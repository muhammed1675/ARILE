import { supabase, functionsUrl, isSupabaseConfigured } from './supabase';
import { SUPABASE_ANON_KEY } from './env';
import { CartLine, CustomerDetails, Order } from '../types';

export interface ApiResult<T = undefined> {
  ok: boolean;
  message?: string;
  data?: T;
}

/* ------------------------------------------------------------------ */
/* Newsletter                                                          */
/* ------------------------------------------------------------------ */

export async function subscribeToNewsletter(email: string): Promise<ApiResult> {
  if (!supabase) {
    // No backend yet — accept optimistically so the UI stays usable in preview.
    return { ok: true };
  }

  const { error } = await supabase.
  from('newsletter_subscribers').
  insert({ email }).
  select().
  single();

  if (error) {
    // Unique violation means they're already subscribed — treat as success.
    if (error.code === '23505') return { ok: true };
    return { ok: false, message: error.message };
  }

  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Contact / bespoke enquiries                                         */
/* ------------------------------------------------------------------ */

export interface EnquiryPayload {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  type: 'general' | 'bespoke' | 'aso_ebi';
}

export async function submitEnquiry(payload: EnquiryPayload): Promise<ApiResult> {
  if (!supabase) {
    return {
      ok: false,
      message: 'Messaging is not connected yet. Reach us on WhatsApp in the meantime.'
    };
  }

  const { error } = await supabase.from('enquiries').insert({
    name: payload.name,
    email: payload.email,
    phone: payload.phone ?? null,
    subject: payload.subject,
    message: payload.message,
    type: payload.type
  });

  if (error) return { ok: false, message: error.message };

  // Fire the notification email; a failure here should not block the customer.
  const endpoint = functionsUrl('send-enquiry-email');
  if (endpoint) {
    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_ANON_KEY ?? ''}`
        },
        body: JSON.stringify(payload)
      });
    } catch {

      /* non-blocking */}
  }

  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

export interface CreateOrderPayload {
  reference: string;
  items: CartLine[];
  customer: CustomerDetails;
  subtotal: number;
  shipping: number;
  total: number;
  userId?: string | null;
}

export async function createOrder(payload: CreateOrderPayload): Promise<ApiResult> {
  if (!supabase) {
    return { ok: true }; // preview mode — proceed to the demo confirmation
  }

  const { error } = await supabase.from('orders').insert({
    reference: payload.reference,
    user_id: payload.userId ?? null,
    status: 'pending',
    currency: 'NGN',
    subtotal: payload.subtotal,
    shipping: payload.shipping,
    total: payload.total,
    items: payload.items,
    customer: payload.customer
  });

  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export async function getOrderByReference(reference: string): Promise<ApiResult<Order>> {
  if (!supabase) return { ok: false, message: 'Orders are not connected yet.' };

  const { data, error } = await supabase.
  from('orders').
  select('*').
  eq('reference', reference).
  maybeSingle();

  if (error) return { ok: false, message: error.message };
  if (!data) return { ok: false, message: 'Order not found.' };

  return {
    ok: true,
    data: {
      id: data.id,
      reference: data.reference,
      status: data.status,
      total: Number(data.total),
      currency: 'NGN',
      items: data.items ?? [],
      customer: data.customer,
      createdAt: data.created_at
    }
  };
}

export async function getMyOrders(userId: string): Promise<ApiResult<Order[]>> {
  if (!supabase) return { ok: false, message: 'Orders are not connected yet.' };

  const { data, error } = await supabase.
  from('orders').
  select('*').
  eq('user_id', userId).
  order('created_at', { ascending: false });

  if (error) return { ok: false, message: error.message };

  return {
    ok: true,
    /* eslint-disable @typescript-eslint/no-explicit-any */
    data: (data ?? []).map((row: any) => ({
      id: row.id,
      reference: row.reference,
      status: row.status,
      total: Number(row.total),
      currency: 'NGN' as const,
      items: row.items ?? [],
      customer: row.customer,
      createdAt: row.created_at
    }))
  };
}

export const backendReady = isSupabaseConfigured;

/* ------------------------------------------------------------------ */
/* Profile                                                             */
/* ------------------------------------------------------------------ */

export interface ProfilePayload {
  fullName: string;
  phone: string;
}

export interface ProfileRecord {
  fullName: string;
  phone: string;
}

export async function getMyProfile(userId: string): Promise<ApiResult<ProfileRecord>> {
  if (!supabase) return { ok: false, message: 'Accounts are not connected yet.' };

  const { data, error } = await supabase.
  from('profiles').
  select('full_name, phone').
  eq('id', userId).
  maybeSingle();

  if (error) return { ok: false, message: error.message };
  return {
    ok: true,
    data: { fullName: data?.full_name ?? '', phone: data?.phone ?? '' }
  };
}

export async function updateMyProfile(
userId: string,
payload: ProfilePayload)
: Promise<ApiResult> {
  if (!supabase) return { ok: false, message: 'Accounts are not connected yet.' };

  const { error } = await supabase.
  from('profiles').
  update({ full_name: payload.fullName, phone: payload.phone }).
  eq('id', userId);

  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Addresses                                                           */
/* ------------------------------------------------------------------ */

export interface AddressRecord {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  isDefault: boolean;
}

export interface AddressPayload {
  label: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  isDefault: boolean;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapAddress(row: any): AddressRecord {
  return {
    id: row.id,
    label: row.label,
    fullName: row.full_name,
    phone: row.phone,
    address: row.address,
    city: row.city,
    state: row.state,
    country: row.country,
    isDefault: row.is_default
  };
}

export async function getMyAddresses(userId: string): Promise<ApiResult<AddressRecord[]>> {
  if (!supabase) return { ok: false, message: 'Accounts are not connected yet.' };

  const { data, error } = await supabase.
  from('addresses').
  select('*').
  eq('user_id', userId).
  order('is_default', { ascending: false }).
  order('created_at', { ascending: false });

  if (error) return { ok: false, message: error.message };
  return { ok: true, data: (data ?? []).map(mapAddress) };
}

export async function addAddress(
userId: string,
payload: AddressPayload)
: Promise<ApiResult<AddressRecord>> {
  if (!supabase) return { ok: false, message: 'Accounts are not connected yet.' };

  const { data, error } = await supabase.
  from('addresses').
  insert({
    user_id: userId,
    label: payload.label,
    full_name: payload.fullName,
    phone: payload.phone,
    address: payload.address,
    city: payload.city,
    state: payload.state,
    country: payload.country,
    is_default: payload.isDefault
  }).
  select().
  single();

  if (error) return { ok: false, message: error.message };
  return { ok: true, data: mapAddress(data) };
}

export async function updateAddress(
id: string,
payload: AddressPayload)
: Promise<ApiResult> {
  if (!supabase) return { ok: false, message: 'Accounts are not connected yet.' };

  const { error } = await supabase.
  from('addresses').
  update({
    label: payload.label,
    full_name: payload.fullName,
    phone: payload.phone,
    address: payload.address,
    city: payload.city,
    state: payload.state,
    country: payload.country,
    is_default: payload.isDefault
  }).
  eq('id', id);

  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export async function deleteAddress(id: string): Promise<ApiResult> {
  if (!supabase) return { ok: false, message: 'Accounts are not connected yet.' };

  const { error } = await supabase.from('addresses').delete().eq('id', id);
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Wishlist                                                             */
/* ------------------------------------------------------------------ */

export async function getMyWishlistIds(userId: string): Promise<ApiResult<string[]>> {
  if (!supabase) return { ok: false, message: 'Accounts are not connected yet.' };

  const { data, error } = await supabase.
  from('wishlist_items').
  select('product_id').
  eq('user_id', userId);

  if (error) return { ok: false, message: error.message };
  return { ok: true, data: (data ?? []).map((row) => row.product_id as string) };
}

export async function addToWishlist(userId: string, productId: string): Promise<ApiResult> {
  if (!supabase) return { ok: false, message: 'Accounts are not connected yet.' };

  const { error } = await supabase.
  from('wishlist_items').
  insert({ user_id: userId, product_id: productId });

  // Already saved — treat as success rather than an error.
  if (error && error.code !== '23505') return { ok: false, message: error.message };
  return { ok: true };
}

export async function removeFromWishlist(
userId: string,
productId: string)
: Promise<ApiResult> {
  if (!supabase) return { ok: false, message: 'Accounts are not connected yet.' };

  const { error } = await supabase.
  from('wishlist_items').
  delete().
  eq('user_id', userId).
  eq('product_id', productId);

  if (error) return { ok: false, message: error.message };
  return { ok: true };
}