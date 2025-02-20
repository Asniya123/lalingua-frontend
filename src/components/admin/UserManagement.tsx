import React, { useEffect, useState } from "react";
import { getUsers, blockUnblock } from "../../services/adminAuth";
import AdminLayout from "../layouts/adminHeader";
import { toast } from "react-toastify";

interface User {
  _id: string;
  name: string;
  email: string;
  isBlocked: boolean;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch Users
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsers();
      if (data) {
        setUsers(data);
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // Handle Block/Unblock User
  const handleBlockUnblock = async (userId: string, isBlocked: boolean) => {
    try {
      await blockUnblock(userId, isBlocked);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, isBlocked: !user.isBlocked } : user
        )
      );
      toast.success(isBlocked ? "User blocked successfully" : "User unblocked successfully");
    } catch (error) {
      console.error("Error updating user status:", error);
      setError("Failed to update user status");
    }
  };

  return (
    <AdminLayout>
    <div className="max-w-4xl mx-auto mt-10">
      <h2 className="text-2xl font-semibold mb-4 text-center">Admin User Management</h2>
      {loading && <p className="text-center text-gray-600">Loading users...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 shadow-md">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
              <th className="border border-gray-300 px-4 py-2 text-center">Status</th>
              <th className="border border-gray-300 px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-100">
                <td className="border border-gray-300 px-4 py-2">{user.name}</td>
                <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded ${
                      user.isBlocked ? "bg-red-200 text-red-600" : "bg-green-200 text-green-600"
                    }`}
                  >
                    {user.isBlocked ? "Blocked" : "Active"}
                  </span>
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <button
                    onClick={() => handleBlockUnblock(user._id, !user.isBlocked)}
                    className={`px-4 py-1 rounded text-white transition ${
                      user.isBlocked ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
                    }`}
                  >
                    {user.isBlocked ? "Unblock" : "Block"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </AdminLayout>
  );
};

export default UserManagement;
