import React from 'react';
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react';
import { classNames } from '../../../lib/format';

/** Plain white card shell used throughout the dashboard. Polymorphic via `as` (defaults to div). */
export function Card({
  as: Tag = 'div',
  className,
  children
}: {
  as?: 'div' | 'li';
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Tag
      className={classNames(
        'rounded-xl border border-dash-border bg-dash-surface',
        className
      )}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={classNames('border-b border-dash-border p-4 sm:p-5', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={classNames('text-sm font-semibold text-dash-fg', className)}>{children}</h3>;
}

type BadgeTone = 'neutral' | 'success' | 'warning' | 'destructive' | 'accent';

// Tinted via opacity modifiers on the dash-* tokens (rather than fixed
// Tailwind shades like `bg-green-50`) so every tone stays legible in both
// the light and dark admin themes instead of only the light one.
const badgeTones: Record<BadgeTone, string> = {
  neutral: 'bg-dash-muted text-dash-fg border-dash-border',
  success: 'bg-dash-success/10 text-dash-success border-dash-success/25',
  warning: 'bg-dash-warning/10 text-dash-warning border-dash-warning/25',
  destructive: 'bg-dash-destructive/10 text-dash-destructive border-dash-destructive/25',
  accent: 'bg-dash-accent/10 text-dash-accent border-dash-accent/25'
};

export function Badge({
  tone = 'neutral',
  children,
  className
}: {
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={classNames(
        'inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium',
        badgeTones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export interface StatCardData {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
  change?: number;
}

export function StatCard({ metric }: { metric: StatCardData }) {
  const Icon = metric.icon;
  const hasChange = typeof metric.change === 'number';
  const isPositive = (metric.change ?? 0) >= 0;
  const ChangeIcon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className="shadow-none">
      <div className="flex items-center gap-3 p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-dash-muted text-dash-fg">
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs text-dash-muted-fg">{metric.label}</p>
          <div className="mt-1 flex items-end gap-2">
            <strong className="text-xl font-semibold leading-none tracking-tight text-dash-fg">
              {metric.value}
            </strong>
            {hasChange && (
              <span
                className={classNames(
                  'inline-flex items-center text-[11px] font-medium',
                  isPositive ? 'text-dash-success' : 'text-dash-destructive'
                )}
              >
                <ChangeIcon className="mr-0.5 h-3 w-3" />
                {Math.abs(metric.change ?? 0)}%
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
