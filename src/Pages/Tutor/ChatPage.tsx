import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ChatBox from "../../components/chat/TutorChatbox";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import ChatSidebar from "../../components/chat/TutorChatSidebar";
import toast from "react-hot-toast";
import { fetch_tutor_chats, fetch_tutor_room } from "../../services/tutorChatService";
import { useSocket } from "../../components/context/socketContext";

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

export default function TutorChatPage() {
  const { onlineUsers } = useSocket();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId");
  const navigate = useNavigate();
  const tutor = useSelector((state: RootState) => state.tutor.tutor);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [chats, setChats] = useState<Contact[]>([]);
  const [isCallModalVisible, setIsCallModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRoomData = async (receiverId: string) => {
    try {
      if (!tutor?._id) {
        throw new Error("Tutor ID is required");
      }
      const response = await fetch_tutor_room(receiverId, tutor._id);
      console.log("fetch_tutor_room response:", response);
      if (response.success && response.room?._id) {
        setSelectedRoomId(response.room._id);
        setSelectedUserId(receiverId);
        navigate(`/tutor/chatPage?userId=${receiverId}`);
      } else {
        toast.error("Failed to load chat room");
      }
    } catch (error: any) {
      console.error("Error fetching room:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        navigate("/tutor/login");
      } else {
        toast.error("Error loading chat room");
      }
    }
  };

  const fetchData = async () => {
    try {
      if (!tutor?._id) {
        throw new Error("Tutor ID is required");
      }
      setIsLoading(true);
      const chatsResponse = await fetch_tutor_chats(tutor._id, searchTerm);
      console.log("fetch_tutor_chats response:", chatsResponse);
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
    } catch (error: any) {
      console.error("Error fetching chats:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        navigate("/tutor/login");
      } else {
        toast.error("Error loading chats");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("Tutor state:", tutor);
    if (!tutor?._id) {
      console.log("No tutor ID, redirecting to /tutor/login");
      toast.error("Please log in to access chat");
      navigate("/tutor/login");
      return;
    }
    fetchData();
  }, [searchTerm, tutor?._id, onlineUsers, navigate]);

  useEffect(() => {
    if (!tutor?._id) {
      console.log("No tutor ID, redirecting to /tutor/login");
      toast.error("Please log in to access chat");
      navigate("/tutor/login");
      return;
    }
    if (userId) {
      fetchRoomData(userId);
    }
  }, [userId, tutor?._id, navigate]);

  const handleSelectRoom = (newRoomId: string) => {
    setSelectedRoomId(newRoomId);
    const selectedChat = chats.find((chat) => chat.chatId === newRoomId);
    if (selectedChat) {
      setSelectedUserId(selectedChat._id);
      navigate(`/tutor/chatPage?userId=${selectedChat._id}`);
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
      {isLoading ? (
        <div className="flex h-full items-center justify-center text-gray-500">
          Loading chats...
        </div>
      ) : (
        <>
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
                userId={selectedUserId}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
                Select a chat to start messaging
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}