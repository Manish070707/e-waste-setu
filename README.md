# E-Waste Setu - Phase 1 Complete

## Quick Start

### Backend
```
cd backend
python -m uvicorn app.main:app --reload --port 8000
```
API docs: http://localhost:8000/docs

### Frontend
```
cd frontend
npm install && npm run dev
```
App: http://localhost:5173

## SIH Demo (2-3 mins)
Go to `/demo` → Run Full Demo
- Collector C-102, Gurugram, PCB 20KG
- AI: PCB @ 92% confidence
- Matched: Green Recovery Solutions, Rs.145/kg, 8km, Pickup
- Final: 20.4kg, Rs.2,958, TRX-982731

## Routes
- `/` — Landing page
- `/collector` — Collector dashboard (pictorial, mobile-first)
- `/collector/lot/new` — 7-step lot wizard
- `/collector/rates` — Today's rates
- `/collector/match/:lotId` — Recycler matching
- `/collector/handover/:trxId` — Digital handover + QR
- `/collector/earnings` — Earnings ledger
- `/collector/safety` — Safety guide (Hindi + English)
- `/recycler` — Recycler dashboard
- `/admin` — Admin metrics
- `/demo` — SIH demo scenario

## Matching Score
Authorization 30% + Price 25% + Distance 20% + Pickup 15% + Material 10%
Only Verified recyclers recommended. Expired/Suspended never shown.

## Stack
Frontend: React 19 + Vite + TypeScript + Tailwind v4 + PWA
Backend: FastAPI + SQLAlchemy 2 + Pydantic v2 + SQLite (swap to PostgreSQL via DATABASE_URL)

## Demo Data
- 5 collectors (C-102 is SIH demo)
- 10 recyclers (7 Verified, 1 Pending, 1 Expired, 1 Suspended)
- 90 days price history, 8 sample transactions
