# ARÍLÉ — Setup Guide

**African wear, timeless you.**
A storefront for a Lagos atelier: React + TypeScript + Tailwind on the front, Supabase for data and auth, Korapay for payments, Resend for email.

---

## Table of contents

1. [What is already built](#1-what-is-already-built)
2. [Run it locally](#2-run-it-locally)
3. [Supabase — database & auth](#3-supabase--database--auth)
4. [Korapay — payments](#4-korapay--payments)
5. [Resend — transactional email](#5-resend--transactional-email)
6. [Deploy the Edge Functions](#6-deploy-the-edge-functions)
7. [Admin dashboard](#7-admin-dashboard)
8. [Go live checklist](#8-go-live-checklist)
9. [Managing the catalogue](#9-managing-the-catalogue)
10. [Project structure](#10-project-structure)
11. [Customising the brand](#11-customising-the-brand)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. What is already built

Everything below is finished and wired up. You only supply credentials.

**Pages**

| Route | Page |
|---|---|
| `/` | Home — hero, categories, featured pieces, story, bespoke, testimonials |
| `/shop` | Shop — category filters, sorting, responsive grid |
| `/shop/:slug` | Product detail — gallery, size/colour pickers, add to bag |
| `/story` | Our story — timeline, values |
| `/gallery` | Gallery — masonry grid with keyboard-navigable lightbox |
| `/bespoke` | Bespoke — three service tiers, size guide, enquiry form |
| `/contact` | Contact — details, message form, FAQ |
| `/cart` | Full bag |
| `/checkout` | Checkout — customer details, order summary, pay |
| `/order/:reference` | Order confirmation with live payment verification |
| `/track-order` | Look up any order by its reference — no account needed |
| `/account` | Sign in / sign up (email or Google), order history |
| `/privacy-policy` | Privacy policy |
| `/terms-conditions` | Terms & conditions |
| `*` | 404 |

**Features**

- Cart with `localStorage` persistence and a slide-out drawer
- Dark **and** light theme, remembered per visitor, respects OS preference on first visit
- Full responsive layout — mobile menu, mobile filter sheet, touch-friendly targets
- Supabase auth (email + password) with automatic profile creation
- Korapay checkout with both redirect verification **and** a signed webhook
- Resend emails: customer receipt, studio order alert, enquiry notifications
- Accessibility: skip link, focus rings, ARIA labels, semantic landmarks, reduced-motion support

**Graceful degradation:** with no `.env` at all, the site runs on bundled seed data. Browsing, cart and forms all work. Only payment and accounts need credentials.

---

## 2. Run it locally

```bash
# 1. install
npm install

# 2. create your env file
cp .env.example .env

# 3. start
npm run dev
```

Open <http://localhost:5173>.

At this point the storefront works with the seven seed products in `data/products.ts`. Continue below to connect the backend.

---

## 3. Supabase — database & auth

### 3.1 Create the project

1. Go to <https://supabase.com/dashboard> → **New project**
2. Choose a region close to Lagos — **EU (Frankfurt)** or **EU (Ireland)** give the best latency
3. Save the database password somewhere safe

### 3.2 Get your keys

**Project Settings → API**, copy:

| Value | Goes where |
|---|---|
| Project URL | `VITE_SUPABASE_URL` in `.env` |
| `anon` `public` key | `VITE_SUPABASE_ANON_KEY` in `.env` |
| `service_role` key | **Never in `.env`.** Edge Function secret only. |

Your `.env`:

```env
VITE_SUPABASE_URL=https://abcdefgh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Restart `npm run dev` after editing `.env`.

### 3.3 Create the tables

**SQL Editor → New query** → paste the whole of `supabase/schema.sql` → **Run**.

This creates `profiles`, `products`, `orders`, `enquiries` and `newsletter_subscribers`, turns on Row Level Security with sensible policies, and adds a trigger that creates a profile whenever someone signs up.

### 3.4 Seed the catalogue

**SQL Editor → New query** → paste `supabase/seed.sql` → **Run**.

Refresh the site. The shop is now reading from Supabase instead of the bundled file.

### 3.5 Turn on auth

**Authentication → Providers → Email** → make sure it is enabled.

- For testing, switch **Confirm email** off so you can sign in immediately
- For production, leave it on and set your **Site URL** under **Authentication → URL Configuration**

### 3.6 Turn on Google sign-in

The account page has a "Continue with Google" button already wired to Supabase — you
just need to switch the provider on.

1. In [Google Cloud Console](https://console.cloud.google.com/), create (or reuse) a
   project → **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   → type **Web application**.
2. Under **Authorized redirect URIs**, add:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
3. Copy the **Client ID** and **Client Secret** Google gives you.
4. In Supabase: **Authentication → Providers → Google** → toggle it on, paste the
   Client ID and Client Secret, **Save**.
5. Under **Authentication → URL Configuration**, make sure **Site URL** (and, once you
   have one, **Redirect URLs**) points at your real deployed domain — Google sends
   people back through Supabase, then Supabase redirects them to `/account` on
   whatever Site URL is configured there.

**About the phone number:** Google doesn't hand over a phone number, but every
account on this storefront needs one. So a customer who signs up with Google is
dropped on a one-field "add your phone number" screen right after their first
sign-in, before they can see the rest of `/account`. Email/password sign-up collects
it directly in the sign-up form instead, so those customers never see that extra
screen.

---

## 4. Korapay — payments

### 4.1 Get your keys

1. Sign up at <https://korapay.com> and complete business verification
2. **Settings → API Keys & Webhooks**
3. Copy your **Secret Key** (`sk_test_...` while testing, `sk_live_...` when live)

The secret key is set as a Supabase secret, **never** in `.env` — it must not reach the browser.

```bash
supabase secrets set KORAPAY_SECRET_KEY=sk_test_xxxxxxxxxxxx
supabase secrets set SITE_URL=http://localhost:5173
```

Change `SITE_URL` to your real domain when you deploy.

### 4.2 Register the webhook

In the Korapay dashboard, **Settings → API Keys & Webhooks → Webhook URL**:

```
https://<your-project-ref>.supabase.co/functions/v1/korapay-webhook
```

The webhook is the source of truth — it marks orders paid even if the customer closes the tab before being redirected back. Its signature is verified with HMAC SHA-256, so nobody can forge a payment.

### 4.3 How the payment flow works

```
Customer fills checkout
   ↓
Order saved to `orders` with status = pending
   ↓
create-payment  →  Korapay charge opened  →  customer redirected to Korapay
   ↓
Customer pays (card / bank transfer / USSD)
   ↓
┌──────────────────────────┬───────────────────────────────┐
│ Redirect back to         │ Webhook fires server-to-server │
│ /order/:reference        │ (works even if tab closed)     │
│ → verify-payment         │ → korapay-webhook              │
│ → status shown, emails   │ → order marked paid            │
└──────────────────────────┴───────────────────────────────┘
```

### 4.4 Test cards

Use Korapay's sandbox cards while `KORAPAY_SECRET_KEY` is a `sk_test_` key. Their current test card list is in the Korapay docs under **Testing**.

---

## 5. Resend — transactional email

### 5.1 Set up

1. Sign up at <https://resend.com>
2. **Domains → Add Domain**, add your sending domain and its DNS records
3. Wait for verification (usually minutes)
4. **API Keys → Create API Key**, copy it

### 5.2 Set the secrets

```bash
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxx
supabase secrets set "ORDER_EMAIL_FROM=ARÍLÉ <orders@yourdomain.com>"
supabase secrets set ORDER_EMAIL_TO=studio@yourdomain.com
```

- `ORDER_EMAIL_FROM` — must be on your verified domain
- `ORDER_EMAIL_TO` — where your team receives order and enquiry alerts

### 5.3 What gets sent

| Trigger | To customer | To studio |
|---|---|---|
| Payment succeeds | Branded receipt with items, totals, delivery address | Order alert |
| Contact / bespoke form | Acknowledgement | Full enquiry, reply-to set to the customer |

Email templates live inside the Edge Functions and use the ARÍLÉ ivory-and-gold styling. Edit them in `supabase/functions/*/index.ts`.

---

## 6. Deploy the Edge Functions

### 6.1 Install the CLI

```bash
npm install -g supabase
supabase login
supabase link --project-ref your-project-ref
```

Your project ref is the subdomain in your Supabase URL.

### 6.2 Confirm your secrets

```bash
supabase secrets list
```

You need all of these:

| Secret | Purpose |
|---|---|
| `KORAPAY_SECRET_KEY` | Open and verify charges |
| `RESEND_API_KEY` | Send email |
| `ORDER_EMAIL_FROM` | Sender address |
| `ORDER_EMAIL_TO` | Studio inbox |
| `SITE_URL` | Post-payment redirect target |

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically — you do not set those.

### 6.3 Deploy

```bash
supabase functions deploy create-payment      --no-verify-jwt
supabase functions deploy verify-payment      --no-verify-jwt
supabase functions deploy send-enquiry-email  --no-verify-jwt
supabase functions deploy korapay-webhook     --no-verify-jwt
```

`--no-verify-jwt` is required: guests check out without an account, and Korapay's webhook has no Supabase session.

### 6.4 Verify

```bash
curl -X POST \
  "https://<project-ref>.supabase.co/functions/v1/create-payment" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-anon-key>" \
  -d '{"reference":"TEST-001","amount":1000,"customer":{"fullName":"Test","email":"test@example.com"},"items":[]}'
```

A `checkoutUrl` in the response means everything is wired correctly.

---

## 7. Admin dashboard

A dashboard for managing orders, the catalogue and enquiries lives at **`/admin`** —
today that's `http://localhost:5173/admin` or `https://your-deploy-url/admin`.
It has its own sign-in and its own layout; storefront visitors never see it or its
link, and it needs Supabase to be connected (section 3) to show anything.

### 7.1 Give yourself access

1. Run `schema.sql` again (or just the **ADMIN ACCESS** section at the bottom) —
   it's safe to re-run and adds an `is_admin` flag to `profiles` plus the extra
   RLS policies admins need to read every order, product and enquiry instead of
   just their own.
2. Create a normal account through the storefront's `/account` page (or sign up
   at `/admin/login` — it uses the same Supabase auth).
3. In the Supabase SQL Editor, run:
   ```sql
   update public.profiles set is_admin = true
   where id = (select id from auth.users where email = 'you@example.com');
   ```
4. Sign in at `/admin/login`. You'll land on **Orders**, with **Products** and
   **Enquiries** alongside it.

What you can do there: move an order through its statuses, flip a product's
`featured` and `is_active` flags, and read/mark-handled every contact and
bespoke enquiry. Adding a brand-new product or editing its fabric, images and
size run is still done from the Supabase Table Editor (section 9) — the
dashboard doesn't duplicate that yet.

### 7.2 About `admin.yourdomain.com`

You don't need to own the domain to use the dashboard today — `/admin` already
works on whatever URL the site is running at (localhost now, your Vercel/Netlify
URL once deployed). A few options once you do buy the domain:

- **Simplest, and what's built in:** keep it as a path — `arile.ng/admin`. No
  extra DNS or hosting config, works the moment the main domain is live, and
  the login screen is exactly as secure either way.
- **A real subdomain later:** add a DNS record for `admin.arile.ng` pointing at
  the same deployment (on Vercel: add `admin.arile.ng` as another domain on the
  *same* project) and it will serve the same app — visiting `admin.arile.ng`
  would land on the storefront's home page, not `/admin`, unless you also add a
  rewrite so that subdomain's `/` maps to `/admin`. That's a hosting-config
  change, not a code change.
- **A fully separate deployment:** point `admin.arile.ng` at its own Vercel/Netlify
  project built from the same repo, and change that project's router to treat
  `/` as the admin dashboard. More setup, only worth it if the admin side grows
  a lot.

Nothing above needs to happen before launch — ship with `/admin` and revisit the
subdomain later if it's worth the DNS change.

---

## 8. Go live checklist

- [ ] `schema.sql` run, `seed.sql` run
- [ ] `.env` has both `VITE_` Supabase values
- [ ] All five Edge Function secrets set
- [ ] All four functions deployed
- [ ] Korapay webhook URL registered and saved
- [ ] Resend domain verified, test email received
- [ ] Swapped `sk_test_` → `sk_live_` in `KORAPAY_SECRET_KEY`
- [ ] `SITE_URL` points at your production domain
- [ ] Supabase **Authentication → URL Configuration → Site URL** set to your domain
- [ ] Real product photos uploaded, seed images replaced
- [ ] `data/site.ts` updated with your real phone, email, address and socials
- [ ] Placed one real low-value order end to end and confirmed both emails arrived

### Deploying the frontend

Any static host works. For Vercel or Netlify:

- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Environment variables:** add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

Because the app uses client-side routing, add a rewrite so every path serves `index.html`:

*Netlify — `public/_redirects`*
```
/*  /index.html  200
```

*Vercel — `vercel.json`*
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

---

## 9. Managing the catalogue

### Adding, editing or removing a product

Sign in at `/admin` (see §7 to make your account an admin) → **Products → New
piece**. You can upload photos straight from that form — drag in files, set the
price, sizes and stock, mark it Featured or hide it from the shop — no SQL needed.
The old approach (editing rows directly in **Table Editor → products**) still
works if you ever need to bulk-edit, but the admin form is the normal way to do
this day to day now.

**One-time setup this needs — the photo uploader talks to Supabase Storage:**

1. **Storage → New bucket** named `products`, set it **Public**.
2. Re-run `schema.sql` (it's idempotent) — it adds the policy that lets admin
   accounts upload to that bucket. Skipping this step means uploads fail with a
   permissions error even though the bucket exists.

Shoot portrait (3:4) against a consistent backdrop — the grid assumes that ratio.

**Categories:** `agbada`, `kaftan`, `buba`, `womens`, `accessories`, `fabric` —
that last one is for adire material sold by the yard rather than a finished
garment. If your Supabase project's `products` table was created before this
category existed, run this once to allow it:

```sql
alter table public.products drop constraint products_category_check;
alter table public.products add constraint products_category_check
  check (category in ('agbada','kaftan','buba','womens','accessories','fabric'));
```

### Managing orders

**`/admin` → Orders.** Click any row to see the items and shipping address, and
move `status` through `paid → in_production → shipped → delivered` as work
progresses — customers see this update on their account page and on
`/track-order`. Table Editor works too, but the admin page is easier since it
shows you what's actually in the order.

---

## 10. Project structure

```
App.tsx                     Routes and providers
index.css                   Design tokens (dark + light), fonts, base styles
tailwind.config.js          Semantic colour scale mapped to CSS variables

components/
  layout/                   Navigation, Footer, Layout shell
  home/                     Hero, CategoryStrip, FeaturedProducts,
                            StorySection, BespokeBanner, Testimonials
  shop/ProductCard.tsx      Product tile used across the site
  cart/CartDrawer.tsx       Slide-out bag
  ui/                       Button, Reveal, SectionHeading, ThemeToggle, Wordmark

contexts/
  ThemeContext.tsx          Dark/light, persisted
  CartContext.tsx           Cart state, persisted
  AuthContext.tsx           Supabase session

hooks/
  useProducts.ts            Supabase catalogue with seed-data fallback
  usePageMeta.ts            Per-route title and description

lib/
  supabase.ts               Client (null when unconfigured)
  api.ts                    Orders, enquiries, newsletter
  korapay.ts                Payment init + verification
  format.ts                 Naira formatting, order references

data/
  site.ts                   Brand details, nav, key images
  products.ts               Seed catalogue
  gallery.ts                Gallery items

pages/                      One file per route

supabase/
  schema.sql                Tables, RLS, triggers
  seed.sql                  Seed catalogue
  functions/
    create-payment/         Opens a Korapay charge
    verify-payment/         Confirms payment, sends receipts
    send-enquiry-email/     Contact & bespoke notifications
    korapay-webhook/        Signed server-to-server confirmation
```

---

## 11. Customising the brand

### Colours

All colour lives in `index.css` as RGB triplets, once for each theme:

```css
:root[data-theme='dark'] {
  --c-canvas: 12 11 10;      /* page background   */
  --c-accent: 201 169 97;    /* antique gold      */
}
:root[data-theme='light'] {
  --c-canvas: 250 246 238;   /* warm ivory        */
  --c-accent: 138 109 47;    /* deepened gold     */
}
```

The gold is intentionally **darker in light mode** so it still passes contrast on ivory. If you change the accent, change both — and check text on it stays readable.

Use them in components as `bg-canvas`, `text-ink`, `text-muted`, `border-line`, `text-accent`, with opacity modifiers like `text-ink/70`.

### Typography

Fonts are imported at the top of `index.css`: **Cormorant Garamond** for display, **Inter** for UI. Swap the `@import` and the `fontFamily` block in `tailwind.config.js` together.

### Brand details

`data/site.ts` holds the name, motto, email, phone, WhatsApp number, address, opening hours and social links. Change them there and they update everywhere, including the email footers.

---

## 12. Troubleshooting

**Products do not change after editing Supabase**
`useProducts` falls back to seed data when the query returns nothing. Check `is_active = true` and that RLS is on with the `products_public_read` policy present.

**"Payments are not connected yet" at checkout**
`.env` is missing a `VITE_SUPABASE_*` value, or the dev server was not restarted after editing it. Vite only reads `.env` at startup.

**Korapay returns 401**
Wrong or stale secret key. Re-run `supabase secrets set KORAPAY_SECRET_KEY=...` then redeploy the two payment functions — secrets are baked in at deploy time.

**Webhook returns "Invalid signature"**
The secret key set in Supabase differs from the one generating the webhook. Make sure both are the same mode — test with test, live with live.

**No emails arriving**
Check `supabase functions logs verify-payment`. Usually the sending domain is unverified in Resend, or `ORDER_EMAIL_FROM` uses a domain you have not added.

**Refreshing `/shop` gives a 404 in production**
Client-side routing needs the rewrite rule from §7.

**Theme flickers on first paint**
The theme is applied in a `useEffect`. To eliminate the flash entirely, add this to `index.html` inside `<head>`:

```html
<script>
  (function () {
    var t = localStorage.getItem('arile-theme');
    if (!t) t = matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', t);
  })();
</script>
```

---

## Support

- Supabase — <https://supabase.com/docs>
- Korapay — <https://developers.korapay.com>
- Resend — <https://resend.com/docs>

Built by [MGRAPHIX_WEB](https://www.mgraphixweb.site)
