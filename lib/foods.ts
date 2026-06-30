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
  source: 'common' | 'off' | 'ai';
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
// Works fully offline (the standalone HTML can't reach external APIs), so this
// covers the everyday foods you'd actually log; the online sources add the
// long tail when the app is served over https.
const COMMON: Generic[] = [
  // canned / processed
  { kw: ['spam', 'luncheon meat'], name: 'Spam (Luncheon Meat)', serving: '2 oz (56g)', kcal: 175, p: 7, c: 2, f: 15 },
  { kw: ['corned beef'], name: 'Corned Beef', serving: '1 serving', kcal: 250, p: 18, c: 2, f: 18 },
  { kw: ['vienna sausage'], name: 'Vienna Sausage', serving: '3 links', kcal: 150, p: 6, c: 1, f: 13 },
  { kw: ['tuna', 'canned tuna'], name: 'Tuna (canned in water)', serving: '1 can', kcal: 191, p: 42, c: 0, f: 1 },
  { kw: ['sardines'], name: 'Sardines', serving: '1 can', kcal: 191, p: 23, c: 0, f: 11 },
  { kw: ['ham'], name: 'Ham', serving: '1 slice', kcal: 46, p: 5, c: 1, f: 2 },
  { kw: ['hotdog', 'hot dog'], name: 'Hotdog', serving: '1 link', kcal: 150, p: 5, c: 2, f: 13 },
  { kw: ['sausage', 'longganisa'], name: 'Sausage', serving: '1 link', kcal: 170, p: 9, c: 1, f: 14 },
  { kw: ['bacon'], name: 'Bacon', serving: '2 strips', kcal: 90, p: 6, c: 0, f: 7 },
  // proteins
  { kw: ['chicken breast', 'grilled chicken'], name: 'Chicken Breast', serving: '100 g', kcal: 165, p: 31, c: 0, f: 4 },
  { kw: ['chicken thigh'], name: 'Chicken Thigh', serving: '100 g', kcal: 209, p: 26, c: 0, f: 11 },
  { kw: ['fried chicken'], name: 'Fried Chicken', serving: '1 piece', kcal: 320, p: 22, c: 11, f: 21 },
  { kw: ['pork chop', 'pork'], name: 'Pork Chop', serving: '100 g', kcal: 231, p: 26, c: 0, f: 14 },
  { kw: ['ground beef', 'giniling'], name: 'Ground Beef', serving: '100 g', kcal: 250, p: 26, c: 0, f: 15 },
  { kw: ['steak', 'beef steak'], name: 'Beef Steak', serving: '100 g', kcal: 271, p: 25, c: 0, f: 19 },
  { kw: ['salmon'], name: 'Salmon', serving: '100 g', kcal: 208, p: 20, c: 0, f: 13 },
  { kw: ['shrimp', 'prawn', 'hipon'], name: 'Shrimp', serving: '100 g', kcal: 99, p: 24, c: 0, f: 1 },
  { kw: ['egg', 'eggs', 'fried egg', 'boiled egg', 'itlog'], name: 'Egg', serving: '1 large', kcal: 70, p: 6, c: 0, f: 5 },
  { kw: ['tofu', 'tokwa'], name: 'Tofu', serving: '100 g', kcal: 76, p: 8, c: 2, f: 5 },
  // grains / carbs
  { kw: ['white rice', 'rice', 'steamed rice', 'kanin'], name: 'White Rice', serving: '1 cup', kcal: 205, p: 4, c: 45, f: 0 },
  { kw: ['brown rice'], name: 'Brown Rice', serving: '1 cup', kcal: 216, p: 5, c: 45, f: 2 },
  { kw: ['garlic rice', 'sinangag'], name: 'Garlic Rice', serving: '1 cup', kcal: 280, p: 5, c: 50, f: 7 },
  { kw: ['fried rice'], name: 'Fried Rice', serving: '1 cup', kcal: 350, p: 8, c: 55, f: 12 },
  { kw: ['bread', 'toast'], name: 'Bread', serving: '1 slice', kcal: 80, p: 3, c: 15, f: 1 },
  { kw: ['pandesal'], name: 'Pandesal', serving: '1 pc', kcal: 110, p: 3, c: 21, f: 2 },
  { kw: ['oatmeal', 'oats', 'porridge'], name: 'Oatmeal', serving: '1 cup', kcal: 150, p: 5, c: 27, f: 3 },
  { kw: ['cereal'], name: 'Cereal', serving: '1 cup', kcal: 150, p: 3, c: 33, f: 2 },
  { kw: ['spaghetti', 'pasta'], name: 'Spaghetti', serving: '1 plate', kcal: 400, p: 14, c: 60, f: 12 },
  { kw: ['noodles', 'pancit', 'bihon'], name: 'Noodles', serving: '1 cup', kcal: 220, p: 7, c: 40, f: 4 },
  { kw: ['ramen', 'instant noodles'], name: 'Ramen', serving: '1 bowl', kcal: 450, p: 15, c: 65, f: 16 },
  { kw: ['potato'], name: 'Potato', serving: '1 medium', kcal: 160, p: 4, c: 37, f: 0 },
  { kw: ['fries', 'french fries'], name: 'French Fries', serving: '1 medium', kcal: 365, p: 4, c: 48, f: 17 },
  // dishes
  { kw: ['pho', 'beef pho'], name: 'Beef Pho', serving: '1 bowl', kcal: 350, p: 30, c: 45, f: 5 },
  { kw: ['chicken pho'], name: 'Chicken Pho', serving: '1 bowl', kcal: 320, p: 28, c: 44, f: 4 },
  { kw: ['adobo', 'chicken adobo'], name: 'Chicken Adobo', serving: '1 serving', kcal: 450, p: 30, c: 10, f: 30 },
  { kw: ['pork adobo'], name: 'Pork Adobo', serving: '1 serving', kcal: 500, p: 28, c: 10, f: 38 },
  { kw: ['sinigang'], name: 'Sinigang', serving: '1 bowl', kcal: 250, p: 25, c: 15, f: 10 },
  { kw: ['tinola'], name: 'Tinola', serving: '1 bowl', kcal: 220, p: 24, c: 8, f: 9 },
  { kw: ['sisig'], name: 'Sisig', serving: '1 serving', kcal: 400, p: 25, c: 5, f: 30 },
  { kw: ['tapsilog'], name: 'Tapsilog', serving: '1 plate', kcal: 700, p: 35, c: 70, f: 30 },
  { kw: ['longsilog', 'longganisa'], name: 'Longsilog', serving: '1 plate', kcal: 750, p: 28, c: 72, f: 38 },
  { kw: ['lumpia', 'spring roll'], name: 'Lumpia (3 pcs)', serving: '3 pcs', kcal: 250, p: 8, c: 22, f: 14 },
  { kw: ['chicken rice', 'hainanese'], name: 'Chicken & Rice', serving: '1 plate', kcal: 600, p: 35, c: 70, f: 18 },
  { kw: ['curry'], name: 'Chicken Curry', serving: '1 bowl', kcal: 400, p: 28, c: 20, f: 22 },
  { kw: ['pad thai'], name: 'Pad Thai', serving: '1 plate', kcal: 450, p: 20, c: 55, f: 16 },
  { kw: ['sushi', 'maki', 'roll'], name: 'Sushi Roll', serving: '6 pcs', kcal: 250, p: 9, c: 40, f: 5 },
  { kw: ['dumpling', 'siomai', 'gyoza', 'dimsum'], name: 'Dumplings (6 pcs)', serving: '6 pcs', kcal: 300, p: 12, c: 35, f: 12 },
  // Filipino dishes
  { kw: ['kare-kare', 'kare kare', 'karekare'], name: 'Kare-Kare', serving: '1 serving', kcal: 450, p: 28, c: 18, f: 30 },
  { kw: ['kaldereta', 'caldereta'], name: 'Beef Kaldereta', serving: '1 serving', kcal: 400, p: 26, c: 15, f: 26 },
  { kw: ['mechado'], name: 'Mechado', serving: '1 serving', kcal: 380, p: 25, c: 14, f: 24 },
  { kw: ['menudo'], name: 'Menudo', serving: '1 serving', kcal: 350, p: 22, c: 18, f: 20 },
  { kw: ['afritada'], name: 'Afritada', serving: '1 serving', kcal: 330, p: 24, c: 16, f: 18 },
  { kw: ['bicol express'], name: 'Bicol Express', serving: '1 serving', kcal: 350, p: 18, c: 10, f: 28 },
  { kw: ['pinakbet', 'pakbet'], name: 'Pinakbet', serving: '1 serving', kcal: 180, p: 8, c: 18, f: 9 },
  { kw: ['laing'], name: 'Laing', serving: '1 serving', kcal: 250, p: 6, c: 12, f: 20 },
  { kw: ['dinuguan'], name: 'Dinuguan', serving: '1 bowl', kcal: 320, p: 22, c: 8, f: 22 },
  { kw: ['bulalo'], name: 'Bulalo', serving: '1 bowl', kcal: 350, p: 28, c: 10, f: 22 },
  { kw: ['nilaga'], name: 'Nilagang Baka', serving: '1 bowl', kcal: 250, p: 24, c: 12, f: 12 },
  { kw: ['lechon'], name: 'Lechon (Roast Pork)', serving: '1 serving', kcal: 400, p: 24, c: 0, f: 33 },
  { kw: ['crispy pata'], name: 'Crispy Pata', serving: '1 serving', kcal: 500, p: 30, c: 5, f: 40 },
  { kw: ['lechon kawali'], name: 'Lechon Kawali', serving: '1 serving', kcal: 450, p: 25, c: 2, f: 38 },
  { kw: ['inasal', 'chicken inasal'], name: 'Chicken Inasal', serving: '1 serving', kcal: 350, p: 30, c: 5, f: 23 },
  { kw: ['pancit canton'], name: 'Pancit Canton', serving: '1 plate', kcal: 350, p: 12, c: 50, f: 11 },
  { kw: ['pancit bihon'], name: 'Pancit Bihon', serving: '1 plate', kcal: 300, p: 10, c: 48, f: 8 },
  { kw: ['pancit malabon'], name: 'Pancit Malabon', serving: '1 plate', kcal: 400, p: 16, c: 52, f: 14 },
  { kw: ['lumpiang shanghai', 'shanghai'], name: 'Lumpiang Shanghai', serving: '4 pcs', kcal: 250, p: 10, c: 18, f: 15 },
  { kw: ['lugaw', 'goto'], name: 'Lugaw', serving: '1 bowl', kcal: 200, p: 6, c: 38, f: 3 },
  { kw: ['arroz caldo'], name: 'Arroz Caldo', serving: '1 bowl', kcal: 280, p: 14, c: 40, f: 7 },
  { kw: ['champorado'], name: 'Champorado', serving: '1 bowl', kcal: 300, p: 6, c: 55, f: 7 },
  { kw: ['tapa', 'beef tapa'], name: 'Beef Tapa', serving: '1 serving', kcal: 280, p: 30, c: 5, f: 14 },
  { kw: ['tocino'], name: 'Tocino', serving: '1 serving', kcal: 300, p: 20, c: 18, f: 16 },
  { kw: ['bangus', 'milkfish'], name: 'Bangus (Milkfish)', serving: '1 serving', kcal: 200, p: 22, c: 0, f: 12 },
  { kw: ['tilapia'], name: 'Tilapia', serving: '1 serving', kcal: 130, p: 26, c: 0, f: 3 },
  { kw: ['munggo', 'mongo'], name: 'Ginisang Munggo', serving: '1 bowl', kcal: 180, p: 12, c: 22, f: 5 },
  { kw: ['halo-halo', 'halo halo'], name: 'Halo-Halo', serving: '1 serving', kcal: 350, p: 6, c: 65, f: 9 },
  { kw: ['turon'], name: 'Turon', serving: '1 pc', kcal: 220, p: 2, c: 40, f: 7 },
  { kw: ['bibingka'], name: 'Bibingka', serving: '1 slice', kcal: 250, p: 5, c: 40, f: 8 },
  { kw: ['puto'], name: 'Puto', serving: '2 pcs', kcal: 110, p: 2, c: 22, f: 2 },
  { kw: ['taho'], name: 'Taho', serving: '1 cup', kcal: 180, p: 7, c: 30, f: 3 },
  // more Filipino dishes
  { kw: ['bistek', 'beefsteak'], name: 'Bistek Tagalog', serving: '1 serving', kcal: 320, p: 26, c: 8, f: 20 },
  { kw: ['igado'], name: 'Igado', serving: '1 serving', kcal: 350, p: 24, c: 10, f: 24 },
  { kw: ['pochero', 'puchero'], name: 'Pochero', serving: '1 bowl', kcal: 380, p: 24, c: 20, f: 22 },
  { kw: ['batchoy', 'la paz'], name: 'La Paz Batchoy', serving: '1 bowl', kcal: 400, p: 18, c: 45, f: 16 },
  { kw: ['lomi'], name: 'Lomi', serving: '1 bowl', kcal: 420, p: 16, c: 55, f: 14 },
  { kw: ['mami'], name: 'Mami', serving: '1 bowl', kcal: 350, p: 18, c: 45, f: 12 },
  { kw: ['sotanghon'], name: 'Sotanghon', serving: '1 bowl', kcal: 250, p: 12, c: 35, f: 7 },
  { kw: ['palabok'], name: 'Pancit Palabok', serving: '1 plate', kcal: 380, p: 14, c: 50, f: 14 },
  { kw: ['paella'], name: 'Paella', serving: '1 plate', kcal: 450, p: 20, c: 55, f: 16 },
  { kw: ['kilawin', 'kinilaw'], name: 'Kinilaw', serving: '1 serving', kcal: 150, p: 20, c: 5, f: 5 },
  { kw: ['paksiw'], name: 'Paksiw na Isda', serving: '1 serving', kcal: 180, p: 22, c: 3, f: 8 },
  { kw: ['ginataang gulay', 'ginataan'], name: 'Ginataang Gulay', serving: '1 bowl', kcal: 200, p: 5, c: 15, f: 14 },
  { kw: ['papaitan', 'pinapaitan'], name: 'Papaitan', serving: '1 bowl', kcal: 250, p: 22, c: 6, f: 15 },
  { kw: ['dinakdakan'], name: 'Dinakdakan', serving: '1 serving', kcal: 350, p: 22, c: 6, f: 26 },
  { kw: ['tokwa\'t baboy', "tokwa't baboy", 'tokwa baboy'], name: "Tokwa't Baboy", serving: '1 serving', kcal: 280, p: 16, c: 8, f: 20 },
  { kw: ['embutido'], name: 'Embutido', serving: '1 slice', kcal: 250, p: 14, c: 12, f: 16 },
  { kw: ['giniling', 'picadillo'], name: 'Giniling (Picadillo)', serving: '1 serving', kcal: 300, p: 20, c: 12, f: 18 },
  { kw: ['bbq', 'pork bbq', 'barbecue', 'inihaw'], name: 'Pork BBQ', serving: '1 stick', kcal: 200, p: 14, c: 8, f: 12 },
  // Filipino kakanin & street food
  { kw: ['biko'], name: 'Biko', serving: '1 slice', kcal: 280, p: 4, c: 55, f: 6 },
  { kw: ['suman'], name: 'Suman', serving: '1 pc', kcal: 200, p: 3, c: 40, f: 4 },
  { kw: ['sapin-sapin', 'sapin sapin'], name: 'Sapin-Sapin', serving: '1 slice', kcal: 220, p: 3, c: 42, f: 5 },
  { kw: ['kutsinta'], name: 'Kutsinta', serving: '2 pcs', kcal: 120, p: 2, c: 26, f: 1 },
  { kw: ['palitaw'], name: 'Palitaw', serving: '2 pcs', kcal: 150, p: 3, c: 30, f: 2 },
  { kw: ['maja blanca'], name: 'Maja Blanca', serving: '1 slice', kcal: 200, p: 3, c: 35, f: 6 },
  { kw: ['leche flan', 'flan'], name: 'Leche Flan', serving: '1 slice', kcal: 300, p: 8, c: 40, f: 12 },
  { kw: ['ensaymada'], name: 'Ensaymada', serving: '1 pc', kcal: 280, p: 6, c: 35, f: 13 },
  { kw: ['hopia'], name: 'Hopia', serving: '1 pc', kcal: 180, p: 4, c: 28, f: 6 },
  { kw: ['banana cue', 'bananacue'], name: 'Banana Cue', serving: '1 stick', kcal: 200, p: 1, c: 45, f: 4 },
  { kw: ['camote cue', 'kamote'], name: 'Camote Cue', serving: '1 stick', kcal: 220, p: 2, c: 48, f: 4 },
  { kw: ['kwek-kwek', 'kwek kwek', 'tokneneng'], name: 'Kwek-Kwek', serving: '3 pcs', kcal: 180, p: 7, c: 15, f: 11 },
  { kw: ['fishball', 'fish ball'], name: 'Fishball', serving: '5 pcs', kcal: 150, p: 8, c: 14, f: 7 },
  { kw: ['isaw'], name: 'Isaw', serving: '2 sticks', kcal: 120, p: 10, c: 2, f: 8 },
  { kw: ['balut'], name: 'Balut', serving: '1 pc', kcal: 190, p: 14, c: 2, f: 13 },
  { kw: ['chicharon', 'chicharron'], name: 'Chicharon', serving: '1 oz', kcal: 250, p: 12, c: 0, f: 22 },
  { kw: ['sago', 'gulaman', "sago't gulaman"], name: "Sago't Gulaman", serving: '1 cup', kcal: 180, p: 0, c: 45, f: 0 },
  { kw: ['buko juice', 'buko'], name: 'Buko Juice', serving: '1 cup', kcal: 110, p: 1, c: 26, f: 0 },
  { kw: ['calamansi'], name: 'Calamansi Juice', serving: '1 cup', kcal: 80, p: 0, c: 20, f: 0 },
  // international / world
  { kw: ['taco', 'tacos'], name: 'Tacos', serving: '1 taco', kcal: 200, p: 9, c: 18, f: 10 },
  { kw: ['burrito'], name: 'Burrito', serving: '1 burrito', kcal: 450, p: 20, c: 55, f: 16 },
  { kw: ['quesadilla'], name: 'Quesadilla', serving: '1 serving', kcal: 350, p: 16, c: 30, f: 18 },
  { kw: ['bibimbap'], name: 'Bibimbap', serving: '1 bowl', kcal: 550, p: 20, c: 75, f: 16 },
  { kw: ['bulgogi'], name: 'Bulgogi', serving: '1 serving', kcal: 400, p: 30, c: 20, f: 22 },
  { kw: ['kimchi'], name: 'Kimchi', serving: '1 serving', kcal: 30, p: 2, c: 5, f: 0 },
  { kw: ['teriyaki'], name: 'Teriyaki Chicken', serving: '1 serving', kcal: 380, p: 30, c: 25, f: 16 },
  { kw: ['katsu', 'tonkatsu'], name: 'Chicken Katsu', serving: '1 serving', kcal: 450, p: 28, c: 35, f: 22 },
  { kw: ['tempura'], name: 'Tempura', serving: '1 serving', kcal: 350, p: 14, c: 30, f: 20 },
  { kw: ['udon'], name: 'Udon', serving: '1 bowl', kcal: 350, p: 12, c: 60, f: 6 },
  { kw: ['tom yum', 'tom yum goong'], name: 'Tom Yum', serving: '1 bowl', kcal: 200, p: 18, c: 12, f: 9 },
  { kw: ['green curry', 'thai curry'], name: 'Green Curry', serving: '1 bowl', kcal: 400, p: 22, c: 18, f: 26 },
  { kw: ['butter chicken'], name: 'Butter Chicken', serving: '1 serving', kcal: 450, p: 28, c: 15, f: 30 },
  { kw: ['biryani'], name: 'Biryani', serving: '1 plate', kcal: 500, p: 18, c: 65, f: 18 },
  { kw: ['naan'], name: 'Naan', serving: '1 pc', kcal: 260, p: 8, c: 45, f: 5 },
  { kw: ['shawarma'], name: 'Shawarma', serving: '1 wrap', kcal: 400, p: 25, c: 30, f: 20 },
  { kw: ['kebab'], name: 'Kebab', serving: '1 serving', kcal: 350, p: 28, c: 8, f: 22 },
  { kw: ['falafel'], name: 'Falafel', serving: '4 pcs', kcal: 330, p: 13, c: 35, f: 16 },
  { kw: ['hummus'], name: 'Hummus', serving: '1/4 cup', kcal: 170, p: 5, c: 14, f: 10 },
  { kw: ['croissant'], name: 'Croissant', serving: '1 pc', kcal: 270, p: 5, c: 31, f: 14 },
  { kw: ['bagel'], name: 'Bagel', serving: '1 pc', kcal: 280, p: 11, c: 55, f: 2 },
  { kw: ['mac and cheese', 'macaroni'], name: 'Mac and Cheese', serving: '1 cup', kcal: 350, p: 12, c: 40, f: 16 },
  // fast food
  { kw: ['burger', 'hamburger'], name: 'Burger', serving: '1 burger', kcal: 350, p: 20, c: 30, f: 18 },
  { kw: ['cheeseburger'], name: 'Cheeseburger', serving: '1 burger', kcal: 400, p: 22, c: 32, f: 20 },
  { kw: ['pizza'], name: 'Pizza', serving: '1 slice', kcal: 285, p: 12, c: 36, f: 10 },
  { kw: ['nachos'], name: 'Nachos', serving: '1 serving', kcal: 350, p: 8, c: 36, f: 19 },
  { kw: ['sandwich'], name: 'Sandwich (Ham & Cheese)', serving: '1', kcal: 350, p: 18, c: 33, f: 16 },
  { kw: ['salad', 'chicken salad'], name: 'Chicken Salad', serving: '1 bowl', kcal: 300, p: 25, c: 15, f: 15 },
  // fruit & veg
  { kw: ['banana', 'saging'], name: 'Banana', serving: '1 medium', kcal: 105, p: 1, c: 27, f: 0 },
  { kw: ['apple'], name: 'Apple', serving: '1 medium', kcal: 95, p: 0, c: 25, f: 0 },
  { kw: ['orange'], name: 'Orange', serving: '1 medium', kcal: 62, p: 1, c: 15, f: 0 },
  { kw: ['mango', 'mangga'], name: 'Mango', serving: '1 medium', kcal: 200, p: 3, c: 50, f: 1 },
  { kw: ['avocado'], name: 'Avocado', serving: '1/2', kcal: 160, p: 2, c: 9, f: 15 },
  { kw: ['broccoli'], name: 'Broccoli', serving: '1 cup', kcal: 55, p: 4, c: 11, f: 1 },
  // dairy
  { kw: ['milk', 'gatas'], name: 'Milk', serving: '1 cup', kcal: 120, p: 8, c: 12, f: 5 },
  { kw: ['greek yogurt', 'yogurt'], name: 'Greek Yogurt', serving: '1 cup', kcal: 100, p: 17, c: 6, f: 0 },
  { kw: ['cheese', 'keso'], name: 'Cheese', serving: '1 slice', kcal: 80, p: 5, c: 1, f: 6 },
  { kw: ['ice cream', 'sorbetes'], name: 'Ice Cream', serving: '1 scoop', kcal: 270, p: 5, c: 31, f: 14 },
  // snacks & sweets
  { kw: ['chocolate', 'choco'], name: 'Chocolate Bar', serving: '1 bar', kcal: 230, p: 3, c: 26, f: 13 },
  { kw: ['cookies', 'biscuit'], name: 'Cookies', serving: '2 pcs', kcal: 160, p: 2, c: 22, f: 8 },
  { kw: ['chips', 'crisps'], name: 'Potato Chips', serving: '1 bag', kcal: 150, p: 2, c: 15, f: 10 },
  { kw: ['donut', 'doughnut'], name: 'Donut', serving: '1', kcal: 250, p: 3, c: 31, f: 14 },
  { kw: ['cake'], name: 'Cake', serving: '1 slice', kcal: 350, p: 4, c: 50, f: 15 },
  { kw: ['peanut butter'], name: 'Peanut Butter', serving: '2 tbsp', kcal: 190, p: 8, c: 7, f: 16 },
  { kw: ['protein bar'], name: 'Protein Bar', serving: '1 bar', kcal: 200, p: 20, c: 22, f: 7 },
  { kw: ['almonds', 'nuts'], name: 'Almonds', serving: '1 oz', kcal: 165, p: 6, c: 6, f: 14 },
  // drinks
  { kw: ['coffee', 'black coffee', 'americano'], name: 'Black Coffee', serving: '1 cup', kcal: 5, p: 0, c: 0, f: 0 },
  { kw: ['latte'], name: 'Caffè Latte', serving: '1 grande', kcal: 190, p: 13, c: 19, f: 7 },
  { kw: ['milk tea', 'milktea', 'boba'], name: 'Milk Tea', serving: '1 cup', kcal: 280, p: 3, c: 55, f: 5 },
  { kw: ['orange juice', 'juice'], name: 'Orange Juice', serving: '1 cup', kcal: 110, p: 2, c: 26, f: 0 },
  { kw: ['soda', 'coke', 'softdrink', 'pepsi'], name: 'Soda (Cola)', serving: '1 can', kcal: 140, p: 0, c: 39, f: 0 },
  { kw: ['beer'], name: 'Beer', serving: '1 can', kcal: 154, p: 2, c: 13, f: 0 },
  { kw: ['protein shake', 'whey', 'protein'], name: 'Protein Shake', serving: '1 scoop', kcal: 160, p: 30, c: 5, f: 2 },
  { kw: ['smoothie'], name: 'Fruit Smoothie', serving: '1 cup', kcal: 200, p: 5, c: 40, f: 3 },
  { kw: ['energy drink'], name: 'Energy Drink', serving: '1 can', kcal: 110, p: 0, c: 28, f: 0 },
  // breakfast
  { kw: ['pancake'], name: 'Pancakes', serving: '3 pcs', kcal: 350, p: 8, c: 50, f: 12 },
  { kw: ['waffle'], name: 'Waffle', serving: '1', kcal: 220, p: 5, c: 25, f: 11 },
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
    '&search_simple=1&action=process&json=1&page_size=20&sort_by=unique_scans_n' +
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

/**
 * AI-powered search — returns macros for ANY food (Filipino dishes, world
 * foods, brands) via the server route. Empty when no API key is configured
 * (standalone HTML / demo mode) or when offline.
 */
export async function aiSearch(
  query: string,
  signal?: AbortSignal,
): Promise<FoodHit[]> {
  try {
    const res = await fetch('/api/nutrition/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      signal,
    });
    if (!res.ok) return []; // 501 (no key) or upstream error
    const data = await res.json();
    const results: Record<string, unknown>[] = data?.results || [];
    return results.map((r, i) => ({
      id: 'ai-' + i + '-' + String(r.name),
      name: String(r.name),
      brand: 'AI estimate',
      serving: typeof r.serving === 'string' ? r.serving : '1 serving',
      kcal: num(r.kcal),
      p: num(r.p),
      c: num(r.c),
      f: num(r.f),
      source: 'ai' as const,
    }));
  } catch {
    return [];
  }
}

/**
 * Merged search: instant common matches first, then AI results (any food,
 * incl. Filipino dishes) and live Open Food Facts products. AI + OFF run in
 * parallel; either failing just means fewer results, never an error.
 */
export async function searchFoods(
  query: string,
  signal?: AbortSignal,
): Promise<FoodHit[]> {
  const local = localFoods(query);
  const [ai, off] = await Promise.all([
    aiSearch(query, signal),
    offSearch(query, signal).catch(() => [] as FoodHit[]),
  ]);
  const seen = new Set<string>();
  const merged: FoodHit[] = [];
  for (const h of [...local, ...ai, ...off]) {
    const key = h.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(h);
  }
  return merged.slice(0, 16);
}
