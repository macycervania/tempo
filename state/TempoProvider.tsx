'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { Currency, Page, TempoState, Theme } from '@/lib/types';
import { makeInitialState, MOTIVATE, THEMES } from '@/lib/constants';
import {
  classifyTask,
  estimateExercise,
  estimateFood,
  parseTrade,
  respondAssistant,
  transcribeVoice,
  type AssistantSnapshot,
} from '@/lib/ai';
import {
  fmtMoney,
  fmtSigned,
  isoLocal,
  labelForDate,
  nowTime,
  taskDate,
  todayIndex,
} from '@/lib/format';
import { clearSettings, loadSettings, savePfp, saveSettings } from '@/lib/storage';
import type { Task } from '@/lib/types';

// ── Context shape ───────────────────────────────────────────────────────────────
export interface TempoApi {
  state: TempoState;
  // page + chrome
  setPage: (p: Page) => void;
  onOpenSettings: () => void;
  // categories
  onToggleManage: () => void;
  onCatInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCatKey: (e: React.KeyboardEvent) => void;
  onCatAdd: () => void;
  onCatRemove: (key: string) => void;
  // capture / voice
  onCaptureInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCaptureKey: (e: React.KeyboardEvent) => void;
  onCaptureSubmit: () => void;
  onVoice: () => void;
  // fuel / training / trade
  onFoodInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFoodKey: (e: React.KeyboardEvent) => void;
  onFoodSubmit: () => void;
  onExInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExKey: (e: React.KeyboardEvent) => void;
  onExSubmit: () => void;
  onTradeInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTradeKey: (e: React.KeyboardEvent) => void;
  onTradeSubmit: () => void;
  removeMeal: (id: string) => void;
  removeWorkout: (id: string) => void;
  // tasks
  toggleTask: (id: string | number) => void;
  // habits
  toggleHabitToday: (id: string) => void;
  toggleSub: (id: string, i: number) => void;
  toggleExpand: (id: string) => void;
  addHabit: () => void;
  removeHabit: (id: string) => void;
  addSub: (id: string) => void;
  removeSub: (id: string, i: number) => void;
  // goals
  toggleKR: (period: 'weekly' | 'monthly', i: number) => void;
  addKR: (period: 'weekly' | 'monthly') => void;
  removeKR: (period: 'weekly' | 'monthly', i: number) => void;
  // budget
  onToggleBudgetManage: () => void;
  addLine: (gi: number) => void;
  removeLine: (gi: number, si: number) => void;
  addGroup: () => void;
  removeGroup: (gi: number) => void;
  addIncome: () => void;
  removeIncome: (i: number) => void;
  onExpenseInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExpenseKey: (e: React.KeyboardEvent) => void;
  onExpenseSubmit: () => void;
  // inline editing
  startEdit: (key: string, val: string | number) => void;
  onEditInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEditKey: (e: React.KeyboardEvent) => void;
  commitEdit: () => void;
  focusRef: (el: HTMLInputElement | null) => void;
  // profile
  fileRef: (el: HTMLInputElement | null) => void;
  onPickPfp: () => void;
  onPfpChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEditUserName: () => void;
  // calendar
  selectDay: (iso: string) => void;
  prevMonth: () => void;
  nextMonth: () => void;
  onCalDraftInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCalDraftKey: (e: React.KeyboardEvent) => void;
  onCalAdd: () => void;
  // settings
  setTheme: (k: string) => void;
  setCurrency: (c: Currency) => void;
  toggleReduceMotion: () => void;
  toggleNotif: (k: keyof TempoState['notifs']) => void;
  onTargetChange: (field: keyof TempoState['targets'], val: string) => void;
  resetSettings: () => void;
  toggleSound: () => void;
  setVoice: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  testVoice: () => void;
  toggleWake: () => void;
  // nateman
  openNateman: (q?: string) => void;
  closeNateman: () => void;
  onNaInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNaKey: (e: React.KeyboardEvent) => void;
  onNaSend: () => void;
}

const Ctx = createContext<TempoApi | null>(null);

export function useTempo(): TempoApi {
  const v = useContext(Ctx);
  if (!v) throw new Error('useTempo must be used inside <TempoProvider>');
  return v;
}

