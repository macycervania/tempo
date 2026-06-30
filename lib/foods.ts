// MyFitnessPal-style food search. Two sources, merged best-effort:
//   1. a built-in table of common foods/dishes → instant matches, works offline
//      (so "pho", "adobo", "chicken rice" resolve even with no network), and
//   2. Open Food Facts — a free, no-key, CORS-friendly database of real
//      products with per-serving macros, queried live from the browser.
// The UI renders the merged list like MFP: name · "cal, serving, brand" + a
// + to log it.

export interface FoodHit {
  id: string;
  name: string;
  brand: string;
  serving: string;
  kcal: number;
  p: number;
  c: number;
  f: number;
  source: 'common' | 'off';
}

type Generic = {
  kw: string[];
  name: string;
  serving: string;
  kcal: number;
  p: number;
  c: number;
  f: number;
};

// Approximate macros per the listed serving — enough to log realistically.
const COMMON: Generic[] = [
  { kw: ['pho', 'beef pho'], name: 'Beef Pho', serving: '1 bowl', kcal: 350, p: 30, c: 45, f: 5 },
  { kw: ['chicken pho'], name: 'Chicken Pho', serving: '1 bowl', kcal: 320, p: 28, c: 44, f: 4 },
  { kw: ['chicken rice', 'hainanese'], name: 'Chicken & Rice', serving: '1 plate', kcal: 600, p: 35, c: 70, f: 18 },
  { kw: ['adobo'], name: 'Chicken Adobo', serving: '1 serving', kcal: 450, p: 30, c: 10, f: 30 },
  { kw: ['sinigang'], name: 'Sinigang', serving: '1 bowl', kcal: 250, p: 25, c: 15, f: 10 },
  { kw: ['tapsilog'], name: 'Tapsilog', serving: '1 plate', kcal: 700, p: 35, c: 70, f: 30 },
  { kw: ['lumpia', 'spring roll'], name: 'Lumpia (3 pcs)', serving: '3 pcs', kcal: 250, p: 8, c: 22, f: 14 },
  { kw: ['fried rice'], name: 'Fried Rice', serving: '1 cup', kcal: 350, p: 8, c: 55, f: 12 },
  { kw: ['white rice', 'rice', 'steamed rice'], name: 'White Rice', serving: '1 cup', kcal: 205, p: 4, c: 45, f: 0 },
  { kw: ['egg', 'eggs', 'fried egg', 'boiled egg'], name: 'Egg', serving: '1 large', kcal: 70, p: 6, c: 0, f: 5 },
  { kw: ['banana'], name: 'Banana', serving: '1 medium', kcal: 105, p: 1, c: 27, f: 0 },
  { kw: ['apple'], name: 'Apple', serving: '1 medium', kcal: 95, p: 0, c: 25, f: 0 },
  { kw: ['chicken breast', 'grilled chicken'], name: 'Chicken Breast', serving: '100 g', kcal: 165, p: 31, c: 0, f: 4 },
  { kw: ['oatmeal', 'oats', 'porridge'], name: 'Oatmeal', serving: '1 cup', kcal: 150, p: 5, c: 27, f: 3 },
  { kw: ['coffee', 'black coffee', 'americano'], name: 'Black Coffee', serving: '1 cup', kcal: 5, p: 0, c: 0, f: 0 },
  { kw: ['latte'], name: 'Caffè Latte', serving: '1 grande', kcal: 190, p: 13, c: 19, f: 7 },
  { kw: ['protein shake', 'whey', 'protein'], name: 'Protein Shake', serving: '1 scoop', kcal: 160, p: 30, c: 5, f: 2 },
  { kw: ['pizza'], name: 'Pizza', serving: '1 slice', kcal: 285, p: 12, c: 36, f: 10 },
  { kw: ['burger', 'hamburger', 'cheeseburger'], name: 'Burger', serving: '1 burger', kcal: 350, p: 20, c: 30, f: 18 },
  { kw: ['spaghetti', 'pasta'], name: 'Spaghetti', serving: '1 plate', kcal: 400, p: 14, c: 60, f: 12 },
  { kw: ['ramen'], name: 'Ramen', serving: '1 bowl', kcal: 450, p: 15, c: 65, f: 16 },
  { kw: ['sushi', 'maki', 'roll'], name: 'Sushi Roll', serving: '6 pcs', kcal: 250, p: 9, c: 40, f: 5 },
  { kw: ['salad'], name: 'Chicken Salad', serving: '1 bowl', kcal: 300, p: 25, c: 15, f: 15 },
  { kw: ['milk'], name: 'Milk', serving: '1 cup', kcal: 120, p: 8, c: 12, f: 5 },
  { kw: ['greek yogurt', 'yogurt'], name: 'Greek Yogurt', serving: '1 cup', kcal: 100, p: 17, c: 6, f: 0 },
  { kw: ['bread', 'toast'], name: 'Bread', serving: '1 slice', kcal: 80, p: 3, c: 15, f: 1 },
  { kw: ['peanut butter'], name: 'Peanut Butter', serving: '2 tbsp', kcal: 190, p: 8, c: 7, f: 16 },
  { kw: ['bacon'], name: 'Bacon', serving: '2 strips', kcal: 90, p: 6, c: 0, f: 7 },
  { kw: ['salmon'], name: 'Salmon', serving: '100 g', kcal: 208, p: 20, c: 0, f: 13 },
  { kw: ['tofu'], name: 'Tofu', serving: '100 g', kcal: 76, p: 8, c: 2, f: 5 },
  { kw: ['fries', 'french fries'], name: 'French Fries', serving: '1 medium', kcal: 365, p: 4, c: 48, f: 17 },
  { kw: ['ice cream'], name: 'Ice Cream', serving: '1 scoop', kcal: 270, p: 5, c: 31, f: 14 },
  { kw: ['chocolate'], name: 'Chocolate Bar', serving: '1 bar', kcal: 230, p: 3, c: 26, f: 13 },
  { kw: ['steak', 'beef'], name: 'Beef Steak', serving: '100 g', kcal: 271, p: 25, c: 0, f: 19 },
  { kw: ['shrimp', 'prawn'], name: 'Shrimp', serving: '100 g', kcal: 99, p: 24, c: 0, f: 1 },
  { kw: ['noodles', 'pancit'], name: 'Noodles', serving: '1 cup', kcal: 220, p: 7, c: 40, f: 4 },
  { kw: ['dumpling', 'siomai', 'gyoza'], name: 'Dumplings (6 pcs)', serving: '6 pcs', kcal: 300, p: 12, c: 35, f: 12 },
  { kw: ['pancake'], name: 'Pancakes', serving: '3 pcs', kcal: 350, p: 8, c: 50, f: 12 },
  { kw: ['smoothie'], name: 'Fruit Smoothie', serving: '1 cup', kcal: 200, p: 5, c: 40, f: 3 },
  { kw: ['curry'], name: 'Chicken Curry', serving: '1 bowl', kcal: 400, p: 28, c: 20, f: 22 },
  { kw: ['pad thai'], name: 'Pad Thai', serving: '1 plate', kcal: 450, p: 20, c: 55, f: 16 },
];

