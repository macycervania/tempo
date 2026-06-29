// ─────────────────────────────────────────────────────────────────────────────
// Tempo's "AI" layer.
//
// Everything here is a LOCAL, deterministic simulation of the smart features the
// prototype demoed: natural-language task capture, food → macros, workout → burn,
// trade parsing, scripted voice transcription, and the Nateman assistant.
//
// It is intentionally isolated behind small, pure functions so a real backend can
// be dropped in later WITHOUT touching the UI:
//   • classifyTask / estimateFood / estimateExercise → replace with an LLM or a
//     real nutrition API (e.g. MyFitnessPal) returning the same shapes.
//   • transcribeVoice → replace with a speech-to-text stream.
//   • respondAssistant → replace with an LLM call that returns the same
//     { answer, actionLabel, intent } contract; the provider executes the intent.
// Search for "AI SEAM" to find each swap point.
// ─────────────────────────────────────────────────────────────────────────────

import type { Area, Priority, Theme } from './types';
import { THEMES } from './constants';

// ── keyword maps used to route a captured sentence to a life area ──────────────
export const BASE_KW: Record<string, string[]> = {
  school: ['school', 'class', 'homework', 'study', 'exam', 'professor', 'prof', 'problem set', 'read', 'lecture', 'assignment', ' os ', 'ch.', 'chapter', 'essay', 'reyes'],
  internship: ['internship', 'work', 'intern', 'standup', 'mentor', 'api', ' pr ', 'deploy', 'ticket', 'staging', 'bug', 'rate-limit', 'rate limit', 'on-call', 'review', 'fix'],
  gym: ['gym', 'workout', 'lift', 'push day', 'pull day', 'legs', 'run', 'cardio', 'macros', 'protein', 'train', 'session', 'meal prep'],
  business: ['trade', 'trading', 'spy', 'market', 'backtest', 'journal', 'setup', 'strategy', 'chart', 'position', 'stock', 'option', 'open'],
};

// ── a small built-in nutrition table (AI SEAM: swap for a real food API) ───────
type FoodEntry = { a: string[]; k: number; p: number; c: number; f: number };
export const FOODS: Record<string, FoodEntry> = {
  egg: { a: ['egg'], k: 78, p: 6, c: 1, f: 5 },
  oatmeal: { a: ['oat', 'oatmeal'], k: 150, p: 5, c: 27, f: 3 },
  chicken: { a: ['chicken'], k: 230, p: 43, c: 2, f: 5 },
  rice: { a: ['rice'], k: 205, p: 4, c: 45, f: 0 },
  banana: { a: ['banana'], k: 105, p: 1, c: 27, f: 0 },
  shake: { a: ['shake', 'whey', 'protein powder', 'protein shake'], k: 160, p: 30, c: 6, f: 3 },
  salad: { a: ['salad'], k: 140, p: 5, c: 12, f: 8 },
  pasta: { a: ['pasta', 'spaghetti'], k: 350, p: 12, c: 70, f: 5 },
  steak: { a: ['steak', 'beef'], k: 450, p: 46, c: 0, f: 28 },
  salmon: { a: ['salmon'], k: 280, p: 39, c: 0, f: 13 },
  yogurt: { a: ['yogurt', 'greek'], k: 140, p: 17, c: 9, f: 4 },
  coffee: { a: ['coffee', 'espresso', 'latte'], k: 15, p: 1, c: 2, f: 0 },
  pizza: { a: ['pizza'], k: 285, p: 12, c: 36, f: 10 },
  burger: { a: ['burger'], k: 550, p: 30, c: 40, f: 28 },
  toast: { a: ['toast', 'bread'], k: 160, p: 5, c: 24, f: 5 },
  almonds: { a: ['almond', 'nuts', 'cashew'], k: 170, p: 6, c: 6, f: 15 },
  apple: { a: ['apple'], k: 95, p: 0, c: 25, f: 0 },
  bagel: { a: ['bagel'], k: 270, p: 11, c: 53, f: 2 },
  pb: { a: ['peanut butter', 'pb'], k: 190, p: 8, c: 6, f: 16 },
  milk: { a: ['milk'], k: 120, p: 8, c: 12, f: 5 },
  broccoli: { a: ['broccoli', 'veg', 'vegetable'], k: 55, p: 4, c: 11, f: 1 },
  avocado: { a: ['avocado'], k: 160, p: 2, c: 9, f: 15 },
  tuna: { a: ['tuna'], k: 180, p: 40, c: 0, f: 2 },
  granola: { a: ['granola', 'cereal'], k: 200, p: 5, c: 38, f: 6 },
  smoothie: { a: ['smoothie'], k: 220, p: 8, c: 38, f: 4 },
};

