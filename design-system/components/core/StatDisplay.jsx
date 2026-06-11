import React from 'react';

/**
 * The hero money figure: a small uppercase label above a large Chakra Petch
 * amount. The cents portion is rendered faint automatically when 'amount'
 * contains a decimal.
 */
export function StatDisplay({ label, amount, size = 46, style, ...rest }) {
  const dot = String(amount).lastIndexOf('.');
  const head = dot > -1 ? String(amount).slice(0, dot) : amount;
  const cents = dot > -1 ? String(amount).slice(dot) : '';
  return (
    <div style={style} {...rest}>
      <div style={{ fontWeight: 'var(--w-bold)', fontSize: 11, textTransform: 'uppercase',
        letterSpacing: '0.14em', color: 'var(--ink-muted)' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-numeric)', fontWeight: 'var(--w-semibold)',
        fontSize: size, color: 'var(--ink-strong)', marginTop: 4, letterSpacing: '0.01em' }}>
        {head}<span style={{ color: 'var(--ink-faint)' }}>{cents}</span>
      </div>
    </div>
  );
}
