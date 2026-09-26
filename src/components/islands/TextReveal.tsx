// Adapted from reference/21st/text-reveal.tsx (21st.dev). CONTEXT.md, "21st.dev islands", item 1.
// Kept: per word, the slide preset (opacity 0 to 1, y 20 to 0), 0.05s stagger, 0.3s per word,
//       the container's opacity fade, and the screen-reader copy with aria-hidden words.
// Changed: plays once when 30% in view (whileInView, once) instead of the `trigger` prop and
//          AnimatePresence; reduced motion renders static text; blur presets, char and line modes,
//          and the exit variants are removed. Words ease on the menu curve (CONTEXT.md, Motion).
import { useEffect, useState } from 'react';
import { motion, type Variants } from 'motion/react';

const STAGGER = 0.05; // defaultStaggerTimes.word
const DURATION = 0.3; // baseDuration
const MENU = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { delayChildren: 0, staggerChildren: STAGGER } },
};

// The "slide" preset
const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION, ease: MENU } },
};

// Astro hands slot children to React as HTML, so the text arrives as a prop.
type Props = {
  text: string;
  className?: string;
};

export default function TextReveal({ text: children, className }: Props) {
  // Read after mount, so the first client render matches the server HTML. Until then, CSS keeps
  // the words static under reduced motion (global.css, .mission__lede).
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    setReduced(matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);
  if (reduced) return <p className={className}>{children}</p>;

  const segments = children.split(/(\s+)/);
  return (
    <motion.p
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={container}
    >
      <span className="sr-only">{children}</span>
      {/* As in the source, spaces are segments too and take their own stagger slot. They stay
          inline (not inline-block) so lines break exactly as the static paragraph does. */}
      {segments.map((segment, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className={/^\s+$/.test(segment) ? undefined : 'reveal-word'}
          variants={item}
        >
          {segment}
        </motion.span>
      ))}
    </motion.p>
  );
}
