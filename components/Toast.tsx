'use client';

import React from 'react';
import type { VM } from '@/state/useViewModel';
import { css } from './css';

export default function Toast({ vm }: { vm: VM }) {
  if (!vm.hasToast) return null;
  return (
    <div
      style={css(
        'position:fixed;bottom:26px;left:50%;transform:translateX(-50%);background:var(--inset);border:1px solid var(--line2);border-radius:10px;padding:12px 18px;font-size:13px;color:var(--text);box-shadow:0 10px 30px rgba(0,0,0,.5);animation:fadeUp .2s ease;z-index:50',
      )}
    >
      {vm.toast}
    </div>
  );
}
