export const SITE = {
  name: 'ARÍLÉ',
  // Update once the real domain is live — used in robots.txt, sitemap.xml,
  // and canonical/Open Graph tags. Using the Vercel URL as a safe default.
  url: 'https://arile.vercel.app',
  motto: 'African wear, timeless you.',
  tagline: 'Handcrafted African wear from Lagos',
  description:
  'ARÍLÉ is a Lagos atelier making handcrafted African wear — agbada, kaftan, buba and ceremonial pieces — cut for the people who carry heritage forward.',
  email: 'hello@arile.ng',
  phone: '+234 801 234 5678',
  whatsapp: '2348012345678',
  address: 'Victoria Island, Lagos, Nigeria',
  hours: 'Tuesday – Saturday · 11am – 7pm WAT',
  socials: [
  { label: 'Instagram', href: 'https://instagram.com' },
  { label: 'TikTok', href: 'https://tiktok.com' },
  { label: 'Pinterest', href: 'https://pinterest.com' }],

  builder: {
    label: 'MGRAPHIX_WEB',
    href: 'https://www.mgraphixweb.site'
  }
} as const;

export const NAV_LINKS = [
{ label: 'Shop', to: '/shop' },
{ label: 'Our Story', to: '/story' },
{ label: 'Gallery', to: '/gallery' },
{ label: 'Bespoke', to: '/bespoke' },
{ label: 'Contact', to: '/contact' }] as
const;

export const HERO_IMAGE = "/b95a74ab-01f3-4dc5-add4-a55d6b5c1bf0.jpg";


export const ATELIER_IMAGE = "/2c26e6ec-4b93-4983-8df2-fef1ede5672f.jpg";


export const FABRIC_IMAGE = "/ebf6f988-dbab-4e87-8654-d92f07528128.jpg";


export const NIGERIAN_STATES = [
'Abia', 'Abuja (FCT)', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi',
'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo',
'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'];