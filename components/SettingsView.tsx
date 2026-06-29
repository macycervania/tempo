'use client';

import React from 'react';
import type { VM } from '@/state/useViewModel';
import { css } from './css';

export default function SettingsView({ vm }: { vm: VM }) {
  const mono = "font-family:'JetBrains Mono',monospace;";
  const st = vm.settings;
  return (
    <div style={css('max-width:840px;margin:0 auto;display:flex;flex-direction:column;gap:16px')}>
      <div style={css('display:flex;align-items:center;gap:10px;margin-bottom:2px')}>
        <span style={css(mono + 'font-size:11px;font-weight:600;letter-spacing:1px;color:var(--bg);background:var(--accent);border-radius:5px;padding:2px 7px')}>⚙</span>
        <span style={css(mono + 'font-size:11px;letter-spacing:2.5px;color:var(--text-faint)')}>// SETTINGS</span>
      </div>

      {/* PROFILE */}
      <section style={css('background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:20px 22px')}>
        <div style={css(mono + 'font-size:10px;letter-spacing:2px;color:var(--text-faint);margin-bottom:16px')}>PROFILE</div>
        <div style={css('display:flex;align-items:center;gap:16px')}>
          <button onClick={vm.onPickPfp} style={vm.pfpStyleObj} title="Upload a photo">
            {vm.noPfp && <span style={css('font-size:19px;font-weight:600;color:var(--text-dim)')}>{vm.pfpInitials}</span>}
          </button>
          <input ref={vm.fileRef} type="file" accept="image/*" onChange={vm.onPfpChange} style={{ display: 'none' }} />
          <div style={{ minWidth: 0 }}>
            {vm.nameShow && (
              <button onClick={vm.onEditUserName} style={css('font-size:16px;font-weight:600;color:var(--text);background:none;border:none;cursor:text;padding:0')}>
                {vm.nameDisplay}
              </button>
            )}
            {vm.nameEditing && (
              <input
                ref={vm.focusRef}
                value={vm.editVal}
                onChange={vm.onEditInput}
                onKeyDown={vm.onEditKey}
                onBlur={vm.commitEdit}
                placeholder="Your name"
                style={css('background:var(--inset);border:1px solid var(--line2);border-radius:7px;padding:5px 10px;color:var(--text);font-size:15px;font-weight:600')}
              />
            )}
            <div style={css('font-size:12.5px;color:var(--text-faint);margin-top:4px')}>Shown across your dashboard · tap photo or name to edit</div>
          </div>
        </div>
      </section>

      {/* THEME */}
      <section style={css('background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:20px 22px')}>
        <div style={css(mono + 'font-size:10px;letter-spacing:2px;color:var(--text-faint);margin-bottom:14px')}>THEME</div>
        <div style={css('display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:0 0 14px;border-bottom:1px solid var(--line)')}>
          {st.themes.map((th, i) => (
            <button key={i} onClick={th.onClick} style={css(th.style)}>
              <span style={css(th.dotStyle)} />
              <span style={css('flex:1;text-align:left')}>{th.name}</span>
              {th.checked && <span style={css('color:var(--accent);font-weight:700;animation:cheerPop .25s ease')}>✓</span>}
            </button>
          ))}
        </div>
        <div style={css('display:flex;align-items:center;justify-content:space-between;gap:16px;padding:13px 0')}>
          <div>
            <div style={css('font-size:13.5px;color:var(--text-dim)')}>Reduce motion</div>
            <div style={css('font-size:12px;color:var(--text-faint)')}>Turn off animations and transitions</div>
          </div>
          <button onClick={st.onToggleMotion} style={css(st.motionToggleStyle)}>
            <span style={css(st.motionKnobStyle)} />
          </button>
        </div>
      </section>

      {/* CURRENCY */}
      <section style={css('background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:20px 22px')}>
        <div style={css(mono + 'font-size:10px;letter-spacing:2px;color:var(--text-faint);margin-bottom:14px')}>REGIONAL · CURRENCY</div>
        <div style={css('display:flex;flex-wrap:wrap;gap:8px')}>
          {st.currencies.map((c, i) => (
            <button key={i} onClick={c.onClick} style={css(c.style)}>
              <span style={css(mono + 'font-size:14px;font-weight:600')}>{c.symbol}</span>
              <span style={css(mono + 'font-size:11px')}>{c.code}</span>
            </button>
          ))}
        </div>
        <div style={css('font-size:12px;color:var(--text-faint);margin-top:12px')}>{st.currencyNote} · updates Budget &amp; Finance instantly</div>
      </section>

      {/* DAILY TARGETS */}
      <section style={css('background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:20px 22px')}>
        <div style={css(mono + 'font-size:10px;letter-spacing:2px;color:var(--text-faint);margin-bottom:14px')}>DAILY TARGETS</div>
        <div style={css('display:grid;grid-template-columns:repeat(2,1fr);gap:12px')}>
          {st.targets.map((t, i) => (
            <div key={i} style={css('display:flex;align-items:center;justify-content:space-between;background:var(--inset);border:1px solid var(--line);border-radius:10px;padding:11px 14px')}>
              <span style={css('font-size:13px;color:var(--text-dim)')}>{t.label}</span>
              <span style={css('display:flex;align-items:center;gap:7px')}>
                <input
                  type="number"
                  value={t.val}
                  onChange={t.onChange}
                  style={css("width:74px;text-align:right;background:var(--inset);border:1px solid var(--line2);border-radius:6px;padding:4px 8px;color:var(--text);font-family:'JetBrains Mono',monospace;font-size:13px")}
                />
                <span style={css(mono + 'font-size:11px;color:var(--text-faint);width:28px')}>{t.unit}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* NOTIFICATIONS */}
      <section style={css('background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:20px 22px')}>
        <div style={css(mono + 'font-size:10px;letter-spacing:2px;color:var(--text-faint);margin-bottom:6px')}>NOTIFICATIONS</div>
        {st.notifs.map((n, i) => (
          <div key={i} style={css('display:flex;align-items:center;justify-content:space-between;gap:16px;padding:13px 0;border-top:1px solid var(--line)')}>
            <div>
              <div style={css('font-size:13.5px;color:var(--text-dim)')}>{n.label}</div>
              <div style={css('font-size:12px;color:var(--text-faint)')}>{n.desc}</div>
            </div>
            <button onClick={n.onToggle} style={css(n.toggleStyle)}>
              <span style={css(n.knobStyle)} />
            </button>
          </div>
        ))}
      </section>

      {/* DATA */}
      <section style={css('background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:20px 22px')}>
        <div style={css(mono + 'font-size:10px;letter-spacing:2px;color:var(--text-faint);margin-bottom:14px')}>DATA</div>
        <div style={css('display:flex;align-items:center;justify-content:space-between;gap:16px')}>
          <div>
            <div style={css('font-size:13.5px;color:var(--text-dim)')}>Reset to defaults</div>
            <div style={css('font-size:12px;color:var(--text-faint)')}>Clears your photo, name, theme &amp; targets on this device</div>
          </div>
          <button
            onClick={st.onReset}
            style={css('background:color-mix(in srgb, #c77b6b 14%, transparent);border:1px solid color-mix(in srgb, #c77b6b 32%, transparent);border-radius:8px;padding:8px 16px;font-size:12.5px;font-weight:600;color:#c77b6b;cursor:pointer;white-space:nowrap')}
          >
            Reset
          </button>
        </div>
      </section>

      {/* ASSISTANT */}
      <section style={css('background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:20px 22px')}>
        <div style={css(mono + 'font-size:10px;letter-spacing:2px;color:var(--text-faint);margin-bottom:6px')}>ASSISTANT</div>
        <div style={css('display:flex;align-items:center;justify-content:space-between;gap:16px;padding:13px 0')}>
          <div>
            <div style={css('font-size:13.5px;color:var(--text-dim)')}>Hey Nateman (voice)</div>
            <div style={css('font-size:12px;color:var(--text-faint)')}>Say “nateman” out loud to summon him — needs mic access</div>
          </div>
          <button onClick={st.onToggleWake} style={css(st.wakeToggleStyle)}>
            <span style={css(st.wakeKnobStyle)} />
          </button>
        </div>
        <div style={css('display:flex;align-items:center;justify-content:space-between;gap:16px;padding:13px 0;border-top:1px solid var(--line)')}>
          <div>
            <div style={css('font-size:13.5px;color:var(--text-dim)')}>Sound effects</div>
            <div style={css('font-size:12px;color:var(--text-faint)')}>Nateman speaks &amp; chimes when he answers</div>
          </div>
          <button onClick={st.onToggleSound} style={css(st.soundToggleStyle)}>
            <span style={css(st.soundKnobStyle)} />
          </button>
        </div>
        <div style={css('display:flex;align-items:center;justify-content:space-between;gap:16px;padding:13px 0;border-top:1px solid var(--line);flex-wrap:wrap')}>
          <div>
            <div style={css('font-size:13.5px;color:var(--text-dim)')}>Nateman&apos;s voice</div>
            <div style={css('font-size:12px;color:var(--text-faint)')}>He reads his replies out loud</div>
          </div>
          <div style={css('display:flex;align-items:center;gap:8px')}>
            <select value={st.voiceVal} onChange={st.onVoice} style={css('background:var(--inset);border:1px solid var(--line2);border-radius:8px;padding:7px 9px;color:var(--text);font-size:12.5px;max-width:180px')}>
              <option value="">System default</option>
              {st.voices.map((v, i) => (
                <option key={i} value={v.uri}>{v.label}</option>
              ))}
            </select>
            <button onClick={st.onTestVoice} style={css('background:var(--accent);color:var(--bg);border:none;border-radius:8px;padding:7px 12px;font-size:12px;font-weight:600;cursor:pointer')}>Test</button>
          </div>
        </div>
      </section>
    </div>
  );
}
