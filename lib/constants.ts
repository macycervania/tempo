import type {
  Theme,
  Currency,
  TempoState,
  Targets,
  Notifs,
} from './types';

export const PALETTE = [
  '#6f90b4',
  '#bd9166',
  '#74ad84',
  'var(--accent)',
  '#9b7fb4',
  '#b46f8a',
  '#7fb4a8',
  '#b4a466',
];

export const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export const DEFAULT_TARGETS: Targets = { kcal: 2800, p: 180, c: 300, f: 80 };

export const NA_DEMOS = [
  'What’s on my plate today?',
  'Add: review my SPY setup tonight',
  'How am I doing today?',
  'Switch to Midnight theme',
  'What’s my net liquid?',
];

export const THEMES: Theme[] = [
  {
    key: 'ember',
    name: 'Ember',
    dot: '#e8a44c',
    accent: '#e8a44c',
    pal: {
      bg: '#0c0b0a',
      panel: '#13110d',
      inset: '#1c1711',
      line: '#2a231a',
      line2: '#3c3122',
      text: '#ececea',
      dim: '#cfc8bf',
      muted: '#a79c8c',
      faint: '#7d7262',
      faint2: '#5e5647',
    },
  },
  {
    key: 'midnight',
    name: 'Midnight',
    dot: '#7c6cf0',
    accent: '#7c6cf0',
    pal: {
      bg: '#0a0c18',
      panel: '#14172e',
      inset: '#1d2245',
      line: '#2b3158',
      line2: '#3c447a',
      text: '#e9eaf6',
      dim: '#c3c6e0',
      muted: '#9499bd',
      faint: '#6f75a4',
      faint2: '#555b88',
    },
  },
  {
    key: 'trench',
    name: 'Trench',
    dot: '#2bbfa6',
    accent: '#2bbfa6',
    pal: {
      bg: '#07130f',
      panel: '#0f211c',
      inset: '#16312a',
      line: '#21433a',
      line2: '#2e5d50',
      text: '#e3efec',
      dim: '#bbd2cc',
      muted: '#86a69d',
      faint: '#638078',
      faint2: '#4c655b',
    },
  },
  {
    key: 'matrix',
    name: 'Matrix',
    dot: '#54d65a',
    accent: '#54d65a',
    pal: {
      bg: '#07110a',
      panel: '#0f1e13',
      inset: '#162c1c',
      line: '#213e2a',
      line2: '#2e573a',
      text: '#e6f0e9',
      dim: '#bfd4c6',
      muted: '#8caa96',
      faint: '#698672',
      faint2: '#516857',
    },
  },
  {
    key: 'crimson',
    name: 'Crimson',
    dot: '#e0566f',
    accent: '#e0566f',
    pal: {
      bg: '#110909',
      panel: '#201012',
      inset: '#2c171a',
      line: '#3e2429',
      line2: '#58333a',
      text: '#f1e8e9',
      dim: '#dac0c4',
      muted: '#b58d93',
      faint: '#956c72',
      faint2: '#755559',
    },
  },
  {
    key: 'light',
    name: 'Light',
    dot: '#7c6cf0',
    accent: '#7c6cf0',
    light: true,
    pal: {
      bg: '#f4f5f7',
      panel: '#ffffff',
      inset: '#eef0f3',
      line: '#e4e6ea',
      line2: '#d3d7df',
      text: '#1b1e26',
      dim: '#474c57',
      muted: '#697084',
      faint: '#8b919e',
      faint2: '#aab0bb',
    },
  },
];

export const CURRENCIES: Currency[] = [
  { code: 'PHP', symbol: '₱' },
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'JPY', symbol: '¥' },
  { code: 'INR', symbol: '₹' },
];

export const DEFAULT_NOTIFS: Notifs = {
  dailySummary: true,
  habitReminders: true,
  deadlineAlerts: true,
  weeklyReview: false,
};

export const MOTIVATE = [
  'Nice — keep it rolling.',
  'That’s the way.',
  'One step closer.',
  'Momentum building.',
  'Locked in.',
  'Streak alive — let’s go.',
  'Future you says thanks.',
];

/** A daily word — motivational lines and Bible verses, shown on the Overview. */
export const VERSES: { text: string; ref: string }[] = [
  { text: 'I can do all things through Christ who strengthens me.', ref: 'Philippians 4:13' },
  { text: 'Commit your work to the Lord, and your plans will be established.', ref: 'Proverbs 16:3' },
  { text: 'Whatever you do, work heartily, as for the Lord and not for men.', ref: 'Colossians 3:23' },
  { text: 'She is clothed with strength and dignity, and laughs without fear of the future.', ref: 'Proverbs 31:25' },
  { text: 'Be strong and courageous. Do not be afraid; the Lord your God is with you.', ref: 'Joshua 1:9' },
  { text: 'Trust in the Lord with all your heart, and lean not on your own understanding.', ref: 'Proverbs 3:5' },
  { text: 'The plans of the diligent lead surely to abundance.', ref: 'Proverbs 21:5' },
  { text: 'Discipline is choosing between what you want now and what you want most.', ref: '' },
  { text: 'Small steps every day add up to big distances.', ref: '' },
  { text: 'You don’t have to be extreme, just consistent.', ref: '' },
  { text: 'Do the hard thing first — the rest of the day bends to it.', ref: '' },
  { text: 'Let us not grow weary of doing good, for in due season we will reap.', ref: 'Galatians 6:9' },
  { text: 'Motivation gets you started; habit keeps you going.', ref: '' },
  { text: 'Today’s effort is tomorrow’s edge.', ref: '' },
];

