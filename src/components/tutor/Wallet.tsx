import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "../../components/UI/card";
import { DollarSign } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { getTutorWallet } from "../../services/tutorAuth";
import { toast } from "react-toastify";
import { Wallet } from "../../interfaces/tutor";

const TutorWallet: React.FC = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const tutor = useSelector((state: RootState) => state.tutor.tutor);

  useEffect(() => {
    if (tutor?._id) {
      fetchWallet();
    }
  }, [tutor]);

  const fetchWallet = async () => {
    setLoading(true);
    try {
      const response = await getTutorWallet(tutor!._id);
      if (response.success && response.wallet) {
        setWallet(response.wallet);
      } else {
        toast.error(response.message || "Failed to load wallet");
      }
    } catch (err) {
      console.error("Error fetching wallet:", err);
      toast.error("Failed to load wallet");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading wallet...</div>;
  }

  if (!wallet) {
    return <div className="text-red-500">Unable to load wallet</div>;
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-semibold flex items-center">
          <DollarSign className="mr-2" /> Tutor Wallet
        </h2>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <p className="text-lg font-medium">Current Balance</p>
          <p className="text-3xl font-bold text-green-600">₹{wallet.balance.toFixed(2)}</p>
        </div>
        <div>
          <h3 className="text-lg font-medium mb-4">Transaction History</h3>
          {wallet.transactions.length > 0 ? (
            <div className="space-y-4">
              {wallet.transactions.map((tx) => (
                <div
                  key={tx.enrolledId}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <div>
                    <p className="text-sm">{tx.reason || "No description"}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(tx.date).toLocaleDateString()}
                    </p>
                  </div>
                  <p
                    className={`text-sm font-medium ${
                      tx.transactionType === "credit" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {tx.transactionType === "credit" ? "+" : "-"}₹{tx.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No transactions found</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TutorWallet;