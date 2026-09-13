import { supabase, isSupabaseConfigured } from './supabase';
import { Enquiry, Order, OrderStatus, Product } from '../types';
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