function num(v: unknown): number {
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
}

/** Instant offline matches from the built-in common-foods table. */
export function localFoods(query: string): FoodHit[] {
  const s = query.toLowerCase().trim();
  if (s.length < 2) return [];
  return COMMON.filter(
    (g) =>
      g.name.toLowerCase().includes(s) ||
      g.kw.some((k) => s.includes(k) || k.includes(s)),
  ).map((g, i) => ({
    id: 'common-' + i,
    name: g.name,
    brand: 'Common',
    serving: g.serving,
    kcal: g.kcal,
    p: g.p,
    c: g.c,
    f: g.f,
    source: 'common' as const,
  }));
}

/** Live results from Open Food Facts (no key, CORS-enabled). */
export async function offSearch(
  query: string,
  signal?: AbortSignal,
): Promise<FoodHit[]> {
  const url =
    'https://world.openfoodfacts.org/cgi/search.pl?search_terms=' +
    encodeURIComponent(query) +
    '&search_simple=1&action=process&json=1&page_size=20' +
    '&fields=code,product_name,brands,serving_size,nutriments';
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error('OFF ' + res.status);
  const data = await res.json();
  const products: Record<string, unknown>[] = data?.products || [];
  const hits: FoodHit[] = [];
  for (const p of products) {
    const name = String(p.product_name || '').trim();
    if (!name) continue;
    const n = (p.nutriments || {}) as Record<string, unknown>;
    const hasServing = n['energy-kcal_serving'] != null || n['proteins_serving'] != null;
    const suf = hasServing ? '_serving' : '_100g';
    let kcal = num(n['energy-kcal' + suf]);
    if (!kcal) kcal = Math.round(num(n['energy' + suf]) / 4.184); // kJ → kcal
    if (!kcal) continue;
    hits.push({
      id: 'off-' + (p.code || name),
      name,
      brand: String(p.brands || '').split(',')[0].trim(),
      serving: hasServing ? String(p.serving_size || '1 serving') : '100 g',
      kcal: Math.round(kcal),
      p: Math.round(num(n['proteins' + suf])),
      c: Math.round(num(n['carbohydrates' + suf])),
      f: Math.round(num(n['fat' + suf])),
      source: 'off',
    });
    if (hits.length >= 12) break;
  }
  return hits;
}

/** Merged search: instant common matches first, then live OFF results. */
export async function searchFoods(
  query: string,
  signal?: AbortSignal,
): Promise<FoodHit[]> {
  const local = localFoods(query);
  let off: FoodHit[] = [];
  try {
    off = await offSearch(query, signal);
  } catch {
    /* offline or blocked — common matches still show */
  }
  const seen = new Set(local.map((h) => h.name.toLowerCase()));
  const merged = [...local];
  for (const h of off) {
    const key = h.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(h);
  }
  return merged.slice(0, 14);
}
