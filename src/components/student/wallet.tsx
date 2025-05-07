import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { fetch_wallet } from '../../services/userAuth';
import { Transaction } from '../../interfaces/wallet';

interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => React.ReactNode;
}

const WalletPage: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.student);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        if (user?._id) {
          const response = await fetch_wallet(user._id);
          if (response.success) {
            setTransactions(
              response.wallet?.transaction?.sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
              ) || []
            );
          }
        }
      } catch (error) {
        console.error('Error fetching wallet:', error);
      }
    };
    fetchWallet();
  }, [user?._id]);

  const totalAmount = transactions.reduce(
    (sum, transaction) =>
      transaction.transactionType === 'credit' ? sum + transaction.amount : sum - transaction.amount,
    0
  );

  const creditTransactions = transactions.filter((t) => t.transactionType === 'credit');
  const debitTransactions = transactions.filter((t) => t.transactionType === 'debit');

  const columns: TableColumn<Transaction>[] = [
    {
      key: 'date',
      label: 'DATE',
      render: (transaction) => new Date(transaction.date).toLocaleDateString('en-GB'),
    },
    {
      key: 'reason',
      label: 'DESCRIPTION',
    },
    {
      key: 'amount',
      label: 'AMOUNT',
      render: (transaction) => (
        <span
          className={transaction.transactionType === 'credit' ? 'text-green-500' : 'text-red-500'}
        >
          {transaction.transactionType === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
        </span>
      ),
    },
  ];

  const renderTable = (data: Transaction[], ariaLabel: string) => (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-200">
            {columns.map((column) => (
              <th key={column.key} className="p-3 text-gray-700">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item._id} className="border-b hover:bg-gray-50">
              {columns.map((column) => (
                <td key={column.key} className="p-3 text-gray-600">
                  {column.render
                    ? column.render(item)
                    : (item[column.key as keyof Transaction] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="bg-zinc-900 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-2">Total Balance</h2>
        <p className="text-4xl font-bold text-white">${totalAmount.toFixed(2)}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Credited Transactions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between mb-4">
            <h3 className="text-xl font-bold">Credited</h3>
          </div>
          <div className="border-b border-gray-200 mb-4" />
          {renderTable(creditTransactions, 'Credited transactions')}
        </div>

        {/* Debited Transactions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between mb-4">
            <h3 className="text-xl font-bold">Debited</h3>
          </div>
          <div className="border-b border-gray-200 mb-4" />
          {renderTable(debitTransactions, 'Debited transactions')}
        </div>
      </div>
    </div>
  );
};

export default WalletPage;