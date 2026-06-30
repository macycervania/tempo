'use client';

import React from 'react';
import type { VM } from '@/state/useViewModel';
import { css, Hov } from './css';

export default function CalendarView({ vm }: { vm: VM }) {
  const mono = "font-family:'JetBrains Mono',monospace;";
  const cal = vm.calendar;
  return (
    <div className="calgrid">
      <section style={css('background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:20px 22px')}>
        <div style={css('display:flex;align-items:center;gap:12px;margin-bottom:16px')}>
          <span style={css(mono + 'font-size:11px;font-weight:600;letter-spacing:1px;color:var(--bg);background:var(--accent);border-radius:5px;padding:2px 7px')}>◷</span>
          <span style={css(mono + 'font-size:11px;letter-spacing:1px;color:var(--text)')}>{cal.monthLabel}</span>
          <div style={{ flex: 1 }} />
          <Hov as="button" onClick={cal.onPrev} styleStr="background:var(--inset);border:1px solid var(--line2);border-radius:7px;width:30px;height:30px;color:var(--text-muted);cursor:pointer;font-size:14px" hover="border-color:var(--line2);color:var(--text)">‹</Hov>
          <Hov as="button" onClick={cal.onNext} styleStr="background:var(--inset);border:1px solid var(--line2);border-radius:7px;width:30px;height:30px;color:var(--text-muted);cursor:pointer;font-size:14px" hover="border-color:var(--line2);color:var(--text)">›</Hov>
        </div>
        <div style={css('display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-bottom:6px')}>
          {cal.weekdayHeads.map((wd, i) => (
            <span key={i} style={css(mono + 'text-align:center;font-size:9.5px;letter-spacing:1px;color:var(--text-faint2)')}>{wd}</span>
          ))}
        </div>
        <div style={css('display:grid;grid-template-columns:repeat(7,1fr);gap:6px')}>
          {cal.cells.map((cell, i) =>
            cell.blank ? (
              <div key={i} />
            ) : (
              <button key={i} onClick={cell.onClick} style={css(cell.cellStyle)}>
                <span style={css(cell.dayStyle)}>{cell.day}</span>
                <div style={css('display:flex;flex-wrap:wrap;gap:3px;align-items:center')}>
                  {cell.dots.map((dot, j) => (
                    <span key={j} style={css(dot.style)} />
                  ))}
                  <span style={css(mono + 'font-size:8px;color:var(--text-faint2)')}>{cell.more}</span>
                </div>
              </button>
            ),
          )}
        </div>
      </section>
      <section style={css('background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:20px 22px;display:flex;flex-direction:column')}>
        <div style={css(mono + 'font-size:10px;letter-spacing:1.5px;color:var(--accent);margin-bottom:4px')}>SELECTED</div>
        <div style={css('font-size:18px;font-weight:700;color:var(--text);margin-bottom:14px')}>{cal.selectedLabel}</div>
        <div style={css('display:flex;align-items:center;gap:9px;background:var(--inset);border:1px solid var(--line2);border-radius:10px;padding:0 12px;height:42px;margin-bottom:14px')}>
          <span style={css(mono + 'font-size:13px;color:var(--accent)')}>+</span>
          <input value={cal.calDraft} onChange={cal.onCalDraftInput} onKeyDown={cal.onCalDraftKey} placeholder="Add a task to this day…" style={css('flex:1;background:none;border:none;color:var(--text);font-size:13px')} />
          <Hov as="button" onClick={cal.onCalAdd} styleStr="background:var(--inset);border:1px solid var(--line2);border-radius:7px;padding:5px 11px;font-size:12px;font-weight:600;color:var(--text-dim);cursor:pointer" hover="border-color:var(--line2)">Add</Hov>
        </div>
        <div style={css('display:flex;flex-direction:column;gap:7px;flex:1')}>
          {cal.selTasks.map((task) => (
            <div key={task.id} style={css('display:flex;align-items:flex-start;gap:11px;padding:11px 13px;background:var(--inset);border:1px solid var(--line);border-radius:11px;animation:fadeUp .2s ease')}>
              <button onClick={task.onToggle} style={css(task.boxStyle)}>
                {task.done && <span style={css('font-size:12px;color:var(--bg);font-weight:700;animation:cheerPop .25s ease')}>✓</span>}
              </button>
              <div style={css('flex:1;min-width:0')}>
                <span style={css(task.badgeStyle)}>{task.badge}</span>
                <div style={css(task.titleStyle)}>{task.title}</div>
              </div>
              <span style={css('display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:500;color:var(--text-muted);flex:0 0 auto')}>
                <span style={css(`width:6px;height:6px;border-radius:2px;background:${task.tint}`)} />
                {task.areaLabel}
              </span>
            </div>
          ))}
          {cal.selEmpty && (
            <div style={css('text-align:center;padding:30px 10px;font-size:13px;color:var(--text-faint2)')}>Nothing scheduled. Add one above.</div>
          )}
        </div>
      </section>
    </div>
  );
}
