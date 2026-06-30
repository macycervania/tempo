# Deploying Tempo // OS

Tempo is a standard **Next.js 14** app, so it deploys to **Vercel** with no build
config. Deploying is what unlocks the two things a `file://` page can't do:

- **Voice** — the Web Speech API only runs over **HTTPS** (Vercel gives you that)
  with microphone permission.
- **Real AI** — the macro / training / Nateman routes call Claude when
  `ANTHROPIC_API_KEY` is set as a server environment variable.

Without a key the deployed app still works fully (local estimators + Nateman's
local brain) — the key just turns the real AI on.

---

## Option A — Vercel dashboard (easiest, ~3 min)

1. Make sure this repo is on GitHub (it is: `macycervania/tempo`).
2. Go to **https://vercel.com/new** and sign in with GitHub.
3. **Import** the `macycervania/tempo` repository.
4. **Framework Preset:** Next.js (auto-detected). Leave Build & Output settings
   at their defaults.
5. **Production Branch:** pick the branch that has this code
   (`claude/build-tempo-nextjs-p370yh`, or `main` if you've merged it).
   You can change this later under **Settings → Git**.
6. (Recommended) Expand **Environment Variables** and add:

   | Name | Value | Notes |
   |------|-------|-------|
   | `ANTHROPIC_API_KEY` | `sk-ant-...` | Turns on AI macros, AI training & real Nateman |
   | `NUTRITION_MODEL` | `claude-haiku-4-5` | Optional — cheaper macro model |
   | `TRAINING_MODEL` | `claude-haiku-4-5` | Optional — cheaper training model |
   | `NATEMAN_MODEL` | `claude-haiku-4-5` | Optional — cheaper assistant model |

   Get a key at **https://console.anthropic.com → API Keys**.
7. Click **Deploy**. You'll get a URL like `https://tempo-xyz.vercel.app`.
8. Open that URL on your phone → **Share → Add to Home Screen** for a
   standalone, app-like launch.

To change env vars later: **Project → Settings → Environment Variables**, then
redeploy (Deployments → ⋯ → Redeploy).

---

## Option B — Vercel CLI

```bash
npm i -g vercel
cd tempo
vercel link                                   # link to a Vercel project
vercel env add ANTHROPIC_API_KEY production    # paste your key when prompted
# optional cheaper models:
# vercel env add NUTRITION_MODEL production     # value: claude-haiku-4-5
# vercel env add TRAINING_MODEL production
# vercel env add NATEMAN_MODEL production
vercel --prod                                  # build + deploy
```

---

## Using voice on the deployed site

- Works on Chrome, Edge, and Safari (incl. iOS Safari) — tap the **Talk through
  your day** button or the Nateman orb and **allow microphone access** when
  prompted.
- If the browser doesn't support speech or the mic is denied, Tempo tells you
  and lets you type instead — it never makes up what it "heard."
- The "hey nateman" wake word (continuous listening) is available where the
  browser supports it; toggle it in **Settings**.

## Local development

```bash
npm install
cp .env.example .env.local      # then paste your key into .env.local (optional)
npm run dev                     # http://localhost:3000  (voice works on localhost)
```
