# KAIF OZERO — Product Requirements Document

## Original Problem Statement
Multi-functional aggregator website for the "KAIF OZERO" consumer cooperative. The platform unites goods and services from all cooperative members into a single showcase.

## Users
- **Admin**: Full platform management
- **Shareholders (Sellers)**: Post products/services, manage deals, view registry
- **Clients (Buyers)**: Browse catalog, send requests, favorites

## Core Requirements
- Three-tier user system with JWT auth
- Multi-language (RU, EN, ZH)
- Dark/Light theme
- Product catalog with categories, search, filters
- Deal & exchange mechanism with 1.5% commission
- Representative meetings via CRM
- Admin panel (users, products, news, KB, ticker, registry)
- Legal pages (Rules, Public Offer)
- Cookie consent banner

## Implemented Features (as of Feb 2026)

### Authentication & Users
- JWT-based register/login for Admin, Shareholder, Client
- Google OAuth (Emergent-managed) session support
- User profile management, role management (admin)

### Content Management (Admin)
- Users CRUD (block, verify, role change)
- Products moderation (approve/reject)
- Knowledge Base CRUD (5 categories)
- News CRUD (images, audio, content)
- Running Ticker CRUD
- **Shareholder Registry CRUD** (name, number, INN, phone, email, pai amount, status, join date, notes)

### Frontend Pages
- Landing Page (hero, categories, news section, ticker, footer)
- Catalog Page
- Product Detail Page (Buy/Exchange/Meeting buttons - UI only)
- Admin Panel (7 tabs: Users, Products, Deals, KB, News, Ticker, Registry)
- Shareholder Dashboard (Products, Deals, Meetings, Registry read-only)
- Client Dashboard
- Knowledge Base Page
- Rules Page, Offer Page
- Auth Page

### UI/UX
- Floating Chat Button with admin messaging (real-time polling)
- Cookie Consent Banner
- Dark theme default with light mode toggle
- i18n (RU, EN, ZH)

### Backend API Endpoints
- `/api/auth/{register, login, me, logout, session}`
- `/api/products`, `/api/products/{id}`, `/api/my-products`
- `/api/deals`, `/api/deals/{id}/{confirm,complete,cancel}`
- `/api/meetings`, `/api/meetings/{id}/{assign,complete}`
- `/api/favorites`, `/api/favorites/{id}`
- `/api/messages`, `/api/messages/conversations`
- `/api/admin/{users, products, deals, stats}`
- `/api/knowledge-base`, `/api/knowledge-base/{id}`
- `/api/news`, `/api/news/{id}`
- `/api/ticker`, `/api/ticker/{id}`
- `/api/registry`, `/api/registry/{id}`
- `/api/admin-chat`
- `/api/users/profile`, `/api/users/{id}/public`
- `/api/shareholder/stats`

## DB Collections
- `users`, `products`, `deals`, `meetings`, `favorites`, `messages`
- `knowledge_base`, `news`, `ticker`, `registry`, `admin_chat`, `user_sessions`

## Mocked/Placeholder Features
- Buy/Exchange/Meeting buttons on product page (UI only)

## P0 — Upcoming Tasks
- Chat functionality backend improvements (WebSocket for real-time)
- Payment integration (YuKassa / Sberbank)
- CRM integration (Bitrix24)

## P1 — Future Tasks
- Telegram notifications
- Full deal/exchange workflow
- Commission calculation engine
- Advanced admin analytics
- Representative & Call-Center roles

## P2 — Backlog
- Refactor AdminPanel.js into sub-components
- File upload for products/news
- Advanced search filters

## Tech Stack
- Backend: FastAPI + MongoDB (Motor)
- Frontend: React + Tailwind CSS + Shadcn/UI
- i18n: i18next + react-i18next
- Auth: JWT + bcrypt

## Test Credentials
- Admin: admin@test.com / admin1234
- Seller: seller@test.com / test1234
- Buyer: buyer@test.com / test1234
