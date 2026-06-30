import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// AI SEAM — workout text → calories, personalised by the user's body.
//
// Runs ONLY when ANTHROPIC_API_KEY is set; otherwise 501 and the client falls
// back to the weight-scaled local estimate in lib/ai.ts. Passing weight + height
// lets Claude give a far more accurate burn than a fixed kcal/min table.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MODEL = process.env.TRAINING_MODEL || 'claude-opus-4-8';

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'training-ai-not-configured' }, { status: 501 });
  }

  let text = '';
  let weight = 0;
  let height = 0;
  try {
    const body = await req.json();
    text = typeof body?.text === 'string' ? body.text.trim() : '';
    weight = Number(body?.weight) || 0;
    height = Number(body?.height) || 0;
  } catch {
    return NextResponse.json({ error: 'bad-request' }, { status: 400 });
  }
  if (!text) {
    return NextResponse.json({ error: 'empty-workout' }, { status: 400 });
  }

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 200,
      system:
        'You estimate exercise calorie burn. Given a free-text workout and the ' +
        "person's body weight (kg) and height (cm), estimate total calories burned " +
        'and the duration in minutes. Use standard MET values scaled to the body ' +
        'weight. Reply with ONLY a JSON object: {"kcal": <total calories>, ' +
        '"minutes": <duration>}. Numbers only.',
      messages: [
        {
          role: 'user',
          content: `Workout: ${text}\nBody weight: ${weight} kg\nHeight: ${height} cm`,
        },
      ],
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
      minutes: Math.max(0, Math.round(num(data.minutes))),
    });
  } catch (err) {
    console.error('training estimate failed:', err);
    return NextResponse.json({ error: 'estimate-failed' }, { status: 502 });
  }
}
