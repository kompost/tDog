# Deployment Guide - Hetzner Server

This guide will help you set up automated deployments to your Hetzner server using GitHub Actions.

## Prerequisites

- A Hetzner server (Ubuntu/Debian recommended)
- SSH access to your server
- GitHub repository with Actions enabled
- Docker and Docker Compose installed on the server

## 1. Server Setup on Hetzner

### Install Docker and Docker Compose

SSH into your Hetzner server and run:

```bash
# Update package list
sudo apt-get update

# Install prerequisites
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add your user to docker group (replace 'username' with your actual username)
sudo usermod -aG docker $USER

# Log out and back in for group changes to take effect
```

### Create deployment directory

```bash
mkdir -p ~/tdog
cd ~/tdog
```

### Set up environment variables

Create a `.env` file in the deployment directory:

```bash
nano ~/tdog/.env
```

Add the following content (replace with your actual database credentials):

```env
DATABASE_URL=postgresql://tdog:tdog_password@db:5432/tdog
NODE_ENV=production
```

Save and exit (Ctrl+X, Y, Enter).

## 2. GitHub Secrets Configuration

Go to your GitHub repository → Settings → Secrets and variables → Actions, and add these secrets:

### Required Secrets:

1. **HETZNER_HOST**
   - Your Hetzner server IP address or domain
   - Example: `123.456.789.0` or `server.yourdomain.com`

2. **HETZNER_USERNAME**
   - SSH username for your server
   - Example: `root` or your user account name

3. **HETZNER_SSH_KEY**
   - Your private SSH key for authentication
   - Generate if you don't have one:
     ```bash
     ssh-keygen -t ed25519 -C "github-actions"
     cat ~/.ssh/id_ed25519  # Copy this entire output
     ```
   - Add the public key to your server:
     ```bash
     # On your server:
     cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys
     ```

### Optional Secrets (for Docker Hub):

4. **DOCKER_USERNAME** (Optional)
   - Your Docker Hub username

5. **DOCKER_PASSWORD** (Optional)
   - Your Docker Hub password or access token

## 3. Deployment Process

The deployment happens automatically when you push to the `main` branch:

1. GitHub Actions builds the Docker image
2. Transfers the image to your Hetzner server
3. Stops the old containers
4. Starts new containers with the updated image
5. Cleans up old images

### Manual Deployment

If you need to deploy manually:

```bash
# SSH into your server
ssh username@your-server-ip

# Navigate to the deployment directory
cd ~/tdog

# Pull the latest changes (if docker-compose.yml changed)
# Or the GitHub Action will copy it automatically

# Restart the containers
docker compose down
docker compose up -d

# View logs
docker compose logs -f app
```

## 4. Database Migrations

For Prisma database migrations, you have two options:

### Option A: Run migrations manually on the server

```bash
# SSH into your server
ssh username@your-server-ip

# Navigate to the deployment directory
cd ~/tdog

# Run migrations inside the container
docker compose exec app pnpm db:push
```

### Option B: Add migration step to the workflow

Update `.github/workflows/deploy.yml` to include migrations in the deployment script:

```yaml
script: |
  cd /home/${{ secrets.HETZNER_USERNAME }}/tdog
  docker load < tdog.tar.gz
  docker compose down
  docker compose up -d
  docker compose exec -T app pnpm db:push
  docker image prune -f
  rm tdog.tar.gz
```

## 5. Firewall Configuration

Make sure your server firewall allows traffic on port 3000:

```bash
# Using ufw (Ubuntu Firewall)
sudo ufw allow 3000/tcp
sudo ufw allow 22/tcp  # SSH
sudo ufw enable
sudo ufw status
```

## 6. Nginx Reverse Proxy (Recommended)

For production, set up Nginx as a reverse proxy:

```bash
# Install Nginx
sudo apt-get install -y nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/tdog
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/tdog /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL/HTTPS with Let's Encrypt

```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is set up automatically
```

## 7. Monitoring and Logs

### View application logs

```bash
docker compose logs -f app
```

### View database logs

```bash
docker compose logs -f db
```

### Check running containers

```bash
docker compose ps
```

### Check resource usage

```bash
docker stats
```

## 8. Troubleshooting

### Container won't start

```bash
# Check logs
docker compose logs app

# Restart containers
docker compose restart

# Full rebuild
docker compose down
docker compose up -d --build
```

### Database connection issues

```bash
# Check if database is running
docker compose ps db

# Check database logs
docker compose logs db

# Test database connection
docker compose exec db psql -U tdog -d tdog
```

### Disk space issues

```bash
# Clean up Docker resources
docker system prune -a

# Remove unused volumes
docker volume prune
```

## 9. Backup Strategy

### Database backups

Create a backup script:

```bash
#!/bin/bash
BACKUP_DIR=~/backups
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d_%H%M%S)
docker compose exec -T db pg_dump -U tdog tdog | gzip > $BACKUP_DIR/tdog_$DATE.sql.gz

# Keep only last 7 days of backups
find $BACKUP_DIR -name "tdog_*.sql.gz" -mtime +7 -delete
```

Add to crontab for automatic backups:

```bash
crontab -e

# Add this line for daily backups at 2 AM
0 2 * * * /path/to/backup-script.sh
```

## 10. Next Steps

- Set up monitoring (e.g., Uptime Robot, Better Stack)
- Configure automated backups
- Set up log aggregation
- Add health check endpoints
- Configure alerts for deployment failures

## Support

For issues with:
- GitHub Actions: Check the Actions tab in your repository
- Docker: Check container logs with `docker compose logs`
- Server: Check system logs with `journalctl -u docker`
