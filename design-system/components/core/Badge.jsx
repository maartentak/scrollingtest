import React from 'react';

/** Small uppercase status chip in Chakra Petch. */
export function Badge({ tone = 'ink', children, style, ...rest }) {
  const tones = {
    ink:   { background: 'var(--forest-700)', color: 'var(--on-dark)' },
    fin:   { background: 'var(--mustard-500)', color: 'var(--ink-strong)' },
    alert: { background: 'var(--terracotta-500)', color: 'var(--on-dark)' },
  };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
      fontFamily: 'var(--font-numeric)', fontSize: 11, fontWeight: 'var(--w-semibold)',
      letterSpacing: '0.14em', textTransform: 'uppercase', padding: '7px 12px',
      borderRadius: 'var(--r-sm)', ...tones[tone], ...style }} {...rest}>{children}</span>
  );
}
