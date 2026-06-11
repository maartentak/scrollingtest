import React from 'react';

/** Circular profile avatar. */
export function Avatar({ src, size = 48, alt = '', style, ...rest }) {
  return (
    <img src={src} alt={alt} style={{ width: size, height: size, borderRadius: 'var(--r-pill)',
      objectFit: 'cover', ...style }} {...rest} />
  );
}
