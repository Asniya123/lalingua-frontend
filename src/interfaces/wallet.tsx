import { Key } from "react";

export interface Transaction {
  _id: Key | null | undefined;
  date: string;
  reason: string;
  transactionType: 'credit' | 'debit';
  amount: number;
}

export interface Wallet {
  walletBalance: number;
  transaction: Transaction[];
}