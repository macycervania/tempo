'use client';

import React from 'react';
import type { VM } from '@/state/useViewModel';
import { css, Hov } from './css';

export default function TasksView({ vm }: { vm: VM }) {
  const mono = "font-family:'JetBrains Mono',monospace;";
  const tv = vm.tasksView;
  return (
    <div style={css('display:flex;flex-direction:column;gap:14px')}>
      {/* CATEGORY BAR (editable) */}
      <div
        style={css(
          'display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:10px 14px;background:var(--panel);border:1px solid var(--line);border-radius:12px',
        )}
      >
        <span style={css(mono + 'font-size:10px;letter-spacing:1.5px;color:var(--text-faint2)')}>
          CATEGORIES
        </span>
        {vm.cats.map((c, i) => (
          <div
            key={i}
            style={css(
              mono +
                'display:flex;align-items:center;gap:7px;font-size:11px;letter-spacing:.5px;color:var(--text-muted);background:var(--panel);border:1px solid var(--line);border-radius:7px;padding:4px 9px',
            )}
          >
            <span style={css(`width:7px;height:7px;border-radius:2px;background:${c.tint}`)} />
            <span>{c.label}</span>
            <span style={css('color:var(--text);font-weight:600')}>{c.count}</span>
            {vm.managing && (
              <Hov
                as="button"
                onClick={c.onRemove}
                styleStr="background:none;border:none;color:var(--text-faint);cursor:pointer;font-size:13px;line-height:1;padding:0 0 0 2px"
                hover="color:#c77b6b"
              >
                ×
              </Hov>
            )}
          </div>
        ))}
        {vm.managing && (
          <div
            style={css(
              'display:flex;align-items:center;gap:6px;background:var(--panel);border:1px dashed var(--line2);border-radius:7px;padding:2px 4px 2px 9px',
            )}
          >
            <input
              value={vm.catDraft}
              onChange={vm.onCatInput}
              onKeyDown={vm.onCatKey}
              placeholder="New category"
              style={css('background:none;border:none;color:var(--text);font-size:12px;width:108px')}
            />
            <button
              onClick={vm.onCatAdd}
              style={css(
                'background:var(--inset);border:1px solid var(--line2);border-radius:5px;padding:3px 8px;font-size:11px;font-weight:600;color:var(--text-dim);cursor:pointer',
              )}
            >
              Add
            </button>
          </div>
        )}
        <div style={{ flex: 1 }} />
        <Hov
          as="button"
          onClick={vm.onToggleManage}
          styleStr={vm.manageBtnStyle}
          hover="border-color:var(--line2);color:var(--text)"
        >
          {vm.manageLabel}
        </Hov>
      </div>

      {/* MATRIX */}
      <section
        style={css('background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:18px 20px')}
      >
        <div style={css('display:flex;align-items:center;gap:10px;margin-bottom:4px')}>
          <span style={css(mono + 'font-size:11px;font-weight:600;letter-spacing:1px;color:var(--text-dim);border:1px solid var(--line2);border-radius:5px;padding:2px 7px')}>02</span>
          <span style={css(mono + 'font-size:11px;letter-spacing:2.5px;color:var(--text-faint)')}>{'// TASKS'}</span>
          <div style={{ flex: 1 }} />
          <span style={css(mono + 'font-size:10.5px;letter-spacing:1px;color:var(--text-faint2)')}>EISENHOWER MATRIX</span>
        </div>
        <p style={css('font-size:12.5px;color:var(--text-faint);margin-bottom:14px')}>
          Sorted by urgency &amp; importance — add a task and Tempo files it into the right quadrant.
        </p>

        {/* CAPTURE */}
        <div style={css('display:flex;align-items:center;gap:10px;margin-bottom:16px;background:var(--inset);border:1px solid var(--line2);border-radius:10px;padding:0 12px;height:44px')}>
          <span style={css(mono + 'font-size:12px;color:var(--accent)')}>+</span>
          <input
            value={vm.capture}
            onChange={vm.onCaptureInput}
            onKeyDown={vm.onCaptureKey}
            placeholder="Add a task (“finish the deck before Friday !”)"
            style={css('flex:1;background:none;border:none;color:var(--text);font-size:13.5px')}
          />
          <Hov
            as="button"
            onClick={vm.onCaptureSubmit}
            styleStr="background:var(--inset);border:1px solid var(--line2);border-radius:7px;padding:6px 13px;font-size:12px;font-weight:600;color:var(--text-dim);cursor:pointer"
            hover="border-color:var(--line2)"
          >
            Add
          </Hov>
        </div>

        <div className="eisengrid">
          {tv.matrix.map((q, i) => (
            <div key={i} style={css(q.cardStyle)}>
              <div style={css('display:flex;align-items:center;gap:9px;margin-bottom:13px')}>
                <span style={css(q.badgeStyle)}>{q.roman}</span>
                <div>
                  <div style={css(q.titleStyle)}>{q.title}</div>
                  <div style={css(mono + 'font-size:9px;letter-spacing:.5px;color:var(--text-faint2);margin-top:2px')}>{q.sub}</div>
                </div>
                <div style={{ flex: 1 }} />
                {q.count > 0 && (
                  <span style={css(mono + 'font-size:11px;color:var(--text-faint)')}>{q.count}</span>
                )}
              </div>
              {q.empty ? (
                <div style={css('flex:1;display:flex;align-items:center;justify-content:center;color:var(--text-faint2);font-size:12.5px')}>
                  No tasks
                </div>
              ) : (
                <div style={css('display:flex;flex-direction:column;gap:8px')}>
                  {q.rows.map((t) => (
                    <Hov
                      key={t.id}
                      styleStr="display:flex;align-items:flex-start;gap:10px;padding:9px 11px;border:1px solid var(--line);border-radius:10px;background:var(--panel);animation:fadeUp .2s ease"
                      hover="border-color:var(--line2)"
                    >
                      <button onClick={t.onToggle} style={css(t.boxStyle)} />
                      <div style={css('flex:1;min-width:0')}>
                        <div style={css('font-size:13.5px;font-weight:500;line-height:1.35;color:var(--text-dim)')}>
                          {t.title}
                        </div>
                        <div style={css('display:inline-flex;align-items:center;gap:6px;margin-top:4px')}>
                          <span style={css(`width:6px;height:6px;border-radius:2px;background:${t.tint}`)} />
                          <span style={css(mono + 'font-size:9.5px;letter-spacing:.5px;color:var(--text-faint)')}>
                            {t.areaLabel}
                          </span>
                        </div>
                      </div>
                    </Hov>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* COMPLETED — viewable & restorable */}
        <div style={css('margin-top:16px;border-top:1px solid var(--line);padding-top:14px')}>
          <Hov
            as="button"
            onClick={tv.onToggleShowDone}
            styleStr={mono + 'font-size:10.5px;letter-spacing:1px;background:transparent;border:1px solid var(--line2);border-radius:8px;padding:7px 12px;cursor:pointer;color:var(--text-faint)'}
            hover="color:var(--text);border-color:var(--line2)"
          >
            {tv.doneLabel}
          </Hov>
          {tv.showDone && (
            <div style={css('margin-top:12px;display:flex;flex-direction:column;gap:7px')}>
              {tv.doneCount === 0 ? (
                <div style={css('color:var(--text-faint2);font-size:12.5px;padding:6px 2px')}>Nothing completed yet today.</div>
              ) : (
                tv.done.map((t) => (
                  <div
                    key={t.id}
                    style={css('display:flex;align-items:flex-start;gap:10px;padding:9px 11px;border:1px solid var(--line);border-radius:10px;background:var(--inset);animation:fadeUp .2s ease')}
                  >
                    <button onClick={t.onToggle} style={css(t.boxStyle)} title="Restore">
                      <span style={css('font-size:11px;color:var(--bg);font-weight:700')}>✓</span>
                    </button>
                    <div style={css('flex:1;min-width:0')}>
                      <div style={css(t.titleStyle)}>{t.title}</div>
                      <div style={css('display:inline-flex;align-items:center;gap:6px;margin-top:4px')}>
                        <span style={css(`width:6px;height:6px;border-radius:2px;background:${t.tint};opacity:.5`)} />
                        <span style={css(mono + 'font-size:9.5px;letter-spacing:.5px;color:var(--text-faint2)')}>{t.areaLabel}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
