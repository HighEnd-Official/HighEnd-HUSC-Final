# HUES Backend (MySQL + Prisma)

## Setup

1. Create a MySQL database (example: `hues`).
2. Create `backend/.env` from `backend/.env.example` and set `DATABASE_URL`, `JWT_SECRET`.
3. If you want admin replies to be emailed to customers, fill in the SMTP settings in `backend/.env`.
4. Install and migrate:

```bash
cd backend
npm i
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
```

## Run

```bash
cd backend
npm run dev
```

Health check: `GET /health`

## Endpoints

- `POST /auth/register` `{ username, email, password }`
- `POST /auth/login` `{ identifier, password }` (identifier = email or username)
- `GET /products`
- `GET /products/:id`
- `POST /products` (Admin/SuperAdmin only, Bearer token)
- `POST /orders` (Bearer token)
- `GET /orders/mine` (Bearer token)
- `GET /orders/:id` (Bearer token)
- `POST /admin/contact-messages/:id/reply` (Admin/SuperAdmin only, Bearer token)
