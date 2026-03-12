# Deployment Guide — AI Employee Dashboard

## Auth flow

```
Browser                    Next.js (Vercel)              Flask API
─────────────────────────────────────────────────────────────────
  /login                  ← middleware: no cookie → redirect /login
  POST /api/login  ──────────────────────────────────→ verify creds
                  ←────────────────────────────────── { token, role }
  saveAuth()
    localStorage[token]
    cookie ai_employee_auth=1 (7d, SameSite=Strict, Secure on HTTPS)
  /dashboard/overview
  middleware: cookie present → NextResponse.next()
  api.system()   ─── X-User-Token: <token> ──────────→ verify token
                ←─────────────────────────────────────  { processes }
─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ session expiry ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
  api.*()        ─── X-User-Token: expired ──────────→ 401
  lib/api.ts: dispatch("auth:unauthorized")
  AuthContext: logout() → clearAuth()
    cookie: max-age=0 (expired)
    localStorage: cleared
  window.location = /login?msg=Session+expired
  middleware: no cookie → redirect /login ✓
```

---

## Pre-deployment checklist

### 1. Local build passes

```bash
cd nextjs-dashboard
npm install
npm run build          # must exit 0 with no TypeScript errors
npm run start          # smoke-test at http://localhost:3000
```

### 2. Flask API is reachable

- [ ] Flask is deployed (e.g. on a VPS, Railway, Render, or EC2)
- [ ] HTTPS is enabled on the Flask domain (required for Secure cookies)
- [ ] Flask is accessible at a stable URL, e.g. `https://api.yourdomain.com`

### 3. Flask CORS configuration

The browser on Vercel will call Flask directly. Flask **must** allow the
Vercel origin. In `dashboard/app.py`:

```python
from flask_cors import CORS

CORS(app, resources={
    r"/api/*": {
        "origins": [
            "https://your-project.vercel.app",      # preview
            "https://dashboard.yourdomain.com",      # custom domain
        ],
        "supports_credentials": True,               # needed for cookies if used
    }
})
```

Install if needed: `pip install flask-cors`

### 4. Flask auth token lifetime

The client estimates token expiry at **6.5 days** (see `TOKEN_TTL_MS` in
`lib/auth.ts`). Align the Flask token lifetime:

```python
# In dashboard/app.py or your auth module
TOKEN_TTL = timedelta(days=7)
```

If Flask uses shorter-lived tokens, reduce `TOKEN_TTL_MS` to match.

---

## Vercel deployment steps

### Step 1 — Install Vercel CLI

```bash
npm install -g vercel
vercel login
```

### Step 2 — Link the repository

```bash
cd nextjs-dashboard
vercel link          # follow prompts, select your team/scope
```

### Step 3 — Add environment variables

Add via Vercel dashboard (Project → Settings → Environment Variables)
**or** via CLI:

```bash
# Flask API URL (no trailing slash, no /api suffix)
vercel env add NEXT_PUBLIC_API_URL production
# When prompted, enter: https://api.yourdomain.com

# Cookie name (must match lib/auth.ts COOKIE_NAME constant)
vercel env add AUTH_COOKIE_NAME production
# When prompted, enter: ai_employee_auth
```

> **Important:** `NEXT_PUBLIC_API_URL` is exposed to the browser. Never put
> tokens, passwords, or secrets in any `NEXT_PUBLIC_*` variable.

### Step 4 — Deploy

```bash
vercel --prod
```

First deploy: Vercel will prompt for project name, framework (Next.js
auto-detected), and root directory. For a monorepo confirm the root is
`nextjs-dashboard/`.

### Step 5 — Set custom domain (optional)

```bash
vercel domains add dashboard.yourdomain.com
```

Then add a CNAME record at your DNS provider:
```
dashboard  CNAME  cname.vercel-dns.com
```

---

## Post-deployment verification

Run these checks after every production deploy:

### Auth flow
```bash
# Should redirect to /login (no cookie)
curl -sI https://your-project.vercel.app/dashboard/overview | grep location

# After login, cookie should be set
# (use browser devtools → Application → Cookies)
```

### Security headers
```bash
curl -sI https://your-project.vercel.app/ | grep -E "strict-transport|content-security|x-frame"
```

Expected output includes:
```
strict-transport-security: max-age=63072000; includeSubDomains; preload
content-security-policy: default-src 'self'; ...
x-frame-options: DENY
```

### API connectivity
```bash
# Should return 401 (Flask reachable, no token)
curl -s https://api.yourdomain.com/api/me | python3 -m json.tool
```

### CORS preflight
```bash
curl -sI -X OPTIONS https://api.yourdomain.com/api/login \
  -H "Origin: https://your-project.vercel.app" \
  -H "Access-Control-Request-Method: POST" | grep -i "access-control"
```

Expected:
```
access-control-allow-origin: https://your-project.vercel.app
access-control-allow-methods: GET, POST, OPTIONS
```

---

## Environment variable reference

| Variable | Required | Where set | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | Prod only | Vercel env | Empty in local dev (proxy) |
| `AUTH_COOKIE_NAME` | Optional | Vercel env | Default: `ai_employee_auth` |

### Local dev (`.env.local`)

```
NEXT_PUBLIC_API_URL=
AUTH_COOKIE_NAME=ai_employee_auth
```

Leave `NEXT_PUBLIC_API_URL` empty — `next.config.ts` proxies `/api/*` to
`http://localhost:5000` when `process.env.VERCEL` is not set.

---

## Rollback

```bash
# List recent deployments
vercel ls

# Promote a previous deployment to production
vercel promote <deployment-url>
```

---

## Common problems

| Symptom | Likely cause | Fix |
|---|---|---|
| Redirect loop on `/login` | Cookie name mismatch | `AUTH_COOKIE_NAME` in Vercel env must equal `COOKIE_NAME` in `lib/auth.ts` |
| 401 on every API call | CORS not configured | Add Vercel domain to Flask `CORS(origins=[...])` |
| Login works but dashboard blank | `NEXT_PUBLIC_API_URL` wrong | Remove trailing slash; confirm Flask is at that URL |
| `Session expired` on every page load | `TOKEN_TTL_MS` too short | Match Flask token lifetime; default is 7 days |
| CSP violation in console | Inline script blocked | Add nonce or widen `script-src` (Next.js requires `'unsafe-eval'` in dev) |
| Build fails `useAuth must be used within <AuthProvider>` | Server component using client hook | Add `"use client"` or move hook usage down the tree |
