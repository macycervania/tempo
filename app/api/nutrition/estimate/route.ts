import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// AI SEAM — meal text → macros, server-side.
//
// This is the real LLM call behind the deterministic local fallback in
// lib/ai.ts. It runs ONLY when ANTHROPIC_API_KEY is set; with no key it returns
// 501 and the client falls back to the built-in food table, so the app stays
// fully functional with zero configuration ("demo mode").
//
// Swap the body for a nutrition provider (Nutritionix, USDA FoodData Central,
// etc.) any time — the { kcal, p, c, f } response contract is all the UI knows.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// The model is overridable so you can trade cost/latency for the task; it
// defaults to the latest Claude Opus. Macro estimation is light, so Haiku
// (NUTRITION_MODEL=claude-haiku-4-5) is a reasonable, cheaper choice.
const MODEL = process.env.NUTRITION_MODEL || 'claude-opus-4-8';

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // No key configured — tell the client to use its local estimate.
    return NextResponse.json(
      { error: 'nutrition-ai-not-configured' },
      { status: 501 },
    );
  }

  let text = '';
  try {
    const body = await req.json();
    text = typeof body?.text === 'string' ? body.text.trim() : '';
  } catch {
    return NextResponse.json({ error: 'bad-request' }, { status: 400 });
  }
  if (!text) {
    return NextResponse.json({ error: 'empty-meal' }, { status: 400 });
  }

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 200,
      system:
        'You are a nutrition estimator. Given a free-text description of a meal, ' +
        'estimate its total calories and macronutrients for the whole described ' +
        'portion. Reply with ONLY a single JSON object and nothing else, in the ' +
        'form {"kcal": <total calories>, "p": <protein g>, "c": <carbs g>, ' +
        '"f": <fat g>}. All values are numbers.',
      messages: [{ role: 'user', content: text }],
    });

    const block = message.content.find((b) => b.type === 'text');
    const raw = block && block.type === 'text' ? block.text : '';
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      return NextResponse.json({ error: 'estimate-failed' }, { status: 502 });
    }
    const data = JSON.parse(match[0]) as Record<string, unknown>;
    const num = (v: unknown) =>
      typeof v === 'number' && isFinite(v) ? v : parseFloat(String(v)) || 0;

    return NextResponse.json({
      kcal: Math.max(0, Math.round(num(data.kcal))),
      p: Math.max(0, Math.round(num(data.p))),
      c: Math.max(0, Math.round(num(data.c))),
      f: Math.max(0, Math.round(num(data.f))),
    });
  } catch (err) {
    // Any upstream failure → let the client fall back to its local estimate.
    console.error('nutrition estimate failed:', err);
    return NextResponse.json({ error: 'estimate-failed' }, { status: 502 });
  }
}
