import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "../../components/UI/card";
import { DollarSign } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { getAdminWallet } from "../../services/adminAuth";
import { toast } from "react-toastify";
import { Wallet } from "../../interfaces/admin";

const AdminWallet: React.FC = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const adminId = useSelector((state: RootState) => state.admin.adminId); // adminId is string | null

  useEffect(() => {
    if (adminId) {
      fetchWallet();
    } else {
      setLoading(false);
      toast.error("Admin ID not found");
    }
  }, [adminId]);

  const fetchWallet = async () => {
    setLoading(true);
    try {
      // Ensure adminId is a string before calling getAdminWallet
      if (!adminId) {
        throw new Error("Admin ID is not available");
      }
      const response = await getAdminWallet(adminId);
      if (response.success && response.wallet) {
        setWallet(response.wallet);
      } else {
        toast.error(response.message || "Failed to load wallet");
      }
    } catch (err) {
      console.error("Error fetching wallet:", err);
      toast.error(err instanceof Error ? err.message : "Failed to load wallet");
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
          <DollarSign className="mr-2" /> Admin Wallet
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

export default AdminWallet;