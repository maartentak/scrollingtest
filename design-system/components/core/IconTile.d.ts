import * as React from 'react';
export interface IconTileProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Default 'ink' (forest). */
  tone?: 'ink' | 'mustard' | 'terra' | 'outline';
  /** Pixel size of the square. Default 52. */
  size?: number;
  children?: React.ReactNode;
}
export declare function IconTile(props: IconTileProps): JSX.Element;
