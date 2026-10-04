import { motion, useReducedMotion } from 'framer-motion'

/**
 * Scroll-triggered entrance for content below the fold.
 *
 * Prefer the CSS `.stagger` / `.animate-fade-up` utilities for elements that
 * are visible on mount — those cost nothing. Use this only when the reveal
 * should genuinely wait until the element scrolls into view.
 */
export default function Reveal({ children, delay = 0, y = 16, className = '', as = 'div', ...rest }) {
  const reduceMotion = useReducedMotion()
  const Component = motion[as] || motion.div

  if (reduceMotion) {
    const Tag = as
    return <Tag className={className} {...rest}>{children}</Tag>
  }

  return (
    <Component
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </Component>
  )
}
