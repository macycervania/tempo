'use client';

import React from 'react';
import { useTempo } from './TempoProvider';
import { THEMES, CURRENCIES, VERSES, HEALTH_QUOTES } from '@/lib/constants';
import {
  estimateExercise,
  estimateFood,
  parseTrade,
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
import type { Area, Mood, Priority, Task } from '@/lib/types';

const MOODS: { key: Mood; label: string; glyph: string; color: string }[] = [
  { key: 'great', label: 'Great', glyph: '◉', color: '#74ad84' },
  { key: 'good', label: 'Good', glyph: '◍', color: '#9bbf7a' },
  { key: 'okay', label: 'Okay', glyph: '◑', color: 'var(--accent)' },
  { key: 'low', label: 'Low', glyph: '◌', color: '#bd9166' },
  { key: 'rough', label: 'Rough', glyph: '○', color: '#c77b6b' },
];

const rank: Record<Priority, number> = { high: 0, med: 1, low: 2 };

/**
 * Derives every value the views render from the current state + action handlers.
 * This is the faithful equivalent of the prototype's renderVals().
 */
export function useViewModel() {
  const api = useTempo();
  const s = api.state;
  const now = new Date();
  const ti = todayIndex(now);
  const TG = s.targets || { kcal: 2800, p: 180, c: 300, f: 80 };

  const fmtPeso = (n: number) => fmtMoney(n, s.currency);
  const fmtSig = (n: number) => fmtSigned(n, s.currency);
  const metaOf = (key: string): Area =>
    s.areas.find((a) => a.key === key) ||
    s.areas[0] || { key: '', label: '—', tint: 'var(--text-muted)' };

  const rootStyle =
    'min-height:100vh;display:flex;flex-direction:column;background:var(--bg)';
  const rootClass = s.reduceMotion ? 'no-motion' : '';

  const gearStyle = `font-size:14px;background:${
    s.page === 'settings' ? 'var(--inset)' : 'transparent'
  };border:1px solid ${
    s.page === 'settings' ? 'var(--line2)' : 'transparent'
  };border-radius:7px;width:30px;height:30px;cursor:pointer;color:${
    s.page === 'settings' ? 'var(--text)' : 'var(--text-faint)'
  };display:flex;align-items:center;justify-content:center;flex:0 0 30px`;

  const toggleStyle = (on: boolean) =>
    `width:40px;height:23px;border-radius:12px;cursor:pointer;transition:all .15s;position:relative;flex:0 0 40px;border:none;background:${
      on ? 'var(--accent)' : 'var(--line2)'
    }`;
  const knobStyle = (on: boolean) =>
    `position:absolute;top:2.5px;left:${
      on ? '19.5px' : '2.5px'
    };width:18px;height:18px;border-radius:50%;background:${
      on ? 'var(--bg)' : 'var(--text-muted)'
    };transition:left .15s`;

  const speechVoices =
    typeof window !== 'undefined' && window.speechSynthesis
      ? window.speechSynthesis.getVoices() || []
      : [];

  const settings = {
    themes: THEMES.map((t) => ({
      name: t.name,
      onClick: () => api.setTheme(t.key),
      checked: s.theme === t.key,
      dotStyle: `width:12px;height:12px;border-radius:50%;flex:0 0 12px;background:${t.dot}`,
      style: `display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:10px;cursor:pointer;font-size:13.5px;font-weight:600;color:var(--text);border:1px solid ${
        s.theme === t.key ? 'var(--accent)' : 'var(--line2)'
      };background:${
        s.theme === t.key
          ? 'color-mix(in srgb, var(--accent) 12%, transparent)'
          : 'var(--inset)'
      }`,
    })),
    currencies: CURRENCIES.map((c) => ({
      code: c.code,
      symbol: c.symbol,
      onClick: () => api.setCurrency(c),
      style: `display:flex;align-items:center;gap:7px;padding:9px 13px;border-radius:9px;cursor:pointer;border:1px solid ${
        s.currency.code === c.code ? 'var(--accent)' : 'var(--line2)'
      };background:${
        s.currency.code === c.code
          ? 'color-mix(in srgb, var(--accent) 10%, transparent)'
          : 'var(--inset)'
      };color:${
        s.currency.code === c.code ? 'var(--text)' : 'var(--text-muted)'
      }`,
    })),
    onToggleMotion: api.toggleReduceMotion,
    motionToggleStyle: toggleStyle(s.reduceMotion),
    motionKnobStyle: knobStyle(s.reduceMotion),
    wake: s.wake,
    onToggleWake: api.toggleWake,
    wakeToggleStyle: toggleStyle(s.wake),
    wakeKnobStyle: knobStyle(s.wake),
    sound: s.sound,
    onToggleSound: api.toggleSound,
    soundToggleStyle: toggleStyle(s.sound),
    soundKnobStyle: knobStyle(s.sound),
    voiceVal: s.voiceURI,
    onVoice: api.setVoice,
    voices: speechVoices
      .filter((v) => /en/i.test(v.lang))
      .map((v) => ({ uri: v.voiceURI, label: v.name })),
    onTestVoice: api.testVoice,
    notifs: (
      [
        { key: 'dailySummary', label: 'Daily summary', desc: 'Show a morning brief card on your Overview (tasks, habits, calories, P&L)' },
        { key: 'habitReminders', label: 'Habit reminders', desc: 'Evening device notification if habits are unfinished (allow notifications)' },
        { key: 'deadlineAlerts', label: 'Deadline alerts', desc: 'Device notification when tasks are due today (allow notifications)' },
        { key: 'weeklyReview', label: 'Weekly review', desc: 'Show a recap card on your Overview (goals, calories, spending, P&L)' },
      ] as const
    ).map((n) => ({
      label: n.label,
      desc: n.desc,
      onToggle: () => api.toggleNotif(n.key),
      toggleStyle: toggleStyle(s.notifs[n.key]),
      knobStyle: knobStyle(s.notifs[n.key]),
    })),
    targets: (
      [
        { field: 'kcal', label: 'Daily calories', val: s.targets.kcal, unit: 'kcal' },
        { field: 'p', label: 'Protein', val: s.targets.p, unit: 'g' },
        { field: 'c', label: 'Carbs', val: s.targets.c, unit: 'g' },
        { field: 'f', label: 'Fat', val: s.targets.f, unit: 'g' },
      ] as const
    ).map((t) => ({
      label: t.label,
      val: t.val,
      unit: t.unit,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        api.onTargetChange(t.field, e.target.value),
    })),
    body: {
      fields: (
        [
          { field: 'weight', label: 'Weight', val: s.body.weight, unit: 'kg' },
          { field: 'height', label: 'Height', val: s.body.height, unit: 'cm' },
        ] as const
      ).map((f) => ({
        label: f.label,
        val: f.val,
        unit: f.unit,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
          api.onBodyChange(f.field, e.target.value),
      })),
      bmi:
        s.body.height > 0
          ? (s.body.weight / Math.pow(s.body.height / 100, 2)).toFixed(1)
          : '—',
    },
    currencyNote: `All amounts shown in ${s.currency.code} (${s.currency.symbol})`,
    onReset: api.resetSettings,
  };

  const pageTabs = (
    [
      { key: 'overview', label: 'Overview', glyph: '◎' },
      { key: 'tasks', label: 'Tasks', glyph: '▦' },
      { key: 'habits', label: 'Habits', glyph: '◴' },
      { key: 'health', label: 'Health', glyph: '♥' },
      { key: 'budget', label: 'Budget', glyph: '▤' },
      { key: 'finance', label: 'Finance', glyph: '◈' },
      { key: 'leaderboard', label: 'Leaders', glyph: '♛' },
      { key: 'calendar', label: 'Calendar', glyph: '▣' },
      { key: 'journal', label: 'Journal', glyph: '✎' },
    ] as const
  ).map((t) => ({
    key: t.key as string,
    label: t.label,
    glyph: t.glyph,
    active: s.page === t.key,
    onClick: () => api.setPage(t.key),
    style: `background:${
      s.page === t.key ? 'var(--inset)' : 'transparent'
    };border:1px solid ${
      s.page === t.key ? 'var(--line2)' : 'transparent'
    };border-radius:7px;padding:5px 13px;font-size:12.5px;font-weight:600;cursor:pointer;transition:all .12s;color:${
      s.page === t.key ? 'var(--text)' : 'var(--text-faint)'
    }`,
  }));

  // categories
  const openByArea: Record<string, number> = {};
  s.areas.forEach((a) => (openByArea[a.key] = 0));
  s.tasks.forEach((t) => {
    if (!t.done && openByArea[t.area] !== undefined) openByArea[t.area]++;
  });
  const cats = s.areas.map((a) => ({
    label: a.label.toUpperCase(),
    tint: a.tint,
    count: openByArea[a.key] || 0,
    onRemove: () => api.onCatRemove(a.key),
  }));

  // priorities
  const badgeStyles: Record<Priority, string> = {
    high: "font-family:'JetBrains Mono',monospace;font-size:9.5px;font-weight:600;letter-spacing:.5px;color:var(--accent);background:color-mix(in srgb, var(--accent) 13%, transparent);border:1px solid color-mix(in srgb, var(--accent) 32%, transparent);border-radius:4px;padding:1.5px 6px",
    med: "font-family:'JetBrains Mono',monospace;font-size:9.5px;font-weight:600;letter-spacing:.5px;color:var(--text-dim);background:var(--inset);border:1px solid var(--line2);border-radius:4px;padding:1.5px 6px",
    low: "font-family:'JetBrains Mono',monospace;font-size:9.5px;font-weight:600;letter-spacing:.5px;color:var(--text-faint);background:transparent;border:1px solid var(--line);border-radius:4px;padding:1.5px 6px",
  };
  const tasks = s.tasks
    .slice()
    .sort(
      (a, b) =>
        Number(a.done) - Number(b.done) ||
        rank[a.priority] - rank[b.priority] ||
        0,
    )
    .map((t) => {
      const m = metaOf(t.area);
      return {
        ...t,
        tint: m.tint,
        areaLabel: m.label,
        dueLabel: labelForDate(taskDate(t)),
        badge: t.priority.toUpperCase(),
        badgeStyle: badgeStyles[t.priority],
        rowStyle: `display:flex;align-items:flex-start;gap:12px;padding:12px 14px;border:1px solid ${
          t.done ? 'var(--panel)' : 'var(--line)'
        };border-radius:11px;background:${
          t.done ? 'var(--bg)' : 'var(--inset)'
        };transition:background .12s,border-color .12s;animation:fadeUp .22s ease`,
        boxStyle: `width:20px;height:20px;flex:0 0 20px;margin-top:1px;border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;border:1.5px solid ${
          t.done ? 'var(--accent)' : 'var(--line2)'
        };background:${t.done ? 'var(--accent)' : 'transparent'}`,
        titleStyle: `font-size:14px;font-weight:500;line-height:1.35;margin-top:4px;${
          t.done
            ? 'color:var(--text-faint2);text-decoration:line-through'
            : 'color:var(--text-dim)'
        }`,
        onToggle: () => api.toggleTask(t.id),
      };
    });

  // Eisenhower matrix — tasks split by urgency × importance (editable titles,
  // open + completed rows per quadrant).
  const tomorrowISO = isoLocal(new Date(now.getTime() + 86400000));
  const isUrgent = (t: Task) => taskDate(t) <= tomorrowISO;
  const matrixRow = (t: Task) => {
    const m = metaOf(t.area);
    return {
      id: t.id,
      title: t.title,
      tint: m.tint,
      areaLabel: m.label,
      onToggle: () => api.toggleTask(t.id),
      boxStyle:
        'width:19px;height:19px;flex:0 0 19px;margin-top:1px;border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;border:1.5px solid var(--line2);background:transparent',
      titleStyle: 'font-size:13.5px;font-weight:500;line-height:1.35;color:var(--text-dim)',
      done: false,
    };
  };
  const matrixDoneRow = (t: Task) => {
    const m = metaOf(t.area);
    return {
      id: t.id,
      title: t.title,
      tint: m.tint,
      areaLabel: m.label,
      onToggle: () => api.toggleTask(t.id),
      boxStyle:
        'width:19px;height:19px;flex:0 0 19px;margin-top:1px;border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:1.5px solid var(--accent);background:var(--accent)',
      titleStyle: 'font-size:13px;font-weight:500;line-height:1.35;color:var(--text-faint2);text-decoration:line-through',
      done: true,
    };
  };
  const eisenMeta = [
    { roman: 'I', sub: 'Do first', color: '#e0566f', f: (t: Task) => t.priority === 'high' && isUrgent(t) },
    { roman: 'II', sub: 'Schedule', color: 'var(--accent)', f: (t: Task) => t.priority === 'high' && !isUrgent(t) },
    { roman: 'III', sub: 'Delegate', color: '#6f90b4', f: (t: Task) => t.priority !== 'high' && isUrgent(t) },
    { roman: 'IV', sub: 'Later', color: '#74ad84', f: (t: Task) => t.priority !== 'high' && !isUrgent(t) },
  ] as const;
  const eisenhower = eisenMeta.map((q, i) => {
    const rows = s.tasks.filter((t) => !t.done && q.f(t)).map(matrixRow);
    const doneRows = s.tasks.filter((t) => t.done && q.f(t)).map(matrixDoneRow);
    return {
      roman: q.roman,
      title: s.matrixTitles[i] || '',
      sub: q.sub,
      color: q.color,
      count: rows.length,
      doneCount: doneRows.length,
      titleEditing: s.edit === 'mt.' + i,
      titleShow: s.edit !== 'mt.' + i,
      onEditTitle: () => api.startEdit('mt.' + i, s.matrixTitles[i] || ''),
      badgeStyle: `width:22px;height:22px;flex:0 0 22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'JetBrains Mono',monospace;font-size:9.5px;font-weight:700;color:var(--bg);background:${q.color}`,
      titleStyle: `font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:1px;font-weight:600;color:${q.color};cursor:text`,
      editStyle: `flex:1;background:var(--inset);border:1px solid var(--line2);border-radius:6px;padding:3px 7px;color:var(--text);font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:600`,
      cardStyle:
        'background:var(--inset);border:1px solid var(--line);border-radius:14px;padding:15px 16px;min-height:200px;display:flex;flex-direction:column',
      rows,
      doneRows,
      empty: rows.length === 0,
    };
  });
  const tasksDoneCount = s.tasks.filter((t) => t.done).length;
  const tasksView = {
    matrix: eisenhower,
    showDone: s.showDone,
    onToggleShowDone: api.toggleShowDone,
    doneCount: tasksDoneCount,
    doneLabel: s.showDone
      ? `Hide completed (${tasksDoneCount})`
      : `Show completed (${tasksDoneCount})`,
    add: {
      areas: s.areas.map((a) => ({ key: a.key, label: a.label })),
      areaVal: s.newTaskArea || (s.areas[0] ? s.areas[0].key : ''),
      onAreaChange: api.setNewTaskArea,
      quads: s.matrixTitles.map((t, i) => ({ i, label: t })),
      quadVal: s.newTaskQuad,
      onQuadChange: api.setNewTaskQuad,
      onAdd: api.onTaskAdd,
      onKey: api.onTaskAddKey,
    },
  };

  // A daily word — rotates once per day across motivational lines + verses.
  const verse = VERSES[Math.floor(now.getTime() / 86400000) % VERSES.length];

  const hr = now.getHours();
  const todayISO = isoLocal(now);
  const greeting =
    (hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening') +
    (s.userName ? ', ' + s.userName : '') +
    '.';
  const todayOpen = s.tasks.filter(
    (t) => !t.done && taskDate(t) === todayISO,
  );
  const highs = todayOpen.filter((t) => t.priority === 'high').length;
  const aiSummary =
    todayOpen.length === 0
      ? 'Nothing open for today — you’re clear. Want me to pull tomorrow forward?'
      : `${todayOpen.length} open for today${
          highs ? `, ${highs} high-priority` : ''
        }. I’ve ordered them below — start at the top.`;
  const doneToday = s.tasks.filter(
    (t) => taskDate(t) === todayISO && t.done,
  ).length;
  const totalToday = s.tasks.filter((t) => taskDate(t) === todayISO).length;

  // fuel
  const consumed = s.meals.reduce((a, m) => a + m.kcal, 0);
  const pSum = s.meals.reduce((a, m) => a + m.p, 0);
  const cSum = s.meals.reduce((a, m) => a + m.c, 0);
  const fSum = s.meals.reduce((a, m) => a + m.f, 0);
  const burned = s.workouts.reduce((a, w) => a + w.kcal, 0);
  const net = consumed - burned;
  const remaining = TG.kcal - net;
  const fuel = {
    consumed,
    target: TG.kcal,
    pct: Math.min(100, Math.round((consumed / TG.kcal) * 100)) + '%',
    netLabel: remaining >= 0 ? `${remaining} left` : `${Math.abs(remaining)} over`,
    netStyle: `font-family:'JetBrains Mono',monospace;font-size:11px;margin-bottom:5px;color:${
      remaining >= 0 ? '#74ad84' : 'var(--accent)'
    }`,
    macros: [
      { label: 'PROTEIN', val: `${pSum}/${TG.p}g`, pct: Math.min(100, Math.round((pSum / TG.p) * 100)) + '%', color: '#74ad84' },
      { label: 'CARBS', val: `${cSum}/${TG.c}g`, pct: Math.min(100, Math.round((cSum / TG.c) * 100)) + '%', color: '#bd9166' },
      { label: 'FAT', val: `${fSum}/${TG.f}g`, pct: Math.min(100, Math.round((fSum / TG.f) * 100)) + '%', color: '#6f90b4' },
    ],
    meals: s.meals.slice().reverse(),
  };

  const totalMin = s.workouts.reduce((a, w) => a + w.minutes, 0);
  const train = {
    burned,
    minutes: totalMin,
    sessionLabel:
      s.workouts.length + (s.workouts.length === 1 ? ' SESSION' : ' SESSIONS'),
    sessions: s.workouts.slice().reverse(),
    empty: s.workouts.length === 0,
  };

  // habits
  const habitsDone = s.habits.filter((h) => h.week[ti]).length;
  const scorePct = s.habits.length
    ? Math.round((habitsDone / s.habits.length) * 100)
    : 0;
  const streakOf = (week: boolean[]) => {
    let n = 0;
    for (let i = ti; i >= 0; i--) {
      if (week[i]) n++;
      else break;
    }
    return n;
  };
  const hb = {
    score: habitsDone,
    total: s.habits.length,
    ringStyle: `background:conic-gradient(var(--accent) ${
      scorePct * 3.6
    }deg, var(--line) ${scorePct * 3.6}deg)`,
    hint:
      habitsDone === 0
        ? 'Start with one.'
        : habitsDone === s.habits.length
          ? 'All done — elite.'
          : `${habitsDone} of ${s.habits.length} done today`,
    onAdd: api.addHabit,
    cards: s.habits.map((h) => {
      const done = h.week[ti];
      const streak = streakOf(h.week);
      const subDone = h.subs.filter((x) => x.done).length;
      const expanded = s.habitExpanded === h.id;
      return {
        id: h.id,
        name: h.name,
        cat: h.cat || 'GENERAL',
        done,
        streak,
        streakShow: streak > 0,
        progress: h.subs.length ? `${subDone}/${h.subs.length}` : '',
        expanded,
        onToggle: () => api.toggleHabitToday(h.id),
        onExpand: () => api.toggleExpand(h.id),
        onRemove: () => api.removeHabit(h.id),
        onAddSub: () => api.addSub(h.id),
        nameEditing: s.edit === 'hn.' + h.id,
        nameShow: s.edit !== 'hn.' + h.id,
        onEditName: () => api.startEdit('hn.' + h.id, h.name),
        cardStyle: `border:1px solid ${
          done
            ? 'color-mix(in srgb, var(--accent) 45%, transparent)'
            : 'var(--line)'
        };background:${
          done
            ? 'color-mix(in srgb, var(--accent) 9%, var(--panel))'
            : 'var(--inset)'
        };border-radius:13px;padding:13px 15px;transition:all .15s`,
        boxStyle: `width:22px;height:22px;flex:0 0 22px;border-radius:7px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;border:1.5px solid ${
          done ? 'var(--accent)' : 'var(--line2)'
        };background:${done ? 'var(--accent)' : 'transparent'}`,
        subs: h.subs.map((x, i) => ({
          label: x.label,
          done: x.done,
          num: i + 1,
          onToggle: () => api.toggleSub(h.id, i),
          onRemove: () => api.removeSub(h.id, i),
          boxStyle: `width:18px;height:18px;flex:0 0 18px;border-radius:5px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:1.5px solid ${
            x.done ? 'var(--accent)' : 'var(--line2)'
          };background:${x.done ? 'var(--accent)' : 'transparent'}`,
          labelStyle: `flex:1;font-size:13px;cursor:text;${
            x.done
              ? 'color:var(--text-faint2);text-decoration:line-through'
              : 'color:var(--text-dim)'
          }`,
          labelEditing: s.edit === 'hs.' + h.id + '.' + i,
          labelShow: s.edit !== 'hs.' + h.id + '.' + i,
          onEditLabel: () => api.startEdit('hs.' + h.id + '.' + i, x.label),
        })),
      };
    }),
  };

  const fe = estimateFood(s.foodDraft);
  const ee = estimateExercise(s.exDraft, s.body.weight);

  // finance (pesos, linked to budget)
  const fd = s.fin;
  const pnlColor = (n: number) => (n >= 0 ? '#74ad84' : '#c77b6b');
  const incomeTotalF = s.budget.income.reduce((a, i) => a + i.amt, 0);
  const spentTotalF = s.budget.groups.reduce(
    (a, g) => a + g.subs.reduce((x, su) => x + su.spent, 0),
    0,
  );
  const cashVal = fd.cashOpening + incomeTotalF - spentTotalF;
  // Per-section edit toggles — each Finance card flips on its own.
  const finBtn = (section: string) => {
    const on = s.finEdit.includes(section);
    return {
      managing: on,
      onToggle: () => api.onToggleFinEdit(section),
      label: on ? 'DONE' : '+ EDIT',
      btnStyle: `font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1px;background:${
        on ? 'var(--inset)' : 'transparent'
      };border:1px solid var(--line2);border-radius:7px;padding:4px 10px;cursor:pointer;transition:all .12s;color:${
        on ? 'var(--text)' : 'var(--text-faint)'
      }`,
    };
  };
  const liquidEdit = finBtn('liquid');
  const assetsEdit = finBtn('assets');
  const pnlEdit = finBtn('pnl');
  const journalEdit = finBtn('journal');
  const managingLiquid = liquidEdit.managing;
  const managingAssets = assetsEdit.managing;
  const managingPnl = pnlEdit.managing;
  const managingJournal = journalEdit.managing;
  // Live read-only crypto from tracked Solana wallets, folded into net worth.
  const walletsTotal = s.wallets.reduce(
    (a, w) => a + (w.status === 'ok' ? w.valLocal : 0),
    0,
  );
  const liquidAccts: {
    label: string;
    val: number;
    color: string;
    editKey?: string;
  }[] = [
    { label: 'CASH · FROM BUDGET', val: cashVal, color: 'var(--accent)' },
    { label: 'SAVINGS', val: fd.savings, color: '#6f90b4', editKey: 'fsav' },
    { label: 'E-WALLET', val: fd.ewallet, color: '#74ad84', editKey: 'fewa' },
  ];
  if (s.wallets.length)
    liquidAccts.push({ label: 'CRYPTO · SOLANA', val: walletsTotal, color: '#9b7fb4' });
  const liquidTotal = liquidAccts.reduce((a, b) => a + b.val, 0);
  const assetsTotal = fd.assets.reduce((a, b) => a + b.val, 0);
  const netWorth = liquidTotal + assetsTotal;
  const fin = {
    liquid: fmtPeso(liquidTotal),
    netWorth: fmtPeso(netWorth),
    liquidEdit,
    assetsEdit,
    pnlEdit,
    journalEdit,
    netDelta:
      '+' +
      Math.round((fd.pnlMonth / Math.max(liquidTotal, 1)) * 1000) / 10 +
      '% · 30D',
    breakdown: liquidAccts.map((b) => ({
      label: b.label,
      color: b.color,
      val: fmtPeso(b.val),
      pct: Math.round((b.val / Math.max(liquidTotal, 1)) * 100) + '%',
      editable: !!b.editKey && managingLiquid,
      editing: !!b.editKey && s.edit === b.editKey,
      show: !(!!b.editKey && s.edit === b.editKey),
      onEdit: b.editKey ? () => api.startEdit(b.editKey as string, b.val) : undefined,
    })),
    assets: fd.assets.map((a, i) => ({
      label: a.label,
      color: a.color,
      val: fmtPeso(a.val),
      pct: Math.round((a.val / Math.max(assetsTotal, 1)) * 100) + '%',
      managing: managingAssets,
      labelEditing: s.edit === 'fal.' + i,
      labelShow: s.edit !== 'fal.' + i,
      onEditLabel: () => api.startEdit('fal.' + i, a.label),
      valEditing: s.edit === 'fav.' + i,
      valShow: s.edit !== 'fav.' + i,
      onEditVal: () => api.startEdit('fav.' + i, a.val),
      onRemove: () => api.removeAsset(i),
    })),
    onAddAsset: api.addAsset,
    assetsTotal: fmtPeso(assetsTotal),
    wallets: {
      hasAny: s.wallets.length > 0,
      total: fmtPeso(walletsTotal),
      addrDraft: s.walletAddrDraft,
      labelDraft: s.walletLabelDraft,
      onAddrInput: api.onWalletAddrInput,
      onLabelInput: api.onWalletLabelInput,
      onAdd: api.addWallet,
      onRefresh: api.refreshWallets,
      rows: s.wallets.map((w) => ({
        id: w.id,
        label: w.label,
        addrShort: w.address.slice(0, 4) + '…' + w.address.slice(-4),
        sol:
          w.status === 'ok'
            ? w.sol.toLocaleString(undefined, { maximumFractionDigits: 3 }) + ' SOL'
            : w.status === 'loading'
              ? 'loading…'
              : w.status === 'error'
                ? 'unavailable'
                : '—',
        val: w.status === 'ok' ? fmtPeso(w.valLocal) : '',
        dotColor:
          w.status === 'ok'
            ? '#74ad84'
            : w.status === 'error'
              ? '#c77b6b'
              : 'var(--text-faint2)',
        onRemove: () => api.removeWallet(w.id),
      })),
    },
    cashNote:
      incomeTotalF >= spentTotalF
        ? `${fmtPeso(incomeTotalF - spentTotalF)} surplus this month`
        : `${fmtPeso(spentTotalF - incomeTotalF)} drawn down this month`,
    incomeNote: `${fmtPeso(incomeTotalF)}/mo income · incl. allowance & rent`,
    pnlStats: [
      { label: 'TODAY', key: 'fpt', raw: fd.pnlToday, val: fmtSig(fd.pnlToday), color: pnlColor(fd.pnlToday) },
      { label: 'THIS MONTH', key: 'fpm', raw: fd.pnlMonth, val: fmtSig(fd.pnlMonth), color: pnlColor(fd.pnlMonth) },
      { label: 'ALL-TIME', key: 'fptot', raw: fd.pnlTotal, val: fmtSig(fd.pnlTotal), color: pnlColor(fd.pnlTotal) },
    ].map((p) => ({
      label: p.label,
      val: p.val,
      color: p.color,
      managing: managingPnl,
      editing: s.edit === p.key,
      show: s.edit !== p.key,
      onEdit: () => api.startEdit(p.key, p.raw),
    })),
    history: (() => {
      const max = Math.max(...fd.history.map((v) => Math.abs(v)), 1);
      return fd.history.map((v) => {
        const h = Math.round((Math.abs(v) / max) * 48);
        const pos = v >= 0;
        return {
          style: `position:absolute;left:2px;right:2px;${
            pos ? 'bottom:50%' : 'top:50%'
          };height:${h}%;background:${
            pos ? '#74ad84' : '#c77b6b'
          };border-radius:${pos ? '3px 3px 0 0' : '0 0 3px 3px'}`,
        };
      });
    })(),
    trades: fd.trades.map((t, i) => ({
      id: t.id,
      sym: t.sym,
      date: t.date,
      pnl: fmtSig(t.pnl),
      pnlStyle: `font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:600;flex:0 0 auto;color:${pnlColor(
        t.pnl,
      )}`,
      managing: managingJournal,
      symEditing: s.edit === 'tsym.' + i,
      symShow: s.edit !== 'tsym.' + i,
      onEditSym: () => api.startEdit('tsym.' + i, t.sym),
      pnlEditing: s.edit === 'tpnl.' + i,
      pnlShow: s.edit !== 'tpnl.' + i,
      onEditPnl: () => api.startEdit('tpnl.' + i, t.pnl),
      onRemove: () => api.removeTrade(t.id),
    })),
    tradeCount: fd.trades.length,
  };
  const te = parseTrade(s.tradeDraft);

  // budget
  const editKey = s.edit;
  // Per-section edit toggles (like Finance): Income and each expense category
  // flip independently.
  const budgetBtn = (section: string) => {
    const on = s.budgetEdit.includes(section);
    return {
      managing: on,
      onToggle: () => api.onToggleBudgetEdit(section),
      label: on ? 'DONE' : '+ EDIT',
      btnStyle: `font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1px;background:${
        on ? 'var(--inset)' : 'transparent'
      };border:1px solid var(--line2);border-radius:7px;padding:4px 9px;cursor:pointer;transition:all .12s;color:${
        on ? 'var(--text)' : 'var(--text-faint)'
      }`,
    };
  };
  const incomeEdit = budgetBtn('income');
  const expensesEdit = budgetBtn('expenses');
  // Badge that doubles as the section's edit toggle (the + / − glyph).
  const editBadge = (on: boolean, color: string, glyph: string, onToggle: () => void) => ({
    glyph,
    onToggle,
    managing: on,
    style: `font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:600;letter-spacing:1px;border-radius:5px;padding:2px 8px;cursor:pointer;transition:all .12s;border:1px solid ${
      on ? color : 'var(--line2)'
    };background:${on ? color : 'transparent'};color:${on ? 'var(--bg)' : color}`,
  });
  const numCell = (
    val: number,
    key: string,
    onEdit: () => void,
    color?: string,
  ) => ({
    val: fmtPeso(val),
    editing: editKey === key,
    show: editKey !== key,
    onEdit,
    color: color || 'var(--text-dim)',
  });
  const incomeTotal = s.budget.income.reduce((a, i) => a + i.amt, 0);
  const incomeLines = s.budget.income.map((i, ix) => ({
    label: i.label,
    amt: fmtPeso(i.amt),
    labelEditing: editKey === 'il.' + ix,
    labelShow: editKey !== 'il.' + ix,
    amtEditing: editKey === 'inc.' + ix,
    amtShow: editKey !== 'inc.' + ix,
    onEditLabel: () => api.startEdit('il.' + ix, i.label),
    onEditAmt: () => api.startEdit('inc.' + ix, i.amt),
    onRemove: () => api.removeIncome(ix),
  }));
  let budgetTotal = 0;
  let spentTotal = 0;
  const bGroups = s.budget.groups.map((g, gi) => {
    let gb = 0;
    let gs = 0;
    const subs = g.subs.map((sub, si) => {
      gb += sub.budget;
      gs += sub.spent;
      const left = sub.budget - sub.spent;
      const pct =
        sub.budget > 0
          ? Math.min(100, Math.round((sub.spent / sub.budget) * 100))
          : sub.spent > 0
            ? 100
            : 0;
      const over = sub.spent > sub.budget;
      return {
        label: sub.label,
        labelEditing: editKey === 'l.' + gi + '.' + si,
        labelShow: editKey !== 'l.' + gi + '.' + si,
        onEditLabel: () => api.startEdit('l.' + gi + '.' + si, sub.label),
        bCell: numCell(sub.budget, 'b.' + gi + '.' + si, () =>
          api.startEdit('b.' + gi + '.' + si, sub.budget),
        ),
        sCell: numCell(
          sub.spent,
          's.' + gi + '.' + si,
          () => api.startEdit('s.' + gi + '.' + si, sub.spent),
          over ? '#c77b6b' : 'var(--text-dim)',
        ),
        left: (left < 0 ? '-' : '') + fmtPeso(Math.abs(left)),
        leftColor: left < 0 ? '#c77b6b' : 'var(--text-faint)',
        barStyle: `height:100%;border-radius:3px;width:${pct}%;background:${
          over ? '#c77b6b' : '#74ad84'
        };transition:width .3s`,
        onRemove: () => api.removeLine(gi, si),
      };
    });
    budgetTotal += gb;
    spentTotal += gs;
    const gpct = gb > 0 ? Math.min(100, Math.round((gs / gb) * 100)) : 0;
    return {
      name: g.name,
      managing: expensesEdit.managing,
      nameEditing: editKey === 'gn.' + gi,
      nameShow: editKey !== 'gn.' + gi,
      onEditName: () => api.startEdit('gn.' + gi, g.name),
      onRemove: () => api.removeGroup(gi),
      onAddLine: () => api.addLine(gi),
      subB: fmtPeso(gb),
      subS: fmtPeso(gs),
      barStyle: `height:100%;border-radius:3px;width:${gpct}%;background:${
        gs > gb ? '#c77b6b' : '#9b7fb4'
      };transition:width .3s`,
      subs,
    };
  });
  const leftToSpend = incomeTotal - spentTotal;
  const leftToBudget = incomeTotal - budgetTotal;
  const budget = {
    month: now
      .toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      .toUpperCase(),
    incomeLines,
    incomeManaging: incomeEdit.managing,
    incomeBadge: editBadge(incomeEdit.managing, '#74ad84', '+', incomeEdit.onToggle),
    expensesManaging: expensesEdit.managing,
    expensesBadge: editBadge(expensesEdit.managing, 'var(--accent)', '−', expensesEdit.onToggle),
    incomeTotal: fmtPeso(incomeTotal),
    groups: bGroups,
    budgetTotal: fmtPeso(budgetTotal),
    spentTotal: fmtPeso(spentTotal),
    summary: [
      { label: 'INCOME', val: fmtPeso(incomeTotal), color: '#74ad84' },
      { label: 'BUDGETED', val: fmtPeso(budgetTotal), color: 'var(--text)' },
      { label: 'SPENT', val: fmtPeso(spentTotal), color: 'var(--text)' },
      {
        label: 'LEFT TO SPEND',
        val: (leftToSpend < 0 ? '-' : '') + fmtPeso(Math.abs(leftToSpend)),
        color: leftToSpend < 0 ? '#c77b6b' : '#74ad84',
      },
    ],
    leftToBudgetLabel:
      (leftToBudget < 0
        ? 'Over-budgeted by '
        : leftToBudget > 0
          ? 'Unallocated '
          : 'Every peso assigned · ') +
      (leftToBudget !== 0 ? fmtPeso(Math.abs(leftToBudget)) : ''),
    leftToBudgetColor:
      leftToBudget < 0
        ? '#c77b6b'
        : leftToBudget > 0
          ? 'var(--accent)'
          : '#74ad84',
  };

  // health
  const calTarget = TG.kcal;
  const histAll = s.calHistory.concat([consumed]);
  const histMax = Math.max(calTarget, ...histAll) * 1.12;
  const trend = histAll.map((v, i) => {
    const ago = histAll.length - 1 - i;
    const d = new Date(now.getTime() - ago * 86400000);
    const isToday = ago === 0;
    const h = Math.round((v / histMax) * 100);
    return {
      label: isToday
        ? 'TODAY'
        : d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      val: v,
      isToday,
      labelColor: isToday ? 'var(--accent)' : 'var(--text-faint2)',
      barStyle: `position:absolute;left:3px;right:3px;bottom:0;height:${h}%;border-radius:4px 4px 0 0;background:${
        v > calTarget ? '#bd9166' : '#74ad84'
      };opacity:${isToday ? 1 : 0.55};transition:height .3s`,
    };
  });
  const targetTop = Math.round((1 - calTarget / histMax) * 100);
  const trendAvg = Math.round(
    histAll.reduce((a, v) => a + v, 0) / histAll.length,
  );
  const health = {
    consumed,
    target: calTarget,
    burned,
    net,
    pct: fuel.pct,
    netColor: remaining >= 0 ? '#74ad84' : 'var(--accent)',
    netStr:
      remaining >= 0
        ? `${remaining} kcal under target`
        : `${Math.abs(remaining)} kcal over target`,
    macros: fuel.macros,
    meals: s.meals
      .slice()
      .reverse()
      .map((m) => ({ ...m, onRemove: () => api.removeMeal(m.id) })),
    trainings: s.workouts
      .slice()
      .reverse()
      .map((w) => ({ ...w, onRemove: () => api.removeWorkout(w.id) })),
    trend,
    targetLineStyle: `position:absolute;left:0;right:0;top:${targetTop}%;height:0;border-top:1px dashed var(--line2);z-index:2`,
    trendAvg,
    empty: s.workouts.length === 0,
    body: (() => {
      const b = s.body;
      const losing = b.weight >= b.goalWeight;
      const toGo = Math.abs(b.weight - b.goalWeight);
      const reached = toGo < 0.05;
      const bmi = b.height > 0 ? b.weight / Math.pow(b.height / 100, 2) : 0;
      // ── MyFitnessPal-style projection ──────────────────────────────────────
      // Daily balance vs your calorie goal (food − exercise − goal). A deficit
      // (negative) projects weight loss. 1 kg of body fat ≈ 7700 kcal.
      const calorieGoal = TG.kcal;
      const netEaten = consumed - burned;
      const balance = netEaten - calorieGoal;
      const projChangeKg = (balance * 35) / 7700;
      const projWeight = Math.max(0, b.weight + projChangeKg);
      const deficit = balance <= 0;
      // Progress along the line from current weight toward the goal, nudged by
      // today's projected change.
      const span = Math.max(toGo, 0.0001);
      const movedToward = deficit === losing ? Math.min(Math.abs(projChangeKg), span) : 0;
      const pct = reached ? 100 : Math.max(6, Math.min(100, Math.round((movedToward / span) * 100)));
      return {
        weight: b.weight,
        height: b.height,
        goalWeight: b.goalWeight,
        bmi: bmi ? bmi.toFixed(1) : '—',
        onGoalChange: (e: React.ChangeEvent<HTMLInputElement>) =>
          api.onBodyChange('goalWeight', e.target.value),
        toGoLabel: reached
          ? 'Goal reached — nice.'
          : `${toGo.toFixed(1)} kg to ${losing ? 'lose' : 'gain'}`,
        toGoColor: reached ? '#74ad84' : 'var(--text-dim)',
        pct: pct + '%',
        // MFP-style projection
        netToday: netEaten,
        balanceLabel: `${Math.abs(Math.round(balance))} kcal ${deficit ? 'under' : 'over'} goal today`,
        balanceColor: deficit ? '#74ad84' : '#c77b6b',
        projWeight: projWeight.toFixed(1),
        projLine: `If every day were like today, you'd weigh ${projWeight.toFixed(1)} kg in 5 weeks.`,
        quote: HEALTH_QUOTES[Math.floor(now.getTime() / 86400000) % HEALTH_QUOTES.length],
      };
    })(),
  };

  // goals
  const goalCard = (period: 'weekly' | 'monthly', key: 'w' | 'm') => {
    const g = s.goals[period];
    const done = g.krs.filter((k) => k.done).length;
    return {
      title: g.title,
      titleEditing: s.edit === 'gt.' + key,
      titleShow: s.edit !== 'gt.' + key,
      onEditTitle: () => api.startEdit('gt.' + key, g.title),
      progressLabel: done + '/' + g.krs.length,
      pct: (g.krs.length ? Math.round((done / g.krs.length) * 100) : 0) + '%',
      onAddKR: () => api.addKR(period),
      krs: g.krs.map((k, i) => ({
        label: k.label,
        done: k.done,
        onToggle: () => api.toggleKR(period, i),
        onRemove: () => api.removeKR(period, i),
        labelEditing: s.edit === 'kr.' + key + '.' + i,
        labelShow: s.edit !== 'kr.' + key + '.' + i,
        onEditLabel: () => api.startEdit('kr.' + key + '.' + i, k.label),
        boxStyle: `width:18px;height:18px;flex:0 0 18px;border-radius:5px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;border:1.5px solid ${
          k.done ? 'var(--accent)' : 'var(--line2)'
        };background:${k.done ? 'var(--accent)' : 'transparent'}`,
        labelStyle: `flex:1;font-size:13px;cursor:text;${
          k.done
            ? 'color:var(--text-faint2);text-decoration:line-through'
            : 'color:var(--text-dim)'
        }`,
      })),
    };
  };
  const goals = { weekly: goalCard('weekly', 'w'), monthly: goalCard('monthly', 'm') };

  // journal
  const moodMeta = (m?: Mood) => MOODS.find((x) => x.key === m) || MOODS[1];
  const journalDateLabel = (iso: string) =>
    iso === todayISO
      ? 'Today'
      : new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });
  const journal = {
    draft: s.journalDraft,
    onInput: api.onJournalInput,
    onKey: api.onJournalKey,
    onSubmit: api.onJournalSubmit,
    onSummarise: api.summariseToday,
    summarizing: s.summarizing,
    canSave: !!s.journalDraft.trim(),
    count: s.journal.length,
    moodPicker: MOODS.map((m) => ({
      key: m.key,
      label: m.label,
      glyph: m.glyph,
      onClick: () => api.setJournalMood(m.key),
      style: `display:flex;align-items:center;gap:6px;padding:6px 11px;border-radius:9px;cursor:pointer;font-size:12px;font-weight:600;transition:all .12s;border:1px solid ${
        s.journalMood === m.key ? m.color : 'var(--line2)'
      };color:${
        s.journalMood === m.key ? 'var(--text)' : 'var(--text-faint)'
      };background:${
        s.journalMood === m.key
          ? `color-mix(in srgb, ${m.color} 14%, transparent)`
          : 'transparent'
      }`,
      dotStyle: `color:${m.color};font-size:13px`,
    })),
    empty: s.journal.length === 0,
    entries: s.journal.map((j) => {
      const mm = moodMeta(j.mood);
      return {
        id: j.id,
        text: j.text,
        time: j.time,
        dateLabel: journalDateLabel(j.date),
        moodLabel: mm.label,
        moodGlyph: mm.glyph,
        moodColor: mm.color,
        isSummary: !!j.summary,
        onRemove: () => api.removeJournalEntry(j.id),
      };
    }),
  };

  // calendar (linked to tasks)
  const monthBase = new Date(now.getFullYear(), now.getMonth() + s.calOffset, 1);
  const firstWeekday = (monthBase.getDay() + 6) % 7;
  const daysInMonth = new Date(
    monthBase.getFullYear(),
    monthBase.getMonth() + 1,
    0,
  ).getDate();
  const tasksByDate: Record<string, Task[]> = {};
  s.tasks.forEach((t) => {
    const d = taskDate(t);
    (tasksByDate[d] = tasksByDate[d] || []).push(t);
  });
  const calCells: Array<
    | { blank: true }
    | {
        blank: false;
        day: number;
        iso: string;
        dots: { style: string }[];
        more: string;
        onClick: () => void;
        cellStyle: string;
        dayStyle: string;
      }
  > = [];
  for (let i = 0; i < firstWeekday; i++) calCells.push({ blank: true });
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(monthBase.getFullYear(), monthBase.getMonth(), day);
    const iso = isoLocal(d);
    const dayTasks = tasksByDate[iso] || [];
    const isToday = iso === todayISO;
    const isSel = iso === s.selectedDate;
    calCells.push({
      blank: false,
      day,
      iso,
      dots: dayTasks.slice(0, 4).map((t) => ({
        style: `width:6px;height:6px;border-radius:2px;background:${
          metaOf(t.area).tint
        };opacity:${t.done ? 0.4 : 1}`,
      })),
      more: dayTasks.length > 4 ? '+' + (dayTasks.length - 4) : '',
      onClick: () => api.selectDay(iso),
      cellStyle: `position:relative;display:flex;flex-direction:column;gap:5px;padding:8px 8px 7px;min-height:78px;border-radius:10px;cursor:pointer;transition:all .12s;border:1px solid ${
        isSel ? 'var(--line2)' : 'var(--line)'
      };background:${isSel ? 'var(--inset)' : 'var(--panel)'}`,
      dayStyle: `font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:600;color:${
        isToday ? 'var(--accent)' : isSel ? 'var(--text)' : 'var(--text-faint)'
      }`,
    });
  }
  const selDateObj = new Date(s.selectedDate + 'T00:00:00');
  const selTasks = (tasksByDate[s.selectedDate] || [])
    .slice()
    .sort(
      (a, b) =>
        Number(a.done) - Number(b.done) || rank[a.priority] - rank[b.priority],
    )
    .map((t) => {
      const m = metaOf(t.area);
      return {
        id: t.id,
        title: t.title,
        done: t.done,
        tint: m.tint,
        areaLabel: m.label,
        badge: t.priority.toUpperCase(),
        badgeStyle: badgeStyles[t.priority],
        onToggle: () => api.toggleTask(t.id),
        boxStyle: `width:20px;height:20px;flex:0 0 20px;margin-top:1px;border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;border:1.5px solid ${
          t.done ? 'var(--accent)' : 'var(--line2)'
        };background:${t.done ? 'var(--accent)' : 'transparent'}`,
        titleStyle: `font-size:14px;font-weight:500;line-height:1.35;margin-top:3px;${
          t.done
            ? 'color:var(--text-faint2);text-decoration:line-through'
            : 'color:var(--text-dim)'
        }`,
      };
    });
  const calendar = {
    monthLabel: monthBase
      .toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      .toUpperCase(),
    cells: calCells,
    weekdayHeads: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    selectedLabel:
      labelForDate(s.selectedDate) +
      ' · ' +
      selDateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
    selTasks,
    selEmpty: selTasks.length === 0,
    onPrev: api.prevMonth,
    onNext: api.nextMonth,
    calDraft: s.calDraft,
    onCalDraftInput: api.onCalDraftInput,
    onCalDraftKey: api.onCalDraftKey,
    onCalAdd: api.onCalAdd,
  };

  // profile
  const initials = (s.userName || '')
    .trim()
    .split(/\s+/)
    .map((w) => w[0] || '')
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const pfpStyleObj: React.CSSProperties = {
    width: '60px',
    height: '60px',
    flex: '0 0 60px',
    borderRadius: '50%',
    border: '1.5px solid var(--line2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    overflow: 'hidden',
    padding: 0,
    background: s.pfp
      ? `var(--panel) url("${s.pfp}") center/cover no-repeat`
      : 'linear-gradient(135deg,var(--line2),var(--panel))',
  };

  // nateman
  const na = {
    open: s.naOpen,
    showFab: !s.naOpen,
    listening: s.naPhase === 'listening',
    answer: s.naPhase === 'answer',
    query: s.naQuery,
    hasQuery: !!s.naQuery,
    answerText: s.naAnswer,
    actionLabel: s.naActionLabel,
    hasActionChip: s.naPhase === 'answer' && !!s.naActionLabel,
    statusText:
      s.naPhase === 'listening'
        ? 'Listening…'
        : s.naPhase === 'thinking'
          ? 'Thinking…'
          : '',
    onClose: api.closeNateman,
    onStop: (e: React.MouseEvent) => e.stopPropagation(),
    onSummon: () => api.openNateman(),
    wakeOn: s.wake,
    mouthStyle:
      'position:absolute;bottom:16%;left:33%;width:34%;background:#2a0e16;border-radius:9px 9px 20px 20px;box-shadow:inset 0 5px 8px rgba(0,0,0,.55);' +
      (s.naPhase === 'answer'
        ? 'height:20%;animation:naTalk .3s ease-in-out infinite'
        : 'height:12%'),
    naInput: s.naInput,
    onNaInput: api.onNaInput,
    onNaKey: api.onNaKey,
    onNaSend: api.onNaSend,
    chips: [
      { label: 'My day', q: 'what’s on my plate today' },
      { label: 'Recall', q: 'what did I journal about trades' },
      { label: 'Net liquid', q: 'what’s my net liquid' },
      { label: 'Add a task', q: 'add review my trades tonight' },
      { label: 'Midnight theme', q: 'switch to midnight theme' },
    ].map((c) => ({ label: c.label, onClick: () => api.openNateman(c.q) })),
  };

  // KPIs
  const kpis = [
    { label: 'OPEN TODAY', val: String(todayOpen.length), color: 'var(--text)' },
    { label: 'FOCUS', val: `${doneToday}/${totalToday}`, color: 'var(--text)' },
    { label: 'HABITS', val: `${habitsDone}/${s.habits.length}`, color: 'var(--text)' },
    { label: 'NET LIQUID', val: fin.liquid, color: 'var(--text)' },
    { label: 'P&L TODAY', val: fmtSig(fd.pnlToday), color: pnlColor(fd.pnlToday) },
  ];

  // Overview: tasks-done summary + compact habits/priorities progress.
  const prioDone = s.tasks.filter((t) => t.done).length;
  const prioTotal = s.tasks.length;
  const taskSummary = {
    doneToday,
    totalToday,
    label: `${doneToday} of ${totalToday} done today`,
    pct: (totalToday ? Math.round((doneToday / totalToday) * 100) : 0) + '%',
  };
  const progress = {
    priorities: {
      label: `${prioDone}/${prioTotal}`,
      pct: (prioTotal ? Math.round((prioDone / prioTotal) * 100) : 0) + '%',
      topOpen: todayOpen[0] ? todayOpen[0].title : 'All clear',
      onOpen: () => api.setPage('tasks'),
    },
    habits: {
      label: `${habitsDone}/${s.habits.length}`,
      ringStyle: hb.ringStyle,
      score: habitsDone,
      hint: hb.hint,
      onOpen: () => api.setPage('habits'),
    },
  };

  // Morning briefing — a compact, glanceable summary line for the session card.
  const briefing = [
    {
      label: 'FIRST UP',
      val: todayOpen[0] ? todayOpen[0].title : 'All clear',
      color: 'var(--text-dim)',
    },
    {
      label: 'HABITS',
      val: `${habitsDone}/${s.habits.length}`,
      color: habitsDone === s.habits.length && s.habits.length ? '#74ad84' : 'var(--text-dim)',
    },
    {
      label: 'WEEKLY GOAL',
      val: goals.weekly.progressLabel,
      color: 'var(--text-dim)',
    },
    {
      label: 'P&L',
      val: fmtSig(fd.pnlToday),
      color: pnlColor(fd.pnlToday),
    },
  ];

  // Weekly review — a Sunday-style recap card (shown on Overview when the
  // "Weekly review" notification toggle is on). Built live from your data.
  const weeklyReview = (() => {
    const wk = s.goals.weekly.krs;
    const mo = s.goals.monthly.krs;
    const krDone = wk.filter((k) => k.done).length;
    const moDone = mo.filter((k) => k.done).length;
    const habitTicks = s.habits.reduce(
      (a, h) => a + h.week.filter(Boolean).length,
      0,
    );
    const habitMax = s.habits.length * 7;
    const habitPct = habitMax ? Math.round((habitTicks / habitMax) * 100) : 0;
    const hist = s.calHistory || [];
    const avgIntake = hist.length
      ? Math.round(hist.reduce((a, b) => a + b, 0) / hist.length)
      : 0;
    const calDelta = s.targets.kcal - avgIntake; // + = under target
    const income = s.budget.income.reduce((a, i) => a + i.amt, 0);
    const spent = s.budget.groups.reduce(
      (a, g) => a + g.subs.reduce((x, su) => x + su.spent, 0),
      0,
    );
    const net = income - spent;
    let worst: { name: string; over: number } | null = null;
    s.budget.groups.forEach((g) => {
      const gb = g.subs.reduce((a, su) => a + su.budget, 0);
      const gs = g.subs.reduce((a, su) => a + su.spent, 0);
      const over = gs - gb;
      if (over > 0 && (!worst || over > worst.over)) worst = { name: g.name, over };
    });
    return {
      show: !!s.notifs.weeklyReview,
      lines: [
        {
          label: 'GOALS',
          val: `${krDone}/${wk.length} weekly · ${moDone}/${mo.length} monthly`,
          color: 'var(--accent)',
        },
        {
          label: 'HABITS',
          val: `${habitPct}% of the week hit`,
          color: '#9b7fb4',
        },
        {
          label: 'CALORIES',
          val: avgIntake
            ? `${avgIntake} kcal/day · ${
                calDelta >= 0
                  ? `${calDelta} under`
                  : `${Math.abs(calDelta)} over`
              } target`
            : 'No intake logged',
          color: calDelta >= 0 ? '#74ad84' : '#c77b6b',
        },
        {
          label: 'BUDGET',
          val:
            net >= 0
              ? `${fmtPeso(net)} surplus this month`
              : `${fmtPeso(-net)} drawn down`,
          color: net >= 0 ? '#74ad84' : '#c77b6b',
        },
        {
          label: 'TRADING',
          val: `${fmtSig(fd.pnlMonth)} realized`,
          color: pnlColor(fd.pnlMonth),
        },
      ],
      note: worst
        ? `Watch ${(worst as { name: string }).name} — ${fmtPeso((worst as { over: number }).over)} over budget.`
        : 'Every category is within budget — nicely done.',
    };
  })();

  // Daily summary — a morning brief card (shown on Overview when the "Daily
  // summary" notification toggle is on).
  const dailyBrief = {
    show: !!s.notifs.dailySummary,
    lines: [
      {
        label: 'FIRST UP',
        val: todayOpen[0] ? todayOpen[0].title : 'All clear — plan your day',
        color: 'var(--text)',
      },
      {
        label: 'TASKS',
        val: `${prioDone}/${prioTotal} done`,
        color: 'var(--text-dim)',
      },
      {
        label: 'HABITS',
        val: `${habitsDone}/${s.habits.length} today`,
        color:
          habitsDone === s.habits.length && s.habits.length
            ? '#74ad84'
            : 'var(--text-dim)',
      },
      {
        label: 'CALORIES',
        val: `${Math.max(0, s.targets.kcal - net)} kcal left of ${s.targets.kcal}`,
        color: '#74ad84',
      },
      {
        label: 'WEEKLY GOAL',
        val: goals.weekly.progressLabel,
        color: 'var(--accent)',
      },
      {
        label: "TODAY'S P&L",
        val: fmtSig(fd.pnlToday),
        color: pnlColor(fd.pnlToday),
      },
    ],
  };

  // ── memecoins (live wallet positions) ──
  const usd = (n: number) =>
    '$' +
    Math.abs(n).toLocaleString(undefined, {
      minimumFractionDigits: n !== 0 && Math.abs(n) < 1 ? 2 : 0,
      maximumFractionDigits: 2,
    });
  const usdSig = (n: number) => (n >= 0 ? '+' : '−') + usd(n);
  const tinyPrice = (n: number) =>
    '$' +
    (n >= 1
      ? n.toLocaleString(undefined, { maximumFractionDigits: 2 })
      : n.toPrecision(2).replace(/0+$/, ''));
  const posValue = s.positions.reduce((a, p) => a + p.valueUsd, 0);
  const posDayPnl = s.positions.reduce((a, p) => a + p.dayPnlUsd, 0);
  const memecoins = {
    hasWallets: s.wallets.length > 0,
    walletCount: s.wallets.length,
    loading: s.positionsLoading,
    onRefresh: api.refreshPositions,
    totalValue: usd(posValue),
    dayPnl: usdSig(posDayPnl),
    dayPnlColor: posDayPnl >= 0 ? '#74ad84' : '#c77b6b',
    count: s.positions.length,
    empty: s.positions.length === 0,
    rows: s.positions.map((p) => ({
      symbol: p.symbol,
      name: p.name,
      icon: p.icon,
      amount:
        p.amount.toLocaleString(undefined, { maximumFractionDigits: 2 }) +
        ' ' +
        p.symbol,
      price: tinyPrice(p.priceUsd),
      value: usd(p.valueUsd),
      change: (p.change24h >= 0 ? '+' : '') + p.change24h.toFixed(1) + '%',
      changeColor: p.change24h >= 0 ? '#74ad84' : '#c77b6b',
      pnl: usdSig(p.dayPnlUsd),
      pnlColor: p.dayPnlUsd >= 0 ? '#74ad84' : '#c77b6b',
    })),
  };

  // ── leaderboard ──
  const leaderboard = {
    configured: api.authConfigured,
    signedIn: !!s.account,
    empty: s.leaderboard.length === 0,
    onRefresh: api.refreshLeaderboard,
    rows: s.leaderboard.map((r, i) => ({
      rank: i + 1,
      medal: i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '',
      name: r.name,
      avatar: r.avatar,
      initials: (r.name || '?').slice(0, 1).toUpperCase(),
      score: r.score.toLocaleString(),
      tasks: String(r.tasksDone),
      habit: r.habitPct + '%',
      pnl: fmtSig(r.pnl),
      pnlColor: pnlColor(r.pnl),
      isMe: r.isMe,
      rowStyle: `display:flex;align-items:center;gap:12px;padding:13px 15px;border-radius:12px;border:1px solid ${
        r.isMe ? 'color-mix(in srgb, var(--accent) 45%, transparent)' : 'var(--line)'
      };background:${
        r.isMe ? 'color-mix(in srgb, var(--accent) 9%, var(--panel))' : 'var(--inset)'
      }`,
    })),
  };

  return {
    pageTabs,
    weeklyReview,
    dailyBrief,
    memecoins,
    leaderboard,
    account: s.account,
    authReady: s.authReady,
    authConfigured: api.authConfigured,
    onSignIn: api.signInGoogle,
    onSignOut: api.signOut,
    isMemecoins: s.page === 'memecoins',
    isLeaderboard: s.page === 'leaderboard',
    isOverview: s.page === 'overview',
    isFinance: s.page === 'finance',
    isHealth: s.page === 'health',
    isTasks: s.page === 'tasks',
    isHabits: s.page === 'habits',
    isBudget: s.page === 'budget',
    isCalendar: s.page === 'calendar',
    isJournal: s.page === 'journal',
    isSettings: s.page === 'settings',
    rootStyle,
    rootClass,
    gearStyle,
    onOpenSettings: api.onOpenSettings,
    settings,
    na,
    clock: nowTime(now),
    dateShort: now
      .toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      .toUpperCase(),
    cats,
    managing: s.managing,
    catDraft: s.catDraft,
    onCatInput: api.onCatInput,
    onCatKey: api.onCatKey,
    onCatAdd: api.onCatAdd,
    onToggleManage: api.onToggleManage,
    manageLabel: s.managing ? 'DONE' : '+ MANAGE',
    manageBtnStyle: `font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1px;background:${
      s.managing ? 'var(--inset)' : 'transparent'
    };border:1px solid var(--line2);border-radius:7px;padding:5px 11px;cursor:pointer;transition:all .12s;color:${
      s.managing ? 'var(--text)' : 'var(--text-faint)'
    }`,
    kpis,
    briefing,
    verse,
    taskSummary,
    progress,
    eisenhower,
    tasksView,
    greeting,
    aiSummary,
    tasks,
    onVoice: api.onVoice,
    voiceIdle: !s.recording && !s.processing,
    voiceRec: s.recording,
    voiceProc: s.processing,
    voiceBtnStyle: `display:flex;align-items:center;width:100%;min-height:56px;padding:11px 16px;border-radius:13px;cursor:${
      s.recording || s.processing ? 'default' : 'pointer'
    };transition:all .15s;border:1px solid ${
      s.recording
        ? 'color-mix(in srgb, var(--accent) 40%, transparent)'
        : 'var(--line2)'
    };background:${
      s.recording
        ? 'color-mix(in srgb, var(--accent) 6%, transparent)'
        : 'var(--panel)'
    }`,
    hasTranscript: !!s.transcript,
    transcript: s.transcript,
    capture: s.capture,
    onCaptureInput: api.onCaptureInput,
    onCaptureKey: api.onCaptureKey,
    onCaptureSubmit: api.onCaptureSubmit,
    fuel,
    foodDraft: s.foodDraft,
    onFoodInput: api.onFoodInput,
    onFoodKey: api.onFoodKey,
    onFoodSubmit: api.onFoodSubmit,
    foodHint: fe ? `~${fe.kcal} kcal · ${fe.p}p / ${fe.c}c / ${fe.f}f` : '',
    foodSearching: s.foodSearching,
    foodResults: s.foodResults.map((h) => ({
      id: h.id,
      name: h.name,
      meta:
        `${h.kcal} cal · ${h.serving}` + (h.brand ? ` · ${h.brand}` : ''),
      macros: `${h.p}p · ${h.c}c · ${h.f}f`,
      onPick: () => api.onPickFood(h),
    })),
    train,
    exDraft: s.exDraft,
    onExInput: api.onExInput,
    onExKey: api.onExKey,
    onExSubmit: api.onExSubmit,
    exHint: ee ? `~${ee.kcal} kcal burned · ${ee.minutes} min` : '',
    hb,
    journal,
    fin,
    tradeDraft: s.tradeDraft,
    onTradeInput: api.onTradeInput,
    onTradeKey: api.onTradeKey,
    onTradeSubmit: api.onTradeSubmit,
    tradeHint: te ? `${te.sym} · ${fmtSig(te.pnl)} realized` : '',
    budget,
    health,
    goals,
    calendar,
    pfp: s.pfp,
    noPfp: !s.pfp,
    pfpInitials: initials || '+',
    onPickPfp: api.onPickPfp,
    onPfpChange: api.onPfpChange,
    fileRef: api.fileRef,
    pfpStyleObj,
    nameDisplay: s.userName || 'Add your name',
    nameEditing: s.edit === 'name',
    nameShow: s.edit !== 'name',
    onEditUserName: api.onEditUserName,
    editVal: s.editVal,
    onEditInput: api.onEditInput,
    onEditKey: api.onEditKey,
    commitEdit: api.commitEdit,
    focusRef: api.focusRef,
    onAddGroup: api.addGroup,
    onAddIncome: api.addIncome,
    expenseDraft: s.expenseDraft,
    onExpenseInput: api.onExpenseInput,
    onExpenseKey: api.onExpenseKey,
    onExpenseSubmit: api.onExpenseSubmit,
    hasToast: !!s.toast,
    toast: s.toast,
  };
}

export type VM = ReturnType<typeof useViewModel>;
