import React from 'react';
import { Link } from 'react-router-dom';
import { classNames } from '../../lib/format';

type Variant = 'primary' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const base =
'inline-flex items-center justify-center gap-2 font-sans uppercase tracking-widest ' +
'transition-[background-color,border-color,color,transform] duration-200 ease-lux ' +
'disabled:opacity-45 disabled:cursor-not-allowed active:scale-[0.98] whitespace-nowrap';

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-accent-ink hover:bg-accent-hover border border-accent hover:border-accent-hover',
  outline: 'border border-accent text-accent hover:bg-accent hover:text-accent-ink',
  ghost: 'border border-line text-ink hover:border-accent hover:text-accent'
};

const sizes: Record<Size, string> = {
  sm: 'text-[10px] px-4 py-2.5',
  md: 'text-[11px] px-6 py-3.5',
  lg: 'text-xs px-8 py-4'
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
}

type ButtonProps = CommonProps &
React.ButtonHTMLAttributes<HTMLButtonElement> & {as?: 'button';};

type AnchorProps = CommonProps &
React.AnchorHTMLAttributes<HTMLAnchorElement> & {as: 'a';href: string;};

type LinkProps = CommonProps & {as: 'link';to: string;};

export function Button(props: ButtonProps | AnchorProps | LinkProps) {
  const { variant = 'primary', size = 'md', fullWidth, className, children } = props;
  const cls = classNames(
    base,
    variants[variant],
    sizes[size],
    fullWidth && 'w-full',
    className
  );

  if (props.as === 'link') {
    const { to } = props;
    return (
      <Link to={to} className={cls}>
        {children}
      </Link>);

  }

  if (props.as === 'a') {
    const { as: _as, variant: _v, size: _s, fullWidth: _f, className: _c, children: _ch, ...rest } =
    props;
    return (
      <a className={cls} {...rest}>
        {children}
      </a>);

  }

  const { as: _as, variant: _v, size: _s, fullWidth: _f, className: _c, children: _ch, ...rest } =
  props as ButtonProps;
  return (
    <button className={cls} {...rest}>
      {children}
    </button>);

}