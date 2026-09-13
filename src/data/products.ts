import { Product } from '../types';

/**
 * Seed catalogue. Used as a fallback whenever Supabase is not yet configured,
 * and as the source for `supabase/seed.sql`. Prices are in Naira (NGN).
 */
export const PRODUCTS: Product[] = [
{
  id: 'p-adewale',
  slug: 'adewale-royal-agbada',
  name: 'Adéwálé',
  meaning: 'The crown comes home',
  category: 'agbada',
  price: 850000,
  compareAtPrice: null,
  currency: 'NGN',
  images: ["/25a171c7-8609-4928-affa-2fdbec48c4b7.jpg", "/ebf6f988-dbab-4e87-8654-d92f07528128.jpg"],



  fabric: 'Handwoven silk aṣọ-òkè',
  embroidery: 'Hand-stitched gold thread',
  occasion: 'Weddings & coronations',
  description:
  'Our signature three-piece agbada, cut from handwoven silk aṣọ-òkè and finished with gold thread worked entirely by hand. The chest panel alone takes one artisan eleven days. Includes the flowing agbada, inner buba and matching sokoto.',
  colors: ['Ivory', 'Champagne'],
  variants: [
  { size: 'S', stock: 2 },
  { size: 'M', stock: 4 },
  { size: 'L', stock: 3 },
  { size: 'XL', stock: 2 },
  { size: 'XXL', stock: 1 }],

  availability: 'in_stock',
  leadTime: 'Ships in 3–5 days',
  featured: true
},
{
  id: 'p-oluwaseun',
  slug: 'oluwaseun-indigo-agbada',
  name: 'Olúwaseun',
  meaning: 'God has done it',
  category: 'agbada',
  price: 920000,
  compareAtPrice: 1050000,
  currency: 'NGN',
  images: ["/407fc6c4-8220-4ffe-9c04-80b22de5683b.jpg"],


  fabric: 'Italian cotton velvet',
  embroidery: 'Tonal geometric couching',
  occasion: 'Evening & state functions',
  description:
  'Deep indigo velvet with tonal embroidery that only reveals itself when the light moves across it. Restraint at its most expensive. Lined in breathable cotton for Lagos evenings.',
  colors: ['Indigo', 'Midnight'],
  variants: [
  { size: 'M', stock: 2 },
  { size: 'L', stock: 3 },
  { size: 'XL', stock: 2 }],

  availability: 'in_stock',
  leadTime: 'Ships in 3–5 days',
  featured: true
},
{
  id: 'p-oluwadara',
  slug: 'oluwadara-obsidian-agbada',
  name: 'Olúwadára',
  meaning: 'God is good',
  category: 'agbada',
  price: 780000,
  compareAtPrice: null,
  currency: 'NGN',
  images: ["/a8a3b81a-df16-44c4-acee-cb7511a297b7.jpg"],


  fabric: 'Jacquard damask',
  embroidery: 'Black-on-black relief work',
  occasion: 'Galas & ceremonies',
  description:
  'An all-black agbada where the pattern is felt before it is seen. Damask woven in relief, embroidered in the same tone, so the whole piece reads as texture rather than decoration.',
  colors: ['Obsidian'],
  variants: [
  { size: 'S', stock: 1 },
  { size: 'M', stock: 3 },
  { size: 'L', stock: 4 },
  { size: 'XL', stock: 2 }],

  availability: 'in_stock',
  leadTime: 'Ships in 3–5 days',
  featured: true
},
{
  id: 'p-bamidele',
  slug: 'bamidele-sand-kaftan',
  name: 'Bámidélé',
  meaning: 'Follow me home',
  category: 'kaftan',
  price: 340000,
  compareAtPrice: null,
  currency: 'NGN',
  images: ["/011dee82-292d-450d-8881-28f9d4f61650.jpg"],


  fabric: 'Washed Irish linen',
  embroidery: 'Cream chest panel, machine-guided by hand',
  occasion: 'Daywear & travel',
  description:
  'The everyday piece in the ARÍLÉ wardrobe. Washed linen that softens with each wear, cut a little longer through the body, with a discreet embroidered placket.',
  colors: ['Sand', 'Bone', 'Olive'],
  variants: [
  { size: 'S', stock: 5 },
  { size: 'M', stock: 8 },
  { size: 'L', stock: 6 },
  { size: 'XL', stock: 4 },
  { size: 'XXL', stock: 2 }],

  availability: 'in_stock',
  leadTime: 'Ships in 2–3 days',
  featured: true
},
{
  id: 'p-ifeoluwa',
  slug: 'ifeoluwa-buba-sokoto',
  name: 'Ìfẹ́olúwa',
  meaning: "God's love",
  category: 'buba',
  price: 420000,
  compareAtPrice: null,
  currency: 'NGN',
  images: ["/8f849734-696e-4395-836b-1b1c9b5e6312.jpg"],


  fabric: 'Handwoven aṣọ-òkè',
  embroidery: 'Fine gold trim at neck and cuff',
  occasion: 'Aṣọ-ẹbí & family ceremonies',
  description:
  'A two-piece buba and sokoto in cream aṣọ-òkè woven on a traditional narrow loom in Iseyin. Our most requested piece for aṣọ-ẹbí parties — we can produce it in quantity without losing the hand.',
  colors: ['Cream', 'Wheat'],
  variants: [
  { size: 'S', stock: 4 },
  { size: 'M', stock: 6 },
  { size: 'L', stock: 5 },
  { size: 'XL', stock: 3 }],

  availability: 'in_stock',
  leadTime: 'Ships in 2–3 days',
  featured: false
},
{
  id: 'p-ayanfe',
  slug: 'ayanfe-iro-buba',
  name: 'Àyànfẹ́',
  meaning: 'The chosen one',
  category: 'womens',
  price: 480000,
  compareAtPrice: null,
  currency: 'NGN',
  images: ["/22d1a6a6-8003-4017-ae93-65aa955739b3.jpg"],


  fabric: 'Burnt-ochre aṣọ-òkè',
  embroidery: 'Sculpted gele included',
  occasion: 'Weddings & introductions',
  description:
  'A modern iro and buba in burnt ochre, cut closer through the shoulder than tradition demands, with a pre-shaped gele so it sits correctly without a specialist.',
  colors: ['Burnt Ochre', 'Terracotta'],
  variants: [
  { size: 'UK 8', stock: 2 },
  { size: 'UK 10', stock: 4 },
  { size: 'UK 12', stock: 4 },
  { size: 'UK 14', stock: 3 },
  { size: 'UK 16', stock: 2 }],

  availability: 'in_stock',
  leadTime: 'Ships in 3–5 days',
  featured: true
},
{
  id: 'p-fila-oba',
  slug: 'fila-oba-burgundy',
  name: 'Fìlà Ọba',
  meaning: "The king's cap",
  category: 'accessories',
  price: 65000,
  compareAtPrice: null,
  currency: 'NGN',
  images: ["/3ded09ea-eab3-437a-945a-4a8a47e9c886.jpg"],


  fabric: 'Burgundy aṣọ-òkè',
  embroidery: 'Gold thread edge',
  occasion: 'Completes any set',
  description:
  'A hand-shaped fila in burgundy aṣọ-òkè with a gold thread edge. Structured enough to hold its fold, soft enough to wear all evening.',
  colors: ['Burgundy', 'Ivory', 'Obsidian'],
  variants: [
  { size: 'One Size', stock: 14 }],

  availability: 'in_stock',
  leadTime: 'Ships in 1–2 days',
  featured: false
}];


export const CATEGORY_LABELS: Record<string, string> = {
  all: 'Everything',
  agbada: 'Agbada',
  kaftan: 'Kaftan',
  buba: 'Buba & Sokoto',
  womens: "Women's",
  accessories: 'Accessories'
};

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}