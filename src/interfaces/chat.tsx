import Student from "./user";

export default interface Chat {
    _id: string;
    participants: string[] | Student[];
    messages: string[] | Message[];
    lastMessage: string | Message;
  }
  export interface Message {
    _id?: string;
    chatId?: string;
    senderId?: string;
    message: string;
    isRead?: boolean;
    message_type?: string;
    message_time: Date;
  }

  interface chatProps {
    roomId: string;
    initiateCall: (recieverId: string | undefined) => void;
    answerCall: () => void;
    endCall: () => void;
    isCallModalVisible: boolean;
  }
  