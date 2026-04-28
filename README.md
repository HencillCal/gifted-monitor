<h1 align="center">🟢 Gifted Monitor</h1>
<p align="center"><b>24/7 uptime monitoring SaaS with instant email alerts</b></p>

<p align="center">
  <a href="https://monitor.giftedtech.co.ke"><img src="https://img.shields.io/badge/LIVE%20APP-monitor.giftedtech.co.ke-green?style=for-the-badge&logo=googlechrome" alt="Live App"/></a>
</p>

<p align="center">
  <a href="https://github.com/mauricegift"><img src="https://img.shields.io/badge/GITHUB-GIFTED%20TECH-red?style=for-the-badge&logo=github"/></a>
  <img src="https://img.shields.io/badge/stack-React%20%2B%20Node.js-blue?style=for-the-badge&logo=react"/>
  <img src="https://img.shields.io/badge/license-MIT-yellow?style=for-the-badge"/>
</p>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 1. OVERVIEW

<details>
<summary>TAP TO EXPAND</summary>

**Gifted Monitor** is a full-stack uptime monitoring SaaS. It watches your websites 24/7 and sends instant email alerts when something goes down — and again when it recovers.

**Live at:** [https://monitor.giftedtech.co.ke](https://monitor.giftedtech.co.ke)

| Feature | Details |
|---|---|
| Uptime Monitoring | HTTP/HTTPS checks via GET, HEAD, or POST |
| Custom Intervals | Per-monitor check intervals (minimum: 30 seconds) |
| Email Alerts | Down + recovery alerts via Resend (up to 5 domain round-robin) |
| Round-Robin Email | Exhausts all configured Resend domains before returning an error |
| Email Change | Confirm new email via link sent to the new address |
| OTP / Link Auth | Email link-based verification for signup and password reset |
| JWT Auth | 1-day tokens with 12-hour sliding auto-refresh |
| Admin Panel | Manage all users, monitors, and contact messages |
| Super Admin | First verified user becomes the platform Super Admin |
| Breadcrumb Navigation | Full breadcrumb trail on every authenticated page |
| Contact Form | Public contact page saves messages to the database |
| PostgreSQL | Single-adapter backend — Neon or any PostgreSQL host |
| Mobile-Responsive | Curved mobile sidebar, hamburger nav, full footer on all pages |
| Monitor Limit | Per-user monitor quota with admin-configurable limits |
| Bulk Actions | Select-all + bulk operations on monitors, users, and messages |
| Pagination | Paginated monitor and user lists with smart page controls |
| Monorepo | Backend builds and serves the React frontend as static files |
| Auto-Refresh | Dashboard and monitor pages auto-refresh every 30 seconds |

</details>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 2. TECH STACK

<details>
<summary>TAP TO EXPAND</summary>

**Backend**
- **Runtime:** Node.js 18+ (CommonJS)
- **Framework:** Express 4
- **Database:** PostgreSQL (Neon recommended)
- **Auth:** JWT (`jsonwebtoken`) + bcrypt (`bcryptjs`, 12 rounds)
- **HTTP Client:** Axios (for pinging monitors)
- **Email:** Resend API — up to 5 domain/key pairs in round-robin rotation
- **Security:** Helmet, express-rate-limit

**Frontend**
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite 7
- **Styling:** Tailwind CSS v4
- **State:** Zustand (persisted to localStorage)
- **Data Fetching:** TanStack Query v5
- **Forms:** React Hook Form + Zod validation
- **Animations:** Framer Motion, AOS
- **Icons:** Lucide React
- **Routing:** React Router v7

</details>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 3. PROJECT STRUCTURE

<details>
<summary>TAP TO EXPAND</summary>

```
gifted-monitor/
├── package.json              # Root monorepo scripts (build, start, start:prod)
├── README.md
├── .gitignore
│
├── backend/                  # Node.js/Express API
│   ├── index.js              # Entry point — starts server + ping engine
│   ├── config.js             # All env vars with defaults
│   ├── package.json
│   ├── .env.example          # Example environment file
│   ├── lib/
│   │   ├── server.js         # Express setup — API routes + static file serving
│   │   ├── auth.js           # JWT sign/verify, requireAuth, requireAdmin middleware
│   │   ├── ping.js           # Monitoring engine (interval-based pinger)
│   │   ├── email.js          # Resend API email helpers (round-robin multi-domain)
│   │   └── db/
│   │       ├── index.js      # DB adapter selector (auto-detects from DATABASE_URL)
│   │       └── adapters/
│   │           └── postgres.js
│   └── routes/
│       ├── index.js          # Route aggregator
│       ├── auth.js           # /api/auth/* endpoints
│       ├── monitors.js       # /api/monitors/* endpoints
│       ├── admin.js          # /api/admin/* endpoints
│       └── public.js         # /api/contact, /api/status
│
└── frontend/                 # React + Vite SPA
    ├── index.html
    ├── vite.config.ts        # Dev proxy: /api → localhost:3000
    ├── src/
    │   ├── App.tsx           # Routes + route guards (PrivateRoute, AdminRoute, GuestRoute)
    │   ├── layouts/
    │   │   ├── AppLayout.tsx         # Authenticated layout (header + sidebar + footer)
    │   │   └── PublicLayout.tsx      # Public layout (nav + footer)
    │   ├── pages/
    │   │   ├── public/       # Home, About, Contact, Terms, Privacy
    │   │   ├── auth/         # Login, Signup, ForgotPassword, VerifyOtp, ResetPassword
    │   │   └── main/
    │   │       ├── Dashboard.tsx
    │   │       ├── Monitors.tsx
    │   │       ├── MonitorDetail.tsx
    │   │       ├── CreateMonitor.tsx
    │   │       ├── Profile.tsx
    │   │       └── admin/
    │   │           ├── AdminDashboard.tsx
    │   │           ├── Users.tsx
    │   │           ├── AdminMonitors.tsx
    │   │           └── Messages.tsx
    │   ├── components/
    │   │   ├── ui/           # Breadcrumb, Modal, InputWithIcon, ButtonWithLoader, etc.
    │   │   └── main/         # MonitorCard, StatusBadge, UptimeBar
    │   ├── store/            # Zustand auth store (persisted)
    │   ├── helpers/          # formatDate, intervals, cropImage
    │   ├── schemas/          # Zod validation schemas
    │   ├── hooks/            # useTheme
    │   ├── config/
    │   │   └── api.ts        # Axios instance with JWT interceptor + auto-refresh
    │   └── types/            # TypeScript types
    └── dist/                 # Built output — served by backend in production
```

</details>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 4. QUICK START — DEVELOPMENT

<details>
<summary>TAP TO EXPAND</summary>

In development, the frontend Vite dev server and the backend API run as separate processes. The Vite dev server proxies `/api` requests to the backend automatically.

**1. Clone the repo**
```bash
git clone https://github.com/mauricegift/gifted-monitor.git
cd gifted-monitor
```

**2. Install dependencies**
```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

**3. Configure environment**
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your values
```

**4. Run both services**

Open two terminals:

```bash
# Terminal 1 — Backend API (port 3000)
cd backend && node index.js

# Terminal 2 — Frontend dev server (port 5173, with HMR)
cd frontend && npm run dev
```

Visit **http://localhost:5173** — the Vite dev server proxies all `/api/*` calls to `localhost:3000` automatically.

</details>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 5. PRODUCTION SETUP (MONOREPO)

<details>
<summary>TAP TO EXPAND</summary>

In production, the backend builds the React frontend and serves its compiled static files directly. This means you only need **one process** and **one port** for the entire application.

**How it works:**
1. `npm run build` compiles the React app into `frontend/dist/`
2. The backend detects `frontend/dist/` at startup and enables static file serving
3. All `/api/*` routes are handled by the backend as before
4. All other routes serve `frontend/dist/index.html` (SPA fallback)

**Build and start:**
```bash
# From the project root — builds frontend then starts backend
npm run start:prod

# Or separately:
npm run build       # builds frontend/dist/
npm start           # starts backend (auto-detects and serves the built frontend)
```

**Using backend scripts directly:**
```bash
cd backend
npm run start:prod   # build frontend + start server
# or
npm run build        # just build
npm start            # just start (assumes dist already exists)
```

**Environment variables for production:**
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...
JWT_SECRET=your_strong_random_secret
FRONTEND_URL=https://monitor.yourdomain.com
```

> **Note:** In production mode, `ALLOWED_ORIGINS` is enforced strictly. Same-origin requests (frontend served from the backend) do not require any CORS configuration.

</details>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 6. ENVIRONMENT VARIABLES

<details>
<summary>TAP TO EXPAND</summary>

Create a `.env` file in the `backend/` directory (or set them in your hosting platform). See `backend/.env.example` for the full template.

```env
# ── Server ───────────────────────────────────────────────────────────
PORT=3000
NODE_ENV=production

# ── Database ─────────────────────────────────────────────────────────
DATABASE_URL=postgresql://user:password@host/dbname

# ── Auth ─────────────────────────────────────────────────────────────
JWT_SECRET=your_strong_random_secret_here
SESSION_SECRET=another_strong_random_secret

# ── Email via Resend ─────────────────────────────────────────────────
# Up to 5 domain/key pairs — tried in round-robin order
# All keys are exhausted before an error is returned
RESEND1_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
RESEND1_DOMAIN=alerts.yourdomain.com
RESEND2_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
RESEND2_DOMAIN=alerts2.yourdomain.com
# RESEND3, RESEND4, RESEND5 — optional

# ── App URL ──────────────────────────────────────────────────────────
# Used in verification/reset/email-change links sent by email
FRONTEND_URL=https://monitor.yourdomain.com

# ── Monitoring Engine ─────────────────────────────────────────────────
PING_CHECK_INTERVAL_SECS=10
MIN_PING_INTERVAL_MINS=0.5

# ── Timezone ─────────────────────────────────────────────────────────
TIMEZONE=Africa/Nairobi

# ── CORS ─────────────────────────────────────────────────────────────
# Not needed if frontend is served by the backend (monorepo mode)
# Required if frontend is hosted separately
ALLOWED_ORIGINS=https://monitor.yourdomain.com
```

> **Security note:** Always set strong, unique secrets for `JWT_SECRET` and `SESSION_SECRET` in production.

> **Resend:** Get API keys and configure sending domains at [resend.com](https://resend.com). The free tier allows 3,000 emails/month. Adding multiple domains provides round-robin failover — all domains are tried before an error is thrown.

</details>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 7. DATABASE SETUP

<details>
<summary>TAP TO EXPAND</summary>

All tables are created automatically on first startup — no manual migrations needed.

**Schema (auto-created):**

```sql
users (
  id, username, name, email, password_hash,
  is_verified, is_admin, is_superadmin, is_disabled,
  avatar, monitor_limit, notify_down, notify_up,
  pending_email, created_at
)

monitors (
  id, user_id, name, url, path, method, body,
  interval_mins, last_status, last_checked_at,
  uptime_pct, notify_down, notify_up,
  is_active, is_down, down_since, created_at
)

check_history (
  id, monitor_id, status, response_time, error_msg, checked_at
)

otp_codes (
  id, email, code, type, expires_at, used, created_at
)

contact_messages (
  id, name, email, subject, message, is_read, created_at
)
```

**PostgreSQL via Neon** is the recommended setup. Free tier is sufficient for most self-hosted deployments.

> `users.monitor_limit` defaults to `20`. Admins/superadmins have no limit applied.

> `users.pending_email` holds the unconfirmed new email address during an email-change flow.

</details>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 8. AUTH FLOW

<details>
<summary>TAP TO EXPAND</summary>

**Signup:**
1. User submits email, username, name, and password to `POST /api/auth/signup`
2. Backend sends a verification link to their email (valid 30 minutes)
3. User clicks the link → `GET /verify?email=...&token=...&type=signup`
4. Frontend posts to `/api/auth/verify-otp` automatically; on success returns JWT + user

**Login:**
1. User submits email (or username) + password to `POST /api/auth/login`
2. Backend validates credentials and checks `is_verified` and `is_disabled`
3. Returns JWT (1-day expiry) + user object

**Token refresh:**
- On every authenticated request, the backend checks remaining token lifetime
- If less than 12 hours remain, a fresh token is returned in `x-refresh-token` header
- The Axios interceptor reads this header and updates the store silently

**Auto-logout:**
- Any `401` response triggers `logout()` in the Axios response interceptor
- `GET /api/auth/me` is called on every app load to validate the token

**Password reset:**
1. User requests link via `POST /api/auth/forgot-password`
2. Frontend auto-verifies on link click; returns a short-lived reset token
3. User sets new password via `POST /api/auth/reset-password`

**Email change:**
1. User enters new email on Profile page → `POST /api/auth/request-email-change`
2. Confirmation link sent to the **new** email address
3. Clicking the link → `POST /api/auth/confirm-email-change`
4. Email updated; a new JWT is issued (old email stays active until confirmed)

**Route guards (frontend):**

| Guard | Behavior |
|---|---|
| `PrivateRoute` | Redirects to `/login` if not authenticated |
| `AdminRoute` | Redirects to `/dashboard` if authenticated but not admin/superadmin |
| `GuestRoute` | Redirects to `/dashboard` if already logged in |

</details>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 9. MONITORING ENGINE

<details>
<summary>TAP TO EXPAND</summary>

The ping engine runs in the backend process as a recurring loop.

**How it works:**
1. Every `PING_CHECK_INTERVAL_SECS` (default: 10s), the engine queries all active monitors
2. For each monitor whose `last_checked_at + interval_mins` is in the past, a ping is dispatched
3. The ping is an HTTP request (`GET`, `HEAD`, or `POST`) using Axios with a 15-second timeout
4. A `2xx` response → **UP**; anything else → **DOWN**
5. Before sending a down alert, the engine waits 8 seconds and retries once to prevent false alarms
6. Check results are written to `check_history` (last 60 kept per monitor)
7. Uptime percentage is calculated from the last 60 checks

**Intervals supported:**
30 seconds, 1 min, 3 min, 5 min, 10 min, 15 min, 30 min, 1 hour, 3 hours, 6 hours, 12 hours, 24 hours

**Alert lifecycle:**
- **Down alert:** Sent when a monitor transitions UP → DOWN (after retry confirmation)
- **Recovery alert:** Sent when a monitor transitions DOWN → UP
- **24h reminder:** Sent every 24 hours if the monitor remains down

**POST monitors:**
- An optional JSON request body can be stored per monitor
- Sent as `Content-Type: application/json` on every POST ping

</details>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 10. ADMIN PANEL

<details>
<summary>TAP TO EXPAND</summary>

Accessible via the **Admin** dropdown in the navigation — requires admin or superadmin privileges.

| Section | Path | What You Can Do |
|---|---|---|
| Dashboard | `/admin/dashboard` | Platform-wide stats (users, monitors, up/down counts) |
| Users | `/admin/users` | Search, view, edit, suspend, promote, demote, or delete users; set monitor limits; bulk actions |
| All Monitors | `/admin/monitors` | View and manage every monitor across all accounts; bulk actions |
| Messages | `/admin/messages` | Read contact form submissions, mark as read, or delete |

**Monitor limit management:**
- Regular users default to **20 monitors**
- Admins and superadmins have **no limit**
- Limits can be changed per-user from the Users admin panel

</details>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 11. BULK ACTIONS

<details>
<summary>TAP TO EXPAND</summary>

Bulk selection is available across three areas. Select items using checkboxes — a sticky action bar appears with available operations.

**User Monitors (`/monitors`):**

| Action | Details |
|---|---|
| Pause | Stops pinging selected monitors |
| Activate | Resumes pinging selected monitors |
| Delete | Permanently deletes selected monitors + their history (requires password) |

**Admin — Users (`/admin/users`):**

| Action | Details |
|---|---|
| Enable | Re-enables disabled selected users |
| Disable | Blocks login for selected users (superadmins are skipped) |
| Delete | Permanently deletes selected users and all their monitors (requires password; superadmins skipped) |

**Admin — Monitors (`/admin/monitors`):**

| Action | Details |
|---|---|
| Pause | Stops pinging selected monitors |
| Activate | Resumes pinging selected monitors |
| Set Interval | Applies the same check interval to all selected monitors |
| Delete | Permanently deletes selected monitors + history (requires password) |

</details>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 12. API REFERENCE

<details>
<summary>AUTH — /api/auth</summary>

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/signup` | No | Register — sends verification link |
| POST | `/verify-otp` | No | Verify signup or reset link/token |
| POST | `/resend-otp` | No | Resend verification link |
| POST | `/login` | No | Login — returns JWT + user |
| POST | `/forgot-password` | No | Send password reset link |
| POST | `/reset-password` | No | Reset password with reset token |
| GET | `/me` | Yes | Get current user profile |
| PUT | `/profile` | Yes | Update name or avatar |
| POST | `/change-password` | Yes | Change account password |
| POST | `/notification-prefs` | Yes | Save email notification preferences |
| POST | `/request-email-change` | Yes | Send confirmation link to new email |
| POST | `/confirm-email-change` | No | Confirm email change from link |

</details>

<details>
<summary>MONITORS — /api/monitors</summary>

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Yes | List all monitors for the current user |
| POST | `/` | Yes | Create a monitor (respects `monitor_limit`) |
| GET | `/:id` | Yes | Get monitor details + last 60 checks |
| PUT | `/:id` | Yes | Update monitor settings |
| DELETE | `/:id` | Yes | Delete a monitor (requires password) |
| POST | `/:id/ping` | Yes | Manually trigger an immediate ping |
| POST | `/bulk` | Yes | Bulk action — body: `{ action, ids, password? }` |

**Bulk actions for monitors:** `pause`, `activate`, `delete`

</details>

<details>
<summary>ADMIN — /api/admin</summary>

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/stats` | Admin | Platform-wide stats |
| GET | `/users` | Admin | Paginated user list |
| GET | `/users/:id` | Admin | Single user + their monitors |
| PUT | `/users/:id` | Admin | Edit user (promote, suspend, set limit) |
| DELETE | `/users/:id` | SuperAdmin | Delete user (requires password) |
| POST | `/users/bulk` | Admin | Bulk user action |
| GET | `/monitors` | Admin | All monitors (paginated) |
| PUT | `/monitors/:id` | Admin | Edit any monitor |
| DELETE | `/monitors/:id` | Admin | Delete any monitor (requires password) |
| POST | `/monitors/bulk` | Admin | Bulk monitor action |
| GET | `/contact` | Admin | Paginated contact messages |
| PUT | `/contact/:id/read` | Admin | Mark message as read |
| POST | `/contact/bulk` | Admin | Bulk message action |

</details>

<details>
<summary>PUBLIC — No auth required</summary>

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/contact` | Submit a contact/support message |
| GET | `/api/status` | System health check |

</details>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 13. DEPLOYMENT

<details>
<summary>TAP TO EXPAND</summary>

**Recommended platforms:** Render, Railway, Fly.io, VPS (Ubuntu/Debian)

**Steps:**

1. Push the repo to GitHub
2. Create a new web service pointing to the repo root
3. Set **Build Command:** `npm run build`
4. Set **Start Command:** `npm start`
5. Add all required environment variables (see Section 6)
6. Set `NODE_ENV=production`
7. Deploy

The backend automatically detects `frontend/dist/` and serves the full application from a single port.

**VPS (Ubuntu/Debian) with PM2:**
```bash
# Clone and install
git clone https://github.com/mauricegift/gifted-monitor.git /root/web/gifted-monitor
cd /root/web/gifted-monitor
cd backend && npm install && cd ../frontend && npm install && cd ..

# Build
cd frontend && npm run build && cd ..

# Create .env
cp backend/.env.example backend/.env
# nano backend/.env   ← fill in your values

# Start with PM2
npm install -g pm2
pm2 start backend/index.js --name gifted-monitor
pm2 save && pm2 startup
```

**Nginx reverse proxy:**
```nginx
server {
    listen 80;
    server_name monitor.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

> **First user is Super Admin** — register your own account immediately after deployment before sharing the link.

</details>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 14. IMPORTANT NOTES

<details>
<summary>TAP TO EXPAND</summary>

**First user is Super Admin**
Register your own account immediately after deployment. The first account to complete email verification becomes the platform Super Admin automatically.

**Email delivery via Resend**
- Create an account at [resend.com](https://resend.com)
- Add and verify your sending domain(s)
- Create API keys (one per domain recommended)
- Set `RESEND1_API_KEY` + `RESEND1_DOMAIN` (and optionally RESEND2–5)
- The system tries each domain in order on every send; if one fails (rate limit or error), it tries the next
- All domains are exhausted before an error is returned to the caller

**Email change flow**
- A confirmation link is sent to the **new** email address
- The old email stays active until the link is clicked and verified
- Links expire in 30 minutes
- The `pending_email` column on the `users` table tracks the in-progress change

**Token auto-refresh**
- JWTs are valid for 24 hours
- If less than 12 hours remain on the token, the backend issues a fresh one in `x-refresh-token`
- The frontend Axios interceptor silently applies the new token — users are never interrupted

**Rate limiting**
- OTP / verification endpoints: 5 requests per 15 minutes per IP
- Auth endpoints: 20 requests per 15 minutes per IP

**Monitor false-alarm prevention**
- When a monitor returns a non-2xx response, the engine waits 8 seconds and retries once
- Only if the retry also fails is the monitor marked DOWN and an alert sent

</details>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 15. LICENSE

MIT — see [LICENSE](LICENSE)

---

<p align="center">Built by <a href="https://me.giftedtech.co.ke">Maurice Gift</a> · <a href="https://giftedtech.co.ke">Gifted Tech</a></p>
