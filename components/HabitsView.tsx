'use client';

import React from 'react';
import type { VM } from '@/state/useViewModel';
import { css, Hov } from './css';
import { EditInput } from './Overview';

export default function HabitsView({ vm }: { vm: VM }) {
  const mono = "font-family:'JetBrains Mono',monospace;";
  return (
    <section
      style={css('background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:18px 20px')}
    >
      <div style={css('display:flex;align-items:center;gap:10px;margin-bottom:16px')}>
        <span style={css(mono + 'font-size:11px;font-weight:600;letter-spacing:1px;color:var(--text-dim);border:1px solid var(--line2);border-radius:5px;padding:2px 7px')}>03</span>
        <span style={css(mono + 'font-size:11px;letter-spacing:2.5px;color:var(--text-faint)')}>{'// HABITS'}</span>
        <div style={{ flex: 1 }} />
        <Hov as="button" onClick={vm.hb.onAdd} styleStr={mono + 'font-size:10px;letter-spacing:1px;background:transparent;border:1px solid var(--line2);border-radius:7px;padding:5px 10px;cursor:pointer;color:var(--text-faint)'} hover="color:var(--text);border-color:var(--accent)">
          + HABIT
        </Hov>
      </div>
      <div style={css('display:flex;align-items:center;gap:14px;margin-bottom:18px')}>
        <div style={css('position:relative;width:56px;height:56px;border-radius:50%;flex:0 0 56px;' + vm.hb.ringStyle)}>
          <div style={css('position:absolute;inset:4px;border-radius:50%;background:var(--panel);display:flex;align-items:center;justify-content:center;font-size:19px;font-weight:700;color:var(--text)')}>
            {vm.hb.score}
          </div>
        </div>
        <div>
          <div style={css(mono + 'font-size:9.5px;letter-spacing:1.5px;color:var(--text-faint)')}>DAILY SCORE · RESETS 00:00</div>
          <div style={css('font-size:15px;font-weight:600;color:var(--text-dim);margin-top:3px')}>{vm.hb.hint}</div>
        </div>
      </div>
      <div style={css('display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px')}>
        {vm.hb.cards.map((h) => (
          <Hov key={h.id} styleStr={h.cardStyle} hover="transform:translateY(-2px);border-color:var(--accent)">
            <div style={css('display:flex;align-items:flex-start;gap:11px')}>
              <button onClick={h.onToggle} style={css(h.boxStyle)}>
                {h.done && <span style={css('font-size:12px;color:var(--bg);font-weight:700;animation:cheerPop .25s ease')}>✓</span>}
              </button>
              <div style={css('flex:1;min-width:0;cursor:pointer')} onClick={h.onExpand}>
                {h.nameShow && <div style={css('font-size:14px;font-weight:600;color:var(--text)')}>{h.name}</div>}
                {h.nameEditing && (
                  <input
                    ref={vm.focusRef}
                    value={vm.editVal}
                    onChange={vm.onEditInput}
                    onKeyDown={vm.onEditKey}
                    onBlur={vm.commitEdit}
                    onClick={(e) => e.stopPropagation()}
                    style={css('width:100%;background:var(--inset);border:1px solid var(--line2);border-radius:5px;padding:2px 6px;color:var(--text);font-size:14px;font-weight:600')}
                  />
                )}
                <div style={css('display:flex;align-items:center;gap:6px;margin-top:3px')}>
                  <span style={css(mono + 'font-size:9.5px;letter-spacing:1px;color:var(--text-faint)')}>{h.cat}</span>
                  {h.progress && <span style={css(mono + 'font-size:9.5px;color:var(--text-faint)')}>· {h.progress}</span>}
                </div>
              </div>
              {h.streakShow && (
                <span style={css('display:inline-flex;align-items:center;gap:3px;flex:0 0 auto')}>
                  <span style={css('width:9px;height:12px;background:linear-gradient(#ffb648,#e0566f);border-radius:50% 50% 50% 50%/62% 62% 40% 40%;display:inline-block')} />
                  <span style={css(mono + 'font-size:11px;font-weight:600;color:#ffb648')}>{h.streak}</span>
                </span>
              )}
              <Hov as="button" onClick={h.onRemove} styleStr="background:none;border:none;color:var(--text-faint2);cursor:pointer;font-size:13px;line-height:1;flex:0 0 auto" hover="color:#c77b6b">×</Hov>
            </div>
            {h.expanded && (
              <div style={css('margin-top:11px;padding-top:11px;border-top:1px solid var(--line)')}>
                <div style={css(mono + 'font-size:9px;letter-spacing:1px;color:var(--text-faint2);margin-bottom:9px')}>SUB-TASKS · ALL REQUIRED TO COMPLETE</div>
                <div style={css('display:flex;flex-direction:column;gap:8px')}>
                  {h.subs.map((sub, i) => (
                    <div key={i} style={css('display:flex;align-items:center;gap:9px')}>
                      <button onClick={sub.onToggle} style={css(sub.boxStyle)}>
                        {sub.done && <span style={css('font-size:10px;color:var(--bg);font-weight:700;animation:cheerPop .25s ease')}>✓</span>}
                      </button>
                      <span style={css(mono + 'font-size:11px;color:var(--text-faint2)')}>{sub.num}.</span>
                      {sub.labelShow && <span onClick={sub.onEditLabel} style={css(sub.labelStyle)}>{sub.label}</span>}
                      {sub.labelEditing && (
                        <EditInput vm={vm} style="flex:1;background:var(--inset);border:1px solid var(--line2);border-radius:5px;padding:2px 6px;color:var(--text);font-size:12px" />
                      )}
                      <Hov as="button" onClick={sub.onRemove} styleStr="background:none;border:none;color:var(--text-faint2);cursor:pointer;font-size:12px;line-height:1" hover="color:#c77b6b">×</Hov>
                    </div>
                  ))}
                </div>
                <Hov as="button" onClick={h.onAddSub} styleStr={mono + 'margin-top:9px;font-size:10px;color:var(--text-faint);background:none;border:none;cursor:pointer'} hover="color:var(--accent)">
                  + add sub-task
                </Hov>
              </div>
            )}
          </Hov>
        ))}
      </div>
    </section>
  );
}
