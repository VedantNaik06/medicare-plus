# MediCare+ — Smart Medicine Reminder & Personal Health Record System

A bilingual (English / मराठी) MERN web app that helps people remember their medicines, track doctor visits,
keep prescriptions and lab reports private, and compare test results over time.

> **Important:** MediCare+ is a **student health-management project**. It does **not** diagnose diseases,
> recommend medicines or doses, or tell you whether a test result is normal. Always follow your doctor's advice.

## Features

| Area | What you can do |
|---|---|
| Account | Register, log in/out, HttpOnly-cookie JWT session, change language/time zone, delete account |
| Medicines | Add/edit/delete, several reminder times a day, start/end dates, before/after-food note, active & completed lists |
| Doses | Mark each dose taken/skipped, no duplicates, upcoming → due → overdue, dose history with filters |
| Reminders | In-app due list + browser notifications while the app is open, hourly server scheduler |
| Appointments | Doctor, clinic, date/time, reason, reminders (1 day / 1 hour…), completed / rescheduled / cancelled |
| Records | Private PDF/JPG/PNG upload, view, download, delete (owner only, no public URLs) |
| Test history | Reports by date, measurements (number or text), search, filters, detail page, comparison line chart |
| Dashboard | Greeting, next dose, today's schedule, next appointment, recent records, 7-day adherence |
| i18n | English + Marathi dictionary (`frontend/src/i18n`), also used for server error messages |

## Tech stack

React 18 + Vite · Tailwind CSS 4 · Framer Motion · Recharts · Lucide icons · React Hook Form · react-i18next · Axios ·
Node.js (≥ 20) + Express 4 · MongoDB Atlas + Mongoose · JWT (cookie) + bcrypt (`bcryptjs`) · Zod · Multer · node-cron · Luxon

> `bcryptjs` is a pure-JavaScript implementation of the same bcrypt algorithm. It avoids native build problems on Windows.

## 1. Set up MongoDB Atlas (free)

1. Create an account at <https://www.mongodb.com/cloud/atlas> and create a **free (M0) cluster**.
2. **Database Access → Add New Database User.** Choose a username and a password (avoid `@ : / ?` in the password,
   or URL-encode it). Give it "Read and write to any database".
3. **Network Access → Add IP Address.** For development click *Add Current IP Address*
   (for a deployed server you must also allow the host's IP, or `0.0.0.0/0` for a student project).
4. **Database → Connect → Drivers.** Copy the connection string. It looks like
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`.
5. Insert the database name before the `?`: `...mongodb.net/medicareplus?retryWrites=true&w=majority`.

## 2. Install and run (development)

```bash
# from the project root
npm run install:all          # installs backend and frontend packages

cd backend
cp .env.example .env         # Windows PowerShell: copy .env.example .env
# open backend/.env and set MONGODB_URI and JWT_SECRET (see below)
cd ..

npm run dev:backend          # terminal 1 -> http://localhost:5000
npm run dev:frontend         # terminal 2 -> http://localhost:5173
```

Open <http://localhost:5173>. In development Vite forwards `/api/*` to the Express server, so no frontend `.env` is needed.

Generate a strong `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### Backend environment variables (`backend/.env`)

| Variable | Meaning | Default |
|---|---|---|
| `MONGODB_URI` | Atlas connection string **(required)** | — |
| `JWT_SECRET` | Long random text used to sign login tokens **(required)** | — |
| `PORT` | API port | `5000` |
| `SESSION_DAYS` | How long a login lasts | `7` |
| `CLIENT_ORIGIN` | Allowed frontend origin(s), comma separated | `http://localhost:5173` |
| `COOKIE_SAMESITE` | `lax`, `strict` or `none` | `lax` |
| `COOKIE_SECURE` | Force the Secure cookie flag | on in production / when `none` |
| `UPLOAD_DIR` | Private upload folder | `storage/uploads` |
| `MAX_FILE_SIZE_MB` | Upload limit (also change `MAX_FILE_MB` in `frontend/src/utils/files.js`) | `5` |
| `DOSE_GRACE_MINUTES` | Minutes after the dose time before it becomes "overdue" | `60` |

### Frontend environment variables (`frontend/.env`, production only)

| Variable | Meaning |
|---|---|
| `VITE_API_URL` | Full API URL when the API is on a different domain, e.g. `https://medicare-api.onrender.com/api` |

## 3. Tests

```bash
npm test          # runs backend tests with Node's built-in test runner (no database needed)
```

They cover dose scheduling and time-zone conversion, upcoming/due/overdue logic, comparison rules (same name **and**
unit only), validators (weak passwords, bad times, ignoring extra fields like `role`) and **security boundaries**:
every private route returns 401 without a login, forged tokens are rejected, state-changing requests without the
CSRF header are blocked. Use Postman for API checks (see the API table below; send the header
`X-Requested-With: medicare-web` on POST/PUT/PATCH/DELETE and keep the cookie jar enabled).

## 4. How it works

### Folder structure

```
medicare-plus/
├── backend/src/   config · models · routes · controllers · middleware · services · validators · utils · app.js · server.js
├── backend/tests/
└── frontend/src/  assets · components · layouts · pages · hooks · context · i18n · services · utils · App.jsx · main.jsx
```

### Data model (7 collections)

`User` · `Medicine` (times: `["08:00","20:00"]`) · `DoseLog` (one row per scheduled dose, unique on medicine + time) ·
`Appointment` · `MedicalRecord` (file **metadata** only) · `TestReport` · `Measurement` (one typed value per row).
Every private document has a `user` field, and every query filters on it.

### Medicine reminders: what happens when the browser is closed?

* The server prepares dose rows for the next 7 days (when you open the app and every hour via `node-cron`).
* While the app is **open and notifications are allowed**, it asks the server every 30 s for due reminders.
  The server marks each reminder as sent in the same atomic step, so **no duplicates** (two tabs, server restart, etc.).
* **If the browser is closed, no browser notification appears.** Browsers only allow that with Web Push
  (a service worker + VAPID keys + a push service) or e-mail/SMS, which are listed under future work.
  When you open the app again, due and overdue doses are shown immediately because their status is computed from the clock.
* "Due" and "overdue" are **calculated when data is read**, not stored, so they are always correct even if the
  scheduler was paused (for example on a sleeping free host).
* Times are stored in UTC; your time zone (default `Asia/Kolkata`) converts them for display and when you type them.

### Security notes and trade-offs

* **HttpOnly cookie** instead of localStorage: scripts cannot steal the token. Trade-off: cookies are sent automatically,
  so we add CSRF defences: `SameSite`, a strict CORS allow-list, JSON-only APIs and a required custom header.
* **Different domains in production** (e.g. Vercel + Render) need `COOKIE_SAMESITE=none` (+ Secure, automatic) and
  `VITE_API_URL`. Some browsers block third-party cookies; the safest option is serving both under one domain or a proxy/rewrite.
* **Ownership:** the user id always comes from the signed cookie. Records of other users return 404 (not 403) so their existence is not revealed.
* **Uploads:** size limit, type check on the real file bytes (not the name), random file names, stored outside any public folder,
  streamed only after an ownership check.
  **Deployment note:** many free hosts erase local disks. For production, replace `backend/src/services/storageService.js`
  with a private cloud bucket (S3, Cloudinary with private delivery, …). Only that file needs to change.
* Passwords: bcrypt (cost 12), strength rules, login errors never reveal whether an email exists, rate limiting on auth routes.
* Logs contain method, path and status only — never bodies, tokens or medical values.

### Test comparison rules

Only measurements with the **same name and the same unit** are drawn on one chart. Different units are never converted or mixed
(you can switch between units). Text results are listed separately. Reference ranges are shown **only if you typed them**.
The app never says a value is "normal" or "abnormal".

## 5. API reference

All responses: `{ "success": true, "data": ... }` or `{ "success": false, "error": { "code", "message", "details?" } }`.
Everything except `/health` and `/auth/*` requires the login cookie. Lists accept `?page=&limit=`.

| Method & path | Purpose |
|---|---|
| `GET /api/health` | Health check |
| `POST /api/auth/register` · `/login` · `/logout` | Create account / log in / log out |
| `GET /api/auth/me` | Current user |
| `GET · PATCH · DELETE /api/users/me` | Profile & preferences / delete account (needs `password`) |
| `GET · POST /api/medicines` · `GET · PUT · DELETE /api/medicines/:id` | Medicine CRUD (`?phase=active|completed|all`) |
| `GET /api/doses?from=&to=` | Doses for a day range (default today) |
| `GET /api/doses/history?status=taken|skipped|missed` | Paginated dose history |
| `PATCH /api/doses/:id` `{status: taken|skipped}` | Record a dose |
| `GET · POST /api/appointments` · `GET · PUT · DELETE /api/appointments/:id` | Appointment CRUD (`?tab=upcoming|past`) |
| `PATCH /api/appointments/:id/status` | completed / rescheduled (+ new time) / cancelled / upcoming |
| `GET · POST /api/records` | List / upload (multipart: `file`, `type`, `title`, `recordDate`) |
| `GET /api/records/:id/file?download=1` | Owner-only file stream |
| `DELETE /api/records/:id` | Delete record and file |
| `GET · POST /api/tests` · `GET · PUT · DELETE /api/tests/:id` | Test reports with measurements (`?search=&category=&from=&to=`) |
| `GET /api/tests/names` | Measurement names available for comparison |
| `GET /api/tests/compare?name=&unit=&from=&to=` | Date-wise comparison data |
| `GET /api/dashboard` | Dashboard summary |
| `POST /api/reminders/claim` | Atomically claim due reminders for notifications |

## 6. Deployment (outline)

1. **Database:** MongoDB Atlas (above). Allow the API host in *Network Access*.
2. **Backend** (Render / Railway): root `backend`, build `npm install`, start `npm start`. Set the environment variables.
   Set `NODE_ENV=production`, `CLIENT_ORIGIN=<your frontend URL>`, and `COOKIE_SAMESITE=none` if the domains differ.
3. **Frontend** (Vercel / Netlify): root `frontend`, build `npm run build`, output `dist`. Set `VITE_API_URL`.
   Add a rewrite of all paths to `/index.html` so React Router deep links work.
4. Replace local file storage with cloud storage (see security notes).

## 7. Screenshots

Add your screenshots to `docs/screenshots/` and link them here: landing page, dashboard (English and Marathi), medicines,
appointments, records, test comparison chart, mobile view.

## 8. Future enhancements (not built)

Web Push or e-mail reminders · caregiver sharing · OCR of uploaded reports · PDF export · refresh-token rotation ·
more languages · weekly-day schedules ("Mon/Wed/Fri").

## 9. Viva cheat-sheet

* **Why a `DoseLog` collection?** Each scheduled dose needs its own status; the unique index on (medicine, scheduledAt) prevents duplicates.
* **Why is "overdue" not stored?** It depends on the current time; computing it on read is always correct.
* **Why an HttpOnly cookie?** JavaScript cannot read it, so XSS cannot steal the session; we then defend against CSRF.
* **How is one user kept away from another's data?** `requireAuth` reads the user from the signed cookie and every query includes `user: req.user._id`.
* **Why separate `Measurement` documents?** One indexed query returns all values of one test across dates, which makes charts simple.
* **Why UTC?** Instants are stored in UTC and converted with the user's time zone, so daylight saving or travel never corrupts data.