export function TempoProvider({ children }: { children: React.ReactNode }) {
  const [state, setStateRaw] = useState<TempoState>(makeInitialState);

  // Mirror of the latest committed state so actions can read synchronously
  // (the class component relied on `this.state` the same way).
  const ref = useRef(state);
  ref.current = state;

  // Shallow-merge partial-state updates, matching React class setState semantics.
  const set = useCallback(
    (patch: Partial<TempoState> | ((s: TempoState) => Partial<TempoState>)) => {
      setStateRaw((prev) => {
        const part = typeof patch === 'function' ? patch(prev) : patch;
        const next = { ...prev, ...part };
        ref.current = next;
        return next;
      });
    },
    [],
  );

  // mutable, non-render refs (timers, audio, mic, counters)
  const timers = useRef<Record<string, ReturnType<typeof setTimeout> | undefined>>({});
  const actx = useRef<AudioContext | null>(null);
  const recRef = useRef<any>(null);
  const naCool = useRef(false);
  const idc = useRef(0);
  const fileEl = useRef<HTMLInputElement | null>(null);

  // ── lifecycle: clock, persisted prefs, voices ──────────────────────────────
  useEffect(() => {
    const clk = setInterval(() => set((s) => ({ tick: s.tick + 1 })), 30000);
    const { settings, pfp, name } = loadSettings();
    const patch: Partial<TempoState> = {};
    if (settings) Object.assign(patch, settings);
    if (pfp) patch.pfp = pfp;
    if (name && !(settings && settings.userName)) patch.userName = name;
    if (Object.keys(patch).length) set(patch);
    try {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = () =>
          set((s) => ({ tick: s.tick + 1 }));
      }
    } catch {
      /* ignore */
    }
    return () => {
      clearInterval(clk);
      Object.values(timers.current).forEach((t) => t && clearTimeout(t));
      stopWake();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── apply theme palette to :root whenever the theme changes ─────────────────
  useEffect(() => {
    const theme: Theme = THEMES.find((t) => t.key === state.theme) || THEMES[0];
    const PAL = theme.pal || THEMES[0].pal;
    const r = document.documentElement.style;
    r.setProperty('--bg', PAL.bg);
    r.setProperty('--panel', PAL.panel);
    r.setProperty('--inset', PAL.inset);
    r.setProperty('--line', PAL.line);
    r.setProperty('--line2', PAL.line2);
    r.setProperty('--text', PAL.text);
    r.setProperty('--text-dim', PAL.dim);
    r.setProperty('--text-muted', PAL.muted);
    r.setProperty('--text-faint', PAL.faint);
    r.setProperty('--text-faint2', PAL.faint2);
    r.setProperty('--accent', theme.accent);
  }, [state.theme]);

  // ── persist preference slice whenever it changes ────────────────────────────
  useEffect(() => {
    saveSettings(ref.current);
  }, [
    state.theme,
    state.currency,
    state.reduceMotion,
    state.targets,
    state.notifs,
    state.userName,
    state.sound,
    state.voiceURI,
  ]);

  // ── small helpers ───────────────────────────────────────────────────────────
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const meta = useCallback(
    (key: string) =>
      ref.current.areas.find((a) => a.key === key) ||
      ref.current.areas[0] || { key: '', label: '—', tint: 'var(--text-muted)' },
    [],
  );
  const flashToast = useCallback(
    (msg: string) => {
      set({ toast: msg });
      clearTimeout(timers.current.toast);
      timers.current.toast = setTimeout(() => set({ toast: null }), 2800);
    },
    [set],
  );
  const cheer = () => MOTIVATE[Math.floor(Math.random() * MOTIVATE.length)];

  const beep = useCallback((freqs: number[]) => {
    if (!ref.current.sound) return;
    try {
      const Ctor =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctor) return;
      if (!actx.current) actx.current = new Ctor();
      const ctx = actx.current!;
      if (ctx.state === 'suspended') ctx.resume();
      const t0 = ctx.currentTime;
      freqs.forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = f;
        o.connect(g);
        g.connect(ctx.destination);
        const st = t0 + i * 0.09;
        g.gain.setValueAtTime(0.0001, st);
        g.gain.exponentialRampToValueAtTime(0.12, st + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, st + 0.18);
        o.start(st);
        o.stop(st + 0.2);
      });
    } catch {
      /* ignore */
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!ref.current.sound) return;
    try {
      const syn = window.speechSynthesis;
      if (!syn) return;
      syn.cancel();
      const u = new SpeechSynthesisUtterance(
        String(text).replace(/[“”—]/g, ' '),
      );
      const voices = syn.getVoices() || [];
      let v = voices.find((x) => x.voiceURI === ref.current.voiceURI);
      if (!v)
        v =
          voices.find(
            (x) =>
              /en/i.test(x.lang) &&
              /(daniel|fred|aaron|arthur|male|google us)/i.test(x.name),
          ) ||
          voices.find((x) => /en/i.test(x.lang)) ||
          voices[0];
      if (v) u.voice = v;
      u.rate = 0.9;
      u.pitch = 0.55;
      u.volume = 1;
      syn.speak(u);
    } catch {
      /* ignore */
    }
  }, []);

  const confettiBurst = useCallback(() => {
    if (ref.current.reduceMotion) return;
    try {
      const acc =
        getComputedStyle(document.documentElement)
          .getPropertyValue('--accent')
          .trim() || '#e8a44c';
      const colors = [acc, '#54d65a', '#7c6cf0', '#e0566f', '#ffb648'];
      const layer = document.createElement('div');
      layer.style.cssText =
        'position:fixed;inset:0;z-index:70;pointer-events:none;overflow:hidden';
      document.body.appendChild(layer);
      const W = window.innerWidth;
      const H = window.innerHeight;
      for (let i = 0; i < 46; i++) {
        const p = document.createElement('div');
        const sz = 6 + Math.random() * 7;
        p.style.cssText = `position:absolute;top:-16px;left:${
          Math.random() * W
        }px;width:${sz}px;height:${sz * 1.5}px;background:${
          colors[i % colors.length]
        };border-radius:2px`;
        layer.appendChild(p);
        const dx = (Math.random() - 0.5) * 240;
        p.animate(
          [
            { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
            {
              transform: `translate(${dx}px, ${H * 0.85}px) rotate(${
                360 + Math.random() * 540
              }deg)`,
              opacity: 1,
              offset: 0.82,
            },
            {
              transform: `translate(${dx}px, ${H + 60}px) rotate(560deg)`,
              opacity: 0,
            },
          ],
          {
            duration: 1200 + Math.random() * 900,
            easing: 'cubic-bezier(.2,.6,.4,1)',
          },
        );
      }
      setTimeout(() => layer.remove(), 2200);
    } catch {
      /* ignore */
    }
  }, []);

  const allHabitsDone = (habits: TempoState['habits']) => {
    const ti = todayIndex();
    return habits.length > 0 && habits.every((h) => h.week[ti]);
  };

  const makeTask = (text: string, viaVoice: boolean): Task => {
    const fields = classifyTask(text, ref.current.areas);
    idc.current += 1;
    return {
      id: 'g' + Date.now() + '_' + idc.current,
      title: fields.title,
      area: fields.area,
      due: fields.due,
      priority: fields.priority,
      done: false,
      viaVoice: !!viaVoice,
    };
  };

  // ── category management ─────────────────────────────────────────────────────
  const setPage = useCallback((p: Page) => set({ page: p }), [set]);
  const onOpenSettings = useCallback(() => set({ page: 'settings' }), [set]);
  const onToggleManage = useCallback(
    () => set((s) => ({ managing: !s.managing, catDraft: '' })),
    [set],
  );
  const onCatInput = (e: React.ChangeEvent<HTMLInputElement>) =>
    set({ catDraft: e.target.value });
  const onCatAdd = useCallback(() => {
    const label = ref.current.catDraft.trim();
    if (!label) return;
    const key = 'c_' + Date.now();
    set((s) => ({
      catDraft: '',
      areas: [
        ...s.areas,
        {
          key,
          label,
          tint: [
            '#6f90b4',
            '#bd9166',
            '#74ad84',
            'var(--accent)',
            '#9b7fb4',
            '#b46f8a',
            '#7fb4a8',
            '#b4a466',
          ][s.areas.length % 8],
        },
      ],
    }));
    flashToast(`Added category “${label}”`);
  }, [set, flashToast]);
  const onCatKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onCatAdd();
  };
  const onCatRemove = useCallback(
    (key: string) =>
      set((s) => {
        const remaining = s.areas.filter((a) => a.key !== key);
        const fallback = (remaining[0] || ({} as any)).key;
        return {
          areas: remaining,
          tasks: s.tasks.map((t) =>
            t.area === key ? { ...t, area: fallback } : t,
          ),
        };
      }),
    [set],
  );

  // ── capture / voice ─────────────────────────────────────────────────────────
  const onCaptureInput = (e: React.ChangeEvent<HTMLInputElement>) =>
    set({ capture: e.target.value });
  const onCaptureSubmit = useCallback(() => {
    const t = ref.current.capture.trim();
    if (!t) return;
    if (/\bnateman\b/i.test(t)) {
      const q = t.replace(/.*?\bnateman\b[,:\s]*/i, '').trim();
      set({ capture: '' });
      openNateman(q);
      return;
    }
    const task = makeTask(t, false);
    set((s) => ({ capture: '', tasks: [task, ...s.tasks] }));
    flashToast(
      `Filed to ${meta(task.area).label} · ${task.priority.toUpperCase()} priority`,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [set, flashToast, meta]);
  const onCaptureKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onCaptureSubmit();
  };

  const finishVoice = useCallback(() => {
    const v = transcribeVoice(ref.current.voiceTake);
    const newTasks = v.items.map((it) => makeTask(it, true));
    set((s) => ({
      processing: false,
      transcript: v.tr,
      voiceTake: s.voiceTake + 1,
      tasks: [...newTasks, ...s.tasks],
    }));
    const highs = newTasks.filter((t) => t.priority === 'high').length;
    flashToast(
      `Captured ${newTasks.length} tasks from voice${
        highs ? ` · ${highs} flagged high` : ''
      }`,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [set, flashToast]);
  const onVoice = useCallback(() => {
    if (ref.current.recording || ref.current.processing) return;
    set({ recording: true, transcript: '' });
    timers.current.v1 = setTimeout(() => {
      set({ recording: false, processing: true });
      timers.current.v2 = setTimeout(() => finishVoice(), 950);
    }, 2400);
  }, [set, finishVoice]);

  // ── fuel / training / trade ─────────────────────────────────────────────────
  const onFoodInput = (e: React.ChangeEvent<HTMLInputElement>) =>
    set({ foodDraft: e.target.value });
  const onFoodSubmit = useCallback(() => {
    const t = ref.current.foodDraft.trim();
    if (!t) return;
    const est = estimateFood(t);
    if (!est) return;
    const meal = {
      id: 'm' + Date.now(),
      time: nowTime(),
      name: cap(t),
      kcal: est.kcal,
      p: est.p,
      c: est.c,
      f: est.f,
    };
    set((s) => ({ foodDraft: '', meals: [...s.meals, meal] }));
    flashToast(`Logged ${est.kcal} kcal · ${est.p}g protein`);
  }, [set, flashToast]);
  const onFoodKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onFoodSubmit();
  };
  const onExInput = (e: React.ChangeEvent<HTMLInputElement>) =>
    set({ exDraft: e.target.value });
  const onExSubmit = useCallback(() => {
    const t = ref.current.exDraft.trim();
    if (!t) return;
    const est = estimateExercise(t);
    if (!est) return;
    const w = {
      id: 'w' + Date.now(),
      time: nowTime(),
      name: cap(t),
      minutes: est.minutes,
      kcal: est.kcal,
    };
    set((s) => ({ exDraft: '', workouts: [...s.workouts, w] }));
    flashToast(`Logged ${est.minutes} min · ${est.kcal} kcal burned`);
  }, [set, flashToast]);
  const onExKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onExSubmit();
  };
  const onTradeInput = (e: React.ChangeEvent<HTMLInputElement>) =>
    set({ tradeDraft: e.target.value });
  const onTradeSubmit = useCallback(() => {
    const t = ref.current.tradeDraft.trim();
    if (!t) return;
    const tr = parseTrade(t);
    if (!tr) {
      flashToast('Try a format like “SPY +210”');
      return;
    }
    set((s) => {
      const fin = JSON.parse(JSON.stringify(s.fin));
      fin.trades = [
        {
          id: 'tr' + Date.now(),
          sym: tr.sym,
          date: 'Today · ' + nowTime(),
          pnl: tr.pnl,
        },
        ...fin.trades,
      ];
      fin.pnlToday += tr.pnl;
      fin.pnlMonth += tr.pnl;
      fin.pnlTotal += tr.pnl;
      if (fin.assets[0]) fin.assets[0].val += tr.pnl;
      fin.history = fin.history.slice();
      fin.history[fin.history.length - 1] = fin.pnlToday;
      return { tradeDraft: '', fin };
    });
    flashToast(`Logged ${tr.sym} ${fmtSigned(tr.pnl, ref.current.currency)}`);
  }, [set, flashToast]);
  const onTradeKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onTradeSubmit();
  };
  const removeMeal = useCallback(
    (id: string) =>
      set((s) => ({ meals: s.meals.filter((m) => m.id !== id) })),
    [set],
  );
  const removeWorkout = useCallback(
    (id: string) =>
      set((s) => ({ workouts: s.workouts.filter((w) => w.id !== id) })),
    [set],
  );

  // ── tasks ───────────────────────────────────────────────────────────────────
  const toggleTask = useCallback(
    (id: string | number) => {
      const t = ref.current.tasks.find((x) => x.id === id);
      const nd = t ? !t.done : false;
      set((s) => ({
        tasks: s.tasks.map((x) =>
          x.id === id ? { ...x, done: !x.done } : x,
        ),
      }));
      if (nd) flashToast(cheer());
    },
    [set, flashToast],
  );

  // ── habits ──────────────────────────────────────────────────────────────────
  const toggleHabitToday = useCallback(
    (id: string) => {
      const ti = todayIndex();
      let nd = false;
      const habits = ref.current.habits.map((h) => {
        if (h.id !== id) return h;
        const nv = !h.week[ti];
        nd = nv;
        return {
          ...h,
          week: h.week.map((v, i) => (i === ti ? nv : v)),
          subs: h.subs.map((x) => ({ ...x, done: nv })),
        };
      });
      set({ habits });
      if (nd) {
        flashToast(cheer());
        if (allHabitsDone(habits)) {
          flashToast('Perfect day — every habit done.');
          confettiBurst();
        }
      }
    },
    [set, flashToast, confettiBurst],
  );
  const toggleSub = useCallback(
    (id: string, i: number) => {
      const ti = todayIndex();
      let jd = false;
      const habits = ref.current.habits.map((h) => {
        if (h.id !== id) return h;
        const subs = h.subs.map((x, j) =>
          j === i ? { ...x, done: !x.done } : x,
        );
        const all = subs.length > 0 && subs.every((x) => x.done);
        if (all && !h.week[ti]) jd = true;
        return { ...h, subs, week: h.week.map((v, k) => (k === ti ? all : v)) };
      });
      set({ habits });
      if (jd) {
        flashToast(cheer());
        if (allHabitsDone(habits)) {
          flashToast('Perfect day — every habit done.');
          confettiBurst();
        }
      }
    },
    [set, flashToast, confettiBurst],
  );
  const toggleExpand = useCallback(
    (id: string) =>
      set((s) => ({ habitExpanded: s.habitExpanded === id ? null : id })),
    [set],
  );
  const addHabit = useCallback(() => {
    const id = 'h' + Date.now();
    set((s) => ({
      habits: [
        ...s.habits,
        { id, name: 'New habit', cat: 'GENERAL', week: [false, false, false, false, false, false, false], subs: [] },
      ],
      habitExpanded: id,
      edit: 'hn.' + id,
      editVal: 'New habit',
    }));
  }, [set]);
  const removeHabit = useCallback(
    (id: string) =>
      set((s) => ({ habits: s.habits.filter((h) => h.id !== id) })),
    [set],
  );
  const addSub = useCallback(
    (id: string) =>
      set((s) => ({
        habits: s.habits.map((h) =>
          h.id === id
            ? { ...h, subs: [...h.subs, { label: 'New step', done: false }] }
            : h,
        ),
        habitExpanded: id,
      })),
    [set],
  );
  const removeSub = useCallback(
    (id: string, i: number) =>
      set((s) => ({
        habits: s.habits.map((h) =>
          h.id === id
            ? { ...h, subs: h.subs.filter((_, j) => j !== i) }
            : h,
        ),
      })),
    [set],
  );

  // ── goals ───────────────────────────────────────────────────────────────────
  const toggleKR = useCallback(
    (period: 'weekly' | 'monthly', i: number) => {
      const g = JSON.parse(JSON.stringify(ref.current.goals));
      g[period].krs[i].done = !g[period].krs[i].done;
      const nd = g[period].krs[i].done;
      set({ goals: g });
      if (nd) flashToast(cheer());
    },
    [set, flashToast],
  );
  const addKR = useCallback(
    (period: 'weekly' | 'monthly') => {
      const g = JSON.parse(JSON.stringify(ref.current.goals));
      g[period].krs.push({ label: 'New key result', done: false });
      const i = g[period].krs.length - 1;
      set({
        goals: g,
        edit: 'kr.' + (period === 'weekly' ? 'w' : 'm') + '.' + i,
        editVal: 'New key result',
      });
    },
    [set],
  );
  const removeKR = useCallback(
    (period: 'weekly' | 'monthly', i: number) => {
      const g = JSON.parse(JSON.stringify(ref.current.goals));
      g[period].krs.splice(i, 1);
      set({ goals: g });
    },
    [set],
  );

  // ── budget ──────────────────────────────────────────────────────────────────
  const cloneBudget = () => JSON.parse(JSON.stringify(ref.current.budget));
  const onToggleBudgetManage = useCallback(
    () => set((s) => ({ budgetManaging: !s.budgetManaging, edit: null })),
    [set],
  );
  const addLine = useCallback(
    (gi: number) => {
      const b = cloneBudget();
      b.groups[gi].subs.push({ label: 'New item', budget: 0, spent: 0 });
      const si = b.groups[gi].subs.length - 1;
      set({ budget: b, edit: 'l.' + gi + '.' + si, editVal: 'New item' });
    },
    [set],
  );
  const removeLine = useCallback(
    (gi: number, si: number) => {
      const b = cloneBudget();
      b.groups[gi].subs.splice(si, 1);
      set({ budget: b });
    },
    [set],
  );
  const addGroup = useCallback(() => {
    const b = cloneBudget();
    b.groups.push({ name: 'New category', subs: [] });
    set({ budget: b, edit: 'gn.' + (b.groups.length - 1), editVal: 'New category' });
  }, [set]);
  const removeGroup = useCallback(
    (gi: number) => {
      const b = cloneBudget();
      b.groups.splice(gi, 1);
      set({ budget: b });
    },
    [set],
  );
  const addIncome = useCallback(() => {
    const b = cloneBudget();
    b.income.push({ label: 'New source', amt: 0 });
    set({ budget: b, edit: 'il.' + (b.income.length - 1), editVal: 'New source' });
  }, [set]);
  const removeIncome = useCallback(
    (i: number) => {
      const b = cloneBudget();
      b.income.splice(i, 1);
      set({ budget: b });
    },
    [set],
  );
  const onExpenseInput = (e: React.ChangeEvent<HTMLInputElement>) =>
    set({ expenseDraft: e.target.value });
  const onExpenseSubmit = useCallback(() => {
    const t = ref.current.expenseDraft.trim();
    if (!t) return;
    const m = t.match(/(\d+(\.\d+)?)/);
    if (!m) {
      flashToast('Try “Grab 180”');
      return;
    }
    const amt = Math.round(parseFloat(m[1]));
    const label = t
      .replace(m[0], '')
      .replace(/[₱$]/g, '')
      .trim()
      .toLowerCase();
    let gi = -1;
    let si = -1;
    ref.current.budget.groups.forEach((g, ix) =>
      g.subs.forEach((sub, sx) => {
        if (gi >= 0) return;
        const toks = sub.label
          .toLowerCase()
          .split(/[^a-z]+/)
          .filter((w) => w.length >= 3);
        if (
          toks.some((w) => label.includes(w)) ||
          (label && sub.label.toLowerCase().includes(label))
        ) {
          gi = ix;
          si = sx;
        }
      }),
    );
    if (gi < 0) {
      flashToast(`No category matches “${label || t}”`);
      return;
    }
    const b = cloneBudget();
    b.groups[gi].subs[si].spent += amt;
    flashToast(
      `Logged ${fmtMoney(amt, ref.current.currency)} to ${
        b.groups[gi].subs[si].label
      }`,
    );
    set({ budget: b, expenseDraft: '' });
  }, [set, flashToast]);
  const onExpenseKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onExpenseSubmit();
  };

  // ── inline editing ──────────────────────────────────────────────────────────
  const startEdit = useCallback(
    (key: string, val: string | number) =>
      set({ edit: key, editVal: String(val) }),
    [set],
  );
  const onEditInput = (e: React.ChangeEvent<HTMLInputElement>) =>
    set({ editVal: e.target.value });
  const commitEdit = useCallback(() => {
    const { edit, editVal } = ref.current;
    if (!edit) return;
    const p = edit.split('.');
    const num = Math.max(0, Math.round(parseFloat(editVal) || 0));
    const txt = editVal.trim() || '—';
    if (edit === 'name') {
      set({ userName: editVal.trim(), edit: null, editVal: '' });
      return;
    }
    if (p[0] === 'gt') {
      const g = JSON.parse(JSON.stringify(ref.current.goals));
      g[p[1] === 'w' ? 'weekly' : 'monthly'].title = txt;
      set({ goals: g, edit: null, editVal: '' });
      return;
    }
    if (p[0] === 'kr') {
      const g = JSON.parse(JSON.stringify(ref.current.goals));
      g[p[1] === 'w' ? 'weekly' : 'monthly'].krs[+p[2]].label = txt;
      set({ goals: g, edit: null, editVal: '' });
      return;
    }
    if (p[0] === 'hn') {
      set((st) => ({
        habits: st.habits.map((h) => (h.id === p[1] ? { ...h, name: txt } : h)),
        edit: null,
        editVal: '',
      }));
      return;
    }
    if (p[0] === 'hs') {
      set((st) => ({
        habits: st.habits.map((h) =>
          h.id === p[1]
            ? {
                ...h,
                subs: h.subs.map((x, j) =>
                  j === +p[2] ? { ...x, label: txt } : x,
                ),
              }
            : h,
        ),
        edit: null,
        editVal: '',
      }));
      return;
    }
    const b = cloneBudget();
    if (p[0] === 'inc') b.income[+p[1]].amt = num;
    else if (p[0] === 'il') b.income[+p[1]].label = txt;
    else if (p[0] === 'b') b.groups[+p[1]].subs[+p[2]].budget = num;
    else if (p[0] === 's') b.groups[+p[1]].subs[+p[2]].spent = num;
    else if (p[0] === 'l') b.groups[+p[1]].subs[+p[2]].label = txt;
    else if (p[0] === 'gn') b.groups[+p[1]].name = txt;
    set({ budget: b, edit: null, editVal: '' });
  }, [set]);
  const onEditKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitEdit();
    else if (e.key === 'Escape') set({ edit: null, editVal: '' });
  };
  const focusRef = (el: HTMLInputElement | null) => {
    if (el) {
      el.focus();
      el.select && el.select();
    }
  };

  // ── profile ─────────────────────────────────────────────────────────────────
  const fileRefCb = (el: HTMLInputElement | null) => {
    fileEl.current = el;
  };
  const onPickPfp = () => {
    if (fileEl.current) fileEl.current.click();
  };
  const onPfpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const result = r.result as string;
      savePfp(result);
      set({ pfp: result });
    };
    r.readAsDataURL(f);
  };
  const onEditUserName = useCallback(
    () => startEdit('name', ref.current.userName),
    [startEdit],
  );

  // ── calendar ────────────────────────────────────────────────────────────────
  const selectDay = useCallback((iso: string) => set({ selectedDate: iso }), [set]);
  const prevMonth = useCallback(
    () => set((s) => ({ calOffset: s.calOffset - 1 })),
    [set],
  );
  const nextMonth = useCallback(
    () => set((s) => ({ calOffset: s.calOffset + 1 })),
    [set],
  );
  const onCalDraftInput = (e: React.ChangeEvent<HTMLInputElement>) =>
    set({ calDraft: e.target.value });
  const onCalAdd = useCallback(() => {
    const t = ref.current.calDraft.trim();
    if (!t) return;
    const task = makeTask(t, false);
    task.due = undefined;
    task.date = ref.current.selectedDate;
    set((s) => ({ calDraft: '', tasks: [task, ...s.tasks] }));
    flashToast(`Added to ${labelForDate(ref.current.selectedDate)}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [set, flashToast]);
  const onCalDraftKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onCalAdd();
  };

  // ── settings ────────────────────────────────────────────────────────────────
  const setTheme = useCallback((k: string) => set({ theme: k }), [set]);
  const setCurrency = useCallback(
    (c: Currency) => {
      set({ currency: c });
      flashToast(`Currency set to ${c.code}`);
    },
    [set, flashToast],
  );
  const toggleReduceMotion = useCallback(
    () => set((s) => ({ reduceMotion: !s.reduceMotion })),
    [set],
  );
  const toggleNotif = useCallback(
    (k: keyof TempoState['notifs']) =>
      set((s) => ({ notifs: { ...s.notifs, [k]: !s.notifs[k] } })),
    [set],
  );
  const onTargetChange = useCallback(
    (field: keyof TempoState['targets'], val: string) => {
      const n = Math.max(0, parseInt(val, 10) || 0);
      set((s) => ({ targets: { ...s.targets, [field]: n } }));
    },
    [set],
  );
  const resetSettings = useCallback(() => {
    clearSettings();
    stopWake();
    set({
      theme: 'ember',
      currency: { code: 'PHP', symbol: '₱' },
      reduceMotion: false,
      targets: { kcal: 2800, p: 180, c: 300, f: 80 },
      notifs: {
        dailySummary: true,
        habitReminders: true,
        deadlineAlerts: true,
        weeklyReview: false,
      },
      pfp: '',
      userName: '',
      wake: false,
    });
    flashToast('Settings reset to defaults');
  }, [set, flashToast]);
  const toggleSound = useCallback(
    () => set((s) => ({ sound: !s.sound })),
    [set],
  );
  const setVoice = (e: React.ChangeEvent<HTMLSelectElement>) =>
    set({ voiceURI: e.target.value });
  const testVoice = () =>
    speak('Hi, I’m Nateman, your assistant. This is how I sound.');

  // ── nateman ─────────────────────────────────────────────────────────────────
  const snapshot = (): AssistantSnapshot => {
    const s = ref.current;
    const today = isoLocal(new Date());
    const todayTasks = s.tasks.filter((t) => taskDate(t) === today);
    const open = todayTasks.filter((t) => !t.done);
    const inc = s.budget.income.reduce((a, i) => a + i.amt, 0);
    const sp = s.budget.groups.reduce(
      (a, g) => a + g.subs.reduce((x, su) => x + su.spent, 0),
      0,
    );
    const liq = s.fin.cashOpening + inc - sp + s.fin.savings + s.fin.ewallet;
    const consumed = s.meals.reduce((a, m) => a + m.kcal, 0);
    const burned = s.workouts.reduce((a, w) => a + w.kcal, 0);
    return {
      openToday: open.length,
      firstOpenTitle: open[0] ? open[0].title : null,
      highToday: open.filter((t) => t.priority === 'high').length,
      doneToday: todayTasks.filter((t) => t.done).length,
      totalToday: todayTasks.length,
      netLiquidLabel: fmtMoney(liq, s.currency),
      pnlTodayLabel: fmtSigned(s.fin.pnlToday, s.currency),
      consumedKcal: consumed,
      burnedKcal: burned,
      remainingKcal: s.targets.kcal - (consumed - burned),
    };
  };

  const executeIntent = (intent: ReturnType<typeof respondAssistant>['intent']) => {
    if (intent.type === 'setTheme') setTheme(intent.themeKey);
    else if (intent.type === 'navigate') set({ page: intent.page });
    else if (intent.type === 'addTask') {
      const task = makeTask(intent.text, true);
      set((s) => ({ tasks: [task, ...s.tasks] }));
    }
  };

  const finishNateman = useCallback(
    (q: string) => {
      beep([659, 880]);
      const r = respondAssistant(q, snapshot());
      set({ naPhase: 'answer', naAnswer: r.answer, naActionLabel: r.actionLabel || '' });
      executeIntent(r.intent);
      speak(r.answer);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [beep, set, speak],
  );

  const openNateman = useCallback(
    (q?: string) => {
      const provided = (q || '').trim();
      beep([523]);
      clearTimeout(timers.current.na1);
      clearTimeout(timers.current.na2);
      set({
        naOpen: true,
        naPhase: provided ? 'thinking' : 'listening',
        naQuery: provided,
        naAnswer: '',
        naActionLabel: '',
      });
      if (provided) {
        timers.current.na2 = setTimeout(() => finishNateman(provided), 750);
      } else {
        const demo =
          ['What’s on my plate today?', 'Add: review my SPY setup tonight', 'How am I doing today?', 'Switch to Midnight theme', 'What’s my net liquid?'][
            ref.current.naTake % 5
          ];
        timers.current.na1 = setTimeout(() => {
          set((st) => ({ naPhase: 'thinking', naQuery: demo, naTake: st.naTake + 1 }));
          timers.current.na2 = setTimeout(() => finishNateman(demo), 800);
        }, 1900);
      }
    },
    [beep, set, finishNateman],
  );
  const closeNateman = useCallback(() => {
    clearTimeout(timers.current.na1);
    clearTimeout(timers.current.na2);
    try {
      window.speechSynthesis && window.speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
    set({ naOpen: false, naPhase: 'idle' });
  }, [set]);
  const onNaInput = (e: React.ChangeEvent<HTMLInputElement>) =>
    set({ naInput: e.target.value });
  const onNaSend = useCallback(() => {
    const v = ref.current.naInput.trim();
    if (!v) return;
    set({ naInput: '' });
    openNateman(v);
  }, [set, openNateman]);
  const onNaKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onNaSend();
  };

  // ── voice wake word ─────────────────────────────────────────────────────────
  function startWake() {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) {
      flashToast('Voice isn’t supported in this browser');
      set({ wake: false });
      return;
    }
    try {
      const rec = new SR();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';
      rec.onresult = (e: any) => {
        let txt = '';
        for (let i = e.resultIndex; i < e.results.length; i++)
          txt += e.results[i][0].transcript;
        if (/nateman/i.test(txt) && !naCool.current) {
          naCool.current = true;
          setTimeout(() => {
            naCool.current = false;
          }, 4500);
          const q = txt.replace(/.*?nateman[,:\s]*/i, '').trim();
          openNateman(q);
        }
      };
      rec.onerror = (ev: any) => {
        if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') {
          set({ wake: false });
          flashToast('Microphone access denied');
        }
      };
      rec.onend = () => {
        if (ref.current.wake && recRef.current) {
          try {
            recRef.current.start();
          } catch {
            /* ignore */
          }
        }
      };
      recRef.current = rec;
      rec.start();
      flashToast('Listening — say “nateman”');
    } catch {
      set({ wake: false });
    }
  }
  function stopWake() {
    if (recRef.current) {
      const r = recRef.current;
      recRef.current = null;
      try {
        r.onend = null;
        r.stop();
      } catch {
        /* ignore */
      }
    }
  }
  const toggleWake = useCallback(() => {
    set((s) => ({ wake: !s.wake }));
    // read intended next value from current (pre-toggle) state
    setTimeout(() => {
      if (ref.current.wake) startWake();
      else stopWake();
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [set]);

  const api: TempoApi = useMemo(
    () => ({
      state,
      setPage,
      onOpenSettings,
      onToggleManage,
      onCatInput,
      onCatKey,
      onCatAdd,
      onCatRemove,
      onCaptureInput,
      onCaptureKey,
      onCaptureSubmit,
      onVoice,
      onFoodInput,
      onFoodKey,
      onFoodSubmit,
      onExInput,
      onExKey,
      onExSubmit,
      onTradeInput,
      onTradeKey,
      onTradeSubmit,
      removeMeal,
      removeWorkout,
      toggleTask,
      toggleHabitToday,
      toggleSub,
      toggleExpand,
      addHabit,
      removeHabit,
      addSub,
      removeSub,
      toggleKR,
      addKR,
      removeKR,
      onToggleBudgetManage,
      addLine,
      removeLine,
      addGroup,
      removeGroup,
      addIncome,
      removeIncome,
      onExpenseInput,
      onExpenseKey,
      onExpenseSubmit,
      startEdit,
      onEditInput,
      onEditKey,
      commitEdit,
      focusRef,
      fileRef: fileRefCb,
      onPickPfp,
      onPfpChange,
      onEditUserName,
      selectDay,
      prevMonth,
      nextMonth,
      onCalDraftInput,
      onCalDraftKey,
      onCalAdd,
      setTheme,
      setCurrency,
      toggleReduceMotion,
      toggleNotif,
      onTargetChange,
      resetSettings,
      toggleSound,
      setVoice,
      testVoice,
      toggleWake,
      openNateman,
      closeNateman,
      onNaInput,
      onNaKey,
      onNaSend,
    }),
    // state is the only value that needs to retrigger consumers; handlers are stable enough
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
