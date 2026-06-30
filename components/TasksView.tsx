'use client';

import React, { useState } from 'react';
import type { VM } from '@/state/useViewModel';
import { css, Hov } from './css';
import { EditInput } from './Overview';

export default function TasksView({ vm }: { vm: VM }) {
  const mono = "font-family:'JetBrains Mono',monospace;";
  const tv = vm.tasksView;
  const [addOpen, setAddOpen] = useState(false);
  const selStyle =
    "background:var(--inset);border:1px solid var(--line2);border-radius:9px;padding:0 10px;height:44px;color:var(--text);font-size:12.5px;font-family:'JetBrains Mono',monospace;cursor:pointer";
  const submitPhone = () => {
    tv.add.onAdd();
    setAddOpen(false);
  };
  return (
    <div className="tasksWrap" style={css('display:flex;flex-direction:column;gap:14px')}>
      {/* CATEGORY BAR (editable) */}
      <div
        className="tasksCats"
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
        className="matrixSection"
        style={css('background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:18px 20px')}
      >
        <div className="matrixHead" style={css('display:flex;align-items:center;gap:10px;margin-bottom:4px')}>
          <span style={css(mono + 'font-size:11px;font-weight:600;letter-spacing:1px;color:var(--text-dim);border:1px solid var(--line2);border-radius:5px;padding:2px 7px')}>02</span>
          <span style={css(mono + 'font-size:11px;letter-spacing:2.5px;color:var(--text-faint)')}>{'// TASKS'}</span>
          <div style={{ flex: 1 }} />
          <span style={css(mono + 'font-size:10.5px;letter-spacing:1px;color:var(--text-faint2)')}>EISENHOWER MATRIX</span>
        </div>
        <p className="matrixHead" style={css('font-size:12.5px;color:var(--text-faint);margin-bottom:14px')}>
          Add a task, pick its category and quadrant, and it files itself. Tap a quadrant title to rename it.
        </p>

        {/* ADD FORM — text + category + quadrant (desktop; phone uses the + FAB) */}
        <div className="matrixAdd" style={css('display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px')}>
          <input
            value={vm.capture}
            onChange={vm.onCaptureInput}
            onKeyDown={tv.add.onKey}
            placeholder="Add a task…"
            style={css('flex:2;min-width:200px;background:var(--inset);border:1px solid var(--line2);border-radius:9px;padding:0 12px;height:44px;color:var(--text);font-size:13.5px')}
          />
          <select value={tv.add.areaVal} onChange={tv.add.onAreaChange} style={css(selStyle)} title="Category">
            {tv.add.areas.map((a) => (
              <option key={a.key} value={a.key}>{a.label}</option>
            ))}
          </select>
          <select value={tv.add.quadVal} onChange={tv.add.onQuadChange} style={css(selStyle)} title="Quadrant">
            {tv.add.quads.map((q) => (
              <option key={q.i} value={q.i}>{q.label}</option>
            ))}
          </select>
          <button
            onClick={tv.add.onAdd}
            style={css('background:var(--accent);color:var(--bg);border:none;border-radius:9px;padding:0 18px;height:44px;font-size:13px;font-weight:600;cursor:pointer')}
          >
            Add
          </button>
        </div>

        <div className="eisengrid">
          {tv.matrix.map((q, i) => (
            <div key={i} style={css(q.cardStyle)}>
              <div style={css('display:flex;align-items:center;gap:9px;margin-bottom:13px')}>
                <span style={css(q.badgeStyle)}>{q.roman}</span>
                <div style={css('flex:1;min-width:0')}>
                  {q.titleShow && (
                    <Hov onClick={q.onEditTitle} styleStr={q.titleStyle} hover="opacity:.8">
                      {q.title}
                    </Hov>
                  )}
                  {q.titleEditing && <EditInput vm={vm} style={q.editStyle} />}
                  <div className="taskAreaLabel" style={css(mono + 'font-size:9px;letter-spacing:.5px;color:var(--text-faint2);margin-top:2px')}>{q.sub}</div>
                </div>
                {q.count > 0 && (
                  <span style={css(mono + 'font-size:11px;color:var(--text-faint);flex:0 0 auto')}>{q.count}</span>
                )}
              </div>
              {q.empty && !(tv.showDone && q.doneRows.length) ? (
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
                        <div style={css(t.titleStyle)}>{t.title}</div>
                        <div className="taskAreaLabel" style={css('display:inline-flex;align-items:center;gap:6px;margin-top:4px')}>
                          <span style={css(`width:6px;height:6px;border-radius:2px;background:${t.tint}`)} />
                          <span style={css(mono + 'font-size:9.5px;letter-spacing:.5px;color:var(--text-faint)')}>
                            {t.areaLabel}
                          </span>
                        </div>
                      </div>
                    </Hov>
                  ))}
                  {tv.showDone &&
                    q.doneRows.map((t) => (
                      <div
                        key={t.id}
                        style={css('display:flex;align-items:flex-start;gap:10px;padding:9px 11px;border:1px solid var(--line);border-radius:10px;background:var(--bg);animation:fadeUp .2s ease')}
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
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* SHOW / HIDE COMPLETED (per quadrant) */}
        <div className="matrixDone" style={css('margin-top:16px')}>
          <Hov
            as="button"
            onClick={tv.onToggleShowDone}
            styleStr={mono + 'font-size:10.5px;letter-spacing:1px;background:transparent;border:1px solid var(--line2);border-radius:8px;padding:7px 12px;cursor:pointer;color:var(--text-faint)'}
            hover="color:var(--text);border-color:var(--line2)"
          >
            {tv.doneLabel}
          </Hov>
          {tv.showDone && tv.doneCount === 0 && (
            <span style={css('margin-left:10px;color:var(--text-faint2);font-size:12.5px')}>Nothing completed yet.</span>
          )}
        </div>
      </section>

      {/* PHONE: floating + to add a task */}
      <button
        className="matrixFab"
        onClick={() => setAddOpen(true)}
        title="Add a task"
        aria-label="Add a task"
      >
        +
      </button>

      {/* PHONE: add sheet opened by the FAB */}
      {addOpen && (
        <>
          <div className="sheetBackdrop" onClick={() => setAddOpen(false)} />
          <div className="addSheet">
            <div style={css('display:flex;align-items:center;margin-bottom:12px')}>
              <span style={css(mono + 'font-size:11px;letter-spacing:1.5px;color:var(--text-faint)')}>NEW TASK</span>
              <div style={{ flex: 1 }} />
              <button onClick={() => setAddOpen(false)} style={css('background:none;border:none;color:var(--text-faint);font-size:20px;line-height:1;cursor:pointer')}>×</button>
            </div>
            <input
              value={vm.capture}
              onChange={vm.onCaptureInput}
              onKeyDown={(e) => { if (e.key === 'Enter') submitPhone(); }}
              placeholder="What needs doing?"
              autoFocus
              style={css('width:100%;background:var(--inset);border:1px solid var(--line2);border-radius:11px;padding:0 14px;height:50px;color:var(--text);font-size:15px;margin-bottom:10px')}
            />
            <div style={css('display:flex;gap:8px;margin-bottom:14px')}>
              <select value={tv.add.areaVal} onChange={tv.add.onAreaChange} style={css(selStyle + ';flex:1')} title="Category">
                {tv.add.areas.map((a) => (<option key={a.key} value={a.key}>{a.label}</option>))}
              </select>
              <select value={tv.add.quadVal} onChange={tv.add.onQuadChange} style={css(selStyle + ';flex:1')} title="Quadrant">
                {tv.add.quads.map((q) => (<option key={q.i} value={q.i}>{q.label}</option>))}
              </select>
            </div>
            <button
              onClick={submitPhone}
              style={css('width:100%;background:var(--accent);color:var(--bg);border:none;border-radius:11px;height:50px;font-size:15px;font-weight:700;cursor:pointer')}
            >
              Add task
            </button>
          </div>
        </>
      )}
    </div>
  );
}
