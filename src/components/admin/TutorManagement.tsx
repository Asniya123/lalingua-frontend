import React, { useEffect, useState } from "react";
import { getTutor, managingTutor } from "../../services/adminAuth";
import { toast } from 'react-toastify';
import AdminLayout from "../../components/layouts/adminHeader";
import { Button } from "../../components/UI/Button";

interface Tutor {
  _id: string;
  name: string;
  email: string;
  documents: string;
  isBlocked: boolean;
  status: string;
}

const TutorManagement: React.FC = () => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalTutors, setTotalTutors] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchTutors();
  }, [currentPage]);

  const fetchTutors = async () => {
    setLoading(true);
    setError(null);
    try {
      const { tutors: tutorData, total } = await getTutor(currentPage, itemsPerPage, 'approved');
      
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

  const handleTutorStatus = async (tutorId: string, currentStatus: boolean) => {
    try {
      await managingTutor(tutorId, !currentStatus);
      setTutors((prevTutors) =>
        prevTutors.map((tutor) =>
          tutor._id === tutorId ? { ...tutor, isBlocked: !currentStatus } : tutor
        )
      );
      toast.success(currentStatus ? "Tutor blocked successfully" : "Tutor unblocked successfully");
    } catch (error) {
      console.error("Error updating tutor status:", error);
      setError("Failed to update tutor status");
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto mt-10">
        <h2 className="text-2xl font-semibold mb-4 text-center">Approved Tutor Management</h2>
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
                          className="text-blue-500 underline"
                        >
                          View Document
                        </a>
                      ) : (
                        "No Document"
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
                        onClick={() => handleTutorStatus(tutor._id, tutor.isBlocked)}
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
                  <td colSpan={5} className="text-center py-4 text-gray-600">
                    No approved tutors available
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
      </div>
    </AdminLayout>
  );
};

export default TutorManagement;