import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import toast from "react-hot-toast";
import { fetch_tutor_chats, fetch_tutor_room } from "../../services/tutorChatService";
import { useSocket } from "../../components/context/socketContext";
import TutorChatBox from "../../components/chat/TutorChatbox";
import TutorChatSidebar from "../../components/chat/TutorChatSlidebar";

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
    if (!receiverId || !tutor?._id) {
      console.error("Invalid receiverId or tutorId:", { receiverId, tutorId: tutor?._id });
      toast.error("Invalid user or tutor data");
      return;
    }

    try {
      console.log("Fetching room for:", { receiverId, senderId: tutor._id });
      const response = await fetch_tutor_room(receiverId, tutor._id);
      console.log("fetch_tutor_room response:", JSON.stringify(response, null, 2));
      if (response.success && response.room?._id) {
        setSelectedRoomId(response.room._id);
        setSelectedUserId(receiverId);
        navigate(`/tutor/chatPage?userId=${encodeURIComponent(receiverId)}`);
      } else {
        console.error("Invalid room response:", response);
        toast.error(response.message || "Failed to load chat room");
      }
    } catch (error: any) {
      console.error("Error fetching room:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error("Error loading chat room: " + (error.message || "Unknown error"));
    }
  };

  const fetchData = async () => {
    try {
      if (!tutor?._id) {
        console.error("No tutor ID available");
        return;
      }
      setIsLoading(true);
      const chatsResponse = await fetch_tutor_chats(tutor._id, searchTerm);
      console.log("fetch_tutor_chats response:", JSON.stringify(chatsResponse, null, 2));
      if (chatsResponse.success) {
        const updatedChats = chatsResponse.users.map((chat: any) => ({
          ...chat,
          isOnline: onlineUsers?.includes(chat._id) || false,
          lastMessageRead: chat.lastMessage ? chat.unReadCount === 0 : true,
        }));
        setChats(updatedChats);
      } else {
        toast.error(chatsResponse.message || "Failed to load chats");
      }
    } catch (error: any) {
      console.error("Error fetching chats:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error("Error loading chats: " + (error.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!tutor?._id) {
      toast.error("Please log in to access chat");
      navigate("/tutor/login");
      return;
    }
    fetchData();
  }, [searchTerm, tutor?._id, onlineUsers, navigate]);

  useEffect(() => {
    if (!tutor?._id) {
      toast.error("Please log in to access chat");
      navigate("/tutor/login");
      return;
    }
    if (userId) {
      console.log("UserId from URL:", userId);
      fetchRoomData(userId);
    }
  }, [userId, tutor?._id, navigate]);

  const handleSelectRoom = (newRoomId: string) => {
    setSelectedRoomId(newRoomId);
    const selectedChat = chats.find((chat) => chat.chatId === newRoomId);
    if (selectedChat) {
      setSelectedUserId(selectedChat._id);
      navigate(`/tutor/chatPage?userId=${encodeURIComponent(selectedChat._id)}`);
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
          <TutorChatSidebar
            onSelectRoom={handleSelectRoom}
            chats={chats}
            setChats={setChats}
            setSearchTerm={setSearchTerm}
          />
          <div className="flex-1">
            {selectedRoomId ? (
              <TutorChatBox
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