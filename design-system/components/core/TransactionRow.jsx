import React from 'react';
import { IconTile } from './IconTile.jsx';

/**
 * One transaction line: icon, title + category, amount + time.
 * On a paper surface by default; pass dark to invert for the striped dark list.
 */
export function TransactionRow({ icon, title, category, amount, time, dark = false, style, ...rest }) {
  const dot = String(amount).lastIndexOf('.');
  const head = dot > -1 ? String(amount).slice(0, dot) : amount;
  const cents = dot > -1 ? String(amount).slice(dot) : '';
  const titleColor = dark ? 'var(--paper-100)' : 'var(--ink-strong)';
  const subColor = dark ? 'var(--on-dark-muted)' : 'var(--ink-muted)';
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '52px 1fr auto', alignItems: 'center',
      gap: 16, padding: '14px 0', ...style }} {...rest}>
      <IconTile tone={dark ? 'outline' : 'ink'} size={dark ? 38 : 46}>{icon}</IconTile>
      <div>
        <div style={{ fontWeight: 'var(--w-bold)', fontSize: 17, color: titleColor }}>{title}</div>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em',
          color: subColor, marginTop: 3 }}>{category}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: 'var(--font-numeric)', fontWeight: 'var(--w-semibold)',
          fontSize: 20, color: titleColor }}>{head}<span style={{ color: dark ? 'var(--on-dark-muted)' : 'var(--ink-faint)' }}>{cents}</span></div>
        <div style={{ fontFamily: 'var(--font-numeric)', fontSize: 11, color: subColor,
          marginTop: 3, letterSpacing: '0.04em' }}>{time}</div>
      </div>
    </div>
  );
}
