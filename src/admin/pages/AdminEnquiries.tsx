import React, { useEffect, useState } from 'react';
import { AlertCircle, Inbox, Check } from 'lucide-react';
import {
  adminGetEnquiries,
  adminSetEnquiryHandled,
  backendReady } from
'../../lib/admin-api';
import { formatDate } from '../../lib/format';
import { useToast } from '../../contexts/ToastContext';
import { Enquiry } from '../../types';
import { usePageMeta } from '../../hooks/usePageMeta';
import { SITE } from '../../data/site';

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
      if (res.ok && res.data) setEnquiries(res.data);else
      toast.error(res.message ?? 'Could not load enquiries.');
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markHandled = async (e: Enquiry, handled: boolean) => {
    setEnquiries((list) => list.map((x) => x.id === e.id ? { ...x, handled } : x));
    const result = await adminSetEnquiryHandled(e.id, handled);
    if (!result.ok) {
      setEnquiries((list) => list.map((x) => x.id === e.id ? { ...x, handled: e.handled } : x));
      toast.error(result.message ?? 'Could not update the enquiry.');
    }
  };

  if (!backendReady) {
    return (
      <div className="flex items-start gap-2.5 border border-line bg-surface-2 p-4 text-[13px] font-light leading-relaxed text-muted">
        <AlertCircle size={15} strokeWidth={1.5} className="mt-px shrink-0 text-accent" />
        Connect Supabase to see enquiries submitted from the contact and bespoke forms.
      </div>);

  }

  return (
    <div>
      <h1 className="font-serif text-2xl">Enquiries</h1>

      {loading ?
      <div className="mt-6 space-y-3">
          {Array.from({ length: 3 }).map((_, i) =>
        <div key={i} className="h-20 animate-pulse bg-surface-2" />
        )}
        </div> :
      enquiries.length === 0 ?
      <div className="mt-8 border border-line bg-surface p-10 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-line text-subtle">
            <Inbox size={19} strokeWidth={1.25} />
          </div>
          <p className="mt-5 font-serif text-xl">No enquiries yet</p>
          <p className="mx-auto mt-2 max-w-sm text-sm font-light text-muted">
            Messages from the contact and bespoke forms will show up here.
          </p>
        </div> :

      <ul className="mt-6 space-y-3">
          {enquiries.map((e) => {
            const isOpen = openId === e.id;
            return (
              <li key={e.id} className="border border-line bg-surface">
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : e.id)}
                  className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-left md:p-5">
                  
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5">
                      <p className="truncate text-ink">{e.name}</p>
                      <span className="shrink-0 border border-line px-2 py-0.5 text-[9px] uppercase tracking-widest text-subtle">
                        {typeLabel[e.type]}
                      </span>
                      {!e.handled &&
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                      }
                    </div>
                    <p className="mt-1 truncate text-[12px] text-subtle">{e.email}</p>
                  </div>
                  <p className="shrink-0 text-[11px] text-subtle">{formatDate(e.createdAt)}</p>
                </button>

                {isOpen &&
                <div className="border-t border-line p-4 md:p-5">
                    {e.subject &&
                  <p className="text-sm text-ink">{e.subject}</p>
                  }
                    <p className="mt-2 whitespace-pre-wrap text-sm font-light leading-relaxed text-muted">
                      {e.message}
                    </p>
                    {e.phone &&
                  <p className="mt-3 text-[11px] text-subtle">Phone: {e.phone}</p>
                  }
                    <div className="mt-4 flex flex-wrap gap-2">
                      <a
                      href={`mailto:${e.email}`}
                      className="border border-line px-3.5 py-2 text-[10px] uppercase tracking-widest text-muted transition-colors duration-200 hover:border-accent hover:text-accent">
                      
                        Reply by email
                      </a>
                      <button
                      type="button"
                      onClick={() => markHandled(e, !e.handled)}
                      className="inline-flex items-center gap-2 border border-line px-3.5 py-2 text-[10px] uppercase tracking-widest text-muted transition-colors duration-200 hover:border-accent hover:text-accent">
                      
                        <Check size={12} strokeWidth={1.5} />
                        {e.handled ? 'Mark as unhandled' : 'Mark as handled'}
                      </button>
                    </div>
                  </div>
                }
              </li>);

          })}
        </ul>
      }
    </div>);

}