// ── exercise → kcal/min rates (AI SEAM: swap for a real fitness model) ─────────
type ExEntry = { a: string[]; rate: number; def: number };
export const EX: ExEntry[] = [
  { a: ['push', 'pull', 'legs', 'lift', 'weights', 'strength', 'gym', 'workout', 'chest', 'back', 'squat', 'deadlift'], rate: 8, def: 45 },
  { a: ['hiit', 'circuit'], rate: 12, def: 25 },
  { a: ['sprint'], rate: 13, def: 20 },
  { a: ['run', 'jog'], rate: 11, def: 30 },
  { a: ['cardio', 'elliptical', 'rower', 'row'], rate: 10, def: 30 },
  { a: ['swim'], rate: 10, def: 30 },
  { a: ['cycle', 'cycling', 'bike', 'spin'], rate: 9, def: 40 },
  { a: ['basketball', 'soccer', 'ball', 'tennis'], rate: 9, def: 45 },
  { a: ['walk'], rate: 5, def: 40 },
  { a: ['yoga', 'stretch', 'mobility'], rate: 4, def: 30 },
];

// ── scripted voice captures (AI SEAM: swap for real speech-to-text) ────────────
export const VOICE = [
  { tr: 'I need to finish the data structures problem set before tomorrow’s deadline, and journal yesterday’s trades.', items: ['finish the data structures problem set before tomorrow’s deadline', 'journal yesterday’s trades'] },
  { tr: 'Push the rate-limit fix today, it’s blocking the team, and maybe book a gym session this evening.', items: ['push the rate-limit fix today, it’s blocking the team', 'maybe book a gym session this evening'] },
  { tr: 'I keep forgetting to email professor Reyes about my extension, and I should review the SPY setup before the open.', items: ['email professor Reyes about my extension', 'review the SPY setup before the open'] },
  { tr: 'Remember to meal prep chicken and rice for the week, and follow up with my mentor about the on-call rotation.', items: ['meal prep chicken and rice for the week', 'follow up with my mentor about the on-call rotation'] },
];

export function transcribeVoice(take: number) {
  return VOICE[take % VOICE.length];
}

// ── pure text utilities ────────────────────────────────────────────────────────
export function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function parseArea(text: string, areas: Area[]): string {
  const lo = ' ' + text.toLowerCase() + ' ';
  let best = 0;
  let area = (areas[0] || ({} as Area)).key;
  for (const a of areas) {
    const kws = (BASE_KW[a.key] || []).concat([a.label.toLowerCase()]);
    const hits = kws.reduce((n, w) => n + (lo.includes(w) ? 1 : 0), 0);
    if (hits > best) {
      best = hits;
      area = a.key;
    }
  }
  return area;
}

export function parsePriority(text: string): Priority {
  const lo = text.toLowerCase();
  if (/\bmaybe\b|someday|sometime|eventually|low.?pri|could|at some point/.test(lo)) return 'low';
  if (/deadline|today|urgent|asap|block|before the open|before open|due\b|exam|important|fix|!/.test(lo)) return 'high';
  return 'med';
}

export function parseDue(text: string): 'today' | 'tomorrow' | 'wed' | 'fri' {
  const lo = text.toLowerCase();
  if (/tomorrow|tmrw|tmr/.test(lo)) return 'tomorrow';
  if (/\bfri/.test(lo)) return 'fri';
  if (/\bwed/.test(lo)) return 'wed';
  return 'today';
}

/** Classify a free-text capture into structured task fields (sans id). */
export function classifyTask(text: string, areas: Area[]) {
  const clean = text.replace(/\s*!+\s*/g, ' ').replace(/\s+/g, ' ').trim();
  return {
    title: cap(clean) || 'New task',
    area: parseArea(text, areas),
    due: parseDue(text),
    priority: parsePriority(text),
  };
}

export interface Macros {
  kcal: number;
  p: number;
  c: number;
  f: number;
}

/**
 * Local, deterministic macro estimate. Used for the instant typing hint and as
 * the offline fallback when no LLM key is configured.
 */
export function estimateFood(text: string): Macros | null {
  if (!text.trim()) return null;
  const parts = text
    .toLowerCase()
    .split(/,|\band\b|\+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const tot = { k: 0, p: 0, c: 0, f: 0 };
  for (const part of parts) {
    const qm = part.match(/^(\d+)/) || part.match(/x\s?(\d+)/);
    const qty = qm ? Math.min(parseInt(qm[1], 10), 12) : 1;
    let hit: FoodEntry | null = null;
    for (const key of Object.keys(FOODS)) {
      if (FOODS[key].a.some((al) => part.includes(al))) {
        hit = FOODS[key];
        break;
      }
    }
    if (hit) {
      tot.k += hit.k * qty;
      tot.p += hit.p * qty;
      tot.c += hit.c * qty;
      tot.f += hit.f * qty;
    } else {
      tot.k += 250;
      tot.p += 8;
      tot.c += 30;
      tot.f += 9;
    }
  }
  return {
    kcal: Math.round(tot.k),
    p: Math.round(tot.p),
    c: Math.round(tot.c),
    f: Math.round(tot.f),
  };
}

export interface MacroResult extends Macros {
  /** Where the numbers came from — surfaced in the UI. */
  source: 'ai' | 'local';
}

/**
 * AI SEAM — meal text → macros.
 *
 * Posts to /api/nutrition/estimate, which calls a real LLM when an API key is
 * configured (see the route). With no key the route 501s and we fall back to the
 * local food table, so the app stays fully functional with zero setup. Swap the
 * route's body for a nutrition provider (Nutritionix, USDA FoodData, etc.) any
 * time without touching the UI — this contract stays the same.
 */
export async function estimateFoodSmart(text: string): Promise<MacroResult | null> {
  const local = estimateFood(text);
  if (!local) return null;
  if (typeof fetch === 'undefined') return { ...local, source: 'local' };
  try {
    const res = await fetch('/api/nutrition/estimate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) return { ...local, source: 'local' };
    const data = (await res.json()) as Partial<Macros>;
    if (typeof data.kcal !== 'number') return { ...local, source: 'local' };
    return {
      kcal: Math.round(data.kcal),
      p: Math.round(data.p ?? local.p),
      c: Math.round(data.c ?? local.c),
      f: Math.round(data.f ?? local.f),
      source: 'ai',
    };
  } catch {
    return { ...local, source: 'local' };
  }
}

export function estimateExercise(text: string) {
  if (!text.trim()) return null;
  const lo = text.toLowerCase();
  let rate = 7;
  let def = 30;
  for (const e of EX) {
    if (e.a.some((al) => lo.includes(al))) {
      rate = e.rate;
      def = e.def;
      break;
    }
  }
  let min = def;
  const mm = lo.match(/(\d+)\s*(min|m\b|minutes)/);
  const hm = lo.match(/(\d+)\s*(h|hr|hour)/);
  const km = lo.match(/(\d+)\s*k\b/);
  if (mm) min = parseInt(mm[1], 10);
  else if (hm) min = parseInt(hm[1], 10) * 60;
  else if (km) min = parseInt(km[1], 10) * 6 + 6;
  min = Math.max(5, Math.min(min, 240));
  return { kcal: Math.round(rate * min), minutes: min };
}

export function parseTrade(text: string) {
  const m = text.match(/([a-zA-Z]{1,5})\s*([+\-]?\$?\s*\d+(\.\d+)?)/);
  if (!m) return null;
  const sym = m[1].toUpperCase();
  let num = parseFloat(m[2].replace(/[^0-9.\-]/g, ''));
  if (/-/.test(m[2])) num = -Math.abs(num);
  return { sym, pnl: Math.round(num) };
}

// ── journal · "summarise my day" ────────────────────────────────────────────────
// AI SEAM: replace summariseDay with an LLM call over the same DaySnapshot. The
// deterministic version below stitches the day's signals into a short reflection.

export interface DaySnapshot {
  doneTasks: string[];
  openTasks: string[];
  habitsDone: number;
  habitsTotal: number;
  consumedKcal: number;
  burnedKcal: number;
  workouts: string[];
  pnlTodayLabel: string;
  topGoal: string | null;
}

export function summariseDay(d: DaySnapshot): string {
  const bits: string[] = [];
  if (d.doneTasks.length) {
    const head = d.doneTasks.slice(0, 2).join(' and ');
    bits.push(
      `You closed ${d.doneTasks.length} task${d.doneTasks.length > 1 ? 's' : ''} — ${head}${
        d.doneTasks.length > 2 ? ' and more' : ''
      }.`,
    );
  } else {
    bits.push('No tasks checked off yet today.');
  }
  if (d.habitsTotal) {
    bits.push(
      d.habitsDone === d.habitsTotal
        ? `Every habit done — a perfect ${d.habitsTotal}/${d.habitsTotal}.`
        : `Habits at ${d.habitsDone}/${d.habitsTotal}.`,
    );
  }
  if (d.workouts.length) {
    bits.push(`Trained: ${d.workouts.join(', ')} (${d.burnedKcal} kcal burned).`);
  }
  if (d.consumedKcal) {
    bits.push(`Ate ${d.consumedKcal} kcal.`);
  }
  bits.push(`Today's P&L is ${d.pnlTodayLabel}.`);
  if (d.openTasks.length) {
    bits.push(`Still open: ${d.openTasks.slice(0, 2).join(', ')}.`);
  }
  if (d.topGoal) {
    bits.push(`Keep pulling toward "${d.topGoal}".`);
  }
  return bits.join(' ');
}

// ── Nateman assistant ──────────────────────────────────────────────────────────
// AI SEAM: replace respondAssistant with an LLM call that returns the same
// { answer, actionLabel, intent } contract. The provider executes the intent so
// the UI never needs to change.

export type NavPage =
  | 'overview'
  | 'priorities'
  | 'habits'
  | 'health'
  | 'budget'
  | 'finance'
  | 'calendar'
  | 'journal';

export const NAV_PAGES: NavPage[] = [
  'overview',
  'priorities',
  'habits',
  'health',
  'budget',
  'finance',
  'calendar',
  'journal',
];

export type AssistantIntent =
  | { type: 'none' }
  | { type: 'setTheme'; themeKey: string }
  | { type: 'addTask'; text: string }
  | { type: 'navigate'; page: NavPage };

/** One searchable fact from the user's history — the "brain" index. */
export interface MemoryItem {
  kind: 'task' | 'meal' | 'workout' | 'habit' | 'journal' | 'trade';
  text: string;
  /** Human-friendly when, e.g. 'today', 'Jun 27'. */
  when: string;
}

export interface AssistantSnapshot {
  /** Number of open (incomplete) tasks due today. */
  openToday: number;
  /** Title of the first open task today, if any. */
  firstOpenTitle: string | null;
  /** High-priority open tasks today. */
  highToday: number;
  doneToday: number;
  totalToday: number;
  netLiquidLabel: string;
  pnlTodayLabel: string;
  consumedKcal: number;
  burnedKcal: number;
  remainingKcal: number;
  /** Everything the user has logged — searched for recall ("ask my OS"). */
  memory: MemoryItem[];
}

const STOP = new Set([
  'the', 'a', 'an', 'and', 'or', 'to', 'of', 'in', 'on', 'for', 'my', 'me', 'i',
  'did', 'do', 'does', 'have', 'has', 'had', 'was', 'were', 'is', 'are', 'am',
  'what', 'when', 'where', 'which', 'who', 'how', 'about', 'that', 'this', 'it',
  'recall', 'remember', 'find', 'search', 'show', 'tell', 'any', 'some', 'last',
  'nateman', 'with', 'from', 'at', 'be', 'been', 'get', 'got', 'up',
]);

const KIND_LABEL: Record<MemoryItem['kind'], string> = {
  task: 'task',
  meal: 'meal',
  workout: 'workout',
  habit: 'habit',
  journal: 'journal entry',
  trade: 'trade',
};

/** Keyword search across the memory index — the deterministic "brain". */
export function searchMemory(query: string, memory: MemoryItem[]): MemoryItem[] {
  const terms = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
  if (!terms.length) return [];
  const scored = memory
    .map((m) => {
      const hay = m.text.toLowerCase();
      const score = terms.reduce((n, t) => n + (hay.includes(t) ? 1 : 0), 0);
      return { m, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, 3).map((x) => x.m);
}

export interface AssistantReply {
  answer: string;
  actionLabel: string;
  intent: AssistantIntent;
}

export function respondAssistant(
  query: string,
  snap: AssistantSnapshot,
): AssistantReply {
  const lo = query.toLowerCase();
  const th: Theme | undefined = THEMES.find((t) => lo.includes(t.name.toLowerCase()));

  // Recall / "ask my OS" — search the user's logged history and cite a source.
  if (
    /\b(when|what|did|have|recall|remember|find|search|last time|history|ago|note|wrote|journal(ed)?|ate|eat|log(ged)?)\b/.test(
      lo,
    ) &&
    !/today|plate|agenda|schedule|net liquid|theme/.test(lo)
  ) {
    const hits = searchMemory(query, snap.memory);
    if (hits.length) {
      const top = hits[0];
      const more =
        hits.length > 1
          ? ` I also found ${hits.length - 1} related ${
              hits.length - 1 > 1 ? 'entries' : 'entry'
            }.`
          : '';
      return {
        answer: `From your ${KIND_LABEL[top.kind]} on ${top.when}: "${top.text}".${more}`,
        actionLabel: `Recalled · ${top.when}`,
        intent: { type: 'none' },
      };
    }
    // fall through to the generic handlers if nothing matched
  }

  if (th && /theme|mode|switch|change|colou?r|look/.test(lo)) {
    return {
      answer: `Done — switched your theme to ${th.name}.`,
      actionLabel: 'Theme → ' + th.name,
      intent: { type: 'setTheme', themeKey: th.key },
    };
  }

  if (/^(nateman[,:\s]*)?(add|remind|note|create|put|schedule)\b/.test(lo)) {
    const txt =
      query
        .replace(/^(nateman[,:\s]*)?(add|remind me to|remind me|note|create|put|schedule)[:\s]*/i, '')
        .trim() || 'New task';
    return {
      answer: `Added “${cap(txt)}” to your tasks.`,
      actionLabel: 'Task added',
      intent: { type: 'addTask', text: txt },
    };
  }

  if (/day|today|plate|schedule|agenda|what.*(do|have)/.test(lo)) {
    const ans =
      snap.openToday === 0
        ? 'You’re all clear for today — nice work.'
        : `You have ${snap.openToday} task${snap.openToday > 1 ? 's' : ''} today${
            snap.highToday ? `, ${snap.highToday} high-priority` : ''
          }. Start with “${snap.firstOpenTitle}”.`;
    return { answer: ans, actionLabel: '', intent: { type: 'none' } };
  }

  if (/liquid|balance|net worth|money|cash|finance|spent|budget/.test(lo)) {
    return {
      answer: `Your net liquid is ${snap.netLiquidLabel}, and today’s P&L is ${snap.pnlTodayLabel}.`,
      actionLabel: 'Opened Finance',
      intent: { type: 'navigate', page: 'finance' },
    };
  }

  if (/cal|ate|eat|food|fuel|macro|protein/.test(lo)) {
    return {
      answer: `You’ve eaten ${snap.consumedKcal} kcal and burned ${snap.burnedKcal}. Net ${
        snap.consumedKcal - snap.burnedKcal
      } — about ${Math.max(0, snap.remainingKcal)} left to your target.`,
      actionLabel: 'Opened Health',
      intent: { type: 'navigate', page: 'health' },
    };
  }

  if (/how.*doing|progress|status|streak/.test(lo)) {
    return {
      answer: `${snap.doneToday}/${snap.totalToday} tasks done today and your habits are on track. Keep it up.`,
      actionLabel: '',
      intent: { type: 'none' },
    };
  }

  if (/thank|thanks|nice|cool|good job|love/.test(lo)) {
    return { answer: 'Anytime — happy to help.', actionLabel: '', intent: { type: 'none' } };
  }

  return {
    answer:
      'On it. I can plan your day, add tasks, check your money, log fuel, or switch themes — just ask.',
    actionLabel: '',
    intent: { type: 'none' },
  };
}

/**
 * AI SEAM — the real Nateman.
 *
 * Posts to /api/nateman, which calls Claude when an API key is configured. The
 * route returns { answer, actionLabel, action }; we validate the action against
 * the known themes/pages and map it to an AssistantIntent. With no key (or any
 * failure) we fall back to the deterministic respondAssistant() above, so the
 * assistant always answers.
 */
export async function respondAssistantSmart(
  query: string,
  snap: AssistantSnapshot,
  themes: { key: string; name: string }[],
): Promise<AssistantReply> {
  if (typeof fetch === 'undefined') return respondAssistant(query, snap);
  try {
    const res = await fetch('/api/nateman', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query, snapshot: snap, themes }),
    });
    if (!res.ok) return respondAssistant(query, snap);
    const data = (await res.json()) as {
      answer?: string;
      actionLabel?: string;
      action?: { type?: string; themeKey?: string; text?: string; page?: string };
    };
    const a = data.action || { type: 'none' };
    let intent: AssistantIntent = { type: 'none' };
    if (a.type === 'setTheme' && a.themeKey && THEMES.some((t) => t.key === a.themeKey)) {
      intent = { type: 'setTheme', themeKey: a.themeKey };
    } else if (a.type === 'addTask' && a.text) {
      intent = { type: 'addTask', text: a.text };
    } else if (a.type === 'navigate' && a.page && NAV_PAGES.includes(a.page as NavPage)) {
      intent = { type: 'navigate', page: a.page as NavPage };
    }
    return {
      answer: data.answer || 'On it.',
      actionLabel: data.actionLabel || '',
      intent,
    };
  } catch {
    return respondAssistant(query, snap);
  }
}
