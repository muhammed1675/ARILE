import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingBag, User } from 'lucide-react';
import { NAV_LINKS, SITE } from '../../data/site';
import { useCart } from '../../contexts/CartContext';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Wordmark } from '../ui/Wordmark';
import { classNames } from '../../lib/format';

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { count, openCart } = useCart();
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const solid = scrolled || !isHome;

  return (
    <>
      <header
        className={classNames(
          'fixed inset-x-0 top-0 z-40 transition-[background-color,border-color,padding,box-shadow] duration-300 ease-lux',
          solid ?
          'border-b border-line bg-canvas py-3.5 shadow-sm' :
          'border-b border-transparent bg-gradient-to-b from-black/45 via-black/10 to-transparent py-5'
        )}>
        
        <nav
          aria-label="Primary"
          className="mx-auto flex max-w-container items-center justify-between px-5 md:px-10">
          
          <Wordmark size="md" tone={solid ? 'default' : 'onPhoto'} />

          <ul className="hidden items-center gap-9 lg:flex">
            {NAV_LINKS.map((link) =>
            <li key={link.to}>
                <NavLink
                to={link.to}
                className={({ isActive }) =>
                classNames(
                  'relative text-[11px] uppercase tracking-widest transition-colors duration-200',
                  solid ?
                  isActive ? 'text-accent' : 'text-muted hover:text-ink' :
                  isActive ? 'text-[#d9bd7f]' : 'text-white/75 hover:text-white'
                )
                }>
                
                  {({ isActive }) =>
                <>
                      {link.label}
                      {isActive &&
                  <motion.span
                    layoutId="nav-underline"
                    className={`absolute -bottom-1.5 left-0 h-px w-full ${solid ? 'bg-accent' : 'bg-[#c9a961]'}`}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }} />

                  }
                    </>
                }
                </NavLink>
              </li>
            )}
          </ul>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <ThemeToggle variant={solid ? 'default' : 'onPhoto'} />

            <Link
              to="/account"
              aria-label="Account"
              className={classNames(
                'hidden h-9 w-9 place-items-center rounded-full border transition-colors duration-200 sm:grid',
                solid ?
                'border-line text-muted hover:border-accent hover:text-accent' :
                'border-white/30 text-white/85 hover:border-white/60 hover:text-white'
              )}>
              
              <User size={15} strokeWidth={1.5} />
            </Link>

            <button
              type="button"
              onClick={openCart}
              aria-label={`Open bag, ${count} item${count === 1 ? '' : 's'}`}
              className={classNames(
                'relative grid h-9 w-9 place-items-center rounded-full border transition-colors duration-200',
                solid ?
                'border-line text-muted hover:border-accent hover:text-accent' :
                'border-white/30 text-white/85 hover:border-white/60 hover:text-white'
              )}>
              
              <ShoppingBag size={15} strokeWidth={1.5} />
              {count > 0 &&
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[9px] font-medium text-accent-ink">
                  {count}
                </span>
              }
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className={classNames(
                'grid h-9 w-9 place-items-center rounded-full border transition-colors duration-200 lg:hidden',
                solid ?
                'border-line text-muted hover:border-accent hover:text-accent' :
                'border-white/30 text-white/85 hover:border-white/60 hover:text-white'
              )}>
              
              <Menu size={16} strokeWidth={1.5} />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {mobileOpen &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex flex-col bg-canvas lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu">
          
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <Wordmark size="md" asLink={false} />
              <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted transition-colors duration-200 hover:border-accent hover:text-accent">
              
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>

            <motion.ul
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } } }}
            className="flex flex-1 flex-col justify-center gap-1 px-5">
            
              {NAV_LINKS.map((link) =>
            <motion.li
              key={link.to}
              variants={{
                hidden: { opacity: 0, y: 14 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
                }
              }}>
              
                  <Link
                to={link.to}
                className="block border-b border-line py-4 font-serif text-3xl text-ink transition-colors duration-200 hover:text-accent">
                
                    {link.label}
                  </Link>
                </motion.li>
            )}
              <motion.li
              variants={{
                hidden: { opacity: 0, y: 14 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
                }
              }}>
              
                <Link
                to="/account"
                className="block border-b border-line py-4 font-serif text-3xl text-ink transition-colors duration-200 hover:text-accent">
                
                  Account
                </Link>
              </motion.li>
            </motion.ul>

            <div className="border-t border-line px-5 py-6">
              <p className="font-serif text-lg italic text-accent">{SITE.motto}</p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-subtle">
                {SITE.address}
              </p>
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </>);

}