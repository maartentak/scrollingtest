import React from 'react';

/** Square category icon tile. Forest by default; mustard/terracotta for emphasis. */
export function IconTile({ tone = 'ink', size = 52, children, style, ...rest }) {
  const tones = {
    ink:   { background: 'var(--forest-700)', color: 'var(--on-dark)' },
    mustard: { background: 'var(--mustard-500)', color: 'var(--ink-strong)' },
    terra: { background: 'var(--terracotta-500)', color: 'var(--on-dark)' },
    outline: { background: 'transparent', color: 'var(--on-dark)', border: '1px solid var(--line-on-ink)' },
  };
  return (
    <span style={{ width: size, height: size, borderRadius: 'var(--r-sm)',
      display: 'grid', placeItems: 'center', flex: 'none', ...tones[tone], ...style }} {...rest}>
      {children}
    </span>
  );
}
