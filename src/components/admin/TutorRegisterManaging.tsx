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
import  SearchBar  from "../../components/UI/SearchBar";

interface Tutor {
  status: string;
  _id: string;
  name: string;
  email: string;
  documents: string;
}

const TutorRegisterManaging = () => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { isOpen: isRejectOpen, onOpen: onRejectOpen, onClose: onRejectClose } = useDisclosure();
  const { isOpen: isApproveOpen, onOpen: onApproveOpen, onClose: onApproveClose } = useDisclosure();
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    setError(null);
    try {
      const data = await getTutorsApproveOrReject();
      if (Array.isArray(data)) {
        setTutors(data);
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (error) {
      setError("Failed to load tutors");
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
      fetchTutors();
      onApproveClose();
    } catch (error) {
      setError("Failed to approve tutor");
    }
  };

  const openRejectionModal = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setRejectionReason("");
    onRejectOpen();
  };

  const handleRejection = async () => {
    if (!selectedTutor || !rejectionReason.trim()) return;
    try {
      await updateTutorStatus(selectedTutor._id, "rejected", rejectionReason);
      fetchTutors();
      onRejectClose();
    } catch (error) {
      setError("Failed to reject tutor");
    }
  };

  return (
    <AdminLayout>
    <div className="max-w-4xl mx-auto mt-10">
      <h2 className="text-2xl font-semibold mb-4 text-center">Tutor Management</h2>
       <SearchBar
          onSearch={setSearchTerm}
          placeholder="Search tutors by name, email, or status..."
        />
      {error && <p className="text-center text-red-500">{error}</p>}
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
            {tutors.length > 0 ? (
              tutors.map((tutor) => (
                <tr key={tutor._id} className="hover:bg-gray-100">
                  <td className="border px-4 py-2">{tutor.name}</td>
                  <td className="border px-4 py-2">{tutor.email}</td>
                  <td className="border px-4 py-2">
                    {tutor.documents ? (
                      <a href={tutor.documents} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                        View Document
                      </a>
                    ) : (
                      "No Document"
                    )}
                  </td>
                  <td className="border px-4 py-2 text-center">{tutor.status}</td>
                  <td className="border px-4 py-2 text-center">
                    {tutor.status?.toLowerCase().trim() === "pending" ? (
                      <>
                        <button
                          onClick={() => openApprovalModal(tutor)}
                          className="mr-2 px-3 py-1 bg-green-500 text-white rounded"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => openRejectionModal(tutor)}
                          className="px-3 py-1 bg-red-500 text-white rounded"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      "No Actions"
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">No tutors found.</td>
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
            <p>Are you sure you want to approve this tutor?</p>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onApproveClose}>Cancel</Button>
            <Button color="primary" onPress={handleApproval}>Approve</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Rejection Modal */}
      <Modal isOpen={isRejectOpen} onOpenChange={onRejectClose}>
        <ModalContent>
          <ModalHeader>Reject Tutor</ModalHeader>
          <ModalBody>
            <p>Enter the reason for rejection:</p>
            <Input
              type="text"
              placeholder="Rejection reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="mt-2 w-full border p-2 rounded"
            />
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onRejectClose}>Cancel</Button>
            <Button color="primary" onPress={handleRejection}>Submit</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
    </AdminLayout>
  );
};

export default TutorRegisterManaging;
