export type Category = 'agbada' | 'kaftan' | 'buba' | 'womens' | 'accessories' | 'fabric';

export type Availability = 'in_stock' | 'made_to_order' | 'sold_out';

export interface ProductVariant {
  size: string;
  stock: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  meaning: string;
  category: Category;
  price: number;
  compareAtPrice: number | null;
  currency: 'NGN';
  images: string[];
  fabric: string;
  embroidery: string;
  occasion: string;
  description: string;
  colors: string[];
  variants: ProductVariant[];
  availability: Availability;
  leadTime: string;
  featured: boolean;
}

export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
}

export type OrderStatus =
'pending' |
'paid' |
'in_production' |
'shipped' |
'delivered' |
'cancelled';

export interface CustomerDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  notes?: string;
}

export interface Order {
  id: string;
  reference: string;
  status: OrderStatus;
  total: number;
  currency: 'NGN';
  items: CartLine[];
  customer: CustomerDetails;
  createdAt: string;
}

export interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  src: string;
  poster?: string;
  caption: string;
  span: string;
}

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  type: 'general' | 'bespoke' | 'aso_ebi';
  handled: boolean;
  createdAt: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  createdAt: string;
}