/** Today as an en-CA ISO date string (YYYY-MM-DD) in local time. */
export function todayISO(): string {
  return new Date().toLocaleDateString('en-CA');
}

/** An en-CA ISO date string `n` days before today, in local time. */
export function daysAgoISO(n: number): string {
  return new Date(Date.now() - n * 86400000).toLocaleDateString('en-CA');
}

/** The initial application state — the prototype's seed data. */
export function makeInitialState(): TempoState {
  return {
    page: 'overview',
    userName: '',
    pfp: '',
    goals: {
      weekly: {
        title: 'Ship the OS project & stay green on trades',
        krs: [
          { label: 'Finish 3 problem sets', done: true },
          { label: 'Merge the rate-limit PR', done: false },
          { label: '5 gym sessions', done: false },
          { label: 'Green trading week', done: false },
        ],
      },
      monthly: {
        title: 'Land the return offer & grow capital 10%',
        krs: [
          { label: 'Top review at internship', done: false },
          { label: 'Maintain 3.7 GPA', done: true },
          { label: 'Hit 16 workouts', done: false },
          { label: 'Portfolio +10% MoM', done: false },
        ],
      },
    },
    selectedDate: todayISO(),
    calOffset: 0,
    calDraft: '',
    theme: 'ember',
    currency: { code: 'PHP', symbol: '₱' },
    reduceMotion: false,
    targets: { ...DEFAULT_TARGETS },
    notifs: { ...DEFAULT_NOTIFS },
    naOpen: false,
    naPhase: 'idle',
    naQuery: '',
    naAnswer: '',
    naActionLabel: '',
    naTake: 0,
    naInput: '',
    wake: false,
    sound: true,
    voiceURI: '',
    managing: false,
    catDraft: '',
    capture: '',
    foodDraft: '',
    exDraft: '',
    tradeDraft: '',
    recording: false,
    processing: false,
    transcript: '',
    voiceTake: 0,
    toast: null,
    tick: 0,
    edit: null,
    editVal: '',
    expenseDraft: '',
    budgetManaging: false,
    calHistory: [2650, 2900, 2400, 3050, 2750, 2500],
    budget: {
      income: [
        { label: 'Allowance', amt: 8000 },
        { label: 'Internship stipend', amt: 18000 },
        { label: 'Trading profit', amt: 6000 },
        { label: 'Freelance / other', amt: 3000 },
      ],
      groups: [
        {
          name: 'Housing & Bills',
          subs: [
            { label: 'Rent / dorm', budget: 9000, spent: 9000 },
            { label: 'Electricity', budget: 1200, spent: 850 },
            { label: 'Water', budget: 400, spent: 380 },
            { label: 'Internet / wifi', budget: 1699, spent: 1699 },
            { label: 'Phone load', budget: 600, spent: 450 },
          ],
        },
        {
          name: 'Food',
          subs: [
            { label: 'Groceries', budget: 4000, spent: 2850 },
            { label: 'Eating out', budget: 2500, spent: 1980 },
            { label: 'Coffee', budget: 1200, spent: 940 },
          ],
        },
        {
          name: 'Transportation',
          subs: [
            { label: 'Jeepney / bus', budget: 1500, spent: 1120 },
            { label: 'Grab', budget: 1200, spent: 760 },
            { label: 'Train / fare', budget: 600, spent: 540 },
          ],
        },
        {
          name: 'Education',
          subs: [
            { label: 'Books & materials', budget: 1500, spent: 1200 },
            { label: 'Online courses', budget: 1000, spent: 499 },
            { label: 'Printing', budget: 300, spent: 180 },
          ],
        },
        {
          name: 'Health & Gym',
          subs: [
            { label: 'Gym membership', budget: 1500, spent: 1500 },
            { label: 'Supplements', budget: 1800, spent: 1650 },
            { label: 'Medicine', budget: 500, spent: 220 },
          ],
        },
        {
          name: 'Trading & Investing',
          subs: [
            { label: 'Brokerage fees', budget: 500, spent: 320 },
            { label: 'Data / tools', budget: 900, spent: 900 },
            { label: 'Courses', budget: 1000, spent: 0 },
          ],
        },
        {
          name: 'Lifestyle',
          subs: [
            { label: 'Subscriptions', budget: 800, spent: 798 },
            { label: 'Shopping', budget: 2000, spent: 1450 },
            { label: 'Entertainment', budget: 1000, spent: 620 },
          ],
        },
        {
          name: 'Savings',
          subs: [
            { label: 'Emergency fund', budget: 3000, spent: 3000 },
            { label: 'Investments', budget: 4000, spent: 4000 },
          ],
        },
      ],
    },
    areas: [
      { key: 'school', label: 'School', tint: '#6f90b4' },
      { key: 'internship', label: 'Intern', tint: '#bd9166' },
      { key: 'gym', label: 'Gym', tint: '#74ad84' },
      { key: 'business', label: 'Trading', tint: 'var(--accent)' },
    ],
    tasks: [
      { id: 1, title: 'Finish data structures problem set', area: 'school', due: 'today', priority: 'high', done: false },
      { id: 2, title: 'Push the API rate-limit fix to staging', area: 'internship', due: 'today', priority: 'high', done: false },
      { id: 9, title: 'Review SPY weekly setup before the open', area: 'business', due: 'today', priority: 'high', done: false },
      { id: 5, title: 'Write standup notes for mentor 1:1', area: 'internship', due: 'today', priority: 'med', done: false },
      { id: 10, title: 'Journal yesterday’s 3 trades', area: 'business', due: 'today', priority: 'med', done: false },
      { id: 7, title: 'Push day — chest & triceps', area: 'gym', due: 'today', priority: 'med', done: true },
      { id: 25, title: 'Read OS textbook — Ch. 7', area: 'school', due: 'tomorrow', priority: 'low', done: false },
      { id: 11, title: 'Backtest the breakout strategy', area: 'business', due: 'fri', priority: 'low', done: false },
    ],
    meals: [
      { id: 'm1', time: '07:40', name: 'Greek yogurt, banana, granola', kcal: 380, p: 24, c: 52, f: 9 },
      { id: 'm2', time: '12:30', name: 'Chicken, rice & broccoli bowl', kcal: 610, p: 48, c: 70, f: 12 },
    ],
    workouts: [
      { id: 'w1', time: '06:30', name: 'Push day — chest & triceps', minutes: 48, kcal: 384 },
    ],
    habits: [
      { id: 'h1', name: 'Gym', cat: 'FITNESS', week: [true, true, false, true, true, false, false], subs: [] },
      { id: 'h2', name: 'Supplements', cat: 'HEALTH', week: [false, false, false, false, false, false, false], subs: [{ label: 'Morning stack', done: false }, { label: 'Creatine', done: false }, { label: 'Evening stack', done: false }] },
      { id: 'h3', name: 'Read 30 min', cat: 'GROWTH', week: [true, false, true, true, false, false, false], subs: [] },
      { id: 'h4', name: 'Journal trades', cat: 'TRADING', week: [true, true, true, true, true, false, false], subs: [{ label: 'Log entries', done: true }, { label: 'Tag setups', done: false }] },
      { id: 'h5', name: 'Deep work', cat: 'OUTPUT', week: [true, true, true, false, false, false, false], subs: [] },
    ],
    habitExpanded: null,
    fin: {
      cashOpening: 20000,
      savings: 30000,
      ewallet: 4200,
      assets: [
        { label: 'EQUITIES', val: 86000, color: '#74ad84' },
        { label: 'INDEX FUNDS', val: 42000, color: '#6f90b4' },
        { label: 'CRYPTO', val: 22000, color: 'var(--accent)' },
      ],
      pnlToday: 1850,
      pnlMonth: 9400,
      pnlTotal: 31200,
      history: [-650, 420, 1100, -300, 780, 1600, -480, 950, 1380, 1850],
      trades: [
        { id: 't1', sym: 'SPY', date: 'Today · 09:41', pnl: 1150 },
        { id: 't2', sym: 'NVDA', date: 'Today · 10:15', pnl: 700 },
        { id: 't3', sym: 'TSLA', date: 'Yesterday', pnl: -460 },
        { id: 't4', sym: 'AAPL', date: 'Mon', pnl: 520 },
      ],
    },
    journal: [
      {
        id: 'j1',
        date: daysAgoISO(1),
        time: '22:10',
        text: 'Closed a green trading day and finally merged the rate-limit PR. Felt scattered in the afternoon — too many context switches. Tomorrow: one deep-work block before standup.',
        mood: 'good',
      },
      {
        id: 'j2',
        date: daysAgoISO(2),
        time: '21:30',
        text: 'Skipped the gym, regret it. Studied OS chapter 6 instead. Need to protect the morning workout slot.',
        mood: 'okay',
      },
    ],
    journalDraft: '',
    journalMood: 'good',
    summarizing: false,
  };
}
