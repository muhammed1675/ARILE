import { SITE } from '../../data/site';

interface PreloaderProps {
  /** 0–100 */
  progress: number;
  /** starts the fade-out once true */
  hide: boolean;
}

export function Preloader({ progress, hide }: PreloaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-hidden={hide}
      className={
      'fixed inset-0 z-[100] flex flex-col items-center justify-center bg-canvas ' +
      'transition-opacity duration-700 ease-lux ' + (
      hide ? 'pointer-events-none opacity-0' : 'opacity-100')
      }>

      <span className="font-serif text-4xl tracking-brand text-ink sm:text-5xl">
        {SITE.name}
      </span>
      <span className="mt-3 text-[9px] uppercase tracking-widest text-subtle">
        {SITE.motto}
      </span>

      <div className="mt-9 h-px w-40 overflow-hidden bg-line sm:w-48">
        <div
          className="h-full bg-accent transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }} />

      </div>

      <span className="sr-only">Loading, {progress}% complete</span>
    </div>);

}
