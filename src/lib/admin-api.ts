import { supabase, isSupabaseConfigured, functionsUrl } from './supabase';
import { Enquiry, NewsletterSubscriber, Order, OrderStatus, Product } from '../types';
import { ApiResult } from './api';

export const backendReady = isSupabaseConfigured;

/** Whether the given user has the admin flag set on their profile row. */
export async function checkIsAdmin(userId: string): Promise<boolean> {
  if (!supabase) return false;
  const { data, error } = await supabase.
  from('profiles').
  select('is_admin').
  eq('id', userId).
  maybeSingle();

  if (error || !data) return false;
  return Boolean(data.is_admin);
}

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapOrder(row: any): Order {
  return {
    id: row.id,
    reference: row.reference,
    status: row.status,
    total: Number(row.total),
    currency: 'NGN',
    items: row.items ?? [],
    customer: row.customer,
    createdAt: row.created_at
  };
}

export async function adminGetOrders(): Promise<ApiResult<Order[]>> {
  if (!supabase) return { ok: false, message: 'Connect Supabase to load orders.' };

  const { data, error } = await supabase.
  from('orders').
  select('*').
  order('created_at', { ascending: false });

  if (error) return { ok: false, message: error.message };
  return { ok: true, data: (data ?? []).map(mapOrder) };
}

export async function adminUpdateOrderStatus(
id: string,
status: OrderStatus)
: Promise<ApiResult> {
  if (!supabase) return { ok: false, message: 'Connect Supabase first.' };

  const { error } = await supabase.from('orders').update({ status }).eq('id', id);
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Products                                                            */
/* ------------------------------------------------------------------ */

function mapProduct(row: any): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    meaning: row.meaning ?? '',
    category: row.category,
    price: Number(row.price),
    compareAtPrice: row.compare_at_price !== null ? Number(row.compare_at_price) : null,
    currency: 'NGN',
    images: row.images ?? [],
    fabric: row.fabric ?? '',
    embroidery: row.embroidery ?? '',
    occasion: row.occasion ?? '',
    description: row.description ?? '',
    colors: row.colors ?? [],
    variants: row.variants ?? [],
    availability: row.availability,
    leadTime: row.lead_time ?? '',
    featured: Boolean(row.featured)
  };
}

export interface AdminProduct extends Product {
  isActive: boolean;
}

export async function adminGetProducts(): Promise<ApiResult<AdminProduct[]>> {
  if (!supabase) return { ok: false, message: 'Connect Supabase to manage the catalogue.' };

  const { data, error } = await supabase.
  from('products').
  select('*').
  order('created_at', { ascending: false });

  if (error) return { ok: false, message: error.message };
  return {
    ok: true,
    data: (data ?? []).map((row: any) => ({ ...mapProduct(row), isActive: Boolean(row.is_active) }))
  };
}

export async function adminSetProductActive(id: string, isActive: boolean): Promise<ApiResult> {
  if (!supabase) return { ok: false, message: 'Connect Supabase first.' };

  const { error } = await supabase.from('products').update({ is_active: isActive }).eq('id', id);
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export async function adminSetProductFeatured(id: string, featured: boolean): Promise<ApiResult> {
  if (!supabase) return { ok: false, message: 'Connect Supabase first.' };

  const { error } = await supabase.from('products').update({ featured }).eq('id', id);
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export interface ProductFormPayload {
  id: string;
  slug: string;
  name: string;
  meaning: string;
  category: Product['category'];
  price: number;
  compareAtPrice: number | null;
  images: string[];
  fabric: string;
  embroidery: string;
  occasion: string;
  description: string;
  colors: string[];
  variants: {size: string;stock: number;}[];
  availability: Product['availability'];
  leadTime: string;
  featured: boolean;
  isActive: boolean;
}

function toRow(p: ProductFormPayload) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    meaning: p.meaning,
    category: p.category,
    price: p.price,
    compare_at_price: p.compareAtPrice,
    currency: 'NGN',
    images: p.images,
    fabric: p.fabric,
    embroidery: p.embroidery,
    occasion: p.occasion,
    description: p.description,
    colors: p.colors,
    variants: p.variants,
    availability: p.availability,
    lead_time: p.leadTime,
    featured: p.featured,
    is_active: p.isActive
  };
}

