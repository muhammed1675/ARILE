import React, { useEffect, useState } from 'react';
import { AlertCircle, Inbox, Check } from 'lucide-react';
import { adminGetEnquiries, adminSetEnquiryHandled, backendReady } from '../../lib/admin-api';
import { formatDate } from '../../lib/format';
import { useToast } from '../../contexts/ToastContext';
import { Enquiry } from '../../types';
import { usePageMeta } from '../../hooks/usePageMeta';
import { SITE } from '../../data/site';
import { Badge, Card } from '../components/dashboard/ui';

const typeLabel: Record<Enquiry['type'], string> = {
  general: 'General',
  bespoke: 'Bespoke',
  aso_ebi: 'Aṣọ-ẹbí'
};

export function AdminEnquiries() {
  usePageMeta(`Enquiries — ${SITE.name} Admin`);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    adminGetEnquiries().then((res) => {
      if (res.ok && res.data) setEnquiries(res.data);
      else toast.error(res.message ?? 'Could not load enquiries.');
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markHandled = async (e: Enquiry, handled: boolean) => {
    setEnquiries((list) => list.map((x) => (x.id === e.id ? { ...x, handled } : x)));
    const result = await adminSetEnquiryHandled(e.id, handled);
    if (!result.ok) {
      setEnquiries((list) => list.map((x) => (x.id === e.id ? { ...x, handled: e.handled } : x)));
      toast.error(result.message ?? 'Could not update the enquiry.');
    }
  };

  if (!backendReady) {
    return (
      <div className="flex items-start gap-2.5 rounded-xl border border-dash-border bg-dash-surface p-4 text-sm leading-relaxed text-dash-muted-fg">
        <AlertCircle size={15} strokeWidth={1.5} className="mt-px shrink-0 text-dash-accent" />
        Connect Supabase to see enquiries submitted from the contact and bespoke forms.
      </div>
    );
  }

  return (
    <div>
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-dash-fg">Enquiries</h1>
        <p className="mt-1 text-xs text-dash-muted-fg">Messages from the contact and bespoke forms.</p>
      </div>

      {loading ? (
        <div className="mt-5 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-dash-muted" />
          ))}
        </div>
      ) : enquiries.length === 0 ? (
        <Card className="mt-6 p-10 text-center shadow-none">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-dash-border text-dash-muted-fg">
            <Inbox size={19} strokeWidth={1.25} />
          </div>
          <p className="mt-5 text-lg font-semibold text-dash-fg">No enquiries yet</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-dash-muted-fg">
            Messages from the contact and bespoke forms will show up here.
          </p>
        </Card>
      ) : (
        <ul className="mt-5 space-y-3">
          {enquiries.map((e) => {
            const isOpen = openId === e.id;
            return (
              <Card as="li" key={e.id} className="overflow-hidden shadow-none">
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : e.id)}
                  className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-left sm:p-5"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5">
                      <p className="truncate font-medium text-dash-fg">{e.name}</p>
                      <Badge tone="neutral">{typeLabel[e.type]}</Badge>
                      {!e.handled && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-dash-accent" aria-hidden="true" />}
                    </div>
                    <p className="mt-1 truncate text-xs text-dash-muted-fg">{e.email}</p>
                  </div>
                  <p className="shrink-0 text-[11px] text-dash-muted-fg">{formatDate(e.createdAt)}</p>
                </button>

                {isOpen && (
                  <div className="border-t border-dash-border p-4 sm:p-5">
                    {e.subject && <p className="text-sm font-medium text-dash-fg">{e.subject}</p>}
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-dash-fg">{e.message}</p>
                    {e.phone && <p className="mt-3 text-[11px] text-dash-muted-fg">Phone: {e.phone}</p>}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <a
                        href={`mailto:${e.email}`}
                        className="rounded-lg border border-dash-border px-3.5 py-2 text-xs font-medium text-dash-fg transition-colors duration-200 hover:border-dash-accent hover:text-dash-accent"
                      >
                        Reply by email
                      </a>
                      <button
                        type="button"
                        onClick={() => markHandled(e, !e.handled)}
                        className="inline-flex items-center gap-2 rounded-lg border border-dash-border px-3.5 py-2 text-xs font-medium text-dash-fg transition-colors duration-200 hover:border-dash-accent hover:text-dash-accent"
                      >
                        <Check size={12} strokeWidth={1.5} />
                        {e.handled ? 'Mark as unhandled' : 'Mark as handled'}
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </ul>
      )}
    </div>
  );
}
