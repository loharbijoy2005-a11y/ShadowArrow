<div align="center">

```
 ███████╗██╗  ██╗ █████╗ ██████╗  ██████╗ ██╗    ██╗     █████╗ ██████╗ ██████╗  ██████╗ ██╗    ██╗
 ██╔════╝██║  ██║██╔══██╗██╔══██╗██╔═══██╗██║    ██║    ██╔══██╗██╔══██╗██╔══██╗██╔═══██╗██║    ██║
 ███████╗███████║███████║██║  ██║██║   ██║██║ █╗ ██║    ███████║██████╔╝██████╔╝██║   ██║██║ █╗ ██║
 ╚════██║██╔══██║██╔══██║██║  ██║██║   ██║██║███╗██║    ██╔══██║██╔══██╗██╔══██╗██║   ██║██║███╗██║
 ███████║██║  ██║██║  ██║██████╔╝╚██████╔╝╚███╔███╔╝    ██║  ██║██║  ██║██║  ██║╚██████╔╝╚███╔███╔╝
 ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝  ╚═════╝  ╚══╝╚══╝    ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝  ╚══╝╚══╝
```

**Born for the culture. Built for the relentless.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Go](https://img.shields.io/badge/Go-1.24-00ADD8?style=for-the-badge&logo=go&logoColor=white)](https://go.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payments-02042B?style=for-the-badge&logo=razorpay&logoColor=white)](https://razorpay.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](./LICENSE)

<br/>

> *High-octane digital storefront engineered to bridge underground gaming aesthetics with premium urban apparel.*  
> *Zero lag. Instant drops. Lightning-fast checkout.*

---

</div>

## ⚡ What is SHADOW ARROW?

**SHADOW ARROW** is a full-stack, production-grade **e-commerce platform** built for the Indian streetwear & gaming lifestyle market. It ships with a blazing-fast Next.js 14 storefront, a robust Go 1.24 REST API, a live AI neural stylist, an **ArrowCoins** loyalty rewards system, real-time order tracking, live support desk, and an integrated admin dashboard — all containerized with Docker and deployed on **Render + Vercel**.

---

## 🧩 Monorepo Architecture

```
SHADOW ARROW WEB/
│
├── 🖥️  storefront/           → Customer-facing Next.js 14 app  (Vercel)
│   ├── app/                  → App Router pages & layouts
│   ├── components/           → Reusable UI components
│   ├── context/              → Cart, Auth React context
│   └── utils/                → API helpers & client utilities
│
├── ⚙️  backend/              → Go 1.24 REST API  (Render)
│   ├── handlers/             → HTTP route handlers
│   ├── models/               → MongoDB document models
│   ├── middleware/           → JWT auth, CORS, rate limiting
│   ├── utils/                → Razorpay, JWT, email helpers
│   ├── cron/                 → Background job scheduler
│   └── db/                   → MongoDB & Redis connection pool
│
├── 🛡️  admin-dashboard/      → Internal admin panel  (Next.js)
│
├── 🤖  python_service/       → AI Neural Styling microservice
│
└── 🐳  docker-compose.yml    → Full-stack local orchestration
```

---

## 🚀 Feature Highlights

### 🛒 Storefront — Customer Experience

| Feature | Description |
|---|---|
| **Product Catalog** | Dynamic filtering by Apparel, Footwear & Accessories |
| **Product Detail** | Full GSM/material specs, size guide modal, image gallery |
| **Cart System** | Persistent drawer cart with real-time quantity management |
| **Checkout Flow** | Multi-step checkout — address → coupon → Razorpay payment |
| **Order Tracking** | Real-time order status with floating bubble modal |
| **ArrowCoins** | Loyalty rewards — earn on purchase, redeem at checkout |
| **AI Stylist** | Neural styling chat with hyper-personalized recommendations |
| **GST Invoice** | Downloadable GST-compliant tax invoice & thermal receipt |
| **Dark / Light Mode** | Full theme engine with persistent user preference |
| **Mobile-First** | Bottom nav, touch gestures, responsive across all devices |

### ⚙️ Backend — API Engine

| Feature | Description |
|---|---|
| **Auth System** | Firebase Phone OTP + Email + JWT session management |
| **Order Engine** | Full order lifecycle: placed → confirmed → shipped → delivered |
| **Payment Gateway** | Razorpay integration with HMAC webhook verification |
| **Coupon System** | Percentage/flat coupons with per-user usage limits |
| **Rewards Engine** | ArrowCoins earn & burn with anti-fraud validation |
| **Support Desk** | Ticket-based live support with real-time admin reply polling |
| **Redis Caching** | Session & product caching for sub-50ms API responses |
| **Cron Jobs** | Auto order progression & push notification scheduler |

### 🛡️ Admin Dashboard

| Feature | Description |
|---|---|
| **Order Management** | View, filter, and update all customer orders |
| **Product Manager** | Add/edit/delete products with image uploads |
| **Support Console** | Reply to customer support tickets in real-time |
| **Coupon Manager** | Create and manage discount campaigns |
| **Customer Lookup** | Search customers by phone or email |

---

## 🧠 AI Neural Stylist

SHADOW ARROW ships with a **standalone AI microservice** that powers:

- 🎯 **Hyper-personalized fit matching** based on body type & style preferences
- 🔔 **Real-time drop alerts** for new product launches
- 🛍️ **Dynamic product curation** — surfaces the right product at the right moment
- 💬 **In-store AI chat window** — customers interact naturally to discover drops

---

## 🏗️ Tech Stack

### Frontend

| Layer | Technology |
|---|---|
| Framework | **Next.js 14** (App Router, SSR) |
| Language | **TypeScript 5** |
| Styling | **Tailwind CSS 3** |
| Auth | **Firebase Auth** (Phone OTP + Email) |
| Fonts | **Sora + Hanken Grotesk + JetBrains Mono** |
| Icons | **Lucide React** |
| HTTP Client | **Axios** |
| PDF Export | **html2pdf.js** |
| Animations | **canvas-confetti** |

### Backend

| Layer | Technology |
|---|---|
| Language | **Go 1.24** |
| HTTP Framework | **Gin** |
| Database | **MongoDB Atlas** |
| Cache | **Redis** |
| Auth | **JWT** (`golang-jwt/jwt v5`) |
| Payments | **Razorpay Go SDK** |
| Config | **godotenv** |

### Infrastructure

| Layer | Technology |
|---|---|
| Storefront | **Vercel** |
| Backend API | **Render** |
| Containerization | **Docker + Docker Compose** |
| CI/CD | **GitHub Actions** |
| Database | **MongoDB Atlas** (Cloud) |
| Cache | **Redis Cloud** |

---

## 🛠️ Local Development Setup

### Prerequisites

- **Node.js** ≥ 18
- **Go** ≥ 1.24
- **Docker** + Docker Compose
- **MongoDB Atlas** URI
- **Redis** (local or cloud)
- **Razorpay** API Keys
- **Firebase** Project with Phone Auth enabled

### 1. Clone the repository

```bash
git clone https://github.com/your-org/shadow-arrow-web.git
cd shadow-arrow-web
```

### 2. Configure environment variables

```bash
# Backend
cp backend/.env.example backend/.env
# Required: MONGO_URI, REDIS_URL, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, JWT_SECRET

# Storefront
cp storefront/.env.example storefront/.env.local
# Required: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_FIREBASE_*, NEXT_PUBLIC_RAZORPAY_KEY_ID
```

### 3. Run with Docker Compose *(Recommended)*

```bash
docker-compose up --build
```

| Service | URL |
|---|---|
| 🖥️ Storefront | http://localhost:3000 |
| ⚙️ Backend API | http://localhost:8080 |

### 4. Run individually *(Development)*

```bash
# Terminal 1 — Backend
cd backend && go run main.go

# Terminal 2 — Storefront
cd storefront && npm install && npm run dev

# Terminal 3 — Admin Dashboard
cd admin-dashboard && npm install && npm run dev
```

---

## 📁 Key API Endpoints

```
AUTH
  POST   /api/v1/auth/send-otp            → Send phone OTP
  POST   /api/v1/auth/verify-otp          → Verify OTP, receive JWT

PRODUCTS
  GET    /api/v1/products                 → List all products
  GET    /api/v1/products/:id             → Get product detail

ORDERS
  POST   /api/v1/orders                   → Place a new order
  GET    /api/v1/orders/track/:id         → Track order by ID

PAYMENTS
  POST   /api/v1/payments/create-order    → Create Razorpay order
  POST   /api/v1/payments/verify          → Verify payment signature

REWARDS
  GET    /api/v1/rewards/balance          → Get ArrowCoins balance
  POST   /api/v1/rewards/redeem           → Redeem coins at checkout

COUPONS
  POST   /api/v1/coupons/validate         → Validate a coupon code

SUPPORT
  POST   /api/v1/user/tickets             → Create a support ticket
  GET    /api/v1/user/tickets             → Get all tickets for user
```

---

## 🌐 Deployment

### Vercel (Storefront)

```bash
cd storefront
vercel --prod
```

### Render (Backend)

Render auto-deploys from `main` branch via [`render.yaml`](./render.yaml). Push to trigger:

```bash
git push origin main
```

---

## 🔐 Security

- All payment webhooks are **HMAC-SHA256 verified** (no raw payload trust)
- Passwords never stored — **Firebase Auth** handles all identity flows
- JWT tokens are **short-lived** with proper expiry enforcement
- MongoDB queries use **parameterized inputs** (no injection surface)
- Auth and payment routes have **rate limiting** middleware
- Sensitive keys are **environment-variable only** — never committed

> See [`SECURITY_REMEDIATION.md`](./SECURITY_REMEDIATION.md) for the full security audit log.

---

## 📄 License

This project is licensed under the **MIT License**. See [`LICENSE`](./LICENSE) for details.

---

<div align="center">

**Built with 🔥 by the SHADOW ARROW Core Team**

*Platform Architecture & Brand Direction — **ShadowArrow Core Team***  
*AI Microservice & Neural Intelligence — **ShadowArrow AI Labs***

<br/>

[![Website](https://img.shields.io/badge/Live%20Site-shadowarrow.com-3b82f6?style=flat-square&logo=vercel)](https://shadowarrow.com)
[![Email](https://img.shields.io/badge/Support-support.shadowarrow%40gmail.com-ef4444?style=flat-square&logo=gmail&logoColor=white)](mailto:support.shadowarrow@gmail.com)

<br/>

*© 2025 SHADOW ARROW Inc. All rights reserved.*

</div>
