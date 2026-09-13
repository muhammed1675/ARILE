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