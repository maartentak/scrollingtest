import * as React from 'react';
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. Default 'alert' (terracotta). */
  variant?: 'alert' | 'ink' | 'ghost';
  children?: React.ReactNode;
}
export declare function Button(props: ButtonProps): JSX.Element;
