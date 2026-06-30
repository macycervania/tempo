// Domain model for Tempo // OS. These mirror the shapes the original prototype
// kept in component state, lifted into typed structures.

export type Priority = 'high' | 'med' | 'low';
export type DueKey = 'today' | 'tomorrow' | 'wed' | 'fri' | string;

export interface Area {
  key: string;
  label: string;
  tint: string;
}

export interface Task {
  id: string | number;
  title: string;
  area: string;
  /** Relative due bucket ('today' | 'tomorrow' | 'wed' | 'fri' | ISO date). */
  due?: DueKey;
  /** Explicit ISO date (en-CA) — set when a task is pinned to a calendar day. */
  date?: string;
  priority: Priority;
  done: boolean;
  viaVoice?: boolean;
}

export interface Meal {
  id: string;
  time: string;
  name: string;
  kcal: number;
  p: number;
  c: number;
  f: number;
}

export interface Workout {
  id: string;
  time: string;
  name: string;
  minutes: number;
  kcal: number;
}

export type Mood = 'great' | 'good' | 'okay' | 'low' | 'rough';

export interface JournalEntry {
  id: string;
  /** ISO date (en-CA) the entry belongs to. */
  date: string;
  /** Clock time the entry was written. */
  time: string;
  text: string;
  mood?: Mood;
  /** AI 'summarise my day' output, generated on demand. */
  summary?: string;
}

export interface HabitSub {
  label: string;
  done: boolean;
}

export interface Habit {
  id: string;
  name: string;
  cat: string;
  /** Mon..Sun completion flags. */
  week: boolean[];
  subs: HabitSub[];
}

export interface KeyResult {
  label: string;
  done: boolean;
}

export interface Goal {
  title: string;
  krs: KeyResult[];
}

export interface Goals {
  weekly: Goal;
  monthly: Goal;
}

export interface IncomeLine {
  label: string;
  amt: number;
}

export interface BudgetSub {
  label: string;
  budget: number;
  spent: number;
}

export interface BudgetGroup {
  name: string;
  subs: BudgetSub[];
}

export interface Budget {
  income: IncomeLine[];
  groups: BudgetGroup[];
}

export interface AssetLine {
  label: string;
  val: number;
  color: string;
}

export interface Trade {
  id: string;
  sym: string;
  date: string;
  pnl: number;
}

export interface Finance {
  cashOpening: number;
  savings: number;
  ewallet: number;
  assets: AssetLine[];
  pnlToday: number;
  pnlMonth: number;
  pnlTotal: number;
  history: number[];
  trades: Trade[];
}

/** Live read-only state of a public Solana wallet's balance. */
export type WalletStatus = 'idle' | 'loading' | 'ok' | 'error';

/**
 * A tracked Solana wallet. Only the public address + label are persisted; the
 * balance is read-only and refreshed live from the chain (never a private key).
 */
export interface SolWallet {
  id: string;
  label: string;
  /** Public base58 address. */
  address: string;
  /** Last fetched SOL balance. */
  sol: number;
  /** Last fetched value in the user's currency. */
  valLocal: number;
  status: WalletStatus;
}

export interface Currency {
  code: string;
  symbol: string;
}

export interface Targets {
  kcal: number;
  p: number;
  c: number;
  f: number;
}

/** Body metrics used for the goal tracker and for AI calorie-burn accuracy. */
export interface Body {
  /** Current body weight in kg. */
  weight: number;
  /** Height in cm. */
  height: number;
  /** Goal body weight in kg. */
  goalWeight: number;
}

export interface Notifs {
  dailySummary: boolean;
  habitReminders: boolean;
  deadlineAlerts: boolean;
  weeklyReview: boolean;
}

export interface ThemePalette {
  bg: string;
  panel: string;
  inset: string;
  line: string;
  line2: string;
  text: string;
  dim: string;
  muted: string;
  faint: string;
  faint2: string;
}

export interface Theme {
  key: string;
  name: string;
  dot: string;
  accent: string;
  light?: boolean;
  pal: ThemePalette;
}

export type Page =
  | 'overview'
  | 'tasks'
  | 'habits'
  | 'health'
  | 'budget'
  | 'finance'
  | 'memecoins'
  | 'leaderboard'
  | 'calendar'
  | 'journal'
  | 'settings';

export type NaPhase = 'idle' | 'listening' | 'thinking' | 'answer';

/** Signed-in account (Supabase Google auth). Null when logged out / no backend. */
export interface Account {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

/** One row of the shared progress leaderboard. */
export interface LeaderRow {
  id: string;
  name: string;
  avatar: string;
  score: number;
  tasksDone: number;
  habitPct: number;
  pnl: number;
  updatedAt: string;
  isMe: boolean;
}

/** A live memecoin position derived from a tracked wallet's holdings. */
export interface TokenPosition {
  mint: string;
  symbol: string;
  name: string;
  amount: number;
  priceUsd: number;
  valueUsd: number;
  change24h: number; // percent
  dayPnlUsd: number;
  icon: string;
}

/** The full mutable application state — the single source of truth. */
export interface TempoState {
  page: Page;
  userName: string;
  pfp: string;
  /** Signed-in account, or null. */
  account: Account | null;
  /** True once the initial auth check has resolved. */
  authReady: boolean;
  /** Live leaderboard rows (empty until synced). */
  leaderboard: LeaderRow[];
  /** Live memecoin positions for tracked wallets. */
  positions: TokenPosition[];
  positionsLoading: boolean;
  goals: Goals;
  selectedDate: string;
  calOffset: number;
  calDraft: string;
  theme: string;
  currency: Currency;
  reduceMotion: boolean;
  targets: Targets;
  body: Body;
  notifs: Notifs;
  // Nateman assistant
  naOpen: boolean;
  naPhase: NaPhase;
  naQuery: string;
  naAnswer: string;
  naActionLabel: string;
  naTake: number;
  naInput: string;
  wake: boolean;
  sound: boolean;
  voiceURI: string;
  // category management
  managing: boolean;
  catDraft: string;
  /** Show completed tasks on the Tasks page. */
  showDone: boolean;
  /** Editable Eisenhower quadrant titles (length 4). */
  matrixTitles: string[];
  /** Add-task form: selected life-area key and quadrant index (0–3). */
  newTaskArea: string;
  newTaskQuad: number;
  // capture inputs
  capture: string;
  foodDraft: string;
  /** MyFitnessPal-style live food search results for the meal logger. */
  foodResults: import('./foods').FoodHit[];
  foodSearching: boolean;
  exDraft: string;
  tradeDraft: string;
  recording: boolean;
  processing: boolean;
  transcript: string;
  voiceTake: number;
  toast: string | null;
  tick: number;
  // inline editing
  edit: string | null;
  editVal: string;
  expenseDraft: string;
  /** Budget sections in edit mode ('income', or 'g{index}' per category). */
  budgetEdit: string[];
  /** Finance sections currently in edit mode (e.g. 'liquid', 'assets', 'pnl', 'journal'). */
  finEdit: string[];
  /** Read-only Solana wallets tracked in net worth. */
  wallets: SolWallet[];
  walletAddrDraft: string;
  walletLabelDraft: string;
  calHistory: number[];
  budget: Budget;
  areas: Area[];
  tasks: Task[];
  meals: Meal[];
  workouts: Workout[];
  habits: Habit[];
  habitExpanded: string | null;
  fin: Finance;
  // journal
  journal: JournalEntry[];
  journalDraft: string;
  journalMood: Mood;
  summarizing: boolean;
}
