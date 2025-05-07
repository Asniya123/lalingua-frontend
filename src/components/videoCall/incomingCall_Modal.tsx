import User from "../../interfaces/user";
import {
  Avatar,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { recieverData } from "../chat/Chatbox";
interface IncommingCallModalProps {
  answerCall: () => void;
  isCallModalVisible: boolean;
  reciever: recieverData | null;
  rejectIncomingCall:()=>void
}
export default function IncommingCallModal({answerCall, isCallModalVisible, reciever,rejectIncomingCall}: IncommingCallModalProps) {
  return (
    <Modal isOpen={isCallModalVisible} onClose={rejectIncomingCall}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <Avatar
            src={(reciever?.profilePicture as string) || "/logos/avatar.avif"}
            name={reciever?.name}
            size="lg"
          />
          <h3 className="ms-4 text-xl font-semibold">
            Incoming Call from {reciever?.name || "Unknown"}
          </h3>
        </ModalHeader>
        <ModalBody>
          <p>Do you want to accept the call?</p>
        </ModalBody>
        <ModalFooter>
          <Button onClick={answerCall} color="success">
            Accept
          </Button>
          <Button onClick={rejectIncomingCall} color="danger">
            Reject
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}