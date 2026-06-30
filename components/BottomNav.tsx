'use client';

import React from 'react';
import type { VM } from '@/state/useViewModel';
import { css } from './css';

/**
 * Phone-only bottom tab bar — fixed to the bottom of the viewport so every
 * page is reachable with one thumb. Hidden on desktop via the `.bottomNav`
 * media query; the top bar's inline nav is hidden on phones in turn.
 */
export default function BottomNav({ vm }: { vm: VM }) {
  const tabs = [
    ...vm.pageTabs,
    {
      key: 'settings',
      label: 'Settings',
      glyph: '⚙',
      active: vm.isSettings,
      onClick: vm.onOpenSettings,
    },
  ];
  return (
    <nav className="bottomNav">
      <div className="bottomNavRow">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={t.onClick}
            style={css(
              `flex:0 0 auto;display:flex;flex-direction:column;align-items:center;gap:3px;min-width:60px;padding:7px 9px 5px;background:none;border:none;cursor:pointer;border-radius:10px;transition:color .12s;color:${
                t.active ? 'var(--accent)' : 'var(--text-faint)'
              }`,
            )}
          >
            <span style={css(`font-size:16px;line-height:1;${t.active ? '' : 'opacity:.85'}`)}>{t.glyph}</span>
            <span
              style={css(
                `font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:.3px;font-weight:600;color:${
                  t.active ? 'var(--accent)' : 'var(--text-faint)'
                }`,
              )}
            >
              {t.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
