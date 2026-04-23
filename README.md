# WeCustomise — Prototype

E-commerce platform for personalised & customisable products.

---

## Quick Start (5 minutes)

### Prerequisites
- Node.js 18+
- PostgreSQL running locally (or use a free cloud DB like Supabase / Railway)

---

### 1. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Create your .env file
cp .env.example .env
# → Edit .env and set DATABASE_URL and JWT_SECRET at minimum

# Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate dev --name init

# Seed the database (creates products, admin user, demo user)
node prisma/seed.js

# Start the dev server
npm run dev
# → API running at http://localhost:5000
```

**Minimum .env values to get running:**
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/wecustomise"
JWT_SECRET="anylongrandomstring"
PORT=5000
CLIENT_URL="http://localhost:5173"
```

---

### 2. Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Create .env
cp .env.example .env
# → Set VITE_API_URL=http://localhost:5000/api

# Start the dev server
npm run dev
# → App running at http://localhost:5173
```

---

## Demo Accounts

| Role     | Email                     | Password      |
|----------|---------------------------|---------------|
| Customer | demo@wecustomise.com      | customer123   |
| Admin    | admin@wecustomise.com     | admin123      |

Discount codes: `WELCOME20` (20% off), `FIRST10` (10% off)

---

## Version Status

| Version | Feature                        | Status      |
|---------|--------------------------------|-------------|
| V1      | Auth + Product Browsing        | ✅ Complete  |
| V2      | Customisation Engine           | 🔜 Next      |
| V3      | Cart + Checkout + Payments     | 🔜 Upcoming  |
| V4      | Orders + Reviews + Gifts       | 🔜 Upcoming  |
| V5      | Admin Panel                    | 🔜 Upcoming  |
| V6      | Polish + Deploy                | 🔜 Upcoming  |

---

## Project Structure

```
wecustomise/
├── server/
│   ├── prisma/
│   │   ├── schema.prisma    ← Full DB schema (all versions)
│   │   └── seed.js          ← Seed data
│   └── src/
│       ├── index.js         ← Express server
│       ├── routes/          ← Route files
│       ├── controllers/     ← Business logic
│       ├── middleware/      ← Auth, error handler
│       └── utils/           ← Prisma client, mailer
└── client/
    └── src/
        ├── pages/           ← Home, Shop, ProductDetail, Login, Register
        ├── components/      ← Navbar, Footer, ProductCard
        ├── contexts/        ← AuthContext
        └── utils/           ← Axios API client
```

---

## API Endpoints (V1)

```
POST  /api/auth/register      Create account
POST  /api/auth/login         Login → returns JWT
GET   /api/auth/me            Get current user (auth required)

GET   /api/products           List products (?search=&category=&customisable=&page=)
GET   /api/products/:id       Get single product with reviews
GET   /api/products/categories All categories
```
