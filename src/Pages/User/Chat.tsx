import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ChatBox from "../../components/chat/Chatbox";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import ChatSidebar from "../../components/chat/ChatSidebar";
import toast from "react-hot-toast";
import { fetch_chats, fetch_room } from "../../services/chatService";
import { useSocket } from "../../components/context/socketContext";
import ErrorBoundary from "../../components/ErrorBoundary";

export interface Contact {
  _id: string;
  chatId?: string;
  name?: string;
  profilePicture?: string | null;
  lastMessage?: string | null;
  unReadCount: number;
  isOnline?: boolean;
  lastMessageRead?: boolean;
}

export default function ChatPage() {
  const { onlineUsers } = useSocket();
  const [searchParams] = useSearchParams();
  const tutorId = searchParams.get("tutorId");
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.student);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedTutorId, setSelectedTutorId] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [chats, setChats] = useState<Contact[]>([]);
  const [isCallModalVisible, setIsCallModalVisible] = useState(false);

  const fetchRoomData = async (receiverId: string) => {
    try {
      const response = await fetch_room(receiverId, user?._id);
      console.log("fetch_room response:", response); 
      if (response.success && response.room?._id) {
        setSelectedRoomId(response.room._id);
        setSelectedTutorId(receiverId);
        navigate(`/chat?tutorId=${receiverId}`);
      } else {
        toast.error("Failed to load chat room");
      }
    } catch (error) {
      console.error("Error fetching room:", error);
      toast.error("Error loading chat room");
    }
  };

  const fetchData = async () => {
    try {
      if (!user?._id) return;
      const chatsResponse = await fetch_chats(user._id, searchTerm);
      console.log("fetch_chats response:-----------------", chatsResponse); 
      if (chatsResponse.success) {
        const updatedChats = chatsResponse.users.map((chat: any) => ({
          ...chat,
          isOnline: onlineUsers?.includes(chat._id) || false,
          lastMessageRead: chat.lastMessage ? chat.unReadCount === 0 : true,
        }));
        setChats(updatedChats);
      } else {
        toast.error("Failed to load chats");
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
      toast.error("Error loading chats");
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm, user, onlineUsers]);

  useEffect(() => {
    if (!user?._id) {
      toast.error("Please log in to access chat");
      navigate("/login");
      return;
    }
    if (tutorId) {
      fetchRoomData(tutorId);
    }
  }, [tutorId, user?._id, navigate]);

  const handleSelectRoom = (newRoomId: string) => {
    setSelectedRoomId(newRoomId);
    const selectedChat = chats.find((chat) => chat.chatId === newRoomId);
    if (selectedChat) {
      setSelectedTutorId(selectedChat._id);
      navigate(`/chat?tutorId=${selectedChat._id}`);
    }
  };

  const initiateCall = (receiverId: string | undefined) => {
    if (receiverId) {
      setIsCallModalVisible(true);
      toast.success(`Initiating call to ${receiverId}`);
    }
  };

  const answerCall = () => {
    setIsCallModalVisible(false);
    toast.success("Call answered");
  };

  const endCall = () => {
    setIsCallModalVisible(false);
    toast.success("Call ended");
  };

  return (
    <div className="flex h-screen">
      <ChatSidebar
        onSelectRoom={handleSelectRoom}
        chats={chats}
        setChats={setChats}
        setSearchTerm={setSearchTerm}
      />
      <div className="flex-1">
        {selectedRoomId ? (

            <ChatBox
              roomId={selectedRoomId}
              initiateCall={initiateCall}
              answerCall={answerCall}
              endCall={endCall}
              isCallModalVisible={isCallModalVisible}
              tutorId={selectedTutorId}
            />

        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
