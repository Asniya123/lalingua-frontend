import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ChatBox from "../../components/student/chat/Chatbox";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import ChatSidebar from "../../components/student/chat/ChatSlidebar";
import toast from "react-hot-toast";
import { fetch_chats, fetch_room } from "../../services/chatService";
import { useSocket } from "../../components/context/useSocket";
import { Message } from "../../interfaces/chat";

export interface Contact {
  _id: string;
  chatId?: string;
  name?: string;
  profilePicture?: string | null;
  lastMessage?: string;
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

  const fetchRoomData = async (receiverId: string) => {
    if (!receiverId || !user?._id) {
      console.error("Invalid receiverId or userId:", { receiverId, userId: user?._id });
      toast.error("Invalid tutor or user data");
      return;
    }

    try {
      console.log("Fetching room for:", { receiverId, senderId: user._id });
      const response = await fetch_room(receiverId, user._id);
      console.log("fetch_room response:", JSON.stringify(response, null, 2));
      if (response.success && response.room?._id) {
        setSelectedRoomId(response.room._id);
        setSelectedTutorId(receiverId);
        navigate(`/chat/${encodeURIComponent(response.room._id)}`);
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
      if (!user?._id) {
        console.error("No user ID available");
        return;
      }
      const chatsResponse = await fetch_chats(user._id, searchTerm);
      console.log("fetch_chats response:", JSON.stringify(chatsResponse, null, 2));
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
    }
  };

  const [chats, setChats] = useState<Contact[]>([]);

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
      console.log("TutorId from URL:", tutorId);
      fetchRoomData(tutorId);
    }
  }, [tutorId, user?._id, navigate]);

  const handleSelectRoom = (newRoomId: string) => {
    setSelectedRoomId(newRoomId);
    navigate(`/chat/${encodeURIComponent(newRoomId)}`);
  };

  if (!user?._id) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        Please log in to access chat
      </div>
    );
  }

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
            userId={user._id}
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