import React, { useEffect, useState } from "react";
import { getUsers, blockUnblock } from "../../services/adminAuth";
import AdminLayout from "../layouts/adminHeader";
import { toast } from "react-toastify";
import { Button } from "../../components/UI/Button"; 
import SearchBar from "../../components/UI/SearchBar";

interface User {
  _id: string;
  name: string;
  email: string;
  isBlocked: boolean;
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  actionType: 'block' | 'unblock';
}



const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<{id: string, status: boolean} | null>(null);
  const itemsPerPage = 5;

  
  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm]); 


  useEffect(() => {
    if (searchTerm) {
      setCurrentPage(1);
    }
  }, [searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {

      const { users: userData, total } = await getUsers(currentPage, itemsPerPage, searchTerm);
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

  const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  actionType
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
            actionType === 'block' ? 'bg-red-100' : 'bg-green-100'
          }`}>
            {actionType === 'block' ? (
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        
        <p className="text-gray-600 mb-6">{message}</p>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-500 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded transition-colors ${
              actionType === 'block' 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            Yes, {actionType === 'block' ? 'Block' : 'Unblock'}
          </button>
        </div>
      </div>
    </div>
  );
};

  const handleBlockUnblockClick = (userId: string, currentStatus: boolean) => {
    setSelectedUser({ id: userId, status: currentStatus });
    setShowModal(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedUser) return;

    try {
      await blockUnblock(selectedUser.id, !selectedUser.status);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === selectedUser.id ? { ...user, isBlocked: !selectedUser.status } : user
        )
      );
      toast.success(
        !selectedUser.status ? "User blocked successfully" : "User unblocked successfully"
      );
    } catch (error) {
      console.error("Error updating user status:", error);
      setError("Failed to update user status");
      toast.error("Failed to update user status");
    } finally {
      setShowModal(false);
      setSelectedUser(null);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const totalPages = Math.ceil(totalUsers / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle search with debouncing (optional improvement)
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  // Optional: Add debouncing for search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== '') {
        fetchUsers();
      }
    }, 300); // 300ms delay

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const getModalContent = () => {
    if (!selectedUser) return { title: '', message: '', actionType: 'block' as const };
    
    const action = selectedUser.status ? 'unblock' : 'block';
    const user = users.find(u => u._id === selectedUser.id);
    
    return {
      title: `${action === 'block' ? 'Block' : 'Unblock'} User`,
      message: `Are you sure you want to ${action} ${user?.name || 'this user'}? This action will ${action === 'block' ? 'prevent the user from accessing the system' : 'restore the user\'s access to the system'}.`,
      actionType: action as 'block' | 'unblock'
    };
  };

  const modalContent = getModalContent();

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto mt-10">
        <h2 className="text-2xl font-semibold mb-4 text-center">Admin User Management</h2>
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search users by name or email..."
        />
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
              {users.length === 0 && !loading ? (
                <tr>
                  <td colSpan={4} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                    {searchTerm ? `No users found matching "${searchTerm}"` : "No users found"}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
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
                        onClick={() => handleBlockUnblockClick(user._id, user.isBlocked)}
                        className={`px-4 py-1 rounded text-white transition ${
                          user.isBlocked ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
                        }`}
                      >
                        {user.isBlocked ? "Unblock" : "Block"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
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

        {/* Custom Confirmation Modal */}
        <ConfirmationModal
          isOpen={showModal}
          onClose={handleCloseModal}
          onConfirm={handleConfirmAction}
          title={modalContent.title}
          message={modalContent.message}
          actionType={modalContent.actionType}
        />
      </div>
    </AdminLayout>
  );
};

export default UserManagement;