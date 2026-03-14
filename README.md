# 🤖 Personal AI Employee — Hackathon 0

> **Your life and business on autopilot. Local-first, agent-driven, human-in-the-loop.**

An autonomous Digital FTE (Full-Time Equivalent) that monitors Gmail, WhatsApp, and your
file system 24/7 — plans tasks, executes them through 18 Agent Skills, and reports weekly
to the CEO. Built on Claude Code + Obsidian vault architecture.

---

## Completion Status

| Tier | Status | Coverage |
|------|--------|----------|
| 🥉 Bronze — Foundation | ✅ Complete | File watcher, task planner, vault pipeline |
| 🥈 Silver — Functional Assistant | ✅ Complete | Gmail, LinkedIn, Twitter, Meta, scheduling |
| 🥇 Gold — Autonomous Employee | ✅ Complete | Odoo, error recovery, CEO briefing, personal domain |
| 💎 Platinum — Cloud + Local | ✅ ~75% | Cloud/local split, health monitor, vault sync |

---

## What It Does

```
Gmail ──┐
WhatsApp─┼──→  Inbox/  ──→  Task Planner  ──→  Ralph Wiggum Loop  ──→  Skills
Files ───┘                                                                  │
                                                                 ┌──────────┤
                                                         gmail-send         │
                                                         linkedin-post      │
                                                         twitter-post       │
                                                         social-meta        │
                                                         accounting-manager │
                                                         human-approval     │
                                                         error-recovery ────┘
                                                                  │
                                                        Done/ · Errors/ · Reports/
```

### Key Features
- **18 Agent Skills** — email, LinkedIn, Twitter, Facebook/Instagram, accounting, approvals
- **3 MCP Servers** — Gmail, Business actions, Odoo ERP
- **Autonomous execution** — Ralph Wiggum loop executes multi-step plans end-to-end
- **Human-in-the-loop** — approval gates for payments, high-risk actions, unknown contacts
- **CEO Weekly Briefing** — auto-generated every Sunday with revenue, tasks, issues
- **System watchdog** — auto-restarts crashed processes, writes health reports
- **Error recovery** — failed tasks quarantined and auto-retried, never deleted
- **Cloud/Local split** — Cloud drafts, Local approves and sends

---

## Project Structure

```
hackathon/
├── CLAUDE.md                      ← Claude Code configuration (read first)
├── ARCHITECTURE.md                ← Full system design + lessons learned
├── DEPLOY.md                      ← Cloud VM deployment guide (Ubuntu)
├── start.sh                       ← Start/stop/restart/health all services
├── watchdog.py                    ← System health monitor + auto-restart
├── ecosystem.config.js            ← PM2 process manager config (5 processes)
├── requirements.txt               ← Python dependencies
├── .env.example                   ← Credential template (copy → .env)
│
├── scripts/
│   ├── run_ai_employee.py         ← Master orchestrator daemon
│   ├── task_planner.py            ← Inbox → Plan_*.md generator
│   ├── ceo_briefing_weekly.py     ← Sunday CEO briefing generator
│   ├── watch_inbox.py             ← Vault inbox file watcher
│   ├── request_approval.py        ← Human approval gate
│   ├── send_email.py              ← Gmail SMTP sender
│   ├── post_linkedin.py           ← LinkedIn Playwright poster
│   ├── vault_file_manager.py      ← File pipeline manager
│   └── setup_cron.sh              ← Cron installer
│
├── .claude/skills/                ← 18 Agent Skills
│   ├── vault-watcher/             ← File system monitor
│   ├── gmail-watcher/             ← IMAP email poller
│   ├── whatsapp-watcher/          ← WhatsApp Web listener
│   ├── task-planner/              ← Plan generator
│   ├── ralph-wiggum/              ← Autonomous executor loop
│   ├── silver-scheduler/          ← Master orchestrator skill
│   ├── gmail-send/                ← Email sending
│   ├── linkedin-post/             ← LinkedIn posting
│   ├── twitter-post/              ← Twitter/X posting
│   ├── social-meta/               ← Facebook + Instagram
│   ├── social-summary/            ← Social activity log
│   ├── human-approval/            ← Approval gate
│   ├── vault-file-manager/        ← File operations
│   ├── error-recovery/            ← Error handling + retry
│   ├── ceo-briefing/              ← Weekly executive report
│   ├── accounting-manager/        ← Income/expense ledger
│   ├── personal-task/             ← Personal domain handler
│   └── odoo-mcp/                  ← Odoo ERP integration
│
├── mcp/
│   ├── business_mcp/server.py     ← Business MCP (email, LinkedIn, logs)
│   └── odoo_mcp/server.py         ← Odoo MCP (invoices, payments)
│
├── .claude/mcp/gmail-mcp/         ← Gmail MCP (Node.js)
│
└── AI_Employee_Vault/
    ├── Inbox/                     ← Drop tasks here
    ├── Needs_Action/              ← Generated execution plans
    ├── Done/                      ← Completed tasks
    ├── Errors/                    ← Failed tasks (quarantined)
    ├── Needs_Approval/            ← Awaiting human decision
    ├── Pending_Approval/email|social/
    ├── Approved/
    ├── In_Progress/cloud|local/
    ├── Accounting/                ← Monthly ledgers
    ├── Briefings/                 ← Sunday CEO briefings
    ├── Reports/                   ← Analytics + social logs
    ├── Logs/                      ← Vault health reports
    ├── Personal/                  ← Personal domain (separate)
    ├── Business_Goals.md          ← KPIs + rules of engagement
    ├── Company_Handbook.md        ← Operational policies
    └── Dashboard.md               ← Real-time queue status
```

