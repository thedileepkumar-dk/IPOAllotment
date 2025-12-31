# IPOAllotment.in

Production-ready IPO Allotment Status Checker for Indian IPOs.

## Features

- ✅ Check allotment status from official registrars (KFintech, Link Intime, Bigshare, Skyline, MAS)
- ✅ Privacy-first: No PAN or personal data storage
- ✅ Rate limiting and anti-block protection
- ✅ SEO-optimized dynamic pages
- ✅ Admin panel for IPO/registrar management
- ✅ Hostinger-ready with MySQL and PM2

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment (copy and edit .env.example)
cp .env.example .env

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Seed database (registrars + sample data)
npm run seed

# Start development server
npm run dev
```

## Deployment (Hostinger)

```bash
# SSH into Hostinger server
ssh user@your-server.hostinger.com

# Clone or pull repository
git clone https://github.com/yourusername/ipo-allotment.git
cd ipo-allotment

# Run deployment script (first time with --seed)
chmod +x scripts/deploy-hostinger.sh
./scripts/deploy-hostinger.sh --seed
```

## Environment Variables

```env
DATABASE_URL="mysql://user:password@host:3306/ipoallotment"
ADMIN_SECRET="your-secret-key"
NEXT_PUBLIC_SITE_URL="https://ipoallotment.in"
NODE_ENV="production"
```

## Admin Access

- URL: `/admin/login`
- Default: `admin` / `admin123`
- **Change password after first login!**

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/allotment/check` | POST | Check allotment status |
| `/api/ipo/live` | GET | Get IPOs with live allotment |
| `/api/admin/auth` | POST | Admin login |
| `/api/admin/ipos` | CRUD | Manage IPOs |
| `/api/admin/registrars` | CRUD | Configure registrars |

## License

MIT
