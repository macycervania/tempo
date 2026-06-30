'use client';

import React from 'react';
import type { VM } from '@/state/useViewModel';
import { css } from './css';

export default function SettingsView({ vm }: { vm: VM }) {
  const mono = "font-family:'JetBrains Mono',monospace;";
  const st = vm.settings;
  const wal = vm.fin.wallets;
  return (
    <div style={css('max-width:840px;margin:0 auto;display:flex;flex-direction:column;gap:16px')}>
      <div style={css('display:flex;align-items:center;gap:10px;margin-bottom:2px')}>
        <span style={css(mono + 'font-size:11px;font-weight:600;letter-spacing:1px;color:var(--bg);background:var(--accent);border-radius:5px;padding:2px 7px')}>⚙</span>
        <span style={css(mono + 'font-size:11px;letter-spacing:2.5px;color:var(--text-faint)')}>{'// SETTINGS'}</span>
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

      {/* ACCOUNT (Google login — shared leaderboard) */}
      <section style={css('background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:20px 22px')}>
        <div style={css(mono + 'font-size:10px;letter-spacing:2px;color:var(--text-faint);margin-bottom:14px')}>ACCOUNT</div>
        {vm.account ? (
          <div style={css('display:flex;align-items:center;gap:14px')}>
            {vm.account.avatar ? (
              <img src={vm.account.avatar} alt="" width={42} height={42} style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <span style={css('width:42px;height:42px;border-radius:50%;background:var(--inset);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:var(--text-dim)')}>{(vm.account.name || '?').slice(0, 1).toUpperCase()}</span>
            )}
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={css('font-size:15px;font-weight:600;color:var(--text)')}>{vm.account.name}</div>
              <div style={css('font-size:12.5px;color:var(--text-faint);overflow:hidden;text-overflow:ellipsis;white-space:nowrap')}>{vm.account.email} · on the leaderboard</div>
            </div>
            <button onClick={vm.onSignOut} style={css('background:var(--inset);border:1px solid var(--line2);border-radius:8px;padding:8px 14px;font-size:12.5px;font-weight:600;color:var(--text-dim);cursor:pointer;white-space:nowrap')}>Sign out</button>
          </div>
        ) : (
          <div style={css('display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap')}>
            <div style={{ minWidth: 0 }}>
              <div style={css('font-size:13.5px;color:var(--text-dim)')}>Sign in with Google</div>
              <div style={css('font-size:12px;color:var(--text-faint)')}>{vm.authConfigured ? 'Join the shared leaderboard with your friends' : 'Available on the deployed app (see SETUP.md)'}</div>
            </div>
            <button onClick={vm.onSignIn} style={css('background:var(--accent);color:var(--bg);border:none;border-radius:9px;padding:9px 16px;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap')}>Continue with Google</button>
          </div>
        )}
      </section>

      {/* THEME */}
      <section style={css('background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:20px 22px')}>
        <div style={css(mono + 'font-size:10px;letter-spacing:2px;color:var(--text-faint);margin-bottom:14px')}>THEME</div>
        <div className="setGrid3" style={css('display:grid;gap:10px;padding:0 0 14px;border-bottom:1px solid var(--line)')}>
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
        <div className="setGrid2" style={css('display:grid;gap:12px')}>
          {st.targets.map((t, i) => (
            <div key={i} style={css('display:flex;flex-direction:column;gap:8px;background:var(--inset);border:1px solid var(--line);border-radius:10px;padding:12px 14px')}>
              <span style={css('font-size:12.5px;color:var(--text-dim)')}>{t.label}</span>
              <span style={css('display:flex;align-items:center;gap:8px')}>
                <input
                  type="number"
                  value={t.val}
                  onChange={t.onChange}
                  style={css("flex:1;min-width:0;text-align:right;background:var(--panel);border:1px solid var(--line2);border-radius:7px;padding:7px 10px;color:var(--text);font-family:'JetBrains Mono',monospace;font-size:14px")}
                />
                <span style={css(mono + 'font-size:11px;color:var(--text-faint);flex:0 0 auto')}>{t.unit}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* BODY */}
      <section style={css('background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:20px 22px')}>
        <div style={css(mono + 'font-size:10px;letter-spacing:2px;color:var(--text-faint);margin-bottom:14px')}>BODY</div>
        <div className="setGrid3" style={css('display:grid;gap:12px')}>
          {st.body.fields.map((f, i) => (
            <div key={i} style={css('display:flex;flex-direction:column;gap:8px;background:var(--inset);border:1px solid var(--line);border-radius:10px;padding:12px 14px')}>
              <span style={css('font-size:12.5px;color:var(--text-dim)')}>{f.label}</span>
              <span style={css('display:flex;align-items:center;gap:8px')}>
                <input
                  type="number"
                  value={f.val}
                  onChange={f.onChange}
                  style={css("flex:1;min-width:0;text-align:right;background:var(--panel);border:1px solid var(--line2);border-radius:7px;padding:7px 10px;color:var(--text);font-family:'JetBrains Mono',monospace;font-size:14px")}
                />
                <span style={css(mono + 'font-size:11px;color:var(--text-faint);flex:0 0 auto')}>{f.unit}</span>
              </span>
            </div>
          ))}
          <div style={css('display:flex;flex-direction:column;gap:8px;background:var(--inset);border:1px solid var(--line);border-radius:10px;padding:12px 14px')}>
            <span style={css('font-size:12.5px;color:var(--text-dim)')}>BMI</span>
            <span style={css(mono + 'font-size:16px;font-weight:600;color:var(--text);padding:5px 0')}>{st.body.bmi}</span>
          </div>
        </div>
        <div style={css('font-size:12px;color:var(--text-faint);margin-top:12px')}>Your goal weight lives on the Health page · powers the weight forecast</div>
      </section>

      {/* CRYPTO WALLETS */}
      <section style={css('background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:20px 22px')}>
        <div style={css('display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap')}>
          <span style={css(mono + 'font-size:10px;letter-spacing:2px;color:var(--text-faint)')}>CRYPTO WALLETS · SOLANA</span>
          <div style={{ flex: 1 }} />
          {wal.hasAny && (
            <>
              <span style={css(mono + 'font-size:10.5px;color:var(--text-faint2)')}>{wal.total} TRACKED</span>
              <button onClick={wal.onRefresh} style={css(mono + 'font-size:10px;letter-spacing:1px;background:transparent;border:1px solid var(--line2);border-radius:7px;padding:5px 10px;color:var(--text-faint);cursor:pointer')}>↻ REFRESH</button>
            </>
          )}
        </div>
        {wal.rows.length > 0 && (
          <div style={css('display:flex;flex-direction:column;gap:8px;margin-bottom:14px')}>
            {wal.rows.map((w) => (
              <div key={w.id} style={css('display:flex;align-items:center;gap:11px;padding:12px 14px;background:var(--inset);border:1px solid var(--line);border-radius:11px')}>
                <span style={css(`width:8px;height:8px;flex:0 0 auto;border-radius:50%;background:${w.dotColor}`)} />
                <div style={css('min-width:0;flex:1')}>
                  <div style={css('font-size:13px;font-weight:600;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap')}>{w.label}</div>
                  <div style={css(mono + 'font-size:10px;color:var(--text-faint2)')}>{w.addrShort} · {w.sol}</div>
                </div>
                {w.val && <span style={css(mono + 'font-size:13px;font-weight:600;color:var(--text-dim)')}>{w.val}</span>}
                <button onClick={w.onRemove} style={css('background:none;border:none;color:var(--text-faint2);cursor:pointer;font-size:14px;line-height:1')}>×</button>
              </div>
            ))}
          </div>
        )}
        <div style={css('display:flex;flex-wrap:wrap;align-items:center;gap:8px')}>
          <input value={wal.labelDraft} onChange={wal.onLabelInput} placeholder="Label (e.g. Phantom)" style={css('flex:1;min-width:120px;background:var(--inset);border:1px solid var(--line2);border-radius:9px;padding:9px 12px;color:var(--text);font-size:13px')} />
          <input value={wal.addrDraft} onChange={wal.onAddrInput} placeholder="Public Solana address" style={css("flex:2;min-width:170px;background:var(--inset);border:1px solid var(--line2);border-radius:9px;padding:9px 12px;color:var(--text);font-family:'JetBrains Mono',monospace;font-size:12.5px")} />
          <button onClick={wal.onAdd} style={css('background:var(--accent);color:var(--bg);border:none;border-radius:9px;padding:9px 16px;font-size:12.5px;font-weight:600;cursor:pointer')}>Track</button>
        </div>
        <div style={css('font-size:12px;color:var(--text-faint);margin-top:10px')}>Read-only — your public address only, never a private key. Balance &amp; SOL price refresh live and fold into your Finance net worth.</div>
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