---

## Required APIs — Where to Get Them

### 1. Gmail — App Password (Free)
**Used for:** Sending replies, reading emails via IMAP
**No paid plan needed** — works with any Gmail account

```
1. Enable 2-Factor Authentication on your Google Account:
   myaccount.google.com → Security → 2-Step Verification

2. Generate an App Password:
   myaccount.google.com → Security → App passwords
   Select "Mail" + "Windows Computer" → Generate
   Copy the 16-character password (no spaces)

3. Add to .env:
   EMAIL_ADDRESS=you@gmail.com
   EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx
   GMAIL_IMAP_USER=you@gmail.com
   GMAIL_IMAP_PASSWORD=xxxx-xxxx-xxxx-xxxx
```
> ⚠️ Do NOT use your regular Gmail password. App Passwords only.

---

### 2. Twitter / X API (Free Basic Tier)
**Used for:** Posting tweets automatically
**Cost:** Free (500 posts/month on Basic plan)

```
1. Apply for developer access:
   developer.twitter.com → Sign in with X account → Apply

2. Create a Project and App:
   developer.twitter.com/portal → Projects → New Project → New App

3. Set App permissions to "Read and Write":
   App Settings → User authentication settings → Read and Write

4. Get your keys:
   App → Keys and Tokens tab → copy all 4 values:
   - API Key (Consumer Key)
   - API Secret (Consumer Secret)
   - Access Token
   - Access Token Secret

5. Add to .env:
   TWITTER_API_KEY=...
   TWITTER_API_SECRET=...
   TWITTER_ACCESS_TOKEN=...
   TWITTER_ACCESS_SECRET=...
```
> 🔗 developer.twitter.com

---

### 3. Meta Graph API — Facebook Page + Instagram (Free)
**Used for:** Posting to Facebook Pages and Instagram Business accounts
**Cost:** Free (rate limits apply)

```
1. Create a Meta Developer App:
   developers.facebook.com → My Apps → Create App
   Select "Business" type

2. Add these products:
   - Facebook Login
   - Instagram Graph API

3. Get a Page Access Token (long-lived, 60 days):
   a. Go to: graph.facebook.com/me/accounts?access_token=<USER_TOKEN>
   b. Or use Graph API Explorer: developers.facebook.com/tools/explorer
   c. Copy the access_token for your page

4. Find your Page ID:
   Open your Facebook Page → About → scroll to "Page ID"
   Or: graph.facebook.com/me?fields=id,name&access_token=<PAGE_TOKEN>

5. Find your Instagram Business Account ID:
   graph.facebook.com/<PAGE_ID>?fields=instagram_business_account

6. Add to .env:
   META_PAGE_ACCESS_TOKEN=...
   META_PAGE_ID=...
   META_IG_ACCOUNT_ID=...
```
> 🔗 developers.facebook.com
> ⚠️ Page must be a Facebook Business Page, not a personal profile
> ⚠️ Instagram must be a Business or Creator account linked to your Page

---

### 4. LinkedIn — No API Needed (Browser Automation)
**Used for:** Posting updates to LinkedIn
**Cost:** Free — uses your existing LinkedIn account via Playwright

```
Add to .env:
   LINKEDIN_EMAIL=you@email.com
   LINKEDIN_PASSWORD=your_linkedin_password

First run (to save browser session):
   python3 .claude/skills/linkedin-post/scripts/post_linkedin.py --dry-run
   # A browser window opens → log in manually → session saved for future runs
```
> ⚠️ Use with care — LinkedIn may restrict automated posting
> ✅ The skill posts on your behalf, same as using the website

---

### 5. WhatsApp — No API Needed (Browser Automation)
**Used for:** Reading incoming WhatsApp messages, sending replies
**Cost:** Free — uses WhatsApp Web via Puppeteer

