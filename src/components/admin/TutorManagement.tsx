import React, { useEffect, useState } from "react";
import { getTutor, managingTutor } from "../../services/adminAuth";
import {  toast } from 'react-toastify';

interface Tutor {
  _id: string;
  name: string;
  email: string;
  documents: string;
  isBlocked: boolean;
}

const TutorManagement: React.FC = () => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTutor();
      console.log("Fetched Tutors:", data); 
      if (Array.isArray(data)) {
        setTutors(data);
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (err) {
      console.error("Failed to fetch tutors", err);
      setError("Failed to load tutors");
    } finally {
      setLoading(false);
    }
  };

  const handleTutorStatus = async (tutorId: string, isBlocked: boolean) => {
    try {
      await managingTutor(tutorId, isBlocked); 
  
      setTutors((prevTutors) =>
        prevTutors.map((tutor) =>
          tutor._id === tutorId ? { ...tutor, isBlocked: !tutor.isBlocked } : tutor
        )
      );
  
      toast.success(isBlocked ? "Tutor blocked successfully" : "Tutor unblocked successfully");
    } catch (error) {
      console.error("Error updating tutor status:", error);
      setError("Failed to update tutor status");
    }
  };
  
  

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h2 className="text-2xl font-semibold mb-4 text-center">Tutor Management</h2>
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
                    onClick={() => handleTutorStatus(tutor._id, !tutor.isBlocked)}
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
                  No tutors available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TutorManagement;
