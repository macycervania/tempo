// Real device notifications via the browser Notification API. These fire while
// the app is open / installed (Add to Home Screen) on a secure context (https
// or localhost) — so they work once deployed, and no-op on a file:// page.
//
// No background/push server here: we surface notifications when the app is open
// and the relevant condition is true, deduped to at most once per day per type.

export function notifySupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function notifyPermission(): NotificationPermission | 'unsupported' {
  if (!notifySupported()) return 'unsupported';
  return Notification.permission;
}

export async function requestNotifyPermission(): Promise<
  NotificationPermission | 'unsupported'
> {
  if (!notifySupported()) return 'unsupported';
  try {
    return await Notification.requestPermission();
  } catch {
    return 'denied';
  }
}

export function showNotification(title: string, body: string, tag: string): void {
  if (!notifySupported() || Notification.permission !== 'granted') return;
  try {
    new Notification(title, { body, tag, icon: '/icon.svg' });
  } catch {
    /* some engines throw outside a service worker — ignore */
  }
}

function todayKey(): string {
  return new Date().toLocaleDateString('en-CA');
}

/** True if this notification type already fired today (once-per-day dedup). */
export function firedToday(key: string): boolean {
  try {
    return localStorage.getItem('notif_' + key) === todayKey();
  } catch {
    return false;
  }
}

export function markFiredToday(key: string): void {
  try {
    localStorage.setItem('notif_' + key, todayKey());
  } catch {
    /* ignore */
  }
}
