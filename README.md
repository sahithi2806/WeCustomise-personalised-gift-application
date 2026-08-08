# WeCustomise — Full Stack Personalised Gift Platform

A full-stack e-commerce web application that allows users to design and purchase personalised products such as t-shirts, mugs, phone cases, and more.

---

## Tech Stack

* Frontend: React (Vite)
* Backend: Node.js, Express
* Database: Prisma ORM (SQLite by default, configurable to PostgreSQL)
* Authentication: JWT-based auth
* State Management: React Context API
* Payment Gateway: Razorpay

---

## Features

* User authentication (Register/Login)
* Product customisation (text, colors, image upload)
* Cart management system
* Checkout flow with multiple payment options (UPI, Card, COD)
* Razorpay payment gateway integration
* Order tracking and history
* Gift scheduling system
* Product reviews (after purchase)
* Admin-ready backend structure

---

## Quick Start

### Prerequisites

* Node.js 18+
* (Optional) PostgreSQL if switching from SQLite
* Razorpay account and API credentials

---

## Backend Setup

```bash
cd server

npm install

cp .env.example .env
# Set DATABASE_URL, JWT_SECRET, and Razorpay credentials

npx prisma generate
npx prisma migrate dev --name init

# Seed database
node prisma/seed.js

npm run dev
# Server → http://localhost:5000
```

### Minimum `.env` values:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_secret_key"
PORT=5000
CLIENT_URL="http://localhost:5173"

RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
```

---

## Frontend Setup

```bash
cd client

npm install

cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api

npm run dev
# App → http://localhost:5173
```

---

## Demo Accounts

| Role     | Email                                                 | Password    |
| -------- | ----------------------------------------------------- | ----------- |
| Customer | [demo@wecustomise.com](mailto:demo@wecustomise.com)   | customer123 |
| Admin    | [admin@wecustomise.com](mailto:admin@wecustomise.com) | admin123    |

Discount Codes:

* WELCOME20 → 20% off
* FIRST10 → 10% off

---

## Project Status

| Module                       | Status      |
| ---------------------------- | ----------- |
| Authentication               | Complete    |
| Product Browsing & Filtering | Complete    |
| Customisation Engine         | Complete    |
| Cart & Checkout              | Complete    |
| Razorpay Payment Integration | Complete    |
| Orders & Reviews             | Complete    |
| Gift Scheduling              | Complete    |
| Admin Features               | In Progress |
| Deployment                   | Next        |

---

## Project Structure

```text
wecustomise/
├── server/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   └── src/
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       ├── utils/
│       └── index.js
│
└── client/
    └── src/
        ├── components/
        ├── contexts/
        ├── pages/
        ├── utils/
        └── App.jsx
```

---

## API Overview

### Auth

```text
POST  /api/auth/register
POST  /api/auth/login
GET   /api/auth/me
```

### Products

```text
GET   /api/products
GET   /api/products/:id
GET   /api/products/categories
```

### Cart

```text
GET   /api/cart
POST  /api/cart
PATCH /api/cart/:id
DELETE /api/cart/:id
```

### Orders

```text
POST  /api/orders
GET   /api/orders
POST  /api/orders/:id/cancel
```

---

## Future Improvements

* Cloud image storage (Cloudinary)
* Performance optimisations
* Mobile responsiveness improvements
* Deployment (Vercel + Railway)

---

## Notes

* Default database uses SQLite (`dev.db`)
* Easily switch to PostgreSQL via Prisma config
* JWT stored in localStorage for authentication
* Razorpay is integrated for online payment processing

---

## Author

Developed as a full-stack engineering project demonstrating real-world e-commerce architecture with customisation capabilities and integrated online payment processing.
