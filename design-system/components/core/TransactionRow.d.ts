import * as React from 'react';
export interface TransactionRowProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode;
  title: string;
  category: string;
  /** Money string, cents dimmed automatically. */
  amount: string;
  time: string;
  /** Invert colors for the striped dark transaction list. */
  dark?: boolean;
}
export declare function TransactionRow(props: TransactionRowProps): JSX.Element;
