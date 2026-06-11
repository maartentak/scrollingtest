import * as React from 'react';
export interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  /** Diameter in px. Default 48. */
  size?: number;
}
export declare function Avatar(props: AvatarProps): JSX.Element;
