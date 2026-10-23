/**
 * motion.js — Shared Framer Motion variants & helpers
 *
 * Keep ALL animation config here so the whole app speaks
 * one motion language.  Import from any page/component.
 *
 * Design rules:
 *  • Nothing faster than 200 ms (too snappy → feels broken)
 *  • Nothing slower than 500 ms (too slow  → feels sluggish)
 *  • Easing: always ease-out for entrances, ease-in-out for interactions
 *  • Scale on hover: max 1.02 — subtle lift, not a portfolio bounce
 *  • Y offset on entry: 12 px — just enough to feel like it "settled"
 */

/* ─── Page / section entry ─────────────────────────────────────────────── */
export const pageVariants = {
  hidden:  { opacity: 0, y: 12 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.38, ease: [0.25, 0.1, 0.25, 1] }, // cubic-bezier ease-out
  },
};

/* ─── Staggered children container ─────────────────────────────────────── */
export const staggerContainer = {
  hidden:  {},
  visible: {
    transition: {
      staggerChildren:  0.055,
      delayChildren:    0.05,
    },
  },
};

/* ─── Individual stagger child (used inside staggerContainer) ───────────── */
export const staggerChild = {
  hidden:  { opacity: 0, y: 14 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.36, ease: [0.25, 0.1, 0.25, 1] },
  },
};

/* ─── Card / panel entry (slightly slower for heavier visual weight) ────── */
export const cardVariants = {
  hidden:  { opacity: 0, y: 10 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.42, ease: [0.25, 0.1, 0.25, 1] },
  },
};

/* ─── Hover / tap for interactive cards ─────────────────────────────────── */
export const cardHover = {
  whileHover: {
    scale: 1.015,
    transition: { duration: 0.18, ease: 'easeOut' },
  },
  whileTap: {
    scale: 0.985,
    transition: { duration: 0.1, ease: 'easeIn' },
  },
};

/* ─── Sidebar nav-item hover ───────────────────────────────────────────── */
export const navHover = {
  whileHover: {
    x: 3,
    transition: { duration: 0.15, ease: 'easeOut' },
  },
  whileTap: {
    scale: 0.97,
  },
};

/* ─── Log row — hover lift (minimal — rows are dense) ──────────────────── */
export const logRowHover = {
  whileHover: {
    backgroundColor: 'rgba(56, 189, 248, 0.04)',
    transition: { duration: 0.12, ease: 'easeOut' },
  },
};

/* ─── Button interactions ───────────────────────────────────────────────── */
export const btnHover = {
  whileHover: {
    scale: 1.03,
    transition: { duration: 0.15, ease: 'easeOut' },
  },
  whileTap: {
    scale: 0.96,
    transition: { duration: 0.08 },
  },
};

/* ─── Slide-in from right (alerts, notifications) ───────────────────────── */
export const slideInRight = {
  hidden:  { opacity: 0, x: 20 },
  visible: {
    opacity: 1, x: 0,
    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
  },
};

/* ─── Fade in only (charts, heavy SVG content) ──────────────────────────── */
export const fadeIn = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

/* ─── Shared transition for border-glow on hover (CSS var trick) ────────── */
export const borderGlowTransition = {
  transition: { duration: 0.2, ease: 'easeOut' },
};

/* ─── Copilot message bubble entry ─────────────────────────────────────── */
export const bubbleVariants = {
  hidden:  { opacity: 0, y: 8, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.28, ease: [0.25, 0.1, 0.25, 1] },
  },
};
