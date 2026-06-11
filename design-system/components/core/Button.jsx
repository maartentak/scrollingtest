import React from 'react';

/**
 * Vorxs full-bleed action button. Uppercase, tracked, mechanical.
 */
export function Button({ variant = 'alert', children, style, ...rest }) {
  const base = {
    fontFamily: 'var(--font-ui)', fontWeight: 'var(--w-bold)', fontSize: 12,
    textTransform: 'uppercase', letterSpacing: '0.14em', border: 0, cursor: 'pointer',
    padding: '16px 22px', borderRadius: 'var(--r-md)', width: '100%',
  };
  const variants = {
    alert: { background: 'var(--terracotta-500)', color: 'var(--on-dark)' },
    ink:   { background: 'var(--forest-700)', color: 'var(--on-dark)' },
    ghost: { background: 'transparent', color: 'var(--ink-strong)',
             border: '1px solid var(--ink-strong)' },
  };
  return <button style={{ ...base, ...variants[variant], ...style }} {...rest}>{children}</button>;
}
