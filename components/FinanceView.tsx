'use client';

import React from 'react';
import type { VM } from '@/state/useViewModel';
import { css, Hov } from './css';
import { EditInput } from './Overview';

export default function FinanceView({ vm }: { vm: VM }) {
  const mono = "font-family:'JetBrains Mono',monospace;";
  const fin = vm.fin;
  return (
    <div style={css('display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px')}>
      {/* 01 NET LIQUID */}
      <section style={css('background:linear-gradient(150deg,var(--panel),var(--panel));border:1px solid var(--line2);border-radius:16px;padding:22px 24px;display:flex;flex-direction:column')}>
        <div style={css('display:flex;align-items:center;gap:10px;margin-bottom:18px')}>
          <span style={css(mono + 'font-size:11px;font-weight:600;letter-spacing:1px;color:var(--bg);background:var(--accent);border-radius:5px;padding:2px 7px')}>01</span>
          <span style={css(mono + 'font-size:11px;letter-spacing:2.5px;color:var(--text-faint)')}>{'// NET LIQUID'}</span>
          <div style={{ flex: 1 }} />
          <Hov as="button" onClick={fin.onToggleManage} styleStr={fin.manageBtnStyle} hover="border-color:var(--line2);color:var(--text)">
            {fin.manageLabel}
          </Hov>
        </div>
        <div style={css('font-size:46px;font-weight:700;letter-spacing:-1.5px;line-height:1')}>{fin.liquid}</div>
        <div style={css(mono + 'font-size:11px;color:#74ad84;margin-top:6px')}>{fin.cashNote}</div>
        <div style={css(mono + 'font-size:10.5px;color:var(--text-faint2);margin-top:3px')}>{fin.incomeNote}</div>
        <div style={css('display:flex;align-items:baseline;gap:8px;margin-top:14px;padding-top:14px;border-top:1px solid var(--line)')}>
          <span style={css(mono + 'font-size:10px;letter-spacing:1.5px;color:var(--text-faint)')}>NET WORTH</span>
          <span style={css('font-size:16px;font-weight:700;color:var(--text)')}>{fin.netWorth}</span>
          <span style={css(mono + 'font-size:10px;color:var(--text-faint2)')}>liquid + assets</span>
        </div>
        <div style={css('display:flex;flex-direction:column;gap:11px;margin-top:22px')}>
          {fin.breakdown.map((b, i) => (
            <div key={i}>
              <div style={css('display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px')}>
                <span style={css(mono + 'font-size:11px;letter-spacing:1px;color:var(--text-muted)')}>{b.label}</span>
                {b.editing ? (
                  <EditInput vm={vm} style={"width:96px;text-align:right;background:var(--inset);border:1px solid var(--line2);border-radius:5px;padding:2px 6px;color:var(--text);font-family:'JetBrains Mono',monospace;font-size:13px"} />
                ) : b.editable ? (
                  <Hov as="span" onClick={b.onEdit} styleStr="font-size:14px;font-weight:600;color:var(--text);cursor:pointer" hover="text-decoration:underline">{b.val}</Hov>
                ) : (
                  <span style={css('font-size:14px;font-weight:600;color:var(--text)')}>{b.val}</span>
                )}
              </div>
              <div style={css('height:6px;border-radius:4px;background:var(--line);overflow:hidden')}>
                <div style={css(`height:100%;border-radius:4px;background:${b.color};width:${b.pct}`)} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 02 ASSETS */}
      <section style={css('background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:22px 24px;display:flex;flex-direction:column')}>
        <div style={css('display:flex;align-items:center;gap:10px;margin-bottom:18px')}>
          <span style={css(mono + 'font-size:11px;font-weight:600;letter-spacing:1px;color:var(--text-dim);border:1px solid var(--line2);border-radius:5px;padding:2px 7px')}>02</span>
          <span style={css(mono + 'font-size:11px;letter-spacing:2.5px;color:var(--text-faint)')}>{'// ASSETS'}</span>
          <div style={{ flex: 1 }} />
          <span style={css(mono + 'font-size:10.5px;color:var(--text-faint2)')}>PORTFOLIO</span>
        </div>
        <div style={css('font-size:34px;font-weight:700;letter-spacing:-1px;line-height:1')}>{fin.assetsTotal}</div>
        <div style={css(mono + 'font-size:11px;color:var(--text-faint2);margin-top:6px')}>TOTAL INVESTED · GROWS WITH REALIZED P&L</div>
        <div style={css('display:flex;flex-direction:column;gap:13px;margin-top:22px')}>
          {fin.assets.map((a, i) => (
            <div key={i}>
              <div style={css('display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin-bottom:6px')}>
                <span style={css('display:flex;align-items:center;gap:7px;min-width:0')}>
                  {a.managing && (
                    <Hov as="button" onClick={a.onRemove} styleStr="background:none;border:none;color:var(--text-faint2);cursor:pointer;font-size:13px;line-height:1" hover="color:#c77b6b">×</Hov>
                  )}
                  {a.labelEditing ? (
                    <EditInput vm={vm} style="background:var(--inset);border:1px solid var(--line2);border-radius:5px;padding:2px 6px;color:var(--text);font-size:12px" />
                  ) : a.managing ? (
                    <Hov as="span" onClick={a.onEditLabel} styleStr={mono + 'font-size:11px;letter-spacing:1px;color:var(--text-muted);cursor:text'} hover="color:var(--text)">{a.label}</Hov>
                  ) : (
                    <span style={css(mono + 'font-size:11px;letter-spacing:1px;color:var(--text-muted)')}>{a.label}</span>
                  )}
                </span>
                {a.valEditing ? (
                  <EditInput vm={vm} style={"width:96px;text-align:right;background:var(--inset);border:1px solid var(--line2);border-radius:5px;padding:2px 6px;color:var(--text);font-family:'JetBrains Mono',monospace;font-size:13px"} />
                ) : a.managing ? (
                  <Hov as="span" onClick={a.onEditVal} styleStr="font-size:14px;font-weight:600;color:var(--text);cursor:pointer" hover="text-decoration:underline">{a.val}</Hov>
                ) : (
                  <span style={css('font-size:14px;font-weight:600;color:var(--text)')}>{a.val}</span>
                )}
              </div>
              <div style={css('height:6px;border-radius:4px;background:var(--line);overflow:hidden')}>
                <div style={css(`height:100%;border-radius:4px;background:${a.color};width:${a.pct}`)} />
              </div>
            </div>
          ))}
        </div>
        {fin.managing && (
          <Hov as="button" onClick={fin.onAddAsset} styleStr={mono + 'margin-top:14px;font-size:11px;color:var(--text-faint);background:none;border:1px dashed var(--line2);border-radius:7px;padding:7px 0;width:100%;cursor:pointer'} hover="color:var(--text);border-color:var(--line2)">
            + add holding
          </Hov>
        )}
      </section>

      {/* CRYPTO WALLETS */}
      <section style={css('grid-column:1 / -1;background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:20px 22px')}>
        <div style={css('display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap')}>
          <span style={css(mono + 'font-size:11px;font-weight:600;letter-spacing:1px;color:#9b7fb4;border:1px solid var(--line2);border-radius:5px;padding:2px 7px')}>◎</span>
          <span style={css(mono + 'font-size:11px;letter-spacing:2.5px;color:var(--text-faint)')}>{'// SOLANA WALLETS'}</span>
          <div style={{ flex: 1 }} />
          {fin.wallets.hasAny && (
            <>
              <span style={css(mono + 'font-size:10.5px;color:var(--text-faint2)')}>{fin.wallets.total} TRACKED</span>
              <Hov as="button" onClick={fin.wallets.onRefresh} styleStr={mono + 'font-size:10px;letter-spacing:1px;background:transparent;border:1px solid var(--line2);border-radius:7px;padding:5px 10px;color:var(--text-faint);cursor:pointer'} hover="border-color:var(--line2);color:var(--text)">
                ↻ REFRESH
              </Hov>
            </>
          )}
        </div>

        {fin.wallets.rows.length > 0 && (
          <div style={css('display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:8px;margin-bottom:14px')}>
            {fin.wallets.rows.map((w) => (
              <div key={w.id} style={css('display:flex;align-items:center;gap:11px;padding:12px 14px;background:var(--inset);border:1px solid var(--line);border-radius:11px')}>
                <span style={css(`width:8px;height:8px;flex:0 0 auto;border-radius:50%;background:${w.dotColor}`)} />
                <div style={css('min-width:0;flex:1')}>
                  <div style={css('font-size:13px;font-weight:600;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap')}>{w.label}</div>
                  <div style={css(mono + 'font-size:10px;color:var(--text-faint2)')}>{w.addrShort} · {w.sol}</div>
                </div>
                {w.val && <span style={css(mono + 'font-size:13px;font-weight:600;color:var(--text-dim)')}>{w.val}</span>}
                <Hov as="button" onClick={w.onRemove} styleStr="background:none;border:none;color:var(--text-faint2);cursor:pointer;font-size:14px;line-height:1" hover="color:#c77b6b">×</Hov>
              </div>
            ))}
          </div>
        )}

        <div style={css('display:flex;flex-wrap:wrap;align-items:center;gap:8px')}>
          <input
            value={fin.wallets.labelDraft}
            onChange={fin.wallets.onLabelInput}
            placeholder="Label (e.g. Phantom)"
            style={css('width:150px;background:var(--inset);border:1px solid var(--line2);border-radius:9px;padding:9px 12px;color:var(--text);font-size:13px')}
          />
          <input
            value={fin.wallets.addrDraft}
            onChange={fin.wallets.onAddrInput}
            placeholder="Public Solana address"
            style={css("flex:1;min-width:200px;background:var(--inset);border:1px solid var(--line2);border-radius:9px;padding:9px 12px;color:var(--text);font-family:'JetBrains Mono',monospace;font-size:12.5px")}
          />
          <Hov as="button" onClick={fin.wallets.onAdd} styleStr="background:var(--accent);color:var(--bg);border:none;border-radius:9px;padding:9px 16px;font-size:12.5px;font-weight:600;cursor:pointer" hover="opacity:.9">
            Track
          </Hov>
        </div>
        <div style={css('font-size:11px;color:var(--text-faint2);margin-top:9px')}>Read-only — your public address only, never a private key. Balance &amp; SOL price refresh live and fold into net worth.</div>
      </section>

      {/* 03 P&L */}
      <section style={css('grid-column:1 / -1;background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:22px 24px;display:flex;flex-direction:column')}>
        <div style={css('display:flex;align-items:center;gap:10px;margin-bottom:18px')}>
          <span style={css(mono + 'font-size:11px;font-weight:600;letter-spacing:1px;color:var(--text-dim);border:1px solid var(--line2);border-radius:5px;padding:2px 7px')}>03</span>
          <span style={css(mono + 'font-size:11px;letter-spacing:2.5px;color:var(--text-faint)')}>{'// PROFIT & LOSS'}</span>
          <div style={{ flex: 1 }} />
          <span style={css(mono + 'font-size:10.5px;color:var(--text-faint2)')}>REALIZED</span>
        </div>
        <div style={css('display:flex;gap:10px;margin-bottom:20px')}>
          {fin.pnlStats.map((p, i) => (
            <div key={i} style={css('flex:1;background:var(--inset);border:1px solid var(--line);border-radius:11px;padding:13px 14px')}>
              <div style={css(mono + 'font-size:9.5px;letter-spacing:1px;color:var(--text-faint);margin-bottom:7px')}>{p.label}</div>
              <div style={css(`font-size:21px;font-weight:700;letter-spacing:-.5px;color:${p.color}`)}>{p.val}</div>
            </div>
          ))}
        </div>
        <div style={css(mono + 'font-size:9.5px;letter-spacing:1.5px;color:var(--text-faint2);margin-bottom:9px')}>LAST 10 SESSIONS</div>
        <div style={css('position:relative;height:88px;display:flex;align-items:stretch;gap:5px;margin-bottom:18px')}>
          <div style={css('position:absolute;top:50%;left:0;right:0;height:1px;background:var(--line2);z-index:1')} />
          {fin.history.map((bar, i) => (
            <div key={i} style={css('position:relative;flex:1;height:100%')}>
              <div style={css(bar.style)} />
            </div>
          ))}
        </div>
        <div style={css('margin-top:auto;display:flex;align-items:center;gap:9px;background:var(--inset);border:1px solid var(--line2);border-radius:10px;padding:0 12px;height:42px')}>
          <span style={css(mono + 'font-size:13px;color:var(--accent)')}>↵</span>
          <input
            value={vm.tradeDraft}
            onChange={vm.onTradeInput}
            onKeyDown={vm.onTradeKey}
            placeholder="Log a trade (“SPY +210”, “WIF -85”)"
            style={css('flex:1;background:none;border:none;color:var(--text);font-size:13px')}
          />
          <Hov as="button" onClick={vm.onTradeSubmit} styleStr="background:var(--inset);border:1px solid var(--line2);border-radius:7px;padding:5px 11px;font-size:12px;font-weight:600;color:var(--text-dim);cursor:pointer" hover="border-color:var(--line2)">
            Log
          </Hov>
        </div>
        {vm.tradeHint && (
          <div style={css('margin-top:8px;font-size:11.5px;color:var(--text-faint);animation:fadeUp .18s ease')}>{vm.tradeHint}</div>
        )}
      </section>

      {/* 04 TRADE JOURNAL */}
      <section style={css('grid-column:1 / -1;background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:20px 22px')}>
        <div style={css('display:flex;align-items:center;gap:10px;margin-bottom:16px')}>
          <span style={css(mono + 'font-size:11px;font-weight:600;letter-spacing:1px;color:var(--text-dim);border:1px solid var(--line2);border-radius:5px;padding:2px 7px')}>04</span>
          <span style={css(mono + 'font-size:11px;letter-spacing:2.5px;color:var(--text-faint)')}>{'// TRADE JOURNAL'}</span>
          <div style={{ flex: 1 }} />
          <span style={css(mono + 'font-size:10.5px;color:var(--text-faint2)')}>{fin.tradeCount} TRADES</span>
        </div>
        <div style={css('display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:8px')}>
          {fin.trades.map((t, i) => (
            <div key={i} style={css('display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--inset);border:1px solid var(--line);border-radius:11px;animation:fadeUp .2s ease')}>
              <span style={css(mono + 'font-size:13px;font-weight:600;color:var(--text);width:54px;flex:0 0 auto')}>{t.sym}</span>
              <span style={css(mono + 'font-size:10px;color:var(--text-faint2);flex:1')}>{t.date}</span>
              <span style={css(t.pnlStyle)}>{t.pnl}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
