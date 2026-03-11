# 🌍 WorldTrips — Travel Agency

React + Node.js + PostgreSQL travel booking platform.

---

## ⚡ QUICK START (Windows)

### Prerequisites
1. **Node.js** → https://nodejs.org (download LTS version)
2. **PostgreSQL** → https://www.postgresql.org/download/windows/ (remember your password!)

### Run these batch files IN ORDER:

| Step | File | What it does |
|------|------|-------------|
| 1 | `STEP1-install-backend.bat` | Installs backend & opens .env for you to set password |
| 2 | `STEP2-install-frontend.bat` | Installs frontend packages |
| 3 | `STEP3-setup-database.bat` | Creates DB and seeds data |
| 4 | `START-BACKEND.bat` | Starts API on port 4000 (keep open!) |
| 5 | `START-FRONTEND.bat` | Opens app in browser on port 5173 |

---

## 🔐 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@worldtrips.ke | Admin@1234 |
| Customer | sarah@example.com | Admin@1234 |

---

## 📁 Folder Structure

```
worldtrips/
├── frontend/            React 18 + Vite
│   └── src/
│       ├── App.jsx          Routes & guards
│       ├── api.js           API client
│       ├── context/         AuthContext
│       ├── components/      Navbar, UI
│       └── pages/           All pages + admin/
│
├── backend/             Node.js + Express
│   ├── server.js        Main entry
│   ├── middleware/      auth.js (JWT)
│   └── routes/          auth, users, destinations, bookings, chat, admin
│
└── database/
    └── schema.sql       Tables + seed data
```

---

## 👨‍💼 Admin Features

**Bookings:**
- ✅ Approve pending → confirmed
- ❌ Reject with notes
- 🔄 Change status (pending/confirmed/completed/cancelled/rejected)
- 💳 Update payment (unpaid/paid/refunded/partial)
- 📝 Add admin notes
- 🗑️ Delete (with confirmation)
- 📥 Export all to CSV

**Destinations:** Add, edit, remove destinations

**Users:** Activate/deactivate, promote to admin, delete, create new accounts

**Analytics:** Revenue & booking charts (last 6 months)

---

## 🛠️ .env Settings (backend/.env)

```env
DB_PASSWORD=YOUR_POSTGRES_PASSWORD_HERE   ← change this!
JWT_SECRET=worldtrips_super_secret_jwt_key_change_this_in_production_2024
ANTHROPIC_API_KEY=                        ← optional for AI chat
```

---

## 🖼️ Adding Destination Images

Place photos in `frontend/public/images/`:
`masai-mara.jpg`, `zanzibar.jpg`, `paris.jpg`, `bali.jpg`, `dubai.jpg`, `maldives.jpg`, `santorini.jpg`, `tokyo.jpg`, `new-york.jpg`, `cape-town.jpg`, `machu-picchu.jpg`, `barcelona.jpg`, `iceland.jpg`, `sydney.jpg`, `amboseli.jpg`

Without images → coloured gradient placeholders appear automatically. Nothing breaks.
