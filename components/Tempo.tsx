'use client';

import React, { useEffect, useState } from 'react';
import { TempoProvider } from '@/state/TempoProvider';
import { useViewModel } from '@/state/useViewModel';
import { css } from './css';
import TopBar from './TopBar';
import Overview from './Overview';
import TasksView from './TasksView';
import HabitsView from './HabitsView';
import HealthView from './HealthView';
import BudgetView from './BudgetView';
import FinanceView from './FinanceView';
import CalendarView from './CalendarView';
import JournalView from './JournalView';
import SettingsView from './SettingsView';
import Nateman from './Nateman';
import Toast from './Toast';

function Shell() {
  const vm = useViewModel();
  return (
    <div style={css(vm.rootStyle)} className={vm.rootClass}>
      <TopBar vm={vm} />
      <div className="appScroll" style={{ flex: 1, overflowY: 'auto' }}>
        <div className="appContent">
          {vm.isOverview && <Overview vm={vm} />}
          {vm.isTasks && <TasksView vm={vm} />}
          {vm.isHabits && <HabitsView vm={vm} />}
          {vm.isFinance && <FinanceView vm={vm} />}
          {vm.isHealth && <HealthView vm={vm} />}
          {vm.isBudget && <BudgetView vm={vm} />}
          {vm.isCalendar && <CalendarView vm={vm} />}
          {vm.isJournal && <JournalView vm={vm} />}
          {vm.isSettings && <SettingsView vm={vm} />}
        </div>
      </div>
      <Nateman vm={vm} />
      <Toast vm={vm} />
    </div>
  );
}

export default function Tempo() {
  // The app is clock-, localStorage-, and speech-API-driven — render only on the
  // client to avoid hydration mismatches and to read saved preferences.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <TempoProvider>
      {mounted ? (
        <Shell />
      ) : (
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }} />
      )}
    </TempoProvider>
  );
}
