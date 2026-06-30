# tempo // OS

A dense, dark, AI-built command center for four lives — **school, internship, gym, and trading** — implemented in **Next.js + TypeScript** from the Claude Design prototype in [`project/Tempo.dc.html`](project/Tempo.dc.html), and extended with ideas from the *Personal OS Build Cheat Sheet*.

It's a single-page, **phone-friendly** dashboard with seven views, a warm-black + amber palette, six switchable themes (including a true light mode), and **Nateman**, a CSS-rendered assistant orb.

## Features

- **Overview** — a calm home screen: greeting, a **daily word** (a motivational line or Bible verse), a tasks-done-today bar, the **voice button** + **Nateman**, compact **Habits & Priorities progress** (tap to open their pages), and your weekly/monthly **Goals**.
- **Tasks** — your tasks as an **Eisenhower matrix** (urgent × important, four quadrants). Add a task with a chosen **category and quadrant**, **rename any quadrant** inline (e.g. "Urgent" → "Remember"), and reveal **completed tasks within each quadrant** via *Show completed* (tap to restore). Ticking anything off plays a chime and a confetti burst.
- **Habits** — the full habits board: daily-score ring, fire streaks, sub-tasks, add/edit/remove. Every tick-off (tasks, habits, sub-tasks, goals) fires a chime + confetti (both respect the Sound effects / Reduce motion settings).
- **Health** — today's intake / burned / net with macros, a 7-day intake trend, full meal & training logs, and a **Body** card: editable **goal weight**, a **MyFitnessPal-style 5-week weight forecast** from today's net calories ("if every day were like today…"), and a health quote. Body weight & height live in **Settings**. Meal logging and **body-aware training calories** run through the **AI seams** (see below).
- **Budget** — a zero-based monthly budget in pesos: income + eight expense groups with subcategories, inline editing, and a smart expense logger. Drives the Finance page's cash.
- **Finance** — net liquid (linked live to the budget), assets/portfolio, realized P&L with a last-10-sessions chart, and a trade journal you can log into.
- **Calendar** — a month grid wired to your tasks; click a day to view, complete, or add tasks to it.
- **Journal** — dated reflections with a mood tag; write your own, or hit **"Summarise my day"** to generate an entry from today's tasks, habits, training and P&L. Entries feed Nateman's recall.
- **Settings** — profile (name + photo), six themes, currency, daily targets, notifications, reduce-motion, and the Nateman assistant controls.
- **Nateman** — a **real assistant**: summon by clicking the orb, typing `nateman …`, or the "hey nateman" voice wake word. When an API key is set he answers via Claude over your live data (see below); with no key he falls back to a capable local brain. He plans your day, switches themes, opens pages, adds tasks, and does **"ask my OS" recall** across your tasks, meals, workouts, habits and journal — citing the source. Talking mouth, confetti on a perfect habit day, and optional text-to-speech.

### Voice

The "Talk through your day" button and Nateman's mic use the browser **Web Speech API** (`SpeechRecognition`) for real speech-to-text — spoken tasks are transcribed and auto-filed, spoken questions go straight to Nateman. The "hey nateman" wake word listens continuously where supported. It's **honest about failure**: when the mic is unavailable or denied it says so and lets you type — it never fabricates what it "heard." Tapping the listening button cancels it. **Voice requires HTTPS (or `localhost`) and microphone permission** — it does not work from a `file://` page, so the standalone HTML below can't use it.

Preferences and your profile persist to `localStorage`.

## Installable on your phone

The app ships a web manifest and Apple touch metadata, renders edge-to-edge under the iOS notch (safe-area insets), and reflows to a single column with a scrollable nav on small screens — so "Add to Home Screen" gives you a standalone, app-like experience.

## Deploy

It's a standard Next.js app — deploy to **Vercel** in a few clicks. Deploying is what unlocks **voice** (the Web Speech API needs HTTPS + mic permission) and the **real Claude-powered AI** (set `ANTHROPIC_API_KEY`). See **[DEPLOY.md](DEPLOY.md)** for dashboard and CLI steps. The single-file `public/tempo.html` is great for a quick offline look, but voice and the real AI need a served HTTPS deployment.

## Tech

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- No CSS framework — theme tokens are CSS custom properties on `:root`, swapped on theme change (faithful to the prototype's inline-style approach via a small `css()` string→object helper in [`components/css.tsx`](components/css.tsx)).
- State lives in one provider ([`state/TempoProvider.tsx`](state/TempoProvider.tsx)); every view renders from a derived view-model ([`state/useViewModel.ts`](state/useViewModel.ts)).

### The "AI" layer

All smart behavior — natural-language task classification, food → macros, workout → burn, trade parsing, scripted voice transcription, the day-summary, recall, and the Nateman assistant — lives behind small, pure seams in [`lib/ai.ts`](lib/ai.ts) (search for `AI SEAM`). They ship as a **local, deterministic simulation** so the app runs with zero configuration, and each one is a drop-in point for a real model or API **without touching the UI**.

**Macros are wired for a real LLM.** Logging a meal calls `estimateFoodSmart`, which POSTs to [`app/api/nutrition/estimate`](app/api/nutrition/estimate/route.ts). That route calls Claude (via the official `@anthropic-ai/sdk`) when `ANTHROPIC_API_KEY` is set, and otherwise returns `501` so the client falls back to the built-in food table — the app stays fully functional offline. The route is also the obvious place to swap in a nutrition provider (Nutritionix, USDA FoodData Central, etc.); the `{ kcal, p, c, f }` contract is all the UI knows.

**Nateman is wired the same way.** The assistant POSTs to [`app/api/nateman`](app/api/nateman/route.ts), which calls Claude with a compact snapshot of your data and returns a natural answer plus an optional structured action (add task, switch theme, open a page) that the provider executes. No key → it falls back to the deterministic `respondAssistant()` brain, so Nateman always answers.

Training calories work the same way: logging a workout posts to [`app/api/training/estimate`](app/api/training/estimate/route.ts) with your weight + height for a body-aware burn, falling back to a weight-scaled local estimate with no key.

```bash
ANTHROPIC_API_KEY=sk-ant-...       # enables AI macros, AI training, + the real Nateman (optional)
NUTRITION_MODEL=claude-haiku-4-5   # optional macro model override (default: claude-opus-4-8)
TRAINING_MODEL=claude-haiku-4-5    # optional training model override (default: claude-opus-4-8)
NATEMAN_MODEL=claude-haiku-4-5     # optional Nateman model override (default: claude-opus-4-8)
```

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build && npm start   # production
```

## Project layout

```
app/            Next.js App Router (layout, page, global CSS, icon, manifest,
                api/{nutrition,training}/estimate + api/nateman — server LLM seams)
components/     React views (TopBar, Overview, Tasks, Habits, Health, Budget,
                Finance, Calendar, Journal, Settings, Nateman, Toast)
                + the css() helper
lib/            types, constants/seed data, format helpers, storage, ai.ts
state/          TempoProvider (state + actions) and useViewModel (derived data)
project/        the original Claude Design prototype + reference assets
chats/          the design conversation transcript
```

## Notes

- The browser speech features (wake word, text-to-speech) depend on the Web Speech API and the voices installed on your device; they degrade gracefully when unavailable.
- The app renders client-side after mount (it's clock-, `localStorage`-, and speech-API-driven), so the first server response is an empty shell by design.
