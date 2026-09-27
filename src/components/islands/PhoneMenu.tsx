// Adapted from reference/21st/liquid-morph-floating-menu.tsx (21st.dev). CONTEXT.md,
// "21st.dev islands", item 4. The phone menu under 900px; loads with client:load.
// Kept: easing [0.22, 1, 0.36, 1]; the ink circle rises over 0.8s after a 0.1s delay (closing: 0.8s,
//       no delay); links fade in over 0.4s starting at 0.4s + 0.08s × index (closing: at once);
//       hamburger to X, each bar rotating 45° over 0.4s, bars 18 × 2px, 3px apart when closed.
// Changed: the trigger sits at the top right in the nav, never floating at the bottom; the ink circle
//          scales up (transform) from the trigger into a full-screen ink panel; no per-letter hover
//          roll; real links; a real button with aria-expanded; Escape closes; focus stays inside while
//          open; the page behind cannot scroll; tapping outside the links or tapping a link closes it.
//          Colors are fixed per surface (no animated color): paper bars on the ink trigger.
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

const ease = [0.22, 1, 0.36, 1] as const;

type NavLink = { label: string; href: string };
type Props = { links: NavLink[]; donateHref: string; current?: string };

export default function PhoneMenu({ links, donateHref, current }: Props) {
  const [open, setOpen] = useState(false);
  const [circle, setCircle] = useState({ x: 0, y: 0, r: 0 });
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const t = (duration: number, delay = 0) => (reduced ? { duration: 0 } : { duration, delay, ease });

  // The circle is centred on the trigger, with a radius that reaches the farthest screen corner.
  const measure = useCallback(() => {
    const b = triggerRef.current?.getBoundingClientRect();
    if (!b) return;
    const x = b.left + b.width / 2;
    const y = b.top + b.height / 2;
    const r = Math.ceil(Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)));
    setCircle({ x, y, r });
  }, []);

  const close = useCallback((refocus = false) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  }, []);

  const toggle = () => {
    if (!open) measure();
    setOpen(!open);
  };

  useEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.classList.add('menu-open'); // locks page scroll (global.css)

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close(true);
        return;
      }
      if (e.key !== 'Tab' || !rootRef.current) return;
      // Focus stays inside: the trigger, the links, and Donate.
      const items = [...rootRef.current.querySelectorAll<HTMLElement>('button, a[href]')];
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (!active || !rootRef.current.contains(active)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    const onResize = () => close();
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      root.classList.remove('menu-open');
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [open, close]);

  return (
    <div ref={rootRef} className="menu">
      <button
        ref={triggerRef}
        type="button"
        className="menu__trigger"
        aria-expanded={open}
        aria-controls="phone-menu"
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={toggle}
      >
        <motion.span
          className="menu__bar"
          initial={false}
          animate={{ rotate: open ? 45 : 0, y: open ? 0 : -3 }}
          transition={t(0.4)}
        />
        <motion.span
          className="menu__bar"
          initial={false}
          animate={{ rotate: open ? -45 : 0, y: open ? 0 : 3 }}
          transition={t(0.4)}
        />
      </button>

      {/* Tapping the panel anywhere outside a link closes it. */}
      <div
        id="phone-menu"
        className="menu__panel"
        data-open={open}
        inert={!open}
        onClick={(e) => {
          if (!(e.target as HTMLElement).closest('a')) close();
        }}
      >
        <motion.span
          className="menu__circle"
          aria-hidden="true"
          style={{
            left: circle.x - circle.r,
            top: circle.y - circle.r,
            width: circle.r * 2,
            height: circle.r * 2,
          }}
          initial={false}
          animate={{ scale: open ? 1 : 0 }}
          transition={t(0.8, open ? 0.1 : 0)}
        />
        <nav className="menu__nav" aria-label="Menu">
          <ul className="menu__list">
            {links.map((link, i) => (
              <li key={link.href}>
                <motion.a
                  className="display menu__link"
                  href={link.href}
                  aria-current={link.href === current ? 'page' : undefined}
                  onClick={() => close()}
                  initial={false}
                  animate={{ opacity: open ? 1 : 0 }}
                  transition={t(0.4, open ? 0.4 + 0.08 * i : 0)}
                >
                  {link.label}
                </motion.a>
              </li>
            ))}
            <li>
              {/* Donate, repeated inside the open menu: the on-ink button (see Button.astro) */}
              <motion.a
                className="btn btn--on-ink menu__donate"
                href={donateHref}
                onClick={() => close()}
                initial={false}
                animate={{ opacity: open ? 1 : 0 }}
                transition={t(0.4, open ? 0.4 + 0.08 * links.length : 0)}
              >
                <span className="btn__fill" aria-hidden="true" />
                <span className="btn__label">Donate</span>
                <span className="btn__hover" aria-hidden="true">
                  <span>Donate</span>
                  <svg className="btn__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" focusable="false">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </span>
              </motion.a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
