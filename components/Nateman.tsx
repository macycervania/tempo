'use client';

import React from 'react';
import type { VM } from '@/state/useViewModel';
import { css, Hov } from './css';

/** The floating summon orb + the full-screen assistant overlay. */
export default function Nateman({ vm }: { vm: VM }) {
  const na = vm.na;
  return (
    <>
      {/* floating summon orb (overview only) */}
      {na.showFab && (
        <button
          onClick={na.onSummon}
          title="Summon Nateman — or type 'nateman'"
          style={css(
            'position:fixed;right:max(20px,env(safe-area-inset-right));bottom:max(20px,env(safe-area-inset-bottom));z-index:45;background:none;border:none;cursor:pointer;padding:0;animation:naFloat 4s ease-in-out infinite',
          )}
        >
          <div style={css('position:relative;width:62px;height:62px')}>
            <span
              style={css(
                "position:absolute;bottom:100%;right:0;margin-bottom:9px;white-space:nowrap;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.5px;color:var(--text-dim);background:var(--panel);border:1px solid var(--line2);border-radius:8px;padding:4px 9px;box-shadow:0 4px 14px rgba(0,0,0,.4)",
              )}
            >
              Say “hey nateman”
            </span>
            <div
              style={css(
                'position:absolute;inset:-28%;border-radius:50%;background:radial-gradient(circle at 50% 50%, rgba(157,107,255,.9), rgba(124,77,214,.4) 56%, transparent 72%);filter:blur(6px);animation:naAura 9s linear infinite',
              )}
            />
            <div
              style={css(
                'position:absolute;inset:13%;border-radius:50%;background:radial-gradient(circle at 36% 30%, #3c3c46, #16161c 47%, #050507 80%);box-shadow:inset 0 -5px 12px rgba(0,0,0,.6), inset 0 5px 11px rgba(157,107,255,.4), 0 8px 22px rgba(0,0,0,.5)',
              )}
            >
              <div
                style={css(
                  'position:absolute;top:12%;left:22%;width:34%;height:26%;border-radius:50%;background:radial-gradient(circle, rgba(255,255,255,.5), transparent 70%);filter:blur(1.5px)',
                )}
              />
              <div
                style={css(
                  'position:absolute;top:34%;left:21%;width:21%;height:27%;background:#fff;clip-path:polygon(0 0, 100% 24%, 60% 100%, 0 62%);animation:naBlink 5.5s infinite',
                )}
              >
                <div
                  style={css(
                    'position:absolute;bottom:18%;left:16%;width:30%;height:26%;background:#c0566f;border-radius:50%;animation:naLook 4.5s ease-in-out infinite',
                  )}
                />
              </div>
              <div
                style={css(
                  'position:absolute;top:34%;right:21%;width:21%;height:27%;background:#fff;clip-path:polygon(100% 0, 0 24%, 40% 100%, 100% 62%);animation:naBlink 5.5s infinite',
                )}
              >
                <div
                  style={css(
                    'position:absolute;bottom:18%;right:16%;width:30%;height:26%;background:#c0566f;border-radius:50%;animation:naLook 4.5s ease-in-out infinite',
                  )}
                />
              </div>
              <div
                style={css(
                  'position:absolute;bottom:18%;left:37%;width:26%;height:12%;background:#2a0e16;border-radius:5px 5px 11px 11px',
                )}
              >
                <div
                  style={css(
                    'position:absolute;top:-2px;left:15%;width:0;height:0;border-left:3px solid transparent;border-right:3px solid transparent;border-top:6px solid #fff',
                  )}
                />
                <div
                  style={css(
                    'position:absolute;top:-2px;right:15%;width:0;height:0;border-left:3px solid transparent;border-right:3px solid transparent;border-top:6px solid #fff',
                  )}
                />
              </div>
            </div>
          </div>
        </button>
      )}

      {/* assistant overlay */}
      {na.open && (
        <div
          onClick={na.onClose}
          style={css(
            'position:fixed;inset:0;z-index:60;background:color-mix(in srgb, var(--bg) 68%, transparent);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);display:flex;align-items:center;justify-content:center;padding:24px;opacity:1',
          )}
        >
          <div
            onClick={na.onStop}
            style={css(
              'width:100%;max-width:520px;display:flex;flex-direction:column;align-items:center;gap:20px',
            )}
          >
            <div
              style={css(
                "font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:3px;color:var(--accent)",
              )}
            >
              NATEMAN
            </div>
            <div
              style={css(
                'min-height:90px;display:flex;flex-direction:column;gap:11px;align-items:center;justify-content:flex-end;text-align:center',
              )}
            >
              {na.hasQuery && (
                <div style={css('font-size:15px;color:var(--text-muted)')}>
                  “{na.query}”
                </div>
              )}
              {na.answer && (
                <div
                  style={css(
                    'font-size:21px;font-weight:600;color:var(--text);line-height:1.4;max-width:470px',
                  )}
                >
                  {na.answerText}
                </div>
              )}
              {na.hasActionChip && (
                <span
                  style={css(
                    "font-family:'JetBrains Mono',monospace;font-size:10.5px;letter-spacing:1px;color:var(--accent);background:color-mix(in srgb, var(--accent) 13%, transparent);border:1px solid color-mix(in srgb, var(--accent) 32%, transparent);border-radius:6px;padding:3px 9px",
                  )}
                >
                  ✓ {na.actionLabel}
                </span>
              )}
              {na.statusText && (
                <div
                  style={css(
                    "font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:1px;color:var(--accent);animation:pulse 1.4s ease-in-out infinite",
                  )}
                >
                  {na.statusText}
                </div>
              )}
            </div>
            <div
              style={css(
                'position:relative;width:184px;height:184px;display:flex;align-items:center;justify-content:center',
              )}
            >
              {na.listening && (
                <>
                  <div
                    style={css(
                      'position:absolute;width:184px;height:184px;border-radius:50%;border:2px solid rgba(157,107,255,.5);animation:naRing 1.8s ease-out infinite',
                    )}
                  />
                  <div
                    style={css(
                      'position:absolute;width:184px;height:184px;border-radius:50%;border:2px solid rgba(157,107,255,.5);animation:naRing 1.8s ease-out .9s infinite',
                    )}
                  />
                </>
              )}
              <div
                style={css(
                  'position:relative;width:152px;height:152px;animation:naFloat 4s ease-in-out infinite',
                )}
              >
                <div
                  style={css(
                    'position:absolute;inset:-30%;border-radius:50%;background:radial-gradient(circle at 50% 50%, rgba(157,107,255,.92), rgba(124,77,214,.42) 55%, transparent 72%);filter:blur(11px);animation:naAura 9s linear infinite',
                  )}
                />
                <div
                  style={css(
                    'position:absolute;inset:13%;border-radius:50%;background:radial-gradient(circle at 36% 30%, #3c3c46, #16161c 47%, #050507 80%);box-shadow:inset 0 -9px 22px rgba(0,0,0,.6), inset 0 8px 18px rgba(157,107,255,.42), 0 14px 40px rgba(0,0,0,.55)',
                  )}
                >
                  <div
                    style={css(
                      'position:absolute;top:10%;left:20%;width:38%;height:26%;border-radius:50%;background:radial-gradient(circle, rgba(255,255,255,.5), transparent 70%);filter:blur(3px)',
                    )}
                  />
                  <div
                    style={css(
                      'position:absolute;top:33%;left:19%;width:23%;height:30%;background:#fff;clip-path:polygon(0 0, 100% 24%, 60% 100%, 0 62%);animation:naBlink 5.5s infinite',
                    )}
                  >
                    <div
                      style={css(
                        'position:absolute;bottom:18%;left:16%;width:30%;height:26%;background:#c0566f;border-radius:50%;animation:naLook 4.5s ease-in-out infinite',
                      )}
                    />
                  </div>
                  <div
                    style={css(
                      'position:absolute;top:33%;right:19%;width:23%;height:30%;background:#fff;clip-path:polygon(100% 0, 0 24%, 40% 100%, 100% 62%);animation:naBlink 5.5s infinite',
                    )}
                  >
                    <div
                      style={css(
                        'position:absolute;bottom:18%;right:16%;width:30%;height:26%;background:#c0566f;border-radius:50%;animation:naLook 4.5s ease-in-out infinite',
                      )}
                    />
                  </div>
                  <div style={css(na.mouthStyle)}>
                    <div
                      style={css(
                        'position:absolute;top:-2px;left:16%;width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:10px solid #fff',
                      )}
                    />
                    <div
                      style={css(
                        'position:absolute;top:-2px;right:16%;width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:10px solid #fff',
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div style={css('width:100%;display:flex;flex-direction:column;gap:11px')}>
              <div
                style={css(
                  "text-align:center;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.5px;color:var(--text-faint)",
                )}
              >
                Say “hey nateman” to summon me — or type below
              </div>
              <div
                style={css(
                  'display:flex;gap:8px;align-items:center;background:var(--inset);border:1px solid var(--line2);border-radius:12px;padding:0 12px;height:48px',
                )}
              >
                <input
                  value={na.naInput}
                  onChange={na.onNaInput}
                  onKeyDown={na.onNaKey}
                  placeholder="Ask Nateman anything…"
                  style={css(
                    'flex:1;background:none;border:none;color:var(--text);font-size:14px',
                  )}
                />
                <button
                  onClick={na.onNaSend}
                  style={css(
                    'background:var(--accent);color:var(--bg);border:none;border-radius:8px;padding:8px 15px;font-size:13px;font-weight:600;cursor:pointer',
                  )}
                >
                  Ask
                </button>
              </div>
              <div
                style={css('display:flex;flex-wrap:wrap;gap:7px;justify-content:center')}
              >
                {na.chips.map((chip, i) => (
                  <Hov
                    key={i}
                    as="button"
                    onClick={chip.onClick}
                    styleStr="background:var(--inset);border:1px solid var(--line2);border-radius:8px;padding:7px 12px;font-size:12px;color:var(--text-dim);cursor:pointer"
                    hover="border-color:var(--accent);color:var(--text)"
                  >
                    {chip.label}
                  </Hov>
                ))}
              </div>
            </div>
            <Hov
              as="button"
              onClick={na.onClose}
              styleStr="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:1px;color:var(--text-faint);background:none;border:none;cursor:pointer"
              hover="color:var(--text)"
            >
              CLOSE
            </Hov>
          </div>
        </div>
      )}
    </>
  );
}
