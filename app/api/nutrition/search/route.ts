import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// AI SEAM — food name → a list of matching foods with macros (MyFitnessPal
// style), server-side. This is what lets ANY food be searchable — Filipino
// dishes (kare-kare, sinigang, bicol express), regional foods, brands, etc. —
// with believable macros, even when they aren't in the built-in table.
//
// Runs ONLY when ANTHROPIC_API_KEY is set; with no key it returns 501 and the
// client falls back to its offline food table + Open Food Facts.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MODEL = process.env.NUTRITION_MODEL || 'claude-opus-4-8';

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'nutrition-ai-not-configured' },
      { status: 501 },
    );
  }

  let query = '';
  try {
    const body = await req.json();
    query = typeof body?.query === 'string' ? body.query.trim() : '';
  } catch {
    return NextResponse.json({ error: 'bad-request' }, { status: 400 });
  }
  if (!query) {
    return NextResponse.json({ error: 'empty-query' }, { status: 400 });
  }

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 700,
      system:
        'You are a food & nutrition search engine like MyFitnessPal. Given a ' +
        'food search query (which may be a Filipino dish, any regional/world ' +
        'food, a brand, or a generic food), return up to 6 of the most relevant ' +
        'matching food entries with realistic per-serving nutrition. Include ' +
        'common variants (e.g. beef vs pork, with rice, etc.). Reply with ONLY a ' +
        'JSON object and nothing else, in the form ' +
        '{"results":[{"name":"<food name>","serving":"<serving size e.g. 1 bowl>",' +
        '"kcal":<number>,"p":<protein g>,"c":<carbs g>,"f":<fat g>}]}. ' +
        'All macro values are numbers. Be accurate and realistic.',
      messages: [{ role: 'user', content: query }],
    });

    const block = message.content.find((b) => b.type === 'text');
    const raw = block && block.type === 'text' ? block.text : '';
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      return NextResponse.json({ results: [] });
    }
    const data = JSON.parse(match[0]) as { results?: unknown[] };
    const num = (v: unknown) =>
      typeof v === 'number' && isFinite(v) ? v : parseFloat(String(v)) || 0;
    const results = (Array.isArray(data.results) ? data.results : [])
      .map((r) => r as Record<string, unknown>)
      .filter((r) => r && typeof r.name === 'string' && num(r.kcal) > 0)
      .slice(0, 6)
      .map((r) => ({
        name: String(r.name),
        serving: typeof r.serving === 'string' ? r.serving : '1 serving',
        kcal: Math.max(0, Math.round(num(r.kcal))),
        p: Math.max(0, Math.round(num(r.p))),
        c: Math.max(0, Math.round(num(r.c))),
        f: Math.max(0, Math.round(num(r.f))),
      }));

    return NextResponse.json({ results });
  } catch (err) {
    console.error('nutrition search failed:', err);
    return NextResponse.json({ results: [] }, { status: 502 });
  }
}
