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


