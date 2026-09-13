import { functionsUrl, isSupabaseConfigured } from './supabase';
import { SUPABASE_ANON_KEY } from './env';
import { CartLine, CustomerDetails } from '../types';

export interface InitialisePaymentPayload {
  reference: string;
  amount: number; // Naira
  customer: CustomerDetails;
  items: CartLine[];
}

export interface InitialisePaymentResult {
  ok: boolean;
  checkoutUrl?: string;
  message?: string;
}

/**
 * Ask the `create-payment` Edge Function to open a Korapay charge.
 * The secret key never touches the browser — it lives in Supabase secrets.
 */
export async function initialisePayment(
payload: InitialisePaymentPayload)
: Promise<InitialisePaymentResult> {
  const endpoint = functionsUrl('create-payment');

  if (!isSupabaseConfigured || !endpoint) {
    return {
      ok: false,
      message:
      'Payments are not connected yet. Add your Supabase and Korapay keys to enable checkout.'
    };
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY ?? ''}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      return { ok: false, message: data?.message ?? 'Unable to start payment.' };
    }

    return { ok: true, checkoutUrl: data.checkoutUrl };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Network error starting payment.'
    };
  }
}

export interface VerifyPaymentResult {
  ok: boolean;
  status?: 'success' | 'pending' | 'failed';
  message?: string;
}

/** Confirm a charge after Korapay redirects the customer back. */
export async function verifyPayment(reference: string): Promise<VerifyPaymentResult> {
  const endpoint = functionsUrl('verify-payment');

  if (!isSupabaseConfigured || !endpoint) {
    return { ok: false, message: 'Payment verification is not configured.' };
  }

  try {
    const res = await fetch(`${endpoint}?reference=${encodeURIComponent(reference)}`, {
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY ?? ''}`
      }
    });
    const data = await res.json();

    if (!res.ok) {
      return { ok: false, message: data?.message ?? 'Could not verify payment.' };
    }

    return { ok: true, status: data.status };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Network error verifying payment.'
    };
  }
}