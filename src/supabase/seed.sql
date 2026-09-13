-- =====================================================================
-- ARÍLÉ — seed catalogue
-- Run AFTER schema.sql. Mirrors data/products.ts so the live catalogue
-- matches what you see in preview.
-- =====================================================================

insert into public.products
  (id, slug, name, meaning, category, price, compare_at_price, images, fabric,
   embroidery, occasion, description, colors, variants, availability, lead_time, featured)
values
(
  'p-adewale', 'adewale-royal-agbada', 'Adéwálé', 'The crown comes home', 'agbada',
  850000, null,
  '["https://cdn.magicpatterns.com/patterns/generated-images/25a171c7-8609-4928-affa-2fdbec48c4b7.jpg","https://cdn.magicpatterns.com/patterns/generated-images/ebf6f988-dbab-4e87-8654-d92f07528128.jpg"]',
  'Handwoven silk aṣọ-òkè', 'Hand-stitched gold thread', 'Weddings & coronations',
  'Our signature three-piece agbada, cut from handwoven silk aṣọ-òkè and finished with gold thread worked entirely by hand. The chest panel alone takes one artisan eleven days. Includes the flowing agbada, inner buba and matching sokoto.',
  '["Ivory","Champagne"]',
  '[{"size":"S","stock":2},{"size":"M","stock":4},{"size":"L","stock":3},{"size":"XL","stock":2},{"size":"XXL","stock":1}]',
  'in_stock', 'Ships in 3–5 days', true
),
(
  'p-oluwaseun', 'oluwaseun-indigo-agbada', 'Olúwaseun', 'God has done it', 'agbada',
  920000, 1050000,
  '["https://cdn.magicpatterns.com/patterns/generated-images/407fc6c4-8220-4ffe-9c04-80b22de5683b.jpg"]',
  'Italian cotton velvet', 'Tonal geometric couching', 'Evening & state functions',
  'Deep indigo velvet with tonal embroidery that only reveals itself when the light moves across it. Restraint at its most expensive. Lined in breathable cotton for Lagos evenings.',
  '["Indigo","Midnight"]',
  '[{"size":"M","stock":2},{"size":"L","stock":3},{"size":"XL","stock":2}]',
  'in_stock', 'Ships in 3–5 days', true
),
(
  'p-oluwadara', 'oluwadara-obsidian-agbada', 'Olúwadára', 'God is good', 'agbada',
  780000, null,
  '["https://cdn.magicpatterns.com/patterns/generated-images/a8a3b81a-df16-44c4-acee-cb7511a297b7.jpg"]',
  'Jacquard damask', 'Black-on-black relief work', 'Galas & ceremonies',
  'An all-black agbada where the pattern is felt before it is seen. Damask woven in relief, embroidered in the same tone, so the whole piece reads as texture rather than decoration.',
  '["Obsidian"]',
  '[{"size":"S","stock":1},{"size":"M","stock":3},{"size":"L","stock":4},{"size":"XL","stock":2}]',
  'in_stock', 'Ships in 3–5 days', true
),
(
  'p-bamidele', 'bamidele-sand-kaftan', 'Bámidélé', 'Follow me home', 'kaftan',
  340000, null,
  '["https://cdn.magicpatterns.com/patterns/generated-images/011dee82-292d-450d-8881-28f9d4f61650.jpg"]',
  'Washed Irish linen', 'Cream chest panel, machine-guided by hand', 'Daywear & travel',
  'The everyday piece in the ARÍLÉ wardrobe. Washed linen that softens with each wear, cut a little longer through the body, with a discreet embroidered placket.',
  '["Sand","Bone","Olive"]',
  '[{"size":"S","stock":5},{"size":"M","stock":8},{"size":"L","stock":6},{"size":"XL","stock":4},{"size":"XXL","stock":2}]',
  'in_stock', 'Ships in 2–3 days', true
),
(
  'p-ifeoluwa', 'ifeoluwa-buba-sokoto', 'Ìfẹ́olúwa', 'God''s love', 'buba',
  420000, null,
  '["https://cdn.magicpatterns.com/patterns/generated-images/8f849734-696e-4395-836b-1b1c9b5e6312.jpg"]',
  'Handwoven aṣọ-òkè', 'Fine gold trim at neck and cuff', 'Aṣọ-ẹbí & family ceremonies',
  'A two-piece buba and sokoto in cream aṣọ-òkè woven on a traditional narrow loom in Iseyin. Our most requested piece for aṣọ-ẹbí parties — we can produce it in quantity without losing the hand.',
  '["Cream","Wheat"]',
  '[{"size":"S","stock":4},{"size":"M","stock":6},{"size":"L","stock":5},{"size":"XL","stock":3}]',
  'in_stock', 'Ships in 2–3 days', false
),
(
  'p-ayanfe', 'ayanfe-iro-buba', 'Àyànfẹ́', 'The chosen one', 'womens',
  480000, null,
  '["https://cdn.magicpatterns.com/patterns/generated-images/22d1a6a6-8003-4017-ae93-65aa955739b3.jpg"]',
  'Burnt-ochre aṣọ-òkè', 'Sculpted gele included', 'Weddings & introductions',
  'A modern iro and buba in burnt ochre, cut closer through the shoulder than tradition demands, with a pre-shaped gele so it sits correctly without a specialist.',
  '["Burnt Ochre","Terracotta"]',
  '[{"size":"UK 8","stock":2},{"size":"UK 10","stock":4},{"size":"UK 12","stock":4},{"size":"UK 14","stock":3},{"size":"UK 16","stock":2}]',
  'in_stock', 'Ships in 3–5 days', true
),
(
  'p-fila-oba', 'fila-oba-burgundy', 'Fìlà Ọba', 'The king''s cap', 'accessories',
  65000, null,
  '["https://cdn.magicpatterns.com/patterns/generated-images/3ded09ea-eab3-437a-945a-4a8a47e9c886.jpg"]',
  'Burgundy aṣọ-òkè', 'Gold thread edge', 'Completes any set',
  'A hand-shaped fila in burgundy aṣọ-òkè with a gold thread edge. Structured enough to hold its fold, soft enough to wear all evening.',
  '["Burgundy","Ivory","Obsidian"]',
  '[{"size":"One Size","stock":14}]',
  'in_stock', 'Ships in 1–2 days', false
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  price = excluded.price,
  images = excluded.images,
  variants = excluded.variants,
  featured = excluded.featured;
