import Student from "./user";

export default interface Chat {
    _id: string;
    participants: string[] | Student[];
    messages: string[] | Message[];
    lastMessage?: string | Message;
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
  


// export interface IMessage {
//   _id: string;
//   senderId: string;
//   content: string;
//   messageType: 'text' | 'image' | 'video' | 'file'; 
//   createdAt: string; 
//   isRead: boolean; 
// }

// export interface IChatRoom {
//   _id: string;
//   participants: string[]; 
//   messages: IMessage[];
//   lastMessage?: IMessage | null; 
//   createdAt: string;
//   updatedAt: string;
// }


export interface OutgoingCallPayload {
  to: string; // Recipient user ID (student)
  from: string; // Sender user ID (tutor)
  roomId: string; // Chat room ID
  callType: "video"; // Call type (e.g., "video" or "audio")
  studentName: string; // Student’s name
  studentImage: string; // Student’s profile picture URL
  tutorName: string; // Tutor’s name
  tutorImage: string; // Tutor’s profile picture URL
  type?: "out-going"  // Optional: Call direction
  userName?: string; // Optional: Recipient’s name (alias for studentName)
  userImage?: string; // Optional: Recipient’s image (alias for studentImage)
}

export interface VideoCallPayload extends OutgoingCallPayload {
  type: "out-going";
  userID: string; // Required field, typically the same as 'to'
  userName?: string; // Optional, as it may duplicate studentName
  userImage?: string; // Optional, as it may duplicate studentImage
}