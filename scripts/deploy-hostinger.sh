#!/bin/bash

# ============================================================================
# IPOAllotment.in - Hostinger Deployment Script
# ============================================================================
# Run this script from the project root on the Hostinger server
# Make sure to:
# 1. Set up MySQL database and update DATABASE_URL in .env
# 2. Configure PM2 for process management
# 3. Set up domain and SSL
# ============================================================================

set -e

echo "🚀 Starting IPOAllotment.in Deployment..."

# 1. Pull Latest Code
echo "📥 Pulling latest code from GitHub..."
git pull origin main

# 2. Install Dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# 3. Generate Prisma Client
echo "🗄️ Generating Prisma Client..."
npx prisma generate

# 4. Run Database Migrations
echo "🔄 Pushing database schema..."
npx prisma db push --accept-data-loss

# 5. Seed Database (first time only)
if [ "$1" == "--seed" ]; then
  echo "🌱 Seeding database..."
  npm run seed
fi

# 6. Build Application
echo "🏗️ Building Next.js application..."
npm run build

# 7. Restart PM2
echo "♻️ Restarting application with PM2..."
pm2 reload ecosystem.config.cjs --env production 2>/dev/null || pm2 start ecosystem.config.cjs --env production

# 8. Save PM2 process list
pm2 save

echo ""
echo "✅ IPOAllotment.in Deployment Complete!"
echo ""
echo "📝 Next Steps:"
echo "   - Verify the site is running: pm2 status"
echo "   - Check logs: pm2 logs ipo-allotment"
echo "   - Access admin: https://ipoallotment.in/admin/login"
echo "   - Default login: admin / admin123"
echo ""
