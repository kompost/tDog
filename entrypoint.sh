#!/bin/sh
npx prisma db push
exec node .output/server/index.mjs
