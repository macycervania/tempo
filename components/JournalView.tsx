'use client';

import React from 'react';
import type { VM } from '@/state/useViewModel';
import { css, Hov } from './css';

export default function JournalView({ vm }: { vm: VM }) {
  const mono = "font-family:'JetBrains Mono',monospace;";
  const j = vm.journal;
  return (
    <div style={css('display:flex;flex-direction:column;gap:14px')}>
      {/* COMPOSER */}
      <section
        style={css(
          'background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:20px 22px',
        )}
      >
        <div style={css('display:flex;align-items:center;gap:10px;margin-bottom:14px')}>
          <span style={css(mono + 'font-size:11px;font-weight:600;letter-spacing:1px;color:var(--bg);background:var(--accent);border-radius:5px;padding:2px 7px')}>
            ✎
          </span>
          <span style={css(mono + 'font-size:11px;letter-spacing:2.5px;color:var(--text-faint)')}>
            {'// JOURNAL'}
          </span>
          <div style={{ flex: 1 }} />
          <span style={css(mono + 'font-size:10.5px;letter-spacing:1px;color:var(--text-faint2)')}>
            {j.count} {j.count === 1 ? 'ENTRY' : 'ENTRIES'}
          </span>
        </div>

        <textarea
          value={j.draft}
          onChange={j.onInput}
          onKeyDown={j.onKey}
          placeholder="How did today go? Wins, blockers, what to change tomorrow…  (⌘/Ctrl + ↵ to save)"
          rows={4}
          style={css(
            'width:100%;resize:vertical;background:var(--inset);border:1px solid var(--line2);border-radius:12px;padding:13px 15px;color:var(--text);font-size:14px;line-height:1.55;font-family:inherit',
          )}
        />

        <div style={css('display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:13px')}>
          <span style={css(mono + 'font-size:10px;letter-spacing:1.5px;color:var(--text-faint2);margin-right:2px')}>
            MOOD
          </span>
          {j.moodPicker.map((m) => (
            <Hov
              key={m.key}
              as="button"
              onClick={m.onClick}
              styleStr={m.style}
              hover="border-color:var(--line2)"
            >
              <span style={css(m.dotStyle)}>{m.glyph}</span>
              {m.label}
            </Hov>
          ))}
          <div style={{ flex: 1 }} />
          <Hov
            as="button"
            onClick={j.onSummarise}
            styleStr={mono + 'font-size:11px;letter-spacing:.5px;background:transparent;border:1px solid var(--line2);border-radius:9px;padding:8px 13px;cursor:pointer;color:var(--text-dim);font-weight:600'}
            hover="color:var(--text);border-color:var(--accent)"
          >
            {j.summarizing ? 'Summarising…' : '✦ Summarise my day'}
          </Hov>
          <button
            onClick={j.onSubmit}
            disabled={!j.canSave}
            style={css(
              `font-size:13px;font-weight:600;border-radius:9px;padding:8px 18px;border:none;cursor:${
                j.canSave ? 'pointer' : 'default'
              };color:${j.canSave ? 'var(--bg)' : 'var(--text-faint2)'};background:${
                j.canSave ? 'var(--accent)' : 'var(--inset)'
              }`,
            )}
          >
            Save
          </button>
        </div>
      </section>

      {/* ENTRIES */}
      {j.empty ? (
        <div
          style={css(
            'background:var(--panel);border:1px dashed var(--line2);border-radius:16px;padding:40px 22px;text-align:center;color:var(--text-faint2);font-size:13.5px',
          )}
        >
          No entries yet — write your first reflection above, or hit “Summarise my day”.
        </div>
      ) : (
        <div style={css('display:flex;flex-direction:column;gap:11px')}>
          {j.entries.map((e) => (
            <Hov
              key={e.id}
              styleStr="background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:16px 18px;animation:fadeUp .2s ease"
              hover="border-color:var(--line2)"
            >
              <div style={css('display:flex;align-items:center;gap:10px;margin-bottom:9px')}>
                <span style={css('display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:var(--text-dim)')}>
                  <span style={css(`color:${e.moodColor};font-size:13px`)}>{e.moodGlyph}</span>
                  {e.moodLabel}
                </span>
                <span style={css(`width:4px;height:4px;border-radius:50%;background:var(--line2)`)} />
                <span style={css(mono + 'font-size:11px;color:var(--text-faint)')}>
                  {e.dateLabel} · {e.time}
                </span>
                {e.isSummary && (
                  <span style={css(mono + 'font-size:9px;letter-spacing:.5px;color:var(--accent);border:1px solid color-mix(in srgb, var(--accent) 32%, transparent);border-radius:4px;padding:1px 6px')}>
                    ✦ TEMPO
                  </span>
                )}
                <div style={{ flex: 1 }} />
                <Hov
                  as="button"
                  onClick={e.onRemove}
                  styleStr="background:none;border:none;color:var(--text-faint2);cursor:pointer;font-size:14px;line-height:1"
                  hover="color:#c77b6b"
                >
                  ×
                </Hov>
              </div>
              <p style={css('font-size:14px;line-height:1.6;color:var(--text-dim);white-space:pre-wrap')}>
                {e.text}
              </p>
            </Hov>
          ))}
        </div>
      )}
    </div>
  );
}
