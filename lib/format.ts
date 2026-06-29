import type { Currency, Task } from './types';

/** Local ISO date (YYYY-MM-DD). */
export function isoLocal(d: Date): string {
  return d.toLocaleDateString('en-CA');
}

/** Current HH:MM in 24h, zero-padded. */
export function nowTime(d: Date = new Date()): string {
  return (
    String(d.getHours()).padStart(2, '0') +
    ':' +
    String(d.getMinutes()).padStart(2, '0')
  );
}

/** Monday-indexed day of week (0 = Mon … 6 = Sun). */
export function todayIndex(d: Date = new Date()): number {
  return (d.getDay() + 6) % 7;
}

/** Format an amount in the active currency. */
export function fmtMoney(n: number, currency: Currency): string {
  const c = currency?.symbol || '₱';
  const neg = n < 0;
  return (neg ? '-' + c : c) + Math.abs(Math.round(n)).toLocaleString('en-US');
}

/** Format a signed amount with a leading + / − sign. */
export function fmtSigned(n: number, currency: Currency): string {
  const c = currency?.symbol || '₱';
  return (n >= 0 ? '+' : '−') + c + Math.abs(Math.round(n)).toLocaleString('en-US');
}

/** Resolve a relative due bucket to an ISO date. */
export function dateFromDue(due: string | undefined, now: Date = new Date()): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(due || '')) return due as string;
  const d = new Date(now);
  if (due === 'tomorrow') {
    d.setDate(d.getDate() + 1);
    return isoLocal(d);
  }
  if (due === 'wed' || due === 'fri') {
    const want = due === 'wed' ? 3 : 5;
    d.setDate(d.getDate() + ((want - d.getDay() + 7) % 7));
    return isoLocal(d);
  }
  return isoLocal(now);
}

/** The effective ISO date for a task — explicit date wins over the due bucket. */
export function taskDate(t: Task, now: Date = new Date()): string {
  return t.date || dateFromDue(t.due, now);
}

/** Human label for an ISO date relative to today. */
export function labelForDate(iso: string, now: Date = new Date()): string {
  const today = isoLocal(now);
  if (iso === today) return 'Today';
  const diff = Math.round(
    (new Date(iso + 'T00:00:00').getTime() - new Date(today + 'T00:00:00').getTime()) /
      86400000,
  );
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff > 1 && diff < 7)
    return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' });
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}
