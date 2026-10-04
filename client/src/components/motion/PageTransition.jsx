import { motion, useReducedMotion } from 'framer-motion'

/**
 * Route-level enter/exit wrapper.
 *
 * This is the one place CSS genuinely cannot help: an element that has already
 * unmounted cannot be animated out. `AnimatePresence mode="wait"` in App.jsx
 * holds the outgoing page on screen until this component reports it finished,
 * which is what makes a route change a fade *through* rather than a
 * cross-fade with nothing fading out.
 */
export default function PageTransition({ children, className = '' }) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