export async function adminCreateProduct(payload: ProductFormPayload): Promise<ApiResult> {
  if (!supabase) return { ok: false, message: 'Connect Supabase first.' };

  const { error } = await supabase.from('products').insert(toRow(payload));
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export async function adminUpdateProduct(payload: ProductFormPayload): Promise<ApiResult> {
  if (!supabase) return { ok: false, message: 'Connect Supabase first.' };

  const { error } = await supabase.
  from('products').
  update(toRow(payload)).
  eq('id', payload.id);
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export async function adminDeleteProduct(id: string): Promise<ApiResult> {
  if (!supabase) return { ok: false, message: 'Connect Supabase first.' };

  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

/**
 * Uploads to the `products` Storage bucket (see setup.md §8 — create it,
 * set it Public, before this will work) and returns its public URL.
 */
export async function adminUploadProductImage(file: File): Promise<ApiResult<string>> {
  if (!supabase) return { ok: false, message: 'Connect Supabase first.' };

  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from('products').upload(path, file, {
    cacheControl: '3600',
    upsert: false
  });
  if (error) return { ok: false, message: error.message };

  const { data } = supabase.storage.from('products').getPublicUrl(path);
  return { ok: true, data: data.publicUrl };
}

/* ------------------------------------------------------------------ */
/* Enquiries                                                           */
/* ------------------------------------------------------------------ */

function mapEnquiry(row: any): Enquiry {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? null,
    subject: row.subject ?? null,
    message: row.message,
    type: row.type,
    handled: Boolean(row.handled),
    createdAt: row.created_at
  };
}

export async function adminGetEnquiries(): Promise<ApiResult<Enquiry[]>> {
  if (!supabase) return { ok: false, message: 'Connect Supabase to see enquiries.' };

  const { data, error } = await supabase.
  from('enquiries').
  select('*').
  order('created_at', { ascending: false });

  if (error) return { ok: false, message: error.message };
  return { ok: true, data: (data ?? []).map(mapEnquiry) };
}

export async function adminSetEnquiryHandled(id: string, handled: boolean): Promise<ApiResult> {
  if (!supabase) return { ok: false, message: 'Connect Supabase first.' };

  const { error } = await supabase.from('enquiries').update({ handled }).eq('id', id);
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Newsletter subscribers                                              */
/* ------------------------------------------------------------------ */

function mapSubscriber(row: any): NewsletterSubscriber {
  return {
    id: row.id,
    email: row.email,
    createdAt: row.created_at
  };
}

export async function adminGetSubscribers(): Promise<ApiResult<NewsletterSubscriber[]>> {
  if (!supabase) return { ok: false, message: 'Connect Supabase to see subscribers.' };

  const { data, error } = await supabase.
  from('newsletter_subscribers').
  select('*').
  order('created_at', { ascending: false });

  if (error) return { ok: false, message: error.message };
  return { ok: true, data: (data ?? []).map(mapSubscriber) };
}

export interface SendNewsletterPayload {
  subject: string;
  message: string;
}

/**
 * Invokes the `send-newsletter` Edge Function, which re-checks (server-side,
 * against the caller's own access token) that the requester is an admin
 * before emailing every subscriber via Resend — the anon key alone is never
 * enough to authorize a bulk send.
 */
export async function adminSendNewsletter(
  payload: SendNewsletterPayload
): Promise<ApiResult<{ sent: number }>> {
  if (!supabase) return { ok: false, message: 'Connect Supabase first.' };

  const endpoint = functionsUrl('send-newsletter');
  if (!endpoint) return { ok: false, message: 'Newsletter sending is not configured.' };

  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) return { ok: false, message: 'Your session has expired — sign in again.' };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (!res.ok) return { ok: false, message: data?.message ?? 'Could not send the newsletter.' };
    return { ok: true, data: { sent: data.sent ?? 0 } };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Network error sending the newsletter.'
    };
  }
}
