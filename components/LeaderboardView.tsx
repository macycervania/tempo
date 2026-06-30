'use client';

import React, { useEffect } from 'react';
import type { VM } from '@/state/useViewModel';
import { css, Hov } from './css';

export default function LeaderboardView({ vm }: { vm: VM }) {
  const mono = "font-family:'JetBrains Mono',monospace;";
  const lb = vm.leaderboard;

  useEffect(() => {
    if (lb.configured) lb.onRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lb.configured, lb.signedIn]);

  return (
    <div style={css('max-width:760px;margin:0 auto;display:flex;flex-direction:column;gap:16px')}>
      <section style={css('background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:20px 22px')}>
        <div style={css('display:flex;align-items:center;gap:10px;margin-bottom:6px')}>
          <span style={css(mono + 'font-size:11px;font-weight:600;letter-spacing:1px;color:var(--bg);background:var(--accent);border-radius:5px;padding:2px 7px')}>♛</span>
          <span style={css(mono + 'font-size:11px;letter-spacing:2.5px;color:var(--text-faint)')}>{'// LEADERBOARD'}</span>
          <div style={{ flex: 1 }} />
          {lb.configured && (
            <Hov as="button" onClick={lb.onRefresh} styleStr={mono + 'font-size:10px;letter-spacing:1px;background:transparent;border:1px solid var(--line2);border-radius:7px;padding:5px 10px;color:var(--text-faint);cursor:pointer'} hover="border-color:var(--line2);color:var(--text)">↻ REFRESH</Hov>
          )}
        </div>
        <p style={css('font-size:12.5px;color:var(--text-faint);margin-bottom:16px')}>
          You and your friends, ranked by progress — tasks done, habit consistency and trading P&amp;L.
        </p>

        {!lb.configured ? (
          <div style={css('text-align:center;padding:28px 14px')}>
            <div style={css('font-size:14px;color:var(--text-dim);margin-bottom:6px')}>Leaderboard needs the deployed app</div>
            <div style={css('font-size:12.5px;color:var(--text-faint);line-height:1.5')}>Sign in with Google on the served version so you and your friends share one board. See <b>SETUP.md</b>.</div>
          </div>
        ) : !lb.signedIn ? (
          <div style={css('text-align:center;padding:28px 14px')}>
            <div style={css('font-size:14px;color:var(--text-dim);margin-bottom:10px')}>Sign in to join the board</div>
            <Hov as="button" onClick={vm.onSignIn} styleStr="background:var(--accent);color:var(--bg);border:none;border-radius:10px;padding:11px 20px;font-size:14px;font-weight:700;cursor:pointer" hover="opacity:.9">Continue with Google</Hov>
          </div>
        ) : lb.empty ? (
          <div style={css('text-align:center;padding:28px 14px;font-size:13px;color:var(--text-faint2)')}>No one on the board yet — invite your friends to sign in.</div>
        ) : (
          <>
            <div style={css(mono + 'display:grid;grid-template-columns:34px 1fr 56px 56px 80px;gap:8px;padding:0 15px 8px;font-size:9px;letter-spacing:1px;color:var(--text-faint2)')}>
              <span>#</span>
              <span>NAME</span>
              <span style={css('text-align:right')}>TASKS</span>
              <span style={css('text-align:right')}>HABIT</span>
              <span style={css('text-align:right')}>P&amp;L</span>
            </div>
            <div style={css('display:flex;flex-direction:column;gap:8px')}>
              {lb.rows.map((r) => (
                <div key={r.rank} style={css(r.rowStyle)}>
                  <span style={css(mono + 'font-size:13px;font-weight:700;color:var(--text-dim);width:22px;flex:0 0 auto;text-align:center')}>{r.medal || r.rank}</span>
                  {r.avatar ? (
                    <img src={r.avatar} alt="" width={30} height={30} style={{ width: 30, height: 30, borderRadius: '50%', flex: '0 0 30px', objectFit: 'cover' }} />
                  ) : (
                    <span style={css('width:30px;height:30px;flex:0 0 30px;border-radius:50%;background:var(--line2);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:var(--text-dim)')}>{r.initials}</span>
                  )}
                  <div style={css('flex:1;min-width:0')}>
                    <div style={css('font-size:14px;font-weight:600;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap')}>{r.name}{r.isMe ? ' · you' : ''}</div>
                    <div style={css(mono + 'font-size:10px;color:var(--text-faint2)')}>{r.score} pts</div>
                  </div>
                  <span style={css(mono + 'font-size:13px;color:var(--text-dim);text-align:right;width:56px;flex:0 0 auto')}>{r.tasks}</span>
                  <span style={css(mono + 'font-size:13px;color:var(--text-dim);text-align:right;width:56px;flex:0 0 auto')}>{r.habit}</span>
                  <span style={css(`font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:600;text-align:right;width:80px;flex:0 0 auto;color:${r.pnlColor}`)}>{r.pnl}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
