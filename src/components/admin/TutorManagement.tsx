import React, { useEffect, useState } from "react";
import { getTutor, managingTutor } from "../../services/adminAuth";
import { toast } from 'react-toastify';
import AdminLayout from "../../components/layouts/adminHeader";
import { Button } from "../../components/UI/Button";
import  SearchBar  from "../../components/UI/SearchBar";

interface Tutor {
  _id: string;
  name: string;
  email: string;
  documents: string;
  isBlocked: boolean;
  status: string;
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  actionType: 'block' | 'unblock';
}

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

const TutorManagement: React.FC = () => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalTutors, setTotalTutors] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedTutor, setSelectedTutor] = useState<{id: string, status: boolean} | null>(null);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchTutors();
  }, [currentPage, searchTerm]);

   useEffect(() => {
      if (searchTerm) {
        setCurrentPage(1);
      }
    }, [searchTerm]);

  const fetchTutors = async () => {
    setLoading(true);
    setError(null);
    try {
      const { tutors: tutorData, total } = await getTutor(currentPage, itemsPerPage, 'approved', searchTerm);
      
      const formattedTutors: Tutor[] = tutorData.map((tutor: any) => ({
        _id: tutor._id,
        name: tutor.name,
        email: tutor.email,
        documents: tutor.documents,
        isBlocked: tutor.is_blocked,
        status: tutor.status
      }));

      setTutors(formattedTutors);
      setTotalTutors(total);
      setTotalPages(Math.ceil(total / itemsPerPage));
    } catch (err: any) {
      console.error("Failed to fetch tutors:", err);
      setError(err.message || "Failed to load tutors");
    } finally {
      setLoading(false);
    }
  };

  const handleTutorStatusClick = (tutorId: string, currentStatus: boolean) => {
    setSelectedTutor({ id: tutorId, status: currentStatus });
    setShowModal(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedTutor) return;

    try {
      await managingTutor(selectedTutor.id, !selectedTutor.status);
      setTutors((prevTutors) =>
        prevTutors.map((tutor) =>
          tutor._id === selectedTutor.id ? { ...tutor, isBlocked: !selectedTutor.status } : tutor
        )
      );
      toast.success(selectedTutor.status ? "Tutor blocked successfully" : "Tutor unblocked successfully");
    } catch (error) {
      console.error("Error updating tutor status:", error);
      setError("Failed to update tutor status");
      toast.error("Failed to update tutor status");
    } finally {
      setShowModal(false);
      setSelectedTutor(null);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTutor(null);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

   const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  useEffect(() => {
      const timeoutId = setTimeout(() => {
        if (searchTerm !== '') {
          fetchTutors();
        }
      }, 300);
  
      return () => clearTimeout(timeoutId);
    }, [searchTerm]);

  const getModalContent = () => {
    if (!selectedTutor) return { title: '', message: '', actionType: 'block' as const };
    
    const action = selectedTutor.status ? 'unblock' : 'block';
    const tutor = tutors.find(t => t._id === selectedTutor.id);
    
    return {
      title: `${action === 'block' ? 'Block' : 'Unblock'} Tutor`,
      message: `Are you sure you want to ${action} ${tutor?.name || 'this tutor'}? This action will ${action === 'block' ? 'prevent the tutor from accessing the system and conducting sessions' : 'restore the tutor\'s access to the system and allow them to conduct sessions'}.`,
      actionType: action as 'block' | 'unblock'
    };
  };

  const modalContent = getModalContent();

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto mt-10">
        <h2 className="text-2xl font-semibold mb-4 text-center">Approved Tutor Management</h2>
        <SearchBar
          onSearch={setSearchTerm}
          placeholder="Search tutors by name, email, or status..."
        />
        {loading && <p className="text-center text-gray-600">Loading tutors...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 shadow-md">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Document</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Status</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tutors.length > 0 ? (
                tutors.map((tutor) => (
                  <tr key={tutor._id} className="hover:bg-gray-100">
                    <td className="border border-gray-300 px-4 py-2">{tutor.name}</td>
                    <td className="border border-gray-300 px-4 py-2">{tutor.email}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {tutor.documents ? (
                        <a
                          href={tutor.documents}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline hover:text-blue-700"
                        >
                          View Document
                        </a>
                      ) : (
                        <span className="text-gray-500">No Document</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${
                          tutor.isBlocked ? "bg-red-200 text-red-600" : "bg-green-200 text-green-600"
                        }`}
                      >
                        {tutor.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      <button
                        onClick={() => handleTutorStatusClick(tutor._id, tutor.isBlocked)}
                        className={`px-4 py-1 rounded text-white transition ${
                          tutor.isBlocked ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
                        }`}
                      >
                        {tutor.isBlocked ? "Unblock" : "Block"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                    {searchTerm ? `No tutors found matching "${searchTerm}"` : "No approved tutors available"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 0 && (
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

export default TutorManagement;