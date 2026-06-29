# tempo // OS

A dense, dark, AI-built command center for four lives — **school, internship, gym, and trading** — implemented in **Next.js + TypeScript** from the Claude Design prototype in [`project/Tempo.dc.html`](project/Tempo.dc.html).

It's a single-page dashboard with six views, a warm-black + amber palette, six switchable themes (including a true light mode), and **Nateman**, a CSS-rendered assistant orb.

## Features

- **Overview** — editable category bar, KPI summary strip, natural-language capture (type or simulated voice) that auto-files tasks and sets priority, weekly/monthly goals with key results, an auto-ordered priorities list, Fuel (food → macros), Training (workout → calories), and a Habits board with a daily-score ring, fire streaks, and sub-tasks.
- **Health** — today's intake / burned / net with macros, a 7-day intake trend, and full meal & training logs.
- **Budget** — a zero-based monthly budget in pesos: income + eight expense groups with subcategories, inline editing, and a smart expense logger. Drives the Finance page's cash.
- **Finance** — net liquid (linked live to the budget), assets/portfolio, realized P&L with a last-10-sessions chart, and a trade journal you can log into.
- **Calendar** — a month grid wired to your tasks; click a day to view, complete, or add tasks to it.
- **Settings** — profile (name + photo), six themes, currency, daily targets, notifications, reduce-motion, and the Nateman assistant controls.
- **Nateman** — summon by clicking the orb, typing `nateman …`, or (where supported) the "hey nateman" voice wake word. He answers from real app data and can switch themes, add tasks, or jump to a page. Talking mouth, confetti on a perfect habit day, and optional text-to-speech.

Preferences and your profile persist to `localStorage`.

## Tech

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- No CSS framework — theme tokens are CSS custom properties on `:root`, swapped on theme change (faithful to the prototype's inline-style approach via a small `css()` string→object helper in [`components/css.tsx`](components/css.tsx)).
- State lives in one provider ([`state/TempoProvider.tsx`](state/TempoProvider.tsx)); every view renders from a derived view-model ([`state/useViewModel.ts`](state/useViewModel.ts)).

### The "AI" layer

All smart behavior — natural-language task classification, food → macros, workout → burn, trade parsing, scripted voice transcription, and the Nateman assistant — is a **local, deterministic simulation** isolated in [`lib/ai.ts`](lib/ai.ts). Each function is a small, pure seam (search for `AI SEAM`) you can swap for a real LLM, speech-to-text stream, or nutrition API **without touching the UI** — `respondAssistant` already returns a structured `{ answer, actionLabel, intent }` contract that the provider executes.

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
app/            Next.js App Router (layout, page, global CSS, favicon)
components/     React views (TopBar, Overview, Health, Budget, Finance,
                Calendar, Settings, Nateman, Toast) + the css() helper
lib/            types, constants/seed data, format helpers, storage, ai.ts
state/          TempoProvider (state + actions) and useViewModel (derived data)
project/        the original Claude Design prototype + reference assets
chats/          the design conversation transcript
```

## Notes

- The browser speech features (wake word, text-to-speech) depend on the Web Speech API and the voices installed on your device; they degrade gracefully when unavailable.
- The app renders client-side after mount (it's clock-, `localStorage`-, and speech-API-driven), so the first server response is an empty shell by design.
