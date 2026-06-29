'use client';

import React from 'react';
import type { VM } from '@/state/useViewModel';
import { css, Hov } from './css';
import { EditInput } from './Overview';

export default function BudgetView({ vm }: { vm: VM }) {
  const mono = "font-family:'JetBrains Mono',monospace;";
  const budget = vm.budget;
  return (
    <>
      {/* summary + month */}
      <div style={css('display:flex;align-items:center;gap:12px;margin-bottom:14px;flex-wrap:wrap')}>
        <span style={css(mono + 'font-size:11px;letter-spacing:2px;color:var(--text-faint)')}>MONTHLY BUDGET</span>
        <span style={css(mono + 'font-size:11px;letter-spacing:1px;color:var(--accent)')}>{budget.month}</span>
        <div style={{ flex: 1 }} />
        <span style={css(`font-size:12.5px;color:${budget.leftToBudgetColor}`)}>{budget.leftToBudgetLabel}</span>
        <Hov as="button" onClick={vm.onToggleBudgetManage} styleStr={vm.budgetManageBtnStyle} hover="border-color:var(--line2);color:var(--text)">
          {vm.budgetManageLabel}
        </Hov>
      </div>

      <div style={css('display:flex;flex-wrap:wrap;align-items:stretch;background:linear-gradient(150deg,var(--panel),var(--panel));border:1px solid var(--line2);border-radius:14px;padding:4px 6px;margin-bottom:14px')}>
        {budget.summary.map((k, i) => (
          <div key={i} style={css('flex:1;min-width:150px;padding:14px 18px;border-right:1px solid var(--inset)')}>
            <div style={css(mono + 'font-size:9.5px;letter-spacing:1.5px;color:var(--text-faint);margin-bottom:7px')}>{k.label}</div>
            <div style={css(`font-size:23px;font-weight:700;letter-spacing:-.5px;line-height:1;color:${k.color}`)}>{k.val}</div>
          </div>
        ))}
      </div>

      {/* expense quick logger */}
      <div style={css('display:flex;align-items:center;gap:9px;background:var(--inset);border:1px solid var(--line2);border-radius:10px;padding:0 12px;height:44px;margin-bottom:16px')}>
        <span style={css(mono + 'font-size:13px;color:var(--accent)')}>↵</span>
        <input
          value={vm.expenseDraft}
          onChange={vm.onExpenseInput}
          onKeyDown={vm.onExpenseKey}
          placeholder="Log an expense — it finds the line (“Grab 180”, “Groceries 1500”)"
          style={css('flex:1;background:none;border:none;color:var(--text);font-size:13.5px')}
        />
        <Hov as="button" onClick={vm.onExpenseSubmit} styleStr="background:var(--inset);border:1px solid var(--line2);border-radius:7px;padding:6px 13px;font-size:12px;font-weight:600;color:var(--text-dim);cursor:pointer" hover="border-color:var(--line2)">
          Log
        </Hov>
      </div>

      <div style={css('display:grid;grid-template-columns:340px minmax(0,1fr);gap:16px;align-items:start')}>
        {/* INCOME */}
        <section style={css('background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:20px 22px')}>
          <div style={css('display:flex;align-items:center;gap:10px;margin-bottom:16px')}>
            <span style={css(mono + 'font-size:11px;font-weight:600;letter-spacing:1px;color:#74ad84;border:1px solid var(--line2);border-radius:5px;padding:2px 7px')}>+</span>
            <span style={css(mono + 'font-size:11px;letter-spacing:2.5px;color:var(--text-faint)')}>{'// INCOME'}</span>
          </div>
          <div style={css('display:flex;flex-direction:column;gap:3px')}>
            {budget.incomeLines.map((inc, i) => (
              <div key={i} style={css('display:flex;align-items:center;gap:8px;padding:8px 4px;border-bottom:1px solid var(--line)')}>
                {vm.budgetManaging && (
                  <Hov as="button" onClick={inc.onRemove} styleStr="background:none;border:none;color:var(--text-faint2);cursor:pointer;font-size:13px;line-height:1" hover="color:#c77b6b">×</Hov>
                )}
                {inc.labelShow && (
                  <Hov onClick={inc.onEditLabel} styleStr="flex:1;font-size:13.5px;color:var(--text-dim);cursor:text" hover="color:var(--text)">{inc.label}</Hov>
                )}
                {inc.labelEditing && (
                  <EditInput vm={vm} style="flex:1;background:var(--inset);border:1px solid var(--line2);border-radius:5px;padding:3px 6px;color:var(--text);font-size:13px" />
                )}
                {inc.amtShow && (
                  <Hov as="span" onClick={inc.onEditAmt} styleStr={mono + 'font-size:13px;font-weight:600;color:#74ad84;cursor:pointer'} hover="text-decoration:underline">{inc.amt}</Hov>
                )}
                {inc.amtEditing && (
                  <EditInput vm={vm} style={"width:84px;text-align:right;background:var(--inset);border:1px solid var(--line2);border-radius:5px;padding:3px 6px;color:var(--text);font-family:'JetBrains Mono',monospace;font-size:13px"} />
                )}
              </div>
            ))}
          </div>
          {vm.budgetManaging && (
            <Hov as="button" onClick={vm.onAddIncome} styleStr={mono + 'margin-top:10px;font-size:11px;color:var(--text-faint);background:none;border:1px dashed var(--line2);border-radius:7px;padding:6px 0;width:100%;cursor:pointer'} hover="color:var(--text);border-color:var(--line2)">
              + add source
            </Hov>
          )}
          <div style={css('display:flex;justify-content:space-between;align-items:baseline;margin-top:14px;padding-top:12px;border-top:1px solid var(--line)')}>
            <span style={css(mono + 'font-size:10px;letter-spacing:1.5px;color:var(--text-faint)')}>TOTAL</span>
            <span style={css('font-size:18px;font-weight:700;color:#74ad84')}>{budget.incomeTotal}</span>
          </div>
        </section>

        {/* EXPENSES */}
        <section style={css('background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:20px 22px;max-height:62vh;overflow-y:auto')}>
          <div style={css('display:flex;align-items:center;gap:10px;margin-bottom:14px')}>
            <span style={css(mono + 'font-size:11px;font-weight:600;letter-spacing:1px;color:var(--text-dim);border:1px solid var(--line2);border-radius:5px;padding:2px 7px')}>−</span>
            <span style={css(mono + 'font-size:11px;letter-spacing:2.5px;color:var(--text-faint)')}>{'// EXPENSES'}</span>
            <div style={{ flex: 1 }} />
            <div style={css(mono + 'display:grid;grid-template-columns:92px 92px 88px;gap:0;font-size:9.5px;letter-spacing:1px;color:var(--text-faint2);text-align:right')}>
              <span>BUDGET</span>
              <span>SPENT</span>
              <span>LEFT</span>
            </div>
          </div>

          {budget.groups.map((g, gi) => (
            <div key={gi} style={css('margin-bottom:14px')}>
              {/* group header */}
              <div style={css('display:grid;grid-template-columns:1fr 92px 92px 88px 104px;align-items:center;gap:8px;padding:8px 0 9px;border-bottom:1px solid var(--line)')}>
                <div style={css('display:flex;align-items:center;gap:8px;min-width:0')}>
                  {vm.budgetManaging && (
                    <Hov as="button" onClick={g.onRemove} styleStr="background:none;border:none;color:var(--text-faint2);cursor:pointer;font-size:13px;line-height:1" hover="color:#c77b6b">×</Hov>
                  )}
                  {g.nameShow && (
                    <Hov as="span" onClick={g.onEditName} styleStr="font-size:13.5px;font-weight:600;letter-spacing:.2px;color:var(--text-dim);cursor:text" hover="color:#fff">{g.name}</Hov>
                  )}
                  {g.nameEditing && (
                    <EditInput vm={vm} style="background:var(--inset);border:1px solid var(--line2);border-radius:5px;padding:3px 6px;color:var(--text);font-size:13px;font-weight:600" />
                  )}
                </div>
                <span style={css(mono + 'text-align:right;font-size:11.5px;color:var(--text-muted)')}>{g.subB}</span>
                <span style={css(mono + 'text-align:right;font-size:11.5px;color:var(--text-dim)')}>{g.subS}</span>
                <span />
                <div style={css('height:6px;border-radius:4px;background:var(--line);overflow:hidden')}>
                  <div style={css(g.barStyle)} />
                </div>
              </div>
              {/* sub rows */}
              {g.subs.map((sub, si) => (
                <Hov key={si} styleStr="display:grid;grid-template-columns:1fr 92px 92px 88px 104px;align-items:center;gap:8px;padding:7px 0" hover="background:var(--inset)">
                  <div style={css('display:flex;align-items:center;gap:7px;min-width:0;padding-left:6px')}>
                    {vm.budgetManaging && (
                      <Hov as="button" onClick={sub.onRemove} styleStr="background:none;border:none;color:var(--text-faint2);cursor:pointer;font-size:12px;line-height:1" hover="color:#c77b6b">×</Hov>
                    )}
                    {sub.labelShow && (
                      <Hov as="span" onClick={sub.onEditLabel} styleStr="font-size:13px;color:var(--text-muted);cursor:text;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" hover="color:var(--text)">{sub.label}</Hov>
                    )}
                    {sub.labelEditing && (
                      <EditInput vm={vm} style="flex:1;background:var(--inset);border:1px solid var(--line2);border-radius:5px;padding:3px 6px;color:var(--text);font-size:13px" />
                    )}
                  </div>
                  <div style={css('text-align:right')}>
                    {sub.bCell.show && (
                      <Hov as="span" onClick={sub.bCell.onEdit} styleStr={mono + 'font-size:12px;color:var(--text-muted);cursor:pointer'} hover="text-decoration:underline">{sub.bCell.val}</Hov>
                    )}
                    {sub.bCell.editing && (
                      <EditInput vm={vm} style={"width:84px;text-align:right;background:var(--inset);border:1px solid var(--line2);border-radius:5px;padding:3px 6px;color:var(--text);font-family:'JetBrains Mono',monospace;font-size:12px"} />
                    )}
                  </div>
                  <div style={css('text-align:right')}>
                    {sub.sCell.show && (
                      <Hov as="span" onClick={sub.sCell.onEdit} styleStr={mono + `font-size:12px;color:${sub.sCell.color};cursor:pointer`} hover="text-decoration:underline">{sub.sCell.val}</Hov>
                    )}
                    {sub.sCell.editing && (
                      <EditInput vm={vm} style={"width:84px;text-align:right;background:var(--inset);border:1px solid var(--line2);border-radius:5px;padding:3px 6px;color:var(--text);font-family:'JetBrains Mono',monospace;font-size:12px"} />
                    )}
                  </div>
                  <span style={css(mono + `text-align:right;font-size:12px;color:${sub.leftColor}`)}>{sub.left}</span>
                  <div style={css('height:5px;border-radius:4px;background:var(--line);overflow:hidden')}>
                    <div style={css(sub.barStyle)} />
                  </div>
                </Hov>
              ))}
              {vm.budgetManaging && (
                <Hov as="button" onClick={g.onAddLine} styleStr={mono + 'margin-top:6px;margin-left:6px;font-size:10.5px;color:var(--text-faint);background:none;border:none;cursor:pointer'} hover="color:var(--accent)">
                  + add line
                </Hov>
              )}
            </div>
          ))}

          {vm.budgetManaging && (
            <Hov as="button" onClick={vm.onAddGroup} styleStr={mono + 'margin-top:6px;font-size:11px;color:var(--text-faint);background:none;border:1px dashed var(--line2);border-radius:7px;padding:8px 0;width:100%;cursor:pointer'} hover="color:var(--text);border-color:var(--line2)">
              + add category
            </Hov>
          )}

          <div style={css('display:grid;grid-template-columns:1fr 92px 92px 88px 104px;align-items:center;gap:8px;margin-top:8px;padding-top:14px;border-top:1px solid var(--line2)')}>
            <span style={css(mono + 'font-size:10px;letter-spacing:1.5px;color:var(--text-dim);font-weight:600')}>TOTAL EXPENSES</span>
            <span style={css(mono + 'text-align:right;font-size:13px;font-weight:600;color:var(--text-muted)')}>{budget.budgetTotal}</span>
            <span style={css(mono + 'text-align:right;font-size:13px;font-weight:600;color:var(--text)')}>{budget.spentTotal}</span>
            <span />
            <span />
          </div>
        </section>
      </div>
    </>
  );
}
