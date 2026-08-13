# Smart Campus Issue Management System

Full working app: React (Vite) frontend + Node/Express backend.
No MongoDB needed — data is stored in simple JSON files
(`backend/data/users.json`, `backend/data/complaints.json`), so it runs
instantly with zero setup. You can swap this for MongoDB Atlas later.

## Folder structure

```
project/
  backend/     -> Express API, runs on http://localhost:5000
  frontend/    -> React app (Vite), runs on http://localhost:5173
```

## How to run (two terminals)

### 1) Backend

```
cd backend
npm install
node server.js
```

You should see: `Server running on http://localhost:5000`

### 2) Frontend

```
cd frontend
npm install
npm run dev
```

Open the URL it gives you — usually http://localhost:5173

## What works

- **Report an Issue** — anyone can submit a complaint (title, description,
  location, optional name/email). No login needed. You get a Complaint ID
  back (e.g. `CMP12345678`).
- **Track Complaint** — enter the Complaint ID to see its live status.
- **Register / Login** — create a Student or Admin account. Passwords are
  hashed with bcryptjs, sessions use JWT tokens (7 day expiry).
- **Admin Dashboard** — logged-in admins see every complaint and can change
  its status: Submitted → In Progress → Resolved / Rejected.

## Test it quickly

1. Start both servers.
2. Go to the site, click **Login → New here? Create an account**, register
   with role = **Admin**.
3. Log out (or open an incognito tab), go to **Report an Issue**, submit a
   complaint, copy the Complaint ID it gives you.
4. Log back in as the Admin, open **Dashboard** — you'll see the complaint
   there and can change its status.
5. Use **Track Complaint** with the saved ID to confirm the status updates.

## Notes

- `backend/.env` already has `PORT=5000` and a `JWT_SECRET`. Change the
  secret before submitting/deploying anywhere public.
- If `node_modules` is missing an error, just re-run `npm install` inside
  that folder — it wasn't included in this zip to keep it small.
- Node v24 broke the native `bcrypt` package earlier — this project uses
  **bcryptjs** instead (pure JS, no native crash), so this issue won't
  come back.

## Future work (mentioned in your CSP roadmap)

- Swap JSON files for MongoDB Atlas (`backend/db.js` is the only file that
  would need to change — the routes already call `db.getUsers()` /
  `db.getComplaints()` etc., so the swap is isolated).
- Deploy backend to Railway/Render, frontend to Vercel/Netlify.
- Cloudinary for real photo uploads on complaints.
- GPS/Maps integration for location field.
- AI-based auto-categorization of issues.
