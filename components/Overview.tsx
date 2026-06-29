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
    <>
      {/* CATEGORY BAR (editable) */}
      <div
        style={css(
          'display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:10px 14px;background:var(--panel);border:1px solid var(--line);border-radius:12px;margin-bottom:14px',
        )}
      >
        <span style={css(mono + 'font-size:10px;letter-spacing:1.5px;color:var(--text-faint2)')}>
          CATEGORIES
        </span>
        {vm.cats.map((c, i) => (
          <div
            key={i}
            style={css(
              mono +
                'display:flex;align-items:center;gap:7px;font-size:11px;letter-spacing:.5px;color:var(--text-muted);background:var(--panel);border:1px solid var(--line);border-radius:7px;padding:4px 9px',
            )}
          >
            <span
              style={css(`width:7px;height:7px;border-radius:2px;background:${c.tint}`)}
            />
            <span>{c.label}</span>
            <span style={css('color:var(--text);font-weight:600')}>{c.count}</span>
            {vm.managing && (
              <Hov
                as="button"
                onClick={c.onRemove}
                styleStr="background:none;border:none;color:var(--text-faint);cursor:pointer;font-size:13px;line-height:1;padding:0 0 0 2px"
                hover="color:#c77b6b"
              >
                ×
              </Hov>
            )}
          </div>
        ))}
        {vm.managing && (
          <div
            style={css(
              'display:flex;align-items:center;gap:6px;background:var(--panel);border:1px dashed var(--line2);border-radius:7px;padding:2px 4px 2px 9px',
            )}
          >
            <input
              value={vm.catDraft}
              onChange={vm.onCatInput}
              onKeyDown={vm.onCatKey}
              placeholder="New category"
              style={css('background:none;border:none;color:var(--text);font-size:12px;width:108px')}
            />
            <button
              onClick={vm.onCatAdd}
              style={css(
                'background:var(--inset);border:1px solid var(--line2);border-radius:5px;padding:3px 8px;font-size:11px;font-weight:600;color:var(--text-dim);cursor:pointer',
              )}
            >
              Add
            </button>
          </div>
        )}
        <div style={{ flex: 1 }} />
        <Hov
          as="button"
          onClick={vm.onToggleManage}
          styleStr={vm.manageBtnStyle}
          hover="border-color:var(--line2);color:var(--text)"
        >
          {vm.manageLabel}
        </Hov>
      </div>

      {/* KPI SUMMARY STRIP */}
      <div
        style={css(
          'display:flex;flex-wrap:wrap;align-items:stretch;background:linear-gradient(150deg,var(--panel),var(--panel));border:1px solid var(--line2);border-radius:14px;padding:4px 6px;margin-bottom:16px',
        )}
      >
        {vm.kpis.map((k, i) => (
          <div
            key={i}
            style={css('flex:1;min-width:128px;padding:13px 16px;border-right:1px solid var(--inset)')}
          >
            <div style={css(mono + 'font-size:9.5px;letter-spacing:1.5px;color:var(--text-faint);margin-bottom:6px')}>
              {k.label}
            </div>
            <div style={css(`font-size:21px;font-weight:700;letter-spacing:-.5px;line-height:1;color:${k.color}`)}>
              {k.val}
            </div>
          </div>
        ))}
      </div>

      <div id="ovgrid">
        {/* 01 SESSION + VOICE */}
        <section
          style={css(
            'grid-column:1 / -1;background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:22px 24px',
          )}
        >
          <div style={css('display:flex;align-items:center;gap:10px;margin-bottom:18px')}>
            <span style={css(mono + 'font-size:11px;font-weight:600;letter-spacing:1px;color:var(--bg);background:var(--accent);border-radius:5px;padding:2px 7px')}>
              01
            </span>
            <span style={css(mono + 'font-size:11px;letter-spacing:2.5px;color:var(--text-faint)')}>
              {'// SESSION'}
            </span>
          </div>
          <div style={css('display:flex;gap:28px;flex-wrap:wrap;align-items:flex-end')}>
            <div style={css('flex:1;min-width:260px;display:flex;gap:16px;align-items:flex-start')}>
              <button onClick={vm.onPickPfp} style={vm.pfpStyleObj} title="Upload a photo">
                {vm.noPfp && (
                  <span style={css('font-size:19px;font-weight:600;color:var(--text-dim)')}>
                    {vm.pfpInitials}
                  </span>
                )}
              </button>
              <input ref={vm.fileRef} type="file" accept="image/*" onChange={vm.onPfpChange} style={{ display: 'none' }} />
              <div style={{ minWidth: 0 }}>
                <h1 style={css('font-size:30px;font-weight:700;letter-spacing:-.5px;line-height:1.05')}>
                  {vm.greeting}
                </h1>
                <p style={css('font-size:14px;color:var(--text-muted);margin-top:7px;line-height:1.5;max-width:440px')}>
                  {vm.aiSummary}
                </p>
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
            <div style={css('flex:0 0 auto;min-width:300px')}>
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
            </div>
          </div>
        </section>

        {/* GOALS */}
        <section
          style={css(
            'grid-column:1 / -1;background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:20px 22px',
          )}
        >
          <div style={css('display:flex;align-items:center;gap:10px;margin-bottom:16px')}>
            <span style={css(mono + 'font-size:11px;font-weight:600;letter-spacing:1px;color:var(--bg);background:var(--accent);border-radius:5px;padding:2px 7px')}>
              ◎
            </span>
            <span style={css(mono + 'font-size:11px;letter-spacing:2.5px;color:var(--text-faint)')}>
              {'// GOALS'}
            </span>
          </div>
          <div style={css('display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:14px')}>
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

        {/* 02 PRIORITIES */}
        <section
          style={css('grid-column:1 / -1;background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:20px 22px')}
        >
          <div style={css('display:flex;align-items:center;gap:10px;margin-bottom:6px')}>
            <span style={css(mono + 'font-size:11px;font-weight:600;letter-spacing:1px;color:var(--text-dim);border:1px solid var(--line2);border-radius:5px;padding:2px 7px')}>02</span>
            <span style={css(mono + 'font-size:11px;letter-spacing:2.5px;color:var(--text-faint)')}>{'// PRIORITIES'}</span>
            <div style={{ flex: 1 }} />
            <span style={css(mono + 'font-size:10.5px;letter-spacing:1px;color:var(--text-faint2)')}>AUTO-ORDERED BY TEMPO</span>
          </div>
          <p style={css('font-size:12.5px;color:var(--text-faint);margin-bottom:16px')}>
            Ranked by deadline, blockers &amp; impact — newest captures slot in automatically.
          </p>
          <div style={css('display:flex;flex-direction:column;gap:8px;max-height:300px;overflow-y:auto')}>
            {vm.tasks.map((task) => (
              <Hov
                key={task.id}
                styleStr={task.rowStyle}
                hover="border-color:var(--line2);background:var(--inset)"
              >
                <button onClick={task.onToggle} style={css(task.boxStyle)}>
                  {task.done && (
                    <span style={css('font-size:12px;color:var(--bg);font-weight:700;animation:pop .2s ease')}>✓</span>
                  )}
                </button>
                <div style={css('flex:1;min-width:0')}>
                  <div style={css('display:flex;align-items:center;gap:8px')}>
                    <span style={css(task.badgeStyle)}>{task.badge}</span>
                    {task.viaVoice && (
                      <span style={css(mono + 'font-size:9px;letter-spacing:.5px;color:var(--text-faint);border:1px solid var(--line2);border-radius:4px;padding:1px 5px')}>
                        ◉ VOICE
                      </span>
                    )}
                  </div>
                  <div style={css(task.titleStyle)}>{task.title}</div>
                </div>
                <div style={css('display:flex;flex-direction:column;align-items:flex-end;gap:5px;flex:0 0 auto')}>
                  <span style={css('display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:500;color:var(--text-muted)')}>
                    <span style={css(`width:6px;height:6px;border-radius:2px;background:${task.tint}`)} />
                    {task.areaLabel}
                  </span>
                  <span style={css(mono + 'font-size:10px;color:var(--text-faint2)')}>{task.dueLabel}</span>
                </div>
              </Hov>
            ))}
          </div>
        </section>

        {/* 03 FUEL */}
        <section
          style={css('background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:20px 22px;display:flex;flex-direction:column')}
        >
          <div style={css('display:flex;align-items:center;gap:10px;margin-bottom:16px')}>
            <span style={css(mono + 'font-size:11px;font-weight:600;letter-spacing:1px;color:var(--text-dim);border:1px solid var(--line2);border-radius:5px;padding:2px 7px')}>03</span>
            <span style={css(mono + 'font-size:11px;letter-spacing:2.5px;color:var(--text-faint)')}>{'// FUEL'}</span>
            <div style={{ flex: 1 }} />
            <span style={css(mono + 'font-size:10.5px;letter-spacing:1px;color:var(--text-faint2)')}>TODAY</span>
          </div>
          <div style={css('display:flex;align-items:flex-end;gap:8px;margin-bottom:4px')}>
            <span style={css('font-size:34px;font-weight:700;letter-spacing:-1px;line-height:1')}>{vm.fuel.consumed}</span>
            <span style={css('font-size:14px;color:var(--text-faint);margin-bottom:4px')}>/ {vm.fuel.target} kcal</span>
            <div style={{ flex: 1 }} />
            <span style={css(vm.fuel.netStyle)}>{vm.fuel.netLabel}</span>
          </div>
          <div style={css('height:7px;border-radius:5px;background:var(--line);overflow:hidden;margin:10px 0 16px')}>
            <div style={css(`height:100%;border-radius:5px;background:linear-gradient(90deg,#c7853a,var(--accent));width:${vm.fuel.pct};transition:width .4s ease`)} />
          </div>
          <div style={css('display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px')}>
            {vm.fuel.macros.map((m, i) => (
              <div key={i}>
                <div style={css('display:flex;justify-content:space-between;align-items:baseline;margin-bottom:5px')}>
                  <span style={css(mono + 'font-size:10px;letter-spacing:1px;color:var(--text-faint)')}>{m.label}</span>
                  <span style={css('font-size:12px;font-weight:600;color:var(--text-dim)')}>{m.val}</span>
                </div>
                <div style={css('height:5px;border-radius:4px;background:var(--line);overflow:hidden')}>
                  <div style={css(`height:100%;border-radius:4px;background:${m.color};width:${m.pct};transition:width .4s ease`)} />
                </div>
              </div>
            ))}
          </div>
          <div style={css('display:flex;flex-direction:column;gap:6px;margin-bottom:14px')}>
            {vm.fuel.meals.map((meal) => (
              <div key={meal.id} style={css('display:flex;align-items:center;gap:10px;padding:9px 11px;background:var(--inset);border:1px solid var(--line);border-radius:9px;animation:fadeUp .2s ease')}>
                <span style={css(mono + 'font-size:10px;color:var(--text-faint2);flex:0 0 auto')}>{meal.time}</span>
                <span style={css('flex:1;min-width:0;font-size:13px;color:var(--text-dim);overflow:hidden;text-overflow:ellipsis;white-space:nowrap')}>{meal.name}</span>
                <span style={css(mono + 'font-size:11px;color:var(--text-dim);flex:0 0 auto')}>{meal.kcal}k</span>
                <span style={css(mono + 'font-size:11px;color:#74ad84;flex:0 0 auto')}>{meal.p}p</span>
              </div>
            ))}
          </div>
          <div style={css('margin-top:auto;display:flex;align-items:center;gap:9px;background:var(--inset);border:1px solid var(--line2);border-radius:10px;padding:0 12px;height:42px')}>
            <span style={css(mono + 'font-size:14px;color:var(--accent)')}>+</span>
            <input
              value={vm.foodDraft}
              onChange={vm.onFoodInput}
              onKeyDown={vm.onFoodKey}
              placeholder="What did you eat? (“3 eggs, oatmeal, coffee”)"
              style={css('flex:1;background:none;border:none;color:var(--text);font-size:13px')}
            />
            <Hov as="button" onClick={vm.onFoodSubmit} styleStr="background:var(--inset);border:1px solid var(--line2);border-radius:7px;padding:5px 11px;font-size:12px;font-weight:600;color:var(--text-dim);cursor:pointer" hover="border-color:var(--line2)">
              Log
            </Hov>
          </div>
          {vm.foodHint && (
            <div style={css('margin-top:8px;font-size:11.5px;color:var(--text-faint);animation:fadeUp .18s ease')}>
              <span style={css(mono + 'font-size:10px;color:var(--accent)')}>EST </span>
              {vm.foodHint}
            </div>
          )}
        </section>

        {/* 04 TRAINING */}
        <section
          style={css('background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:20px 22px;display:flex;flex-direction:column')}
        >
          <div style={css('display:flex;align-items:center;gap:10px;margin-bottom:16px')}>
            <span style={css(mono + 'font-size:11px;font-weight:600;letter-spacing:1px;color:var(--text-dim);border:1px solid var(--line2);border-radius:5px;padding:2px 7px')}>04</span>
            <span style={css(mono + 'font-size:11px;letter-spacing:2.5px;color:var(--text-faint)')}>{'// TRAINING'}</span>
            <div style={{ flex: 1 }} />
            <span style={css(mono + 'font-size:10.5px;letter-spacing:1px;color:var(--text-faint2)')}>TODAY</span>
          </div>
          <div style={css('display:flex;align-items:flex-end;gap:18px;margin-bottom:18px')}>
            <div style={css('display:flex;align-items:flex-end;gap:7px')}>
              <span style={css('font-size:34px;font-weight:700;letter-spacing:-1px;line-height:1;color:#74ad84')}>{vm.train.burned}</span>
              <span style={css('font-size:14px;color:var(--text-faint);margin-bottom:4px')}>kcal burned</span>
            </div>
            <div style={{ flex: 1 }} />
            <div style={css('text-align:right')}>
              <div style={css('font-size:18px;font-weight:700;color:var(--text)')}>
                {vm.train.minutes}
                <span style={css('font-size:12px;color:var(--text-faint);font-weight:500')}> min</span>
              </div>
              <div style={css(mono + 'font-size:10px;color:var(--text-faint2);margin-top:2px')}>{vm.train.sessionLabel}</div>
            </div>
          </div>
          <div style={css('display:flex;flex-direction:column;gap:6px;margin-bottom:14px;flex:1')}>
            {vm.train.sessions.map((w) => (
              <div key={w.id} style={css('display:flex;align-items:center;gap:11px;padding:11px 13px;background:var(--inset);border:1px solid var(--line);border-radius:10px;animation:fadeUp .2s ease')}>
                <span style={css('width:8px;height:8px;border-radius:2px;background:#74ad84;flex:0 0 auto')} />
                <div style={css('flex:1;min-width:0')}>
                  <div style={css('font-size:13.5px;font-weight:500;color:var(--text-dim);overflow:hidden;text-overflow:ellipsis;white-space:nowrap')}>{w.name}</div>
                  <div style={css(mono + 'font-size:10px;color:var(--text-faint2);margin-top:2px')}>{w.time} · {w.minutes} min</div>
                </div>
                <span style={css(mono + 'font-size:13px;font-weight:600;color:#74ad84;flex:0 0 auto')}>{w.kcal}</span>
              </div>
            ))}
            {vm.train.empty && (
              <div style={css('text-align:center;padding:24px;font-size:13px;color:var(--text-faint2)')}>
                No sessions logged yet today.
              </div>
            )}
          </div>
          <div style={css('display:flex;align-items:center;gap:9px;background:var(--inset);border:1px solid var(--line2);border-radius:10px;padding:0 12px;height:42px')}>
            <span style={css(mono + 'font-size:14px;color:#74ad84')}>+</span>
            <input
              value={vm.exDraft}
              onChange={vm.onExInput}
              onKeyDown={vm.onExKey}
              placeholder="What did you train? (“push day 45 min”)"
              style={css('flex:1;background:none;border:none;color:var(--text);font-size:13px')}
            />
            <Hov as="button" onClick={vm.onExSubmit} styleStr="background:var(--inset);border:1px solid var(--line2);border-radius:7px;padding:5px 11px;font-size:12px;font-weight:600;color:var(--text-dim);cursor:pointer" hover="border-color:var(--line2)">
              Log
            </Hov>
          </div>
          {vm.exHint && (
            <div style={css('margin-top:8px;font-size:11.5px;color:var(--text-faint);animation:fadeUp .18s ease')}>
              <span style={css(mono + 'font-size:10px;color:#74ad84')}>EST </span>
              {vm.exHint}
            </div>
          )}
        </section>

        {/* 05 HABITS */}
        <section
          style={css('grid-column:1 / -1;background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:15px 17px')}
        >
          <div style={css('display:flex;align-items:center;gap:10px;margin-bottom:14px')}>
            <span style={css(mono + 'font-size:11px;font-weight:600;letter-spacing:1px;color:var(--text-dim);border:1px solid var(--line2);border-radius:5px;padding:2px 7px')}>05</span>
            <span style={css(mono + 'font-size:11px;letter-spacing:2.5px;color:var(--text-faint)')}>{'// HABITS'}</span>
            <div style={{ flex: 1 }} />
            <Hov as="button" onClick={vm.hb.onAdd} styleStr={mono + 'font-size:10px;letter-spacing:1px;background:transparent;border:1px solid var(--line2);border-radius:7px;padding:5px 10px;cursor:pointer;color:var(--text-faint)'} hover="color:var(--text);border-color:var(--accent)">
              + HABIT
            </Hov>
          </div>
          <div style={css('display:flex;align-items:center;gap:14px;margin-bottom:14px')}>
            <div style={css('position:relative;width:50px;height:50px;border-radius:50%;flex:0 0 50px;' + vm.hb.ringStyle)}>
              <div style={css('position:absolute;inset:4px;border-radius:50%;background:var(--panel);display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:700;color:var(--text)')}>
                {vm.hb.score}
              </div>
            </div>
            <div>
              <div style={css(mono + 'font-size:9.5px;letter-spacing:1.5px;color:var(--text-faint)')}>DAILY SCORE · RESETS 00:00</div>
              <div style={css('font-size:14px;font-weight:600;color:var(--text-dim);margin-top:3px')}>{vm.hb.hint}</div>
            </div>
          </div>
          <div style={css('display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:9px')}>
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
      </div>
    </>
  );
}

export { EditInput };
