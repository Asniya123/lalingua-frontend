import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Input,
} from "@heroui/react";
import { getTutorsApproveOrReject, updateTutorStatus } from "../../services/adminAuth";
import AdminLayout from "../layouts/adminHeader";
import SearchBar from "../../components/UI/SearchBar";

interface Tutor {
  status: string;
  _id: string;
  name: string;
  email: string;
  documents: string;
}

const TutorRegisterManaging = () => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [filteredTutors, setFilteredTutors] = useState<Tutor[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { isOpen: isRejectOpen, onOpen: onRejectOpen, onClose: onRejectClose } = useDisclosure();
  const { isOpen: isApproveOpen, onOpen: onApproveOpen, onClose: onApproveClose } = useDisclosure();
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    fetchTutors();
  }, []);

  // Filter tutors when search term changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredTutors(tutors);
    } else {
      const filtered = tutors.filter(tutor =>
        tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutor.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTutors(filtered);
    }
  }, [searchTerm, tutors]);

  const fetchTutors = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await getTutorsApproveOrReject(searchTerm);
      console.log("Fetched tutors:", data);
      
      if (Array.isArray(data)) {
        setTutors(data);
        setFilteredTutors(data);
      } else {
        console.error("Invalid response structure:", data);
        throw new Error("Invalid response structure - expected array");
      }
    } catch (error) {
      console.error("Fetch tutors error:", error);
      setError("Failed to load tutors. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openApprovalModal = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    onApproveOpen();
  };

  const handleApproval = async () => {
    if (!selectedTutor) return;
    try {
      await updateTutorStatus(selectedTutor._id, "approved");
      await fetchTutors(); // Refresh the list
      onApproveClose();
    } catch (error) {
      console.error("Approval error:", error);
      setError("Failed to approve tutor. Please try again.");
    }
  };

  const openRejectionModal = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setRejectionReason("");
    onRejectOpen();
  };

  const handleRejection = async () => {
    if (!selectedTutor || !rejectionReason.trim()) {
      setError("Please provide a rejection reason");
      return;
    }
    try {
      await updateTutorStatus(selectedTutor._id, "rejected", rejectionReason);
      await fetchTutors(); // Refresh the list
      onRejectClose();
      setRejectionReason("");
    } catch (error) {
      console.error("Rejection error:", error);
      setError("Failed to reject tutor. Please try again.");
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="max-w-4xl mx-auto mt-10">
          <div className="text-center">Loading tutors...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto mt-10">
        <h2 className="text-2xl font-semibold mb-4 text-center">Tutor Management</h2>
        
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search tutors by name, email, or status..."
        />
        
        {error && (
          <div className="text-center text-red-500 mb-4 p-2 bg-red-100 rounded">
            {error}
            <button 
              onClick={() => setError(null)} 
              className="ml-2 text-red-700 hover:text-red-900"
            >
              ×
            </button>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 shadow-md">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2 text-left">Name</th>
                <th className="border px-4 py-2 text-left">Email</th>
                <th className="border px-4 py-2 text-left">Document</th>
                <th className="border px-4 py-2 text-center">Status</th>
                <th className="border px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTutors.length > 0 ? (
                filteredTutors.map((tutor) => (
                  <tr key={tutor._id} className="hover:bg-gray-100">
                    <td className="border px-4 py-2">{tutor.name}</td>
                    <td className="border px-4 py-2">{tutor.email}</td>
                    <td className="border px-4 py-2">
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
                    <td className="border px-4 py-2 text-center">
                      <span className={`px-2 py-1 rounded text-sm ${
                        tutor.status?.toLowerCase() === 'approved' ? 'bg-green-100 text-green-800' :
                        tutor.status?.toLowerCase() === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {tutor.status}
                      </span>
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {tutor.status?.toLowerCase().trim() === "pending" ? (
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => openApprovalModal(tutor)}
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => openRejectionModal(tutor)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-500">No Actions</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">
                    {searchTerm ? 'No tutors found matching your search.' : 'No tutors found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Approval Modal */}
        <Modal isOpen={isApproveOpen} onOpenChange={onApproveClose}>
          <ModalContent>
            <ModalHeader>Approve Tutor</ModalHeader>
            <ModalBody>
              <p>Are you sure you want to approve <strong>{selectedTutor?.name}</strong>?</p>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onApproveClose}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleApproval}>
                Approve
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Rejection Modal */}
        <Modal isOpen={isRejectOpen} onOpenChange={onRejectClose}>
          <ModalContent>
            <ModalHeader>Reject Tutor</ModalHeader>
            <ModalBody>
              <p>Enter the reason for rejecting <strong>{selectedTutor?.name}</strong>:</p>
              <Input
                type="text"
                placeholder="Rejection reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="mt-2"
                required
              />
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onRejectClose}>
                Cancel
              </Button>
              <Button 
                color="primary" 
                onPress={handleRejection}
                isDisabled={!rejectionReason.trim()}
              >
                Submit
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default TutorRegisterManaging;