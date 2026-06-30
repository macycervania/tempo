# Tempo // OS — full setup (deploy + Google login + shared leaderboard + live memecoins)

The standalone `public/tempo.html` works offline with no setup. To unlock the
**multiplayer** features — Google login, a **shared leaderboard** for you and
your friends, **AI any-food search**, the real **Nateman**, and **voice** — you
deploy the Next.js app and add a few keys. ~15 minutes.

## What turns on when

| Feature | Standalone HTML | Deployed (no keys) | Deployed + keys |
| --- | --- | --- | --- |
| Tasks / habits / health / budget / journal | ✅ | ✅ | ✅ |
| Built-in food table (174 foods) | ✅ | ✅ | ✅ |
| AI any-food search, real Nateman, AI macros | — | — | ✅ `ANTHROPIC_API_KEY` |
| Voice (speech-to-text + TTS) | — | ✅ (HTTPS) | ✅ |
| Solana wallet balance + live memecoin P&L | — | ✅ | ✅ |
| Google login + shared leaderboard | — | — | ✅ Supabase |

## 1. Deploy to Vercel

1. Push this repo to GitHub (already done if you're reading this on GitHub).
2. Go to **vercel.com → New Project → import this repo → Deploy**. It's a
   standard Next.js app; no config needed.
3. You get a URL like `https://tempo-os.vercel.app`.

## 2. AI (any food, Nateman, macros) — optional but recommended

In Vercel → **Project → Settings → Environment Variables**, add:

```
ANTHROPIC_API_KEY = sk-ant-...        # from console.anthropic.com
# optional cheaper model for food/macros:
NUTRITION_MODEL = claude-haiku-4-5
```

Redeploy. Now searching any food (kare-kare, dinengdeng, any brand) returns
real macros, and Nateman answers over your live data.

## 3. Supabase (Google login + leaderboard)

1. Create a free project at **supabase.com**.
2. **SQL editor → New query →** paste [`supabase/schema.sql`](supabase/schema.sql) → Run.
3. **Authentication → Providers → Google →** enable it:
   - Create an OAuth client at **console.cloud.google.com** (OAuth consent
     screen + Credentials → OAuth client ID → Web application).
   - Authorized redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`
   - Paste the **Client ID** and **Client secret** into Supabase's Google provider.
4. **Authentication → URL Configuration →** set **Site URL** to your Vercel URL
   and add it to **Redirect URLs**.
5. In Vercel env vars, add (from Supabase → Project Settings → API):

```
NEXT_PUBLIC_SUPABASE_URL = https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...   # the "anon public" key
```

Redeploy. Now **Settings → Account → Continue with Google** signs you in, and
the **Leaders** page shows you and every friend who signs in, ranked by
tasks done, habit consistency and trading P&L. Your score syncs automatically.

## 4. Memecoins

Add your **public** Solana address in **Settings → Crypto Wallets** (never a
private key). The **Memecoins** page reads your token holdings from the chain
and prices them live via Dexscreener, showing each position and today's P&L.
(Cost-basis "bought vs sold" P&L would need a transaction-history provider like
Helius/Birdeye — ask and I'll wire it.)

## Local development

```bash
npm install
cp .env.example .env.local   # fill in the keys above (optional)
npm run dev                  # http://localhost:3000
```
