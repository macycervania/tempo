'use client';

import React from 'react';
import { useTempo } from './TempoProvider';
import { THEMES, CURRENCIES } from '@/lib/constants';
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
import type { Area, Priority, Task } from '@/lib/types';

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
        { key: 'dailySummary', label: 'Daily summary', desc: 'A morning brief of your day' },
        { key: 'habitReminders', label: 'Habit reminders', desc: 'Nudge me to keep streaks alive' },
        { key: 'deadlineAlerts', label: 'Deadline alerts', desc: 'Warn me before tasks are due' },
        { key: 'weeklyReview', label: 'Weekly review', desc: 'Sunday recap of goals & spending' },
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
    currencyNote: `All amounts shown in ${s.currency.code} (${s.currency.symbol})`,
    onReset: api.resetSettings,
  };

  const pageTabs = (
    [
      { key: 'overview', label: 'Overview' },
      { key: 'health', label: 'Health' },
      { key: 'budget', label: 'Budget' },
      { key: 'finance', label: 'Finance' },
      { key: 'calendar', label: 'Calendar' },
    ] as const
  ).map((t) => ({
    label: t.label,
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
  const ee = estimateExercise(s.exDraft);

  // finance (pesos, linked to budget)
  const fd = s.fin;
  const pnlColor = (n: number) => (n >= 0 ? '#74ad84' : '#c77b6b');
  const incomeTotalF = s.budget.income.reduce((a, i) => a + i.amt, 0);
  const spentTotalF = s.budget.groups.reduce(
    (a, g) => a + g.subs.reduce((x, su) => x + su.spent, 0),
    0,
  );
  const cashVal = fd.cashOpening + incomeTotalF - spentTotalF;
  const liquidAccts = [
    { label: 'CASH · FROM BUDGET', val: cashVal, color: 'var(--accent)' },
    { label: 'SAVINGS', val: fd.savings, color: '#6f90b4' },
    { label: 'E-WALLET', val: fd.ewallet, color: '#74ad84' },
  ];
  const liquidTotal = liquidAccts.reduce((a, b) => a + b.val, 0);
  const assetsTotal = fd.assets.reduce((a, b) => a + b.val, 0);
  const netWorth = liquidTotal + assetsTotal;
  const fin = {
    liquid: fmtPeso(liquidTotal),
    netWorth: fmtPeso(netWorth),
    netDelta:
      '+' +
      Math.round((fd.pnlMonth / Math.max(liquidTotal, 1)) * 1000) / 10 +
      '% · 30D',
    breakdown: liquidAccts.map((b) => ({
      label: b.label,
      color: b.color,
      val: fmtPeso(b.val),
      pct: Math.round((b.val / Math.max(liquidTotal, 1)) * 100) + '%',
    })),
    assets: fd.assets.map((a) => ({
      label: a.label,
      color: a.color,
      val: fmtPeso(a.val),
      pct: Math.round((a.val / Math.max(assetsTotal, 1)) * 100) + '%',
    })),
    assetsTotal: fmtPeso(assetsTotal),
    cashNote:
      incomeTotalF >= spentTotalF
        ? `${fmtPeso(incomeTotalF - spentTotalF)} surplus this month`
        : `${fmtPeso(spentTotalF - incomeTotalF)} drawn down this month`,
    pnlStats: [
      { label: 'TODAY', val: fmtSig(fd.pnlToday), color: pnlColor(fd.pnlToday) },
      { label: 'THIS MONTH', val: fmtSig(fd.pnlMonth), color: pnlColor(fd.pnlMonth) },
      { label: 'ALL-TIME', val: fmtSig(fd.pnlTotal), color: pnlColor(fd.pnlTotal) },
    ],
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
    trades: fd.trades.map((t) => ({
      sym: t.sym,
      date: t.date,
      pnl: fmtSig(t.pnl),
      pnlStyle: `font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:600;flex:0 0 auto;color:${pnlColor(
        t.pnl,
      )}`,
    })),
    tradeCount: fd.trades.length,
  };
  const te = parseTrade(s.tradeDraft);

  // budget
  const editKey = s.edit;
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
    showFab: s.page === 'overview' && !s.naOpen,
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
      { label: 'Net liquid', q: 'what’s my net liquid' },
      { label: 'Add a task', q: 'add review my trades tonight' },
      { label: 'Midnight theme', q: 'switch to midnight theme' },
    ].map((c) => ({ label: c.label, onClick: () => api.openNateman(c.q) })),
  };

  // KPIs
  const kpis = [
    { label: 'OPEN TODAY', val: String(todayOpen.length), color: 'var(--text)' },
    { label: 'FOCUS', val: `${doneToday}/${totalToday}`, color: 'var(--text)' },
    { label: 'NET KCAL', val: String(net), color: 'var(--text)' },
    { label: 'BURNED', val: String(burned), color: '#74ad84' },
    { label: 'HABITS', val: `${habitsDone}/${s.habits.length}`, color: 'var(--text)' },
    { label: 'NET LIQUID', val: fin.liquid, color: 'var(--text)' },
    { label: 'P&L TODAY', val: fmtSig(fd.pnlToday), color: pnlColor(fd.pnlToday) },
  ];

  return {
    pageTabs,
    isOverview: s.page === 'overview',
    isFinance: s.page === 'finance',
    isHealth: s.page === 'health',
    isBudget: s.page === 'budget',
    isCalendar: s.page === 'calendar',
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
    train,
    exDraft: s.exDraft,
    onExInput: api.onExInput,
    onExKey: api.onExKey,
    onExSubmit: api.onExSubmit,
    exHint: ee ? `~${ee.kcal} kcal burned · ${ee.minutes} min` : '',
    hb,
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
    budgetManaging: s.budgetManaging,
    onToggleBudgetManage: api.onToggleBudgetManage,
    budgetManageLabel: s.budgetManaging ? 'DONE' : '+ EDIT LINES',
    budgetManageBtnStyle: `font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1px;background:${
      s.budgetManaging ? 'var(--inset)' : 'transparent'
    };border:1px solid var(--line2);border-radius:7px;padding:5px 11px;cursor:pointer;transition:all .12s;color:${
      s.budgetManaging ? 'var(--text)' : 'var(--text-faint)'
    }`,
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