```
First run (QR code scan required — one time only):
   cd .claude/skills/whatsapp-watcher
   npm install
   node scripts/whatsapp_watcher.js --mode once
   # A browser window opens → scan QR code with your phone
   # Session is saved to WHATSAPP_SESSION_PATH in .env

Add to .env:
   WHATSAPP_SESSION_PATH=/home/youruser/.whatsapp-session
```
> ⚠️ Keep this machine logged in — WhatsApp Web requires active phone connection
> ⚠️ Only one WhatsApp Web session per account at a time

---

### 6. Odoo Community ERP (Free, Self-Hosted) — Optional for Gold Tier
**Used for:** Creating invoices, recording payments, listing transactions
**Cost:** Free — self-hosted open source

```
Option A — Docker (fastest):
   docker run -d -p 8069:8069 --name odoo \
     -e HOST=db -e USER=odoo -e PASSWORD=odoo \
     --link some-postgres:db odoo:19

Option B — Manual Ubuntu install:
   See: odoo.com/documentation/19.0/administration/install.html

After installation:
   1. Create a database at: localhost:8069
   2. Settings → Technical → API Keys → New → copy key
   3. Add to .env:
      ODOO_URL=http://localhost:8069
      ODOO_DB=odoo
      ODOO_USER=admin
      ODOO_API_KEY=your_api_key
```
> 🔗 odoo.com/documentation
> ✅ You can skip Odoo for Bronze/Silver tiers

---

### 7. Claude Code / Anthropic API
**Used for:** The reasoning engine (Claude Code itself)
**Cost:** ~$20/month (Pro plan) or pay-per-token (API)

```
Get your API key:
   console.anthropic.com → API Keys → Create Key

Add to .env:
   ANTHROPIC_API_KEY=sk-ant-...

Install Claude Code CLI:
   npm install -g @anthropic/claude-code
   claude --version   # verify
```
> 🔗 console.anthropic.com

---

### API Summary Table

| API | Tier | Cost | Where |
|-----|------|------|-------|
| Gmail App Password | Bronze+ | Free | myaccount.google.com |
| Twitter/X API v2 | Silver+ | Free (500 posts/mo) | developer.twitter.com |
| Meta Graph API | Silver+ | Free | developers.facebook.com |
| LinkedIn (Playwright) | Silver+ | Free | linkedin.com (your account) |
| WhatsApp Web | Silver+ | Free | web.whatsapp.com (your phone) |
| Odoo Community | Gold+ | Free (self-hosted) | odoo.com |
| Anthropic API | All | ~$20/mo Pro | console.anthropic.com |

> **Total cost to run:** ~$20–70/month (Claude Code + optional cloud VM)

---

## How to Run

### Prerequisites

```bash
# Check versions
python3 --version      # need 3.10+
node --version         # need 18+
npm --version
claude --version       # need Claude Code installed
pm2 --version          # install if missing: npm install -g pm2
```

### Step 1 — Clone & Configure

```bash
git clone <your-repo-url>
cd hackathon

# Create Python virtual environment
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Install Playwright browsers (for LinkedIn)
playwright install chromium

# Configure credentials
cp .env.example .env
nano .env    # fill in your API keys
```

### Step 2 — Install Node.js dependencies

```bash
# Gmail MCP server
cd .claude/mcp/gmail-mcp
npm install && npm run build
cd ../../..

# WhatsApp watcher
cd .claude/skills/whatsapp-watcher
npm install
cd ../../..
```

### Step 3 — First-time authentication

```bash
# WhatsApp — scan QR code once (saves session for future runs)
cd .claude/skills/whatsapp-watcher
node scripts/whatsapp_watcher.js --mode once
# Scan QR code with your phone, then Ctrl+C after "Client is ready!"

# LinkedIn — log in once via browser (saves session)
python3 .claude/skills/linkedin-post/scripts/post_linkedin.py --dry-run
```

### Step 4 — Start everything with PM2

```bash
# Start all 5 processes (orchestrator, vault-watcher, gmail-watcher,
# whatsapp-watcher, watchdog)
./start.sh start

# Check everything is running
./start.sh health

# View live logs
pm2 logs

# Stop everything
./start.sh stop
```

### Step 5 — Run a single task (test)

```bash
# Drop a task into the inbox
echo "# Test Task
Send a test email to myself confirming the AI Employee is working." \
  > AI_Employee_Vault/Inbox/test_task.md

# Run one cycle manually (without daemon)
python3 scripts/run_ai_employee.py --once

# Check results
ls AI_Employee_Vault/Done/
ls AI_Employee_Vault/Needs_Action/
cat logs/actions.log | tail -20
```

### Step 6 — (Optional) Set up cron for single-machine scheduling

```bash
# Install cron job (runs every 5 minutes)
bash scripts/setup_cron.sh

# Verify
crontab -l

# Install CEO briefing cron (runs every Sunday 7am)
python3 scripts/ceo_briefing_weekly.py --install-cron
```

