import React, { useEffect, useState } from 'react';
import { AlertCircle, Mail, Send, Users } from 'lucide-react';
import { adminGetSubscribers, adminSendNewsletter, backendReady } from '../../lib/admin-api';
import { formatDate } from '../../lib/format';
import { usePageMeta } from '../../hooks/usePageMeta';
import { useToast } from '../../contexts/ToastContext';
import { SITE } from '../../data/site';
import { NewsletterSubscriber } from '../../types';
import { Card, CardHeader, CardTitle } from '../components/dashboard/ui';

const inputClass =
  'w-full rounded-lg border border-dash-border bg-dash-bg px-3.5 py-2.5 text-sm text-dash-fg ' +
  'placeholder:text-dash-muted-fg transition-colors duration-200 focus:border-dash-accent focus:outline-none';

export function AdminSubscribers() {
  usePageMeta(`Subscribers — ${SITE.name} Admin`);
  const toast = useToast();
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!backendReady) {
      setLoading(false);
      return;
    }
    adminGetSubscribers().then((res) => {
      if (res.ok && res.data) setSubscribers(res.data);
      else setError(res.message ?? 'Could not load subscribers.');
      setLoading(false);
    });
  }, []);

  const send = async () => {
    setConfirmOpen(false);
    setSending(true);
    const result = await adminSendNewsletter({ subject: subject.trim(), message: message.trim() });
    setSending(false);

    if (!result.ok) {
      toast.error(result.message ?? 'Could not send that message.');
      return;
    }
    toast.success(
      result.data?.sent
        ? `Sent to ${result.data.sent} subscriber${result.data.sent === 1 ? '' : 's'}.`
        : 'Nothing to send — the subscriber list is empty.'
    );
    setSubject('');
    setMessage('');
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error('Add a subject and a message before sending.');
      return;
    }
    setConfirmOpen(true);
  };

  if (!backendReady) {
    return (
      <div className="flex items-start gap-2.5 rounded-xl border border-dash-border bg-dash-surface p-4 text-sm leading-relaxed text-dash-muted-fg">
        <AlertCircle size={15} strokeWidth={1.5} className="mt-px shrink-0 text-dash-accent" />
        Connect Supabase to see who has subscribed and send them updates.
      </div>
    );
  }

  return (
    <div>
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-dash-fg">Subscribers</h1>
        <p className="mt-1 text-xs text-dash-muted-fg">
          Everyone who joined the mailing list from the site footer.
        </p>
      </div>

      {error && (
        <p className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-dash-destructive">
          <AlertCircle size={16} strokeWidth={1.5} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}

      <div className="mt-5 grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        {/* Subscriber list */}
        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle>{loading ? 'Subscribers' : `${subscribers.length} subscriber${subscribers.length === 1 ? '' : 's'}`}</CardTitle>
            <Users size={16} strokeWidth={1.5} className="text-dash-muted-fg" />
          </CardHeader>

          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-9 animate-pulse rounded-lg bg-dash-muted" />
              ))}
            </div>
          ) : subscribers.length === 0 ? (
            <div className="p-6 text-center">
              <div className="mx-auto grid h-11 w-11 place-items-center rounded-full border border-dash-border text-dash-muted-fg">
                <Mail size={17} strokeWidth={1.25} />
              </div>
              <p className="mt-4 text-sm font-medium text-dash-fg">No subscribers yet</p>
              <p className="mx-auto mt-1.5 max-w-[220px] text-xs text-dash-muted-fg">
                Emails collected from the newsletter form will show up here.
              </p>
            </div>
          ) : (
            <ul className="max-h-[420px] divide-y divide-dash-border overflow-y-auto">
              {subscribers.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <span className="truncate text-dash-fg">{s.email}</span>
                  <span className="shrink-0 text-[11px] text-dash-muted-fg">{formatDate(s.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Compose */}
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Send an update</CardTitle>
            <p className="mt-1 text-xs text-dash-muted-fg">
              Goes out to every subscriber above via email.
            </p>
          </CardHeader>

          <form onSubmit={onSubmit} className="space-y-4 p-4 sm:p-5">
            <div>
              <label htmlFor="ns-subject" className="mb-1.5 block text-[10px] uppercase tracking-widest text-dash-muted-fg">
                Subject
              </label>
              <input
                id="ns-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="New pieces just arrived"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="ns-message" className="mb-1.5 block text-[10px] uppercase tracking-widest text-dash-muted-fg">
                Message
              </label>
              <textarea
                id="ns-message"
                rows={8}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write what you'd like to tell your subscribers…"
                className={inputClass}
              />
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-dash-border pt-4">
              <p className="text-xs text-dash-muted-fg">
                {subscribers.length > 0
                  ? `This will email ${subscribers.length} subscriber${subscribers.length === 1 ? '' : 's'}.`
                  : 'No subscribers to send to yet.'}
              </p>
              <button
                type="submit"
                disabled={sending || subscribers.length === 0}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-dash-primary px-4 py-2.5 text-sm font-medium text-dash-primary-fg transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={15} strokeWidth={1.75} />
                {sending ? 'Sending…' : 'Send'}
              </button>
            </div>
          </form>
        </Card>
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl border border-dash-border bg-dash-surface p-5 shadow-xl">
            <h2 className="text-sm font-semibold text-dash-fg">Send to {subscribers.length} subscriber{subscribers.length === 1 ? '' : 's'}?</h2>
            <p className="mt-2 text-sm text-dash-muted-fg">
              This can&apos;t be undone once it&apos;s sent. Double-check the subject and message first.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="rounded-lg border border-dash-border px-4 py-2 text-sm font-medium text-dash-muted-fg transition-colors duration-150 hover:bg-dash-muted hover:text-dash-fg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={send}
                className="rounded-lg bg-dash-primary px-4 py-2 text-sm font-medium text-dash-primary-fg transition-opacity duration-200 hover:opacity-90"
              >
                Send now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
