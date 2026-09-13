import React, { ReactNode } from 'react';
import { Reveal } from './Reveal';
import { classNames } from '../../lib/format';

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  align?: 'left' | 'center';
  aside?: ReactNode;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  aside,
  className
}: SectionHeadingProps) {
  return (
    <Reveal
      className={classNames(
        'flex flex-col gap-6 md:flex-row md:items-end md:justify-between',
        align === 'center' && 'md:flex-col md:items-center text-center',
        className
      )}>
      
      <div className={classNames('max-w-2xl', align === 'center' && 'mx-auto')}>
        {eyebrow &&
        <div
          className={classNames(
            'flex items-center gap-3 mb-5',
            align === 'center' && 'justify-center'
          )}>
          
            <span className="h-px w-8 bg-accent" aria-hidden="true" />
            <span className="text-[10px] tracking-widest uppercase text-accent">
              {eyebrow}
            </span>
          </div>
        }
        <h2 className="font-serif text-[2.15rem] leading-[1.08] sm:text-4xl md:text-5xl text-balance">
          {title}
        </h2>
        {description &&
        <p className="mt-5 text-sm md:text-base font-light leading-relaxed text-muted max-w-xl">
            {description}
          </p>
        }
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </Reveal>);

}