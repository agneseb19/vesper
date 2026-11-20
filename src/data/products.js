// VESPER — catalog data. Everything here is fictional.
// Each colorway drives the procedural 3D model (src/three/buildSunglasses.js).

export const METALS = {
  gold: '#d4a95a',
  silver: '#c9ccd1',
  rose: '#d9a08c',
  gunmetal: '#5a5c61',
};

export const collections = [
  {
    slug: 'riviera',
    name: 'Riviera',
    kicker: 'Collection 01',
    tagline: 'The classic, unhurried.',
    description:
      'Thick hand-polished acetate in the shape everyone reaches for first. Built for long lunches by the water and the drive home after.',
    tone: '#e9a25b',
  },
  {
    slug: 'nocturne',
    name: 'Nocturne',
    kicker: 'Collection 02',
    tagline: 'For the hour after golden.',
    description:
      'Swept cat-eye silhouettes with a lifted outer corner. Dramatic in daylight, unforgettable at dusk.',
    tone: '#d9748f',
  },
  {
    slug: 'meridian',
    name: 'Meridian',
    kicker: 'Collection 03',
    tagline: 'Light metal, long horizons.',
    description:
      'Featherweight titanium wire, double bridges and adjustable pads. Nine grams of frame between you and the sun.',
    tone: '#c9a46a',
  },
  {
    slug: 'atelier',
    name: 'Atelier',
    kicker: 'Limited',
    tagline: 'Numbered. Never repeated.',
    description:
      'Small runs of 300 pieces, each engraved with its number on the inner temple. When a drop is gone, it is gone.',
    tone: '#8e5bd9',
  },
];

const lenses = {
  dusk: { top: '#3a1f2b', bottom: '#e9a25b', mirror: true, name: 'Dusk mirror' },
  rose: { top: '#5b2a3a', bottom: '#e8b0b8', mirror: false, name: 'Rosé gradient' },
  smoke: { top: '#0e0e10', bottom: '#5d5d63', mirror: false, name: 'Smoke gradient' },
  brown: { top: '#2a1a10', bottom: '#a8774a', mirror: false, name: 'Brown gradient' },
  g15: { top: '#1d2a1e', bottom: '#4f6650', mirror: false, name: 'Bottle green' },
  amber: { top: '#4a2810', bottom: '#f0b46a', mirror: false, name: 'Amber' },
  blue: { top: '#0d1e3a', bottom: '#5f8fd8', mirror: true, name: 'Ocean mirror' },
  violet: { top: '#2b1446', bottom: '#e9a25b', mirror: true, name: 'Vesper iridescent' },
  gold: { top: '#3a2a0f', bottom: '#e6c27a', mirror: true, name: 'Gold mirror' },
  silver: { top: '#1c1f24', bottom: '#b7bec8', mirror: true, name: 'Silver mirror' },
};

export const products = [
  // ── RIVIERA ───────────────────────────────────────────
  {
    slug: 'the-riviera',
    number: 'N°01',
    name: 'The Riviera',
    collection: 'riviera',
    shape: 'wayfarer',
    material: 'acetate',
    price: 320,
    bestseller: true,
    hero: true,
    tagline: 'The one you will not take off.',
    description:
      'Our signature. A trapezoid front cut from a single block of acetate, a brow that leans forward just enough, and polarized mineral lenses that fade from dusk-violet to amber.',
    specs: { lens: '52 mm', bridge: '20 mm', temple: '145 mm', weight: '31 g' },
    colorways: [
      { id: 'noir', name: 'Noir / Dusk mirror', frame: { color: '#0d0c0c', pattern: 'solid' }, metal: 'silver', lens: lenses.violet },
      { id: 'havana', name: 'Havana / Brown', frame: { color: '#3b1f0f', pattern: 'tortoise' }, metal: 'gold', lens: lenses.brown },
      { id: 'ivory', name: 'Ivory / Bottle green', frame: { color: '#efe6d4', pattern: 'solid' }, metal: 'gold', lens: lenses.g15 },
    ],
  },
  {
    slug: 'portofino',
    number: 'N°02',
    name: 'Portofino',
    collection: 'riviera',
    shape: 'wayfarer',
    material: 'acetate',
    price: 320,
    bestseller: true,
    tagline: 'Harbour light, tortoiseshell warmth.',
    description:
      'A softer, slightly narrower Riviera in honey havana. Brown gradient lenses keep colours true from noon to aperitivo.',
    specs: { lens: '50 mm', bridge: '21 mm', temple: '145 mm', weight: '29 g' },
    colorways: [
      { id: 'havana', name: 'Honey havana / Brown', frame: { color: '#4a2711', pattern: 'tortoise' }, metal: 'gold', lens: lenses.brown },
      { id: 'olive', name: 'Olive / Bottle green', frame: { color: '#3d4029', pattern: 'solid' }, metal: 'gold', lens: lenses.g15 },
    ],
  },
  {
    slug: 'capri',
    number: 'N°03',
    name: 'Capri',
    collection: 'riviera',
    shape: 'oversized',
    material: 'acetate',
    price: 340,
    tagline: 'Big frame, bigger sky.',
    description:
      'An oversized square with generous lenses and a flat brow. Bone-white acetate and bottle-green glass, for whitewashed walls and blue water.',
    specs: { lens: '56 mm', bridge: '18 mm', temple: '145 mm', weight: '34 g' },
    colorways: [
      { id: 'bone', name: 'Bone / Bottle green', frame: { color: '#ece3d1', pattern: 'solid' }, metal: 'gold', lens: lenses.g15 },
      { id: 'noir', name: 'Noir / Smoke', frame: { color: '#0d0c0c', pattern: 'solid' }, metal: 'silver', lens: lenses.smoke },
    ],
  },

  // ── NOCTURNE ──────────────────────────────────────────
  {
    slug: 'vesper-noir',
    number: 'N°04',
    name: 'Vesper Noir',
    collection: 'nocturne',
    shape: 'cateye',
    material: 'acetate',
    price: 360,
    bestseller: true,
    tagline: 'A lifted corner, a lowered voice.',
    description:
      'The cat-eye that named the house. Gloss black, sharp at the outer brow, soft along the cheek, with smoke gradients that read as eyeliner from across a room.',
    specs: { lens: '54 mm', bridge: '17 mm', temple: '140 mm', weight: '28 g' },
    colorways: [
      { id: 'noir', name: 'Noir / Smoke', frame: { color: '#0b0a0a', pattern: 'solid' }, metal: 'gold', lens: lenses.smoke },
      { id: 'noir-rose', name: 'Noir / Rosé', frame: { color: '#0b0a0a', pattern: 'solid' }, metal: 'rose', lens: lenses.rose },
    ],
  },
  {
    slug: 'bordeaux',
    number: 'N°05',
    name: 'Bordeaux',
    collection: 'nocturne',
    shape: 'cateye',
    material: 'acetate',
    price: 360,
    tagline: 'Translucent wine, rosé glass.',
    description:
      'Crystal burgundy acetate that glows when the sun is behind you. Rosé gradient lenses warm every complexion.',
    specs: { lens: '53 mm', bridge: '17 mm', temple: '140 mm', weight: '27 g' },
    colorways: [
      { id: 'wine', name: 'Crystal wine / Rosé', frame: { color: '#6b1626', pattern: 'crystal' }, metal: 'rose', lens: lenses.rose },
      { id: 'blush', name: 'Blush crystal / Amber', frame: { color: '#e7a9a4', pattern: 'crystal' }, metal: 'gold', lens: lenses.amber },
    ],
  },
  {
    slug: 'gilda',
    number: 'N°06',
    name: 'Gilda',
    collection: 'nocturne',
    shape: 'cateye',
    material: 'acetate',
    price: 380,
    bestseller: true,
    tagline: 'Old Hollywood, new acetate.',
    description:
      'Deep tortoise, an exaggerated wing and amber lenses that turn every evening into a film still.',
    specs: { lens: '55 mm', bridge: '16 mm', temple: '140 mm', weight: '30 g' },
    colorways: [
      { id: 'tortoise', name: 'Dark tortoise / Amber', frame: { color: '#2a140a', pattern: 'tortoise' }, metal: 'gold', lens: lenses.amber },
      { id: 'noir', name: 'Noir / Gold mirror', frame: { color: '#0b0a0a', pattern: 'solid' }, metal: 'gold', lens: lenses.gold },
    ],
  },

  // ── MERIDIAN ──────────────────────────────────────────
  {
    slug: 'meridian',
    number: 'N°07',
    name: 'Meridian',
    collection: 'meridian',
    shape: 'aviator',
    material: 'metal',
    price: 410,
    tagline: 'Nine grams of titanium.',
    description:
      'A double-bridge aviator in brushed gold titanium. Teardrop lenses cover the whole field of view without ever feeling heavy.',
    specs: { lens: '58 mm', bridge: '14 mm', temple: '140 mm', weight: '9 g' },
    colorways: [
      { id: 'gold', name: 'Gold / Brown', frame: { color: '#d4a95a', pattern: 'metal' }, metal: 'gold', lens: lenses.brown },
      { id: 'gold-g15', name: 'Gold / Bottle green', frame: { color: '#d4a95a', pattern: 'metal' }, metal: 'gold', lens: lenses.g15 },
    ],
  },
  {
    slug: 'solstice',
    number: 'N°08',
    name: 'Solstice',
    collection: 'meridian',
    shape: 'aviator',
    material: 'metal',
    price: 410,
    tagline: 'The longest day, mirrored.',
    description:
      'Palladium-finished titanium and an ocean mirror that throws the sky back at itself.',
    specs: { lens: '58 mm', bridge: '14 mm', temple: '140 mm', weight: '9 g' },
    colorways: [
      { id: 'silver', name: 'Palladium / Ocean mirror', frame: { color: '#c9ccd1', pattern: 'metal' }, metal: 'silver', lens: lenses.blue },
      { id: 'gunmetal', name: 'Gunmetal / Smoke', frame: { color: '#5a5c61', pattern: 'metal' }, metal: 'gunmetal', lens: lenses.smoke },
    ],
  },
  {
    slug: 'aurelia',
    number: 'N°09',
    name: 'Aurelia',
    collection: 'meridian',
    shape: 'round',
    material: 'metal',
    price: 390,
    tagline: 'Perfect circles in rose gold.',
    description:
      'A fine round wire with a keyhole bridge. Rosé lenses, rose-gold rims: soft, literary, quietly bold.',
    specs: { lens: '49 mm', bridge: '21 mm', temple: '145 mm', weight: '8 g' },
    colorways: [
      { id: 'rose', name: 'Rose gold / Rosé', frame: { color: '#d9a08c', pattern: 'metal' }, metal: 'rose', lens: lenses.rose },
      { id: 'gold', name: 'Gold / Amber', frame: { color: '#d4a95a', pattern: 'metal' }, metal: 'gold', lens: lenses.amber },
    ],
  },

  // ── ATELIER ───────────────────────────────────────────
  {
    slug: 'atelier-obsidian',
    number: 'AT/I',
    name: 'Atelier I — Obsidian',
    collection: 'atelier',
    shape: 'oversized',
    material: 'acetate',
    price: 620,
    limited: true,
    edition: 300,
    left: 41,
    tagline: 'Volcanic black, iridescent glass.',
    description:
      'Twelve-millimetre acetate polished for thirty days, gold seven-barrel hinges and the full Vesper iridescent coating. 300 pieces, individually numbered.',
    specs: { lens: '57 mm', bridge: '19 mm', temple: '145 mm', weight: '38 g' },
    colorways: [
      { id: 'obsidian', name: 'Obsidian / Vesper iridescent', frame: { color: '#050505', pattern: 'solid' }, metal: 'gold', lens: lenses.violet },
    ],
  },
  {
    slug: 'atelier-champagne',
    number: 'AT/II',
    name: 'Atelier II — Champagne',
    collection: 'atelier',
    shape: 'cateye',
    material: 'acetate',
    price: 620,
    limited: true,
    edition: 300,
    left: 112,
    tagline: 'A toast, in crystal acetate.',
    description:
      'Champagne crystal acetate with a gold mirror that catches candlelight. Each frame arrives in a hand-stitched leather case.',
    specs: { lens: '54 mm', bridge: '17 mm', temple: '140 mm', weight: '29 g' },
    colorways: [
      { id: 'champagne', name: 'Champagne crystal / Gold mirror', frame: { color: '#e8d2a2', pattern: 'crystal' }, metal: 'gold', lens: lenses.gold },
    ],
  },
  {
    slug: 'atelier-lapis',
    number: 'AT/III',
    name: 'Atelier III — Lapis',
    collection: 'atelier',
    shape: 'round',
    material: 'acetate',
    price: 580,
    limited: true,
    edition: 300,
    left: 7,
    tagline: 'Deep blue, silver horizon.',
    description:
      'A thick round acetate in lapis blue with a silver mirror. Almost sold out.',
    specs: { lens: '50 mm', bridge: '21 mm', temple: '145 mm', weight: '30 g' },
    colorways: [
      { id: 'lapis', name: 'Lapis / Silver mirror', frame: { color: '#1b2c66', pattern: 'solid' }, metal: 'silver', lens: lenses.silver },
    ],
  },
];

export const LENS_UPGRADES = [
  { id: 'standard', name: 'Mineral glass, UV400', price: 0 },
  { id: 'polarized', name: 'Polarized mineral glass', price: 40 },
  { id: 'rx', name: 'Prescription-ready', price: 120 },
];

export const getProduct = (slug) => products.find((p) => p.slug === slug);
export const getCollection = (slug) => collections.find((c) => c.slug === slug);
export const productsIn = (slug) => products.filter((p) => p.collection === slug);
export const heroProduct = products.find((p) => p.hero);

export const SHAPE_LABELS = {
  wayfarer: 'Classic square',
  oversized: 'Oversized',
  cateye: 'Cat-eye',
  aviator: 'Aviator',
  round: 'Round',
};

export const formatPrice = (n) =>
  new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
