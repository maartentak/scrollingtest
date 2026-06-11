import * as React from 'react';
export interface StatDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Uppercase eyebrow, e.g. "Total Spent". */
  label: string;
  /** Money string, e.g. "$1,894.0". Cents render faint automatically. */
  amount: string;
  /** Font size of the figure. Default 46. */
  size?: number;
}
export declare function StatDisplay(props: StatDisplayProps): JSX.Element;
