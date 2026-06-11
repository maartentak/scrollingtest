import * as React from 'react';
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Color tone. Default 'ink'. */
  tone?: 'ink' | 'fin' | 'alert';
  children?: React.ReactNode;
}
export declare function Badge(props: BadgeProps): JSX.Element;
