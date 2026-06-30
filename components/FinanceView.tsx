'use client';

import React, { useEffect } from 'react';
import type { VM } from '@/state/useViewModel';
import { css, Hov } from './css';
import { EditInput } from './Overview';

export default function FinanceView({ vm }: { vm: VM }) {
  const mono = "font-family:'JetBrains Mono',monospace;";
  const fin = vm.fin;
  const mc = vm.memecoins;

  // Pull live memecoin positions when Finance opens / wallets change.
  useEffect(() => {
    if (mc.hasWallets) mc.onRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mc.walletCount]);

  return (
    <div style={css('display:flex;flex-direction:column;gap:16px')}>
      {/* 01 NET WORTH */}
      <section style={css('background:linear-gradient(150deg,var(--panel),var(--panel));border:1px solid var(--line2);border-radius:16px;padding:22px 24px')}>
        <div style={css('display:flex;align-items:center;gap:10px;margin-bottom:18px')}>
          <span style={css(mono + 'font-size:11px;font-weight:600;letter-spacing:1px;color:var(--bg);background:var(--accent);border-radius:5px;padding:2px 7px')}>01</span>
          <span style={css(mono + 'font-size:11px;letter-spacing:2.5px;color:var(--text-faint)')}>{'// NET WORTH'}</span>
        </div>
        <div style={css('font-size:46px;font-weight:700;letter-spacing:-1.5px;line-height:1')}>{fin.netWorth}</div>
        <div style={css(mono + 'font-size:11px;color:#74ad84;margin-top:6px')}>{fin.cashNote}</div>
        <div style={css(mono + 'font-size:10.5px;color:var(--text-faint2);margin-top:3px')}>{fin.incomeNote}</div>
        <div style={css('display:flex;align-items:baseline;gap:8px;margin-top:14px;padding-top:14px;border-top:1px solid var(--line)')}>
          <span style={css(mono + 'font-size:10px;letter-spacing:1.5px;color:var(--text-faint)')}>LIQUID</span>
          <span style={css('font-size:16px;font-weight:700;color:var(--text)')}>{fin.liquid}</span>
          <span style={css(mono + 'font-size:10px;color:var(--text-faint2)')}>cash, savings, crypto</span>
        </div>
        <div style={css('display:flex;flex-direction:column;gap:11px;margin-top:20px')}>
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

      {/* 02 MEMECOINS — live wallet positions + 24h P&L */}
      <section style={css('background:linear-gradient(150deg,color-mix(in srgb, #9b7fb4 8%, var(--panel)),var(--panel));border:1px solid var(--line2);border-radius:16px;padding:22px 24px')}>
        <div style={css('display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap')}>
          <span style={css(mono + 'font-size:11px;font-weight:600;letter-spacing:1px;color:var(--bg);background:#9b7fb4;border-radius:5px;padding:2px 7px')}>02</span>
          <span style={css(mono + 'font-size:11px;letter-spacing:2.5px;color:var(--text-faint)')}>{'// MEMECOINS'}</span>
          <div style={{ flex: 1 }} />
          <span style={css(mono + 'font-size:10px;letter-spacing:1px;color:var(--text-faint2)')}>{mc.totalValue} · {mc.count} TOKENS</span>
          <Hov as="button" onClick={mc.onRefresh} styleStr={mono + 'font-size:10px;letter-spacing:1px;background:transparent;border:1px solid var(--line2);border-radius:7px;padding:5px 10px;color:var(--text-faint);cursor:pointer'} hover="border-color:var(--line2);color:var(--text)">
            {mc.loading ? 'LOADING…' : '↻ REFRESH'}
          </Hov>
        </div>
        <div style={css(mono + 'font-size:10px;letter-spacing:1.5px;color:var(--text-faint);margin-bottom:5px')}>TODAY&apos;S P&amp;L (24H)</div>
        <div style={css(`font-size:42px;font-weight:700;letter-spacing:-1.5px;line-height:1;color:${mc.dayPnlColor}`)}>{mc.dayPnl}</div>

        {!mc.hasWallets ? (
          <div style={css('margin-top:16px;padding:16px;background:var(--inset);border:1px solid var(--line);border-radius:12px;font-size:12.5px;color:var(--text-faint);line-height:1.5')}>
            Add your Solana wallet in <b>Settings → Crypto Wallets</b> to track memecoin positions and live P&amp;L (via Dexscreener, on the deployed app).
          </div>
        ) : mc.empty ? (
          <div style={css('margin-top:16px;text-align:center;padding:22px;font-size:12.5px;color:var(--text-faint2)')}>
            {mc.loading ? 'Loading positions…' : 'No traded tokens found (or offline — live data needs the served app).'}
          </div>
        ) : (
          <div style={css('display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:8px;margin-top:16px')}>
            {mc.rows.map((r, i) => (
              <div key={i} style={css('display:flex;align-items:center;gap:11px;padding:11px 13px;background:var(--inset);border:1px solid var(--line);border-radius:11px')}>
                {r.icon ? (
                  <img src={r.icon} alt="" width={30} height={30} style={{ width: 30, height: 30, borderRadius: '50%', flex: '0 0 30px', objectFit: 'cover' }} />
                ) : (
                  <span style={css('width:30px;height:30px;flex:0 0 30px;border-radius:50%;background:var(--line2);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:var(--text-dim)')}>{r.symbol.slice(0, 1)}</span>
                )}
                <div style={css('min-width:0;flex:1')}>
                  <div style={css('font-size:13.5px;font-weight:600;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap')}>{r.symbol}</div>
                  <div style={css(mono + 'font-size:10px;color:var(--text-faint2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap')}>{r.value} · {r.change}</div>
                </div>
                <span style={css(`font-family:'JetBrains Mono',monospace;font-size:12.5px;font-weight:600;flex:0 0 auto;color:${r.pnlColor}`)}>{r.pnl}</span>
              </div>
            ))}
          </div>
        )}
        <div style={css('font-size:11px;color:var(--text-faint2);margin-top:12px;line-height:1.5')}>Read-only · holdings from the Solana chain, prices &amp; 24h change from Dexscreener.</div>
      </section>

      {/* 03 ASSETS — manual holdings */}
      <section style={css('background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:22px 24px')}>
        <div style={css('display:flex;align-items:center;gap:10px;margin-bottom:18px')}>
          <span style={css(mono + 'font-size:11px;font-weight:600;letter-spacing:1px;color:var(--text-dim);border:1px solid var(--line2);border-radius:5px;padding:2px 7px')}>03</span>
          <span style={css(mono + 'font-size:11px;letter-spacing:2.5px;color:var(--text-faint)')}>{'// ASSETS'}</span>
          <div style={{ flex: 1 }} />
          <Hov as="button" onClick={fin.assetsEdit.onToggle} styleStr={fin.assetsEdit.btnStyle} hover="border-color:var(--line2);color:var(--text)">
            {fin.assetsEdit.label}
          </Hov>
        </div>
        <div style={css('font-size:34px;font-weight:700;letter-spacing:-1px;line-height:1')}>{fin.assetsTotal}</div>
        <div style={css(mono + 'font-size:11px;color:var(--text-faint2);margin-top:6px')}>STOCKS, FUNDS &amp; LONG-TERM HOLDINGS · TAP + EDIT TO ADJUST</div>
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
        {fin.assetsEdit.managing && (
          <Hov as="button" onClick={fin.onAddAsset} styleStr={mono + 'margin-top:14px;font-size:11px;color:var(--text-faint);background:none;border:1px dashed var(--line2);border-radius:7px;padding:7px 0;width:100%;cursor:pointer'} hover="color:var(--text);border-color:var(--line2)">
            + add holding
          </Hov>
        )}
      </section>
    </div>
  );
}
