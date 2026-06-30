import type { TempoState } from './types';

// Keys kept identical to the prototype so existing saved prefs carry over.
const SETTINGS_KEY = 'tempo_settings';
const PFP_KEY = 'tempo_pfp';
const NAME_KEY = 'tempo_name';

/** The slice of state we persist between sessions (preferences + profile). */
export type PersistedSettings = Pick<
  TempoState,
  | 'theme'
  | 'currency'
  | 'reduceMotion'
  | 'targets'
  | 'body'
  | 'notifs'
  | 'userName'
  | 'sound'
  | 'voiceURI'
>;

export function loadSettings(): {
  settings: Partial<TempoState> | null;
  pfp: string | null;
  name: string | null;
} {
  if (typeof window === 'undefined')
    return { settings: null, pfp: null, name: null };
  let settings: Partial<TempoState> | null = null;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) settings = JSON.parse(raw);
  } catch {
    settings = null;
  }
  let pfp: string | null = null;
  let name: string | null = null;
  try {
    pfp = localStorage.getItem(PFP_KEY);
    name = localStorage.getItem(NAME_KEY);
  } catch {
    /* ignore */
  }
  return { settings, pfp, name };
}

export function saveSettings(state: TempoState): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: PersistedSettings = {
      theme: state.theme,
      currency: state.currency,
      reduceMotion: state.reduceMotion,
      targets: state.targets,
      body: state.body,
      notifs: state.notifs,
      userName: state.userName,
      sound: state.sound,
      voiceURI: state.voiceURI,
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

export function savePfp(dataUrl: string): void {
  try {
    localStorage.setItem(PFP_KEY, dataUrl);
  } catch {
    /* ignore */
  }
}

export function clearSettings(): void {
  try {
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem(PFP_KEY);
    localStorage.removeItem(NAME_KEY);
  } catch {
    /* ignore */
  }
}
