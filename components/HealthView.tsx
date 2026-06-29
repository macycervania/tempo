'use client';

import React from 'react';
import type { VM } from '@/state/useViewModel';
import { css, Hov } from './css';

export default function HealthView({ vm }: { vm: VM }) {
  const mono = "font-family:'JetBrains Mono',monospace;";
  const health = vm.health;
  return (
    <div style={css('display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px')}>
      {/* 01 TODAY */}
      <section style={css('grid-column:1 / -1;background:linear-gradient(150deg,var(--panel),var(--panel));border:1px solid var(--line2);border-radius:16px;padding:22px 24px')}>
        <div style={css('display:flex;align-items:center;gap:10px;margin-bottom:20px')}>
          <span style={css(mono + 'font-size:11px;font-weight:600;letter-spacing:1px;color:var(--bg);background:var(--accent);border-radius:5px;padding:2px 7px')}>01</span>
          <span style={css(mono + 'font-size:11px;letter-spacing:2.5px;color:var(--text-faint)')}>{'// TODAY'}</span>
          <div style={{ flex: 1 }} />
          <span style={css(mono + `font-size:11px;color:${health.netColor}`)}>{health.netStr}</span>
        </div>
        <div style={css('display:flex;gap:14px;flex-wrap:wrap;margin-bottom:22px')}>
          <div style={css('flex:1;min-width:150px;background:var(--inset);border:1px solid var(--line);border-radius:12px;padding:16px 18px')}>
            <div style={css(mono + 'font-size:10px;letter-spacing:1.5px;color:var(--text-faint);margin-bottom:8px')}>INTAKE</div>
            <div style={css('display:flex;align-items:flex-end;gap:6px')}>
              <span style={css('font-size:30px;font-weight:700;letter-spacing:-1px;line-height:1')}>{health.consumed}</span>
              <span style={css('font-size:12px;color:var(--text-faint);margin-bottom:3px')}>/ {health.target}</span>
            </div>
          </div>
          <div style={css('flex:1;min-width:150px;background:var(--inset);border:1px solid var(--line);border-radius:12px;padding:16px 18px')}>
            <div style={css(mono + 'font-size:10px;letter-spacing:1.5px;color:var(--text-faint);margin-bottom:8px')}>BURNED</div>
            <div style={css('display:flex;align-items:flex-end;gap:6px')}>
              <span style={css('font-size:30px;font-weight:700;letter-spacing:-1px;line-height:1;color:#74ad84')}>{health.burned}</span>
              <span style={css('font-size:12px;color:var(--text-faint);margin-bottom:3px')}>kcal</span>
            </div>
          </div>
          <div style={css('flex:1;min-width:150px;background:var(--inset);border:1px solid var(--line);border-radius:12px;padding:16px 18px')}>
            <div style={css(mono + 'font-size:10px;letter-spacing:1.5px;color:var(--text-faint);margin-bottom:8px')}>NET</div>
            <div style={css('display:flex;align-items:flex-end;gap:6px')}>
              <span style={css('font-size:30px;font-weight:700;letter-spacing:-1px;line-height:1')}>{health.net}</span>
              <span style={css('font-size:12px;color:var(--text-faint);margin-bottom:3px')}>kcal</span>
            </div>
          </div>
        </div>
        <div style={css('display:grid;grid-template-columns:repeat(3,1fr);gap:16px')}>
          {health.macros.map((m, i) => (
            <div key={i}>
              <div style={css('display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px')}>
                <span style={css(mono + 'font-size:10px;letter-spacing:1px;color:var(--text-faint)')}>{m.label}</span>
                <span style={css('font-size:13px;font-weight:600;color:var(--text-dim)')}>{m.val}</span>
              </div>
              <div style={css('height:6px;border-radius:4px;background:var(--line);overflow:hidden')}>
                <div style={css(`height:100%;border-radius:4px;background:${m.color};width:${m.pct};transition:width .4s ease`)} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 02 7-DAY INTAKE */}
      <section style={css('grid-column:1 / -1;background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:20px 22px')}>
        <div style={css('display:flex;align-items:center;gap:10px;margin-bottom:18px')}>
          <span style={css(mono + 'font-size:11px;font-weight:600;letter-spacing:1px;color:var(--text-dim);border:1px solid var(--line2);border-radius:5px;padding:2px 7px')}>02</span>
          <span style={css(mono + 'font-size:11px;letter-spacing:2.5px;color:var(--text-faint)')}>{'// 7-DAY INTAKE'}</span>
          <div style={{ flex: 1 }} />
          <span style={css(mono + 'font-size:10.5px;color:var(--text-faint2)')}>AVG {health.trendAvg} KCAL · TARGET {health.target}</span>
        </div>
        <div style={css('display:flex;align-items:flex-end;gap:10px;height:140px')}>
          {health.trend.map((day, i) => (
            <div key={i} style={css('flex:1;display:flex;flex-direction:column;align-items:center;gap:8px;height:100%')}>
              <div style={css('position:relative;flex:1;width:100%')}>
                <div style={css(health.targetLineStyle)} />
                <div style={css(day.barStyle)} />
              </div>
              <span style={css(mono + `font-size:10px;color:${day.labelColor}`)}>{day.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 03 MEALS */}
      <section style={css('background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:20px 22px;display:flex;flex-direction:column')}>
        <div style={css('display:flex;align-items:center;gap:10px;margin-bottom:16px')}>
          <span style={css(mono + 'font-size:11px;font-weight:600;letter-spacing:1px;color:var(--text-dim);border:1px solid var(--line2);border-radius:5px;padding:2px 7px')}>03</span>
          <span style={css(mono + 'font-size:11px;letter-spacing:2.5px;color:var(--text-faint)')}>{'// MEALS'}</span>
        </div>
        <div style={css('display:flex;flex-direction:column;gap:6px;margin-bottom:14px;flex:1')}>
          {health.meals.map((meal) => (
            <Hov key={meal.id} styleStr="display:flex;align-items:center;gap:11px;padding:11px 13px;background:var(--inset);border:1px solid var(--line);border-radius:10px;animation:fadeUp .2s ease" hover="border-color:var(--line2)">
              <span style={css(mono + 'font-size:10px;color:var(--text-faint2);flex:0 0 auto')}>{meal.time}</span>
              <span style={css('flex:1;min-width:0;font-size:13px;color:var(--text-dim);overflow:hidden;text-overflow:ellipsis;white-space:nowrap')}>{meal.name}</span>
              <span style={css(mono + 'font-size:11px;color:var(--text-dim);flex:0 0 auto')}>{meal.kcal}k</span>
              <span style={css(mono + 'font-size:11px;color:#74ad84;flex:0 0 auto')}>{meal.p}p</span>
              <Hov as="button" onClick={meal.onRemove} styleStr="background:none;border:none;color:var(--text-faint2);cursor:pointer;font-size:14px;line-height:1;flex:0 0 auto" hover="color:#c77b6b">×</Hov>
            </Hov>
          ))}
        </div>
        <div style={css('margin-top:auto;display:flex;align-items:center;gap:9px;background:var(--inset);border:1px solid var(--line2);border-radius:10px;padding:0 12px;height:42px')}>
          <span style={css(mono + 'font-size:14px;color:var(--accent)')}>+</span>
          <input value={vm.foodDraft} onChange={vm.onFoodInput} onKeyDown={vm.onFoodKey} placeholder="What did you eat? (“3 eggs, oatmeal, coffee”)" style={css('flex:1;background:none;border:none;color:var(--text);font-size:13px')} />
          <Hov as="button" onClick={vm.onFoodSubmit} styleStr="background:var(--inset);border:1px solid var(--line2);border-radius:7px;padding:5px 11px;font-size:12px;font-weight:600;color:var(--text-dim);cursor:pointer" hover="border-color:var(--line2)">Log</Hov>
        </div>
        {vm.foodHint && (
          <div style={css('margin-top:8px;font-size:11.5px;color:var(--text-faint)')}>
            <span style={css(mono + 'font-size:10px;color:var(--accent)')}>EST </span>
            {vm.foodHint}
          </div>
        )}
      </section>

      {/* 04 TRAINING */}
      <section style={css('background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:20px 22px;display:flex;flex-direction:column')}>
        <div style={css('display:flex;align-items:center;gap:10px;margin-bottom:16px')}>
          <span style={css(mono + 'font-size:11px;font-weight:600;letter-spacing:1px;color:var(--text-dim);border:1px solid var(--line2);border-radius:5px;padding:2px 7px')}>04</span>
          <span style={css(mono + 'font-size:11px;letter-spacing:2.5px;color:var(--text-faint)')}>{'// TRAINING'}</span>
        </div>
        <div style={css('display:flex;flex-direction:column;gap:6px;margin-bottom:14px;flex:1')}>
          {health.trainings.map((w) => (
            <Hov key={w.id} styleStr="display:flex;align-items:center;gap:11px;padding:11px 13px;background:var(--inset);border:1px solid var(--line);border-radius:10px;animation:fadeUp .2s ease" hover="border-color:var(--line2)">
              <span style={css('width:8px;height:8px;border-radius:2px;background:#74ad84;flex:0 0 auto')} />
              <div style={css('flex:1;min-width:0')}>
                <div style={css('font-size:13.5px;font-weight:500;color:var(--text-dim);overflow:hidden;text-overflow:ellipsis;white-space:nowrap')}>{w.name}</div>
                <div style={css(mono + 'font-size:10px;color:var(--text-faint2);margin-top:2px')}>{w.time} · {w.minutes} min</div>
              </div>
              <span style={css(mono + 'font-size:13px;font-weight:600;color:#74ad84;flex:0 0 auto')}>{w.kcal}</span>
              <Hov as="button" onClick={w.onRemove} styleStr="background:none;border:none;color:var(--text-faint2);cursor:pointer;font-size:14px;line-height:1;flex:0 0 auto" hover="color:#c77b6b">×</Hov>
            </Hov>
          ))}
          {health.empty && (
            <div style={css('text-align:center;padding:24px;font-size:13px;color:var(--text-faint2)')}>No sessions logged yet today.</div>
          )}
        </div>
        <div style={css('display:flex;align-items:center;gap:9px;background:var(--inset);border:1px solid var(--line2);border-radius:10px;padding:0 12px;height:42px')}>
          <span style={css(mono + 'font-size:14px;color:#74ad84')}>+</span>
          <input value={vm.exDraft} onChange={vm.onExInput} onKeyDown={vm.onExKey} placeholder="What did you train? (“push day 45 min”)" style={css('flex:1;background:none;border:none;color:var(--text);font-size:13px')} />
          <Hov as="button" onClick={vm.onExSubmit} styleStr="background:var(--inset);border:1px solid var(--line2);border-radius:7px;padding:5px 11px;font-size:12px;font-weight:600;color:var(--text-dim);cursor:pointer" hover="border-color:var(--line2)">Log</Hov>
        </div>
        {vm.exHint && (
          <div style={css('margin-top:8px;font-size:11.5px;color:var(--text-faint)')}>
            <span style={css(mono + 'font-size:10px;color:#74ad84')}>EST </span>
            {vm.exHint}
          </div>
        )}
      </section>
    </div>
  );
}
