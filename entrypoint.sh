#!/bin/sh
npx prisma db push --skip-generate
exec node .output/server/index.mjs
