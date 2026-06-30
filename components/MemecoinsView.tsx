'use client';

import React, { useEffect } from 'react';
import type { VM } from '@/state/useViewModel';
import { css, Hov } from './css';

export default function MemecoinsView({ vm }: { vm: VM }) {
  const mono = "font-family:'JetBrains Mono',monospace;";
  const mc = vm.memecoins;

  // Pull live positions when the page opens / wallets change.
  useEffect(() => {
    if (mc.hasWallets) mc.onRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mc.walletCount]);

  return (
    <div style={css('display:flex;flex-direction:column;gap:16px')}>
      {/* HERO — day P&L */}
      <section style={css('background:linear-gradient(150deg,var(--panel),var(--panel));border:1px solid var(--line2);border-radius:16px;padding:22px 24px')}>
        <div style={css('display:flex;align-items:center;gap:10px;margin-bottom:16px')}>
          <span style={css(mono + 'font-size:11px;font-weight:600;letter-spacing:1px;color:var(--bg);background:var(--accent);border-radius:5px;padding:2px 7px')}>◉</span>
          <span style={css(mono + 'font-size:11px;letter-spacing:2.5px;color:var(--text-faint)')}>{'// MEMECOINS'}</span>
          <div style={{ flex: 1 }} />
          <Hov as="button" onClick={mc.onRefresh} styleStr={mono + 'font-size:10px;letter-spacing:1px;background:transparent;border:1px solid var(--line2);border-radius:7px;padding:5px 10px;color:var(--text-faint);cursor:pointer'} hover="border-color:var(--line2);color:var(--text)">
            {mc.loading ? 'LOADING…' : '↻ REFRESH'}
          </Hov>
        </div>
        <div style={css(mono + 'font-size:10px;letter-spacing:1.5px;color:var(--text-faint);margin-bottom:6px')}>TODAY&apos;S P&amp;L (24H)</div>
        <div style={css(`font-size:42px;font-weight:700;letter-spacing:-1.5px;line-height:1;color:${mc.dayPnlColor}`)}>{mc.dayPnl}</div>
        <div style={css('display:flex;align-items:baseline;gap:8px;margin-top:12px;padding-top:12px;border-top:1px solid var(--line)')}>
          <span style={css(mono + 'font-size:10px;letter-spacing:1.5px;color:var(--text-faint)')}>HOLDINGS</span>
          <span style={css('font-size:16px;font-weight:700;color:var(--text)')}>{mc.totalValue}</span>
          <span style={css(mono + 'font-size:10px;color:var(--text-faint2)')}>· {mc.count} tokens</span>
        </div>
      </section>

      {/* POSITIONS */}
      <section style={css('background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:18px 20px')}>
        <div style={css('display:flex;align-items:center;gap:10px;margin-bottom:14px')}>
          <span style={css(mono + 'font-size:11px;font-weight:600;letter-spacing:1px;color:var(--text-dim);border:1px solid var(--line2);border-radius:5px;padding:2px 7px')}>≣</span>
          <span style={css(mono + 'font-size:11px;letter-spacing:2.5px;color:var(--text-faint)')}>{'// POSITIONS'}</span>
        </div>

        {!mc.hasWallets ? (
          <div style={css('text-align:center;padding:30px 14px')}>
            <div style={css('font-size:14px;color:var(--text-dim);margin-bottom:6px')}>No wallet tracked yet</div>
            <div style={css('font-size:12.5px;color:var(--text-faint);line-height:1.5')}>Add your Solana wallet in <b>Settings → Crypto Wallets</b>. Positions and live P&amp;L (via Dexscreener) appear here on the deployed app.</div>
          </div>
        ) : mc.empty ? (
          <div style={css('text-align:center;padding:30px 14px;font-size:13px;color:var(--text-faint2)')}>
            {mc.loading ? 'Loading positions…' : 'No traded tokens found in your wallet (or offline — needs the deployed/served app for live data).'}
          </div>
        ) : (
          <div style={css('display:flex;flex-direction:column;gap:8px')}>
            {mc.rows.map((r, i) => (
              <div key={i} style={css('display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--inset);border:1px solid var(--line);border-radius:11px')}>
                {r.icon ? (
                  <img src={r.icon} alt="" width={32} height={32} style={{ width: 32, height: 32, borderRadius: '50%', flex: '0 0 32px', objectFit: 'cover' }} />
                ) : (
                  <span style={css('width:32px;height:32px;flex:0 0 32px;border-radius:50%;background:var(--line2);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:var(--text-dim)')}>{r.symbol.slice(0, 1)}</span>
                )}
                <div style={css('min-width:0;flex:1')}>
                  <div style={css('font-size:14px;font-weight:600;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap')}>{r.symbol}</div>
                  <div style={css(mono + 'font-size:10px;color:var(--text-faint2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap')}>{r.amount} · {r.price}</div>
                </div>
                <div style={css('text-align:right;flex:0 0 auto')}>
                  <div style={css('font-size:14px;font-weight:600;color:var(--text)')}>{r.value}</div>
                  <div style={css(`font-family:'JetBrains Mono',monospace;font-size:11px;color:${r.pnlColor}`)}>{r.pnl} · {r.change}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={css('font-size:11px;color:var(--text-faint2);margin-top:12px;line-height:1.5')}>Read-only. Prices &amp; 24h change from Dexscreener; holdings from the Solana chain. Today&apos;s P&amp;L = change in holding value over 24h.</div>
      </section>
    </div>
  );
}