---

## Running Modes

### Mode A — Always-On Daemon (Recommended)
Uses PM2 to keep all watchers and the orchestrator running 24/7:
```bash
./start.sh start       # start
./start.sh status      # check
./start.sh logs        # tail logs
./start.sh health      # full health check
./start.sh restart     # restart all
./start.sh stop        # stop all
```

### Mode B — Single-Run (Cron)
Run one cycle on a schedule, then exit:
```bash
python3 scripts/run_ai_employee.py --once
```
Add to crontab: `*/5 * * * * cd /path/to/hackathon && ./venv/bin/python3 scripts/run_ai_employee.py --once >> logs/ai_employee.log 2>&1`

### Mode C — Manual / Development
Run individual skills or scripts directly:
```bash
# Generate CEO briefing now
python3 scripts/ceo_briefing_weekly.py --now --dry-run

# Test email sending (dry-run)
python3 scripts/send_email.py --to test@example.com --subject "Test" --body "Hello" --dry-run

# Check system health
python3 watchdog.py --once

# View watchdog report
python3 watchdog.py --status
```

---

## Approval Workflow

When a high-risk action is detected, the AI creates an approval file:

```
AI_Employee_Vault/Needs_Approval/
  approval_20260218_100000_Send_invoice_to_Client_A.pending
```

**To approve:** Rename the file extension from `.pending` to `.approved`
```bash
mv "AI_Employee_Vault/Needs_Approval/approval_*.pending" \
   "AI_Employee_Vault/Needs_Approval/approval_*.approved"
```

**To reject:** Rename to `.rejected`

The system polls every 5 seconds and proceeds automatically. Unanswered requests timeout after 1 hour (`.timeout`).

---

## Weekly CEO Briefing

Auto-generated every Sunday at 07:00 (if cron is set up) or manually:

```bash
python3 scripts/ceo_briefing_weekly.py --now
cat AI_Employee_Vault/Briefings/latest.md
```

Output: `AI_Employee_Vault/Briefings/YYYY-MM-DD_CEO_Briefing.md`

Covers: Revenue, Completed Tasks, Pending Approvals, Open Errors, System Health.

---

## Useful Commands

```bash
# Health check
./start.sh health

# View live system health report
cat AI_Employee_Vault/Logs/system_health.md

# View live dashboard
cat AI_Employee_Vault/Dashboard.md

# View last 20 actions
tail -20 logs/actions.log

# Check error queue
cat AI_Employee_Vault/Errors/.error_queue.json

# PM2 process monitor (interactive)
pm2 monit

# Restart single process
pm2 restart orchestrator
pm2 restart vault-watcher
pm2 restart gmail-watcher
pm2 restart whatsapp-watcher
pm2 restart watchdog
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `pm2: command not found` | `npm install -g pm2` |
| `python3: No module named playwright` | `pip install playwright && playwright install chromium` |
| Gmail connection refused | Check App Password, enable IMAP in Gmail Settings → See All Settings → Forwarding and POP/IMAP |
| Twitter 403 Forbidden | App permissions must be "Read and Write", not "Read only" |
| Meta token expired | Page Access Tokens expire in 60 days — re-generate at Graph API Explorer |
| WhatsApp QR expired | Delete `WHATSAPP_SESSION_PATH` folder and re-scan |
| Watchdog shows DEGRADED | PM2 not running — run `./start.sh start` |
| Tasks stuck in Needs_Action | Run `python3 scripts/run_ai_employee.py --once` to process manually |
| `DRY_RUN=true` actions skipped | Change `DRY_RUN=false` in `.env` when ready for real actions |

---

## Architecture Overview

See [ARCHITECTURE.md](ARCHITECTURE.md) for full system design, data flow diagrams, and lessons learned.

See [DEPLOY.md](DEPLOY.md) for Ubuntu cloud VM deployment guide.

---

## Hackathon Submission

- **Tier:** Gold / Platinum
- **Skills implemented:** 18
- **MCP Servers:** 3 (Gmail, Business, Odoo)
- **External integrations:** Gmail, LinkedIn, Twitter/X, Facebook, Instagram, WhatsApp, Odoo
- **Demo:** Drop any `.md` file in `AI_Employee_Vault/Inbox/` and watch it execute

---

## Security Notes

- `.env` is in `.gitignore` — never committed
- All credentials accessed via `os.getenv()` only
- All external actions log to `logs/actions.log` with timestamp + result
- `DRY_RUN=true` by default — set to `false` only when ready
- Payments and high-risk actions always require human approval
- WhatsApp sessions stored locally, never synced to cloud

---

*Built for Panaversity Hackathon 0 — Personal AI Employee. Powered by Claude Code.*
