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
  const system =
    "You are Nateman, the user's terminal-style personal assistant inside the " +
    'Tempo // OS dashboard. Be warm, concise and direct — 1 to 3 sentences. ' +
    'Answer using ONLY the JSON snapshot of the user\'s data provided in the ' +
    'message (tasks, habits, meals, workouts, finance, journal, goals). If the ' +
    'data does not contain the answer, say so plainly.\n\n' +
    'You may perform AT MOST ONE action. Reply with ONLY a JSON object, no prose ' +
    'around it, in this exact shape:\n' +
    '{"answer": string, "actionLabel": string, "action": {"type": "none" | ' +
    '"setTheme" | "addTask" | "navigate", "themeKey"?: string, "text"?: string, ' +
    '"page"?: "overview"|"tasks"|"habits"|"health"|"budget"|"finance"|"calendar"|"journal"}}\n\n' +
    'Rules: use "addTask" with the task text when asked to add/remind/note a task; ' +
    '"setTheme" with a themeKey when asked to change theme/colors (available themes: ' +
    themeList +
    '); "navigate" with a page when asked to open/show a section; otherwise "none". ' +
    'actionLabel is a short confirmation like "Task added" or "" when no action.';

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 400,
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
      action?: { type?: unknown; themeKey?: unknown; text?: unknown; page?: unknown };
    };
    return NextResponse.json({
      answer: typeof data.answer === 'string' ? data.answer : 'On it.',
      actionLabel: typeof data.actionLabel === 'string' ? data.actionLabel : '',
      action: data.action && typeof data.action === 'object' ? data.action : { type: 'none' },
    });
  } catch (err) {
    console.error('nateman failed:', err);
    return NextResponse.json({ error: 'nateman-failed' }, { status: 502 });
  }
}
