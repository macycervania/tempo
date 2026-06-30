'use client';

import React from 'react';
import type { VM } from '@/state/useViewModel';
import { css, Hov } from './css';

/** The inline edit field shared across goals, habits, name, budget, etc. */
function EditInput({ vm, style }: { vm: VM; style: string }) {
  return (
    <input
      ref={vm.focusRef}
      value={vm.editVal}
      onChange={vm.onEditInput}
      onKeyDown={vm.onEditKey}
      onBlur={vm.commitEdit}
      style={css(style)}
    />
  );
}

export default function Overview({ vm }: { vm: VM }) {
  const mono = "font-family:'JetBrains Mono',monospace;";
  return (
    <div id="ovgrid">
      {/* LEFT — session + progress */}
      <div className="ovcol">
        {/* 01 SESSION + VERSE + VOICE */}
        <section
          style={css('background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:22px 24px')}
        >
          <div style={css('display:flex;align-items:center;gap:10px;margin-bottom:18px')}>
            <span style={css(mono + 'font-size:11px;font-weight:600;letter-spacing:1px;color:var(--bg);background:var(--accent);border-radius:5px;padding:2px 7px')}>
              01
            </span>
            <span style={css(mono + 'font-size:11px;letter-spacing:2.5px;color:var(--text-faint)')}>
              {'// SESSION'}
            </span>
          </div>

          <div style={css('display:flex;gap:16px;align-items:flex-start')}>
            <button onClick={vm.onPickPfp} style={vm.pfpStyleObj} title="Upload a photo">
              {vm.noPfp && (
                <span style={css('font-size:19px;font-weight:600;color:var(--text-dim)')}>
                  {vm.pfpInitials}
                </span>
              )}
            </button>
            <input ref={vm.fileRef} type="file" accept="image/*" onChange={vm.onPfpChange} style={{ display: 'none' }} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <h1 style={css('font-size:30px;font-weight:700;letter-spacing:-.5px;line-height:1.05')}>
                {vm.greeting}
              </h1>
              <div style={{ marginTop: 10 }}>
                {vm.nameShow && (
                  <Hov
                    as="button"
                    onClick={vm.onEditUserName}
                    styleStr={mono + 'font-size:10.5px;letter-spacing:.5px;color:var(--text-faint);background:none;border:1px solid var(--line2);border-radius:7px;padding:5px 10px;cursor:pointer'}
                    hover="color:var(--text);border-color:var(--line2)"
                  >
                    ✎ {vm.nameDisplay}
                  </Hov>
                )}
                {vm.nameEditing && (
                  <input
                    ref={vm.focusRef}
                    value={vm.editVal}
                    onChange={vm.onEditInput}
                    onKeyDown={vm.onEditKey}
                    onBlur={vm.commitEdit}
                    placeholder="Your name"
                    style={css('background:var(--inset);border:1px solid var(--line2);border-radius:7px;padding:5px 10px;color:var(--text);font-size:13px;width:180px')}
                  />
                )}
              </div>
            </div>
          </div>

          {/* DAILY WORD — motivational line / Bible verse */}
          <div
            style={css(
              'margin-top:16px;background:var(--inset);border:1px solid var(--line);border-left:2px solid var(--accent);border-radius:10px;padding:13px 16px',
            )}
          >
            <p style={css('font-size:14.5px;font-style:italic;line-height:1.5;color:var(--text-dim)')}>
              “{vm.verse.text}”
            </p>
            {vm.verse.ref && (
              <div style={css(mono + 'font-size:10.5px;letter-spacing:.5px;color:var(--accent);margin-top:7px')}>
                — {vm.verse.ref}
              </div>
            )}
          </div>

          {/* TASKS DONE SUMMARY */}
          <div style={css('margin-top:16px')}>
            <div style={css('display:flex;align-items:baseline;justify-content:space-between;margin-bottom:7px')}>
              <span style={css(mono + 'font-size:10px;letter-spacing:1.5px;color:var(--text-faint)')}>TASKS DONE TODAY</span>
              <span style={css('font-size:13px;font-weight:600;color:var(--text-dim)')}>{vm.taskSummary.label}</span>
            </div>
            <div style={css('height:7px;border-radius:5px;background:var(--line);overflow:hidden')}>
              <div style={css(`height:100%;border-radius:5px;background:linear-gradient(90deg,#c7853a,var(--accent));width:${vm.taskSummary.pct};transition:width .4s ease`)} />
            </div>
          </div>

          {/* VOICE + CAPTURE */}
          <div style={css('margin-top:18px;max-width:360px')}>
            <button onClick={vm.onVoice} style={css(vm.voiceBtnStyle)}>
              {vm.voiceIdle && (
                <span style={css('display:flex;align-items:center;gap:12px')}>
                  <span style={css('width:34px;height:34px;border-radius:50%;border:1.5px solid var(--accent);display:flex;align-items:center;justify-content:center;flex:0 0 34px')}>
                    <span style={css('width:12px;height:12px;border-radius:50%;background:var(--accent)')} />
                  </span>
                  <span style={css('text-align:left;line-height:1.25')}>
                    <span style={css('display:block;font-size:14px;font-weight:600;color:var(--text)')}>
                      Talk through your day
                    </span>
                    <span style={css(mono + 'display:block;font-size:10.5px;color:var(--text-faint);margin-top:1px')}>
                      I&apos;ll file it &amp; set priority
                    </span>
                  </span>
                </span>
              )}
              {vm.voiceRec && (
                <span style={css('display:flex;align-items:center;gap:13px')}>
                  <span style={css('width:34px;height:34px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;flex:0 0 34px;animation:pulse 1.1s ease-in-out infinite')}>
                    <span style={css('width:12px;height:12px;border-radius:3px;background:var(--bg)')} />
                  </span>
                  <span style={css('display:flex;align-items:center;gap:3px;height:26px')}>
                    {['0s', '-.2s', '-.4s', '-.1s', '-.5s', '-.3s', '-.15s'].map((d, i) => (
                      <span
                        key={i}
                        style={css(`width:3px;height:26px;background:var(--accent);border-radius:2px;transform-origin:center;animation:wave .9s ease-in-out ${d} infinite`)}
                      />
                    ))}
                  </span>
                  <span style={css(mono + 'font-size:11px;color:var(--accent);margin-left:4px')}>
                    listening…
                  </span>
                </span>
              )}
              {vm.voiceProc && (
                <span style={css('display:flex;align-items:center;gap:12px')}>
                  <span style={css('width:20px;height:20px;border-radius:50%;border:2px solid var(--line2);border-top-color:var(--accent);animation:spin .7s linear infinite')} />
                  <span style={css(mono + 'font-size:12px;color:var(--text-dim)')}>
                    filing &amp; prioritizing…
                  </span>
                </span>
              )}
            </button>
            <div style={css('display:flex;align-items:center;gap:10px;margin-top:10px;background:var(--inset);border:1px solid var(--line2);border-radius:10px;padding:0 12px;height:42px')}>
              <span style={css(mono + 'font-size:11px;color:var(--text-faint2)')}>↵</span>
              <input
                value={vm.capture}
                onChange={vm.onCaptureInput}
                onKeyDown={vm.onCaptureKey}
                placeholder="…or type it (“fix API today !”)"
                style={css('flex:1;background:none;border:none;color:var(--text);font-size:13.5px')}
              />
              <Hov
                as="button"
                onClick={vm.onCaptureSubmit}
                styleStr="background:var(--inset);border:1px solid var(--line2);border-radius:7px;padding:5px 11px;font-size:12px;font-weight:600;color:var(--text-dim);cursor:pointer"
                hover="border-color:var(--line2)"
              >
                Add
              </Hov>
            </div>
            {vm.hasTranscript && (
              <div style={css('margin-top:10px;font-size:12.5px;color:var(--text-muted);line-height:1.45;animation:fadeUp .2s ease')}>
                <span style={css(mono + 'font-size:10px;color:var(--accent);letter-spacing:1px')}>
                  HEARD{' '}
                </span>
                &quot;{vm.transcript}&quot;
              </div>
            )}
            <div style={css(mono + 'font-size:10px;letter-spacing:.5px;color:var(--text-faint2);margin-top:10px')}>
              Tap the orb (bottom-right) or say “hey nateman” to ask your assistant.
            </div>
          </div>
        </section>

        {/* PROGRESS — habits & priorities */}
        <section
          style={css('background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:18px 20px')}
        >
          <div style={css('display:flex;align-items:center;gap:10px;margin-bottom:16px')}>
            <span style={css(mono + 'font-size:11px;font-weight:600;letter-spacing:1px;color:var(--text-dim);border:1px solid var(--line2);border-radius:5px;padding:2px 7px')}>◷</span>
            <span style={css(mono + 'font-size:11px;letter-spacing:2.5px;color:var(--text-faint)')}>{'// PROGRESS'}</span>
          </div>

          {/* Priorities */}
          <Hov
            onClick={vm.progress.priorities.onOpen}
            styleStr="display:block;background:var(--inset);border:1px solid var(--line);border-radius:12px;padding:14px 16px;cursor:pointer;margin-bottom:11px"
            hover="border-color:var(--line2)"
          >
            <div style={css('display:flex;align-items:baseline;justify-content:space-between;margin-bottom:8px')}>
              <span style={css(mono + 'font-size:10px;letter-spacing:1.5px;color:var(--text-faint)')}>TASKS</span>
              <span style={css('font-size:13px;font-weight:600;color:var(--text-dim)')}>{vm.progress.priorities.label} done</span>
            </div>
            <div style={css('height:6px;border-radius:4px;background:var(--line);overflow:hidden;margin-bottom:9px')}>
              <div style={css(`height:100%;border-radius:4px;background:linear-gradient(90deg,#7a63a0,#9b7fb4);width:${vm.progress.priorities.pct};transition:width .4s ease`)} />
            </div>
            <div style={css('display:flex;align-items:center;gap:8px')}>
              <span style={css('flex:1;min-width:0;font-size:12.5px;color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap')}>
                Next: {vm.progress.priorities.topOpen}
              </span>
              <span style={css(mono + 'font-size:10px;letter-spacing:.5px;color:var(--accent)')}>OPEN →</span>
            </div>
          </Hov>

          {/* Habits */}
          <Hov
            onClick={vm.progress.habits.onOpen}
            styleStr="display:flex;align-items:center;gap:14px;background:var(--inset);border:1px solid var(--line);border-radius:12px;padding:14px 16px;cursor:pointer"
            hover="border-color:var(--line2)"
          >
            <div style={css('position:relative;width:46px;height:46px;border-radius:50%;flex:0 0 46px;' + vm.progress.habits.ringStyle)}>
              <div style={css('position:absolute;inset:4px;border-radius:50%;background:var(--inset);display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;color:var(--text)')}>
                {vm.progress.habits.score}
              </div>
            </div>
            <div style={css('flex:1;min-width:0')}>
              <div style={css('display:flex;align-items:baseline;gap:8px')}>
                <span style={css(mono + 'font-size:10px;letter-spacing:1.5px;color:var(--text-faint)')}>HABITS</span>
                <span style={css('font-size:13px;font-weight:600;color:var(--text-dim)')}>{vm.progress.habits.label}</span>
              </div>
              <div style={css('font-size:12.5px;color:var(--text-muted);margin-top:3px')}>{vm.progress.habits.hint}</div>
            </div>
            <span style={css(mono + 'font-size:10px;letter-spacing:.5px;color:var(--accent);flex:0 0 auto')}>OPEN →</span>
          </Hov>
        </section>
      </div>

      {/* RIGHT — goals (kept on the overview) */}
      <div className="ovcol">
        {/* DAILY SUMMARY — morning brief (toggle in Settings → Notifications) */}
        {vm.dailyBrief.show && (
          <section style={css('background:var(--panel);border:1px solid var(--line2);border-radius:16px;padding:20px 22px')}>
            <div style={css('display:flex;align-items:center;gap:10px;margin-bottom:14px')}>
              <span style={css(mono + 'font-size:11px;font-weight:600;letter-spacing:1px;color:var(--bg);background:var(--accent);border-radius:5px;padding:2px 7px')}>☀</span>
              <span style={css(mono + 'font-size:11px;letter-spacing:2.5px;color:var(--text-faint)')}>{'// MORNING BRIEF'}</span>
              <div style={{ flex: 1 }} />
              <span style={css(mono + 'font-size:10px;letter-spacing:1px;color:var(--text-faint2)')}>TODAY</span>
            </div>
            <div style={css('display:flex;flex-direction:column;gap:11px')}>
              {vm.dailyBrief.lines.map((l, i) => (
                <div key={i} style={css('display:flex;align-items:baseline;justify-content:space-between;gap:12px')}>
                  <span style={css(mono + 'font-size:10px;letter-spacing:1.5px;color:var(--text-faint);flex:0 0 auto')}>{l.label}</span>
                  <span style={css(`font-size:13px;font-weight:600;text-align:right;color:${l.color};overflow:hidden;text-overflow:ellipsis;white-space:nowrap`)}>{l.val}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* WEEKLY REVIEW — Sunday recap (toggle in Settings → Notifications) */}
        {vm.weeklyReview.show && (
          <section style={css('background:var(--panel);border:1px solid var(--line2);border-radius:16px;padding:20px 22px')}>
            <div style={css('display:flex;align-items:center;gap:10px;margin-bottom:14px')}>
              <span style={css(mono + 'font-size:11px;font-weight:600;letter-spacing:1px;color:var(--bg);background:var(--accent);border-radius:5px;padding:2px 7px')}>✦</span>
              <span style={css(mono + 'font-size:11px;letter-spacing:2.5px;color:var(--text-faint)')}>{'// THIS WEEK'}</span>
              <div style={{ flex: 1 }} />
              <span style={css(mono + 'font-size:10px;letter-spacing:1px;color:var(--text-faint2)')}>RECAP</span>
            </div>
            <div style={css('display:flex;flex-direction:column;gap:11px')}>
              {vm.weeklyReview.lines.map((l, i) => (
                <div key={i} style={css('display:flex;align-items:baseline;justify-content:space-between;gap:12px')}>
                  <span style={css(mono + 'font-size:10px;letter-spacing:1.5px;color:var(--text-faint);flex:0 0 auto')}>{l.label}</span>
                  <span style={css(`font-size:13px;font-weight:600;text-align:right;color:${l.color}`)}>{l.val}</span>
                </div>
              ))}
            </div>
            <div style={css('margin-top:14px;padding-top:13px;border-top:1px solid var(--line);font-size:12.5px;color:var(--text-muted);line-height:1.45')}>
              {vm.weeklyReview.note}
            </div>
          </section>
        )}

        <section
          style={css('background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:20px 22px')}
        >
          <div style={css('display:flex;align-items:center;gap:10px;margin-bottom:16px')}>
            <span style={css(mono + 'font-size:11px;font-weight:600;letter-spacing:1px;color:var(--bg);background:var(--accent);border-radius:5px;padding:2px 7px')}>
              ◎
            </span>
            <span style={css(mono + 'font-size:11px;letter-spacing:2.5px;color:var(--text-faint)')}>
              {'// GOALS'}
            </span>
          </div>
          <div style={css('display:grid;grid-template-columns:1fr;gap:14px')}>
            {([['weekly', 'THIS WEEK', 'var(--accent)', '#c7853a,var(--accent)'], ['monthly', 'THIS MONTH', '#9b7fb4', '#7a63a0,#9b7fb4']] as const).map(
              ([periodKey, head, headColor, grad]) => {
                const g = vm.goals[periodKey];
                return (
                  <div key={periodKey} style={css('background:var(--inset);border:1px solid var(--line);border-radius:13px;padding:16px 18px')}>
                    <div style={css('display:flex;align-items:center;justify-content:space-between;margin-bottom:4px')}>
                      <span style={css(mono + `font-size:10px;letter-spacing:1.5px;color:${headColor}`)}>{head}</span>
                      <span style={css(mono + 'font-size:10.5px;color:var(--text-faint)')}>{g.progressLabel}</span>
                    </div>
                    {g.titleShow && (
                      <Hov
                        onClick={g.onEditTitle}
                        styleStr="font-size:15px;font-weight:600;color:var(--text);line-height:1.3;cursor:text;margin-bottom:12px"
                        hover="color:#fff"
                      >
                        {g.title}
                      </Hov>
                    )}
                    {g.titleEditing && (
                      <EditInput vm={vm} style="width:100%;background:var(--inset);border:1px solid var(--line2);border-radius:6px;padding:5px 8px;color:var(--text);font-size:14px;font-weight:600;margin-bottom:12px" />
                    )}
                    <div style={css('height:6px;border-radius:4px;background:var(--line);overflow:hidden;margin-bottom:14px')}>
                      <div style={css(`height:100%;border-radius:4px;background:linear-gradient(90deg,${grad});width:${g.pct};transition:width .4s ease`)} />
                    </div>
                    <div style={css('display:flex;flex-direction:column;gap:9px')}>
                      {g.krs.map((kr, i) => (
                        <div key={i} style={css('display:flex;align-items:center;gap:10px')}>
                          <button onClick={kr.onToggle} style={css(kr.boxStyle)}>
                            {kr.done && (
                              <span style={css('font-size:10px;color:var(--bg);font-weight:700;animation:cheerPop .25s ease')}>✓</span>
                            )}
                          </button>
                          {kr.labelShow && (
                            <span onClick={kr.onEditLabel} style={css(kr.labelStyle)}>{kr.label}</span>
                          )}
                          {kr.labelEditing && (
                            <EditInput vm={vm} style="flex:1;background:var(--inset);border:1px solid var(--line2);border-radius:5px;padding:3px 6px;color:var(--text);font-size:13px" />
                          )}
                          <Hov
                            as="button"
                            onClick={kr.onRemove}
                            styleStr="background:none;border:none;color:var(--text-faint2);cursor:pointer;font-size:13px;line-height:1"
                            hover="color:#c77b6b"
                          >
                            ×
                          </Hov>
                        </div>
                      ))}
                    </div>
                    <Hov
                      as="button"
                      onClick={g.onAddKR}
                      styleStr={mono + 'margin-top:11px;font-size:10.5px;color:var(--text-faint);background:none;border:none;cursor:pointer'}
                      hover="color:var(--accent)"
                    >
                      + add key result
                    </Hov>
                  </div>
                );
              },
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export { EditInput };
