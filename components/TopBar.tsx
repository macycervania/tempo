'use client';

import React from 'react';
import type { VM } from '@/state/useViewModel';
import { css, Hov } from './css';

export default function TopBar({ vm }: { vm: VM }) {
  return (
    <header
      style={css(
        'position:sticky;top:0;z-index:30;display:flex;align-items:center;gap:20px;height:46px;padding:0 22px;background:var(--panel);backdrop-filter:blur(8px);border-bottom:1px solid var(--line)',
      )}
    >
      <div style={css('display:flex;align-items:center;gap:9px')}>
        <div
          style={css(
            'width:8px;height:8px;border-radius:50%;background:var(--accent);box-shadow:0 0 10px color-mix(in srgb, var(--accent) 60%, transparent)',
          )}
        />
        <span
          style={css(
            "font-family:'JetBrains Mono',monospace;font-weight:600;font-size:13px;letter-spacing:2px;color:var(--text)",
          )}
        >
          tempo
        </span>
        <span
          style={css(
            "font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1px;color:var(--text-faint2)",
          )}
        >
          // OS
        </span>
      </div>
      <nav style={css('display:flex;align-items:center;gap:4px')}>
        {vm.pageTabs.map((tab, i) => (
          <Hov
            key={i}
            as="button"
            onClick={tab.onClick}
            styleStr={tab.style}
            hover="color:var(--text)"
          >
            {tab.label}
          </Hov>
        ))}
      </nav>
      <div style={{ flex: 1 }} />
      <div
        style={css(
          "font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:1px;color:var(--text-faint)",
        )}
      >
        {vm.clock}
        <span style={css('color:var(--text-faint2)')}> · {vm.dateShort}</span>
      </div>
      {vm.na.wakeOn && (
        <span
          title="Listening for ‘nateman’"
          style={css(
            'width:8px;height:8px;border-radius:50%;background:#9d6bff;box-shadow:0 0 8px #9d6bff;animation:pulse 1.3s ease-in-out infinite;flex:0 0 8px',
          )}
        />
      )}
      <Hov
        as="button"
        onClick={vm.onOpenSettings}
        styleStr={vm.gearStyle}
        hover="border-color:var(--line2);color:var(--text)"
        title="Settings"
      >
        ⚙
      </Hov>
    </header>
  );
}
