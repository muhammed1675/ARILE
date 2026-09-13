/** Format a Naira amount for display, e.g. 850000 -> "₦850,000". */
export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
}

/** Korapay expects the smallest currency unit (kobo). */
export function toKobo(amountInNaira: number): number {
  return Math.round(amountInNaira * 100);
}

/** Generate a human-readable order reference, e.g. "ARILE-8F3K2Q". */
export function generateReference(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return `ARILE-${out}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

export function classNames(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ');
}