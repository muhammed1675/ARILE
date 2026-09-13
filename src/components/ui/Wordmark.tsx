import React from 'react';
import { Link } from 'react-router-dom';
import { SITE } from '../../data/site';

interface WordmarkProps {
  size?: 'sm' | 'md' | 'lg';
  withMotto?: boolean;
  asLink?: boolean;
  /** 'onPhoto' forces light text for use over an unscrimmed-by-theme hero image */
  tone?: 'default' | 'onPhoto';
}

const sizeMap = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-3xl'
};

const toneMap = {
  default: 'text-ink hover:text-accent',
  onPhoto: 'text-white hover:text-[#d9bd7f]'
};

export function Wordmark({ size = 'md', withMotto = false, asLink = true, tone = 'default' }: WordmarkProps) {
  const content =
  <span className="flex flex-col leading-none">
      <span className={`font-serif tracking-brand ${sizeMap[size]}`}>{SITE.name}</span>
      {withMotto &&
    <span className="mt-1.5 text-[9px] tracking-widest uppercase text-muted">
          {SITE.motto}
        </span>
    }
    </span>;


  if (!asLink) return content;

  return (
    <Link to="/" className={`transition-colors duration-200 ${toneMap[tone]}`}>
      {content}
    </Link>);

}
