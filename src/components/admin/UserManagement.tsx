import React, { useEffect, useState } from "react";
import { getUsers, blockUnblock } from "../../services/adminAuth";
import AdminLayout from "../layouts/adminHeader";
import { toast } from "react-toastify";
import { Button } from "../../components/UI/Button"; 

interface User {
  _id: string;
  name: string;
  email: string;
  isBlocked: boolean;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

 
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { users: userData, total } = await getUsers(currentPage, itemsPerPage);
      console.log("User data:", userData);

      setUsers(
        userData.map((user) => ({
          ...user,
          isBlocked: user.is_blocked, 
        }))
      );
      setTotalUsers(total);
    } catch (err) {
      console.error("Failed to fetch users", err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };


  const handleBlockUnblock = async (userId: string, currentStatus: boolean) => {
    const action = currentStatus ? "unblock" : "block";
    const confirmMessage = `Are you sure you want to ${action} this user?`;
    const isConfirmed = window.confirm(confirmMessage);

    if (!isConfirmed) {
      return; 
    }

    try {
      await blockUnblock(userId, !currentStatus);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, isBlocked: !currentStatus } : user
        )
      );
      toast.success(
        !currentStatus ? "User blocked successfully" : "User unblocked successfully"
      );
    } catch (error) {
      console.error("Error updating user status:", error);
      setError("Failed to update user status");
      toast.error("Failed to update user status");
    }
  };
  const totalPages = Math.ceil(totalUsers / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
                      onClick={() => handleBlockUnblock(user._id, user.isBlocked)}
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

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="text-gray-500"
              >
                Previous
              </Button>

              {Array.from({ length: totalPages }).map((_, index) => (
                <Button
                  key={index}
                  variant={currentPage === index + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(index + 1)}
                  className={currentPage === index + 1 ? "bg-primary text-white" : "text-gray-700"}
                >
                  {index + 1}
                </Button>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="text-gray-500"
              >
                Next
              </Button>
            </nav>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default UserManagement;