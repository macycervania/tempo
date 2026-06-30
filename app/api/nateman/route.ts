import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// AI SEAM — the Nateman assistant, server-side.
//
// Runs ONLY when ANTHROPIC_API_KEY is set; otherwise returns 501 and the client
// falls back to the deterministic respondAssistant() brain in lib/ai.ts. Claude
// answers from the snapshot the client sends (tasks, habits, meals, finance,
// journal, …) and may return ONE structured action the provider then executes.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MODEL = process.env.NATEMAN_MODEL || 'claude-opus-4-8';

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'nateman-ai-not-configured' }, { status: 501 });
  }

  let query = '';
  let snapshot: unknown = {};
  let themes: { key: string; name: string }[] = [];
  try {
    const body = await req.json();
    query = typeof body?.query === 'string' ? body.query.trim() : '';
    snapshot = body?.snapshot ?? {};
    themes = Array.isArray(body?.themes) ? body.themes : [];
  } catch {
    return NextResponse.json({ error: 'bad-request' }, { status: 400 });
  }
  if (!query) {
    return NextResponse.json({ error: 'empty-query' }, { status: 400 });
  }

  const themeList = themes.map((t) => `${t.key} (${t.name})`).join(', ');
  const habitNames = (() => {
    const hn = (snapshot as { habitNames?: unknown })?.habitNames;
    return Array.isArray(hn) ? hn.filter((x) => typeof x === 'string') : [];
  })();
  const system =
    "You are Nateman, the user's terminal-style personal assistant inside the " +
    'Tempo // OS dashboard. The user is lazy and wants to just SAY what they did ' +
    'or need to do, and have you log it for them automatically. Be warm, concise ' +
    'and direct — 1 to 2 sentences. Answer questions using the JSON snapshot of ' +
    "the user's data; if it lacks the answer, say so plainly.\n\n" +
    'CRITICAL: when the user describes things they did or need, perform the ' +
    'matching actions. One message can contain SEVERAL actions — e.g. "I ate 2 ' +
    'eggs and rice, ran 5k, and bought some BONK up 40 bucks" → a logMeal, a ' +
    'logWorkout, and a logTrade. Output EVERY action.\n\n' +
    'Reply with ONLY a JSON object, no prose around it, in this exact shape:\n' +
    '{"answer": string, "actionLabel": string, "actions": Action[]}\n\n' +
    'Each Action is one of:\n' +
    '- {"type":"addTask","text": string} — a task / reminder / something to do.\n' +
    '- {"type":"logMeal","name": string,"kcal": number,"p": number,"c": number,"f": number} ' +
    '— food the user ATE. YOU estimate realistic macros (kcal, protein p, carbs c, ' +
    'fat f in grams) for the described portion. Combine one meal description into a ' +
    'single logMeal (sum the items).\n' +
    '- {"type":"logWorkout","name": string,"minutes": number,"kcal": number} — exercise ' +
    'the user DID. YOU estimate minutes and calories burned.\n' +
    '- {"type":"completeHabit","name": string} — when the user says they did one of ' +
    'their habits. Match the name to one of these existing habits EXACTLY: ' +
    (habitNames.length ? habitNames.join(', ') : '(none yet)') +
    '. Only use a name from that list.\n' +
    '- {"type":"logTrade","sym": string,"pnl": number} — a memecoin/stock trade result. ' +
    'sym is the ticker (e.g. BONK, SPY), pnl is profit (positive) or loss (negative) in dollars.\n' +
    '- {"type":"setTheme","themeKey": string} — change theme. Available: ' +
    themeList +
    '.\n' +
    '- {"type":"navigate","page": "overview"|"tasks"|"habits"|"health"|"budget"|"finance"|"calendar"|"journal"} ' +
    '— open a section when asked to show/open it.\n\n' +
    'If the user is only asking a question (no logging), use an empty actions array []. ' +
    'actionLabel is a short human summary of what you logged, e.g. "Logged 2 items" ' +
    'or "Meal + run logged", or "" when nothing was logged. In "answer", confirm ' +
    'naturally what you logged (include the calories/pnl you estimated so they can sanity-check).';

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 700,
      system,
      messages: [
        {
          role: 'user',
          content: `Question: ${query}\n\nMy data (JSON):\n${JSON.stringify(snapshot)}`,
        },
      ],
    });

    const block = message.content.find((b) => b.type === 'text');
    const raw = block && block.type === 'text' ? block.text : '';
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      return NextResponse.json({ error: 'no-json' }, { status: 502 });
    }
    const data = JSON.parse(match[0]) as {
      answer?: unknown;
      actionLabel?: unknown;
      actions?: unknown;
      action?: unknown;
    };
    // Accept either the new `actions` array or a legacy single `action`.
    const actions = Array.isArray(data.actions)
      ? data.actions.filter((a) => a && typeof a === 'object')
      : data.action && typeof data.action === 'object'
        ? [data.action]
        : [];
    return NextResponse.json({
      answer: typeof data.answer === 'string' ? data.answer : 'On it.',
      actionLabel: typeof data.actionLabel === 'string' ? data.actionLabel : '',
      actions,
    });
  } catch (err) {
    console.error('nateman failed:', err);
    return NextResponse.json({ error: 'nateman-failed' }, { status: 502 });
  }
}
