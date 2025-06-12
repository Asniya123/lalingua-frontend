import { Avatar, Badge, ScrollShadow } from "@nextui-org/react";
import { Dispatch, SetStateAction, useEffect, useState, useCallback } from "react";
import SearchInput from "../../UI/SearchInput";
import { fetch_tutor_room } from "../../../services/tutorChatService";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { useSocket } from "../../context/useSocket";
import { Message } from "../../../interfaces/chat";
import toast from "react-hot-toast";
import { Check } from "lucide-react";
import { Contact } from "../../../Pages/Tutor/ChatPage";

interface ChatSidebarProps {
  onSelectRoom: (roomId: string) => void;
  chats: Contact[];
  setChats: Dispatch<SetStateAction<Contact[]>>;
  setSearchTerm: Dispatch<SetStateAction<string>>;
}

export default function TutorChatSidebar({ onSelectRoom, chats, setChats, setSearchTerm }: ChatSidebarProps) {
  const tutor = useSelector((state: RootState) => state.tutor.tutor);
  const { socket } = useSocket();
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [loadingRoomId, setLoadingRoomId] = useState<string | null>(null);

  const handleNewBadge = useCallback((message: Message) => {
    console.log("Received new-badge:", JSON.stringify(message, null, 2));
    if (!message.chatId || message.senderId === tutor?._id) return;

    setChats((prev) =>
      prev.map((chat) =>
        chat.chatId === message.chatId
          ? {
              ...chat,
              unReadCount: (chat.unReadCount || 0) + 1,
              lastMessage: message.message,
              lastMessageRead: false,
            }
          : chat
      )
    );
    toast("New message!", { icon: "👥" });
  }, [tutor?._id, setChats]);

  const handleNewMessage = useCallback((message: Message) => {
    console.log("Received new-message:", JSON.stringify(message, null, 2));
    if (!message.chatId || message.senderId === tutor?._id) return;

    setChats((prev) =>
      prev.map((chat) =>
        chat.chatId === message.chatId
          ? {
              ...chat,
              unReadCount: selectedRoom === message.chatId ? 0 : (chat.unReadCount || 0) + 1,
              lastMessage: message.message,
              lastMessageRead: message.isRead || false,
            }
          : chat
      )
    );

    if (selectedRoom !== message.chatId) {
      toast("New message!", { icon: "💬" });
    }
  }, [tutor?._id, selectedRoom, setChats]);

  const handleMessageRead = useCallback((data: { chatId: string; userId: string }) => {
    console.log("Received message-read:", JSON.stringify(data, null, 2));
    if (data.userId === tutor?._id) return;

    setChats((prev) =>
      prev.map((chat) =>
        chat.chatId === data.chatId
          ? { ...chat, unReadCount: 0, lastMessageRead: true }
          : chat
      )
    );
  }, [tutor?._id, setChats]);

  useEffect(() => {
    if (!socket || !tutor?._id) {
      console.warn("Socket or tutor is null, skipping event listeners setup", { socket: !!socket, tutorId: tutor?._id });
      setIsInitialLoading(false);
      return;
    }

    socket.on("new-badge", handleNewBadge);
    socket.on("new-message", handleNewMessage);
    socket.on("message-read", handleMessageRead);

    setIsInitialLoading(false);

    return () => {
      socket.off("new-badge", handleNewBadge);
      socket.off("new-message", handleNewMessage);
      socket.off("message-read", handleMessageRead);
    };
  }, [socket, tutor?._id, handleNewBadge, handleNewMessage, handleMessageRead]);

  const handleRoomSelection = useCallback(async (receiverId: string) => {
    try {
      if (!receiverId || !tutor?._id) {
        console.error("Missing receiverId or tutorId:", { receiverId, tutorId: tutor?._id });
        toast.error("Invalid user data");
        return;
      }

      // Prevent multiple simultaneous room selections
      if (loadingRoomId) {
        console.log("Room selection already in progress, ignoring");
        return;
      }

      console.log("handleRoomSelection called with:", { receiverId, tutorId: tutor._id });
      setLoadingRoomId(receiverId);

      const timeout = setTimeout(() => {
        setLoadingRoomId(null);
        toast.error("Request timed out: Unable to load chat room");
      }, 10000);

      const response = await fetch_tutor_room(receiverId, tutor._id);
      console.log("handleRoomSelection response:", JSON.stringify(response, null, 2));

      clearTimeout(timeout);

      if (response.success && response.room?._id) {
        setSelectedRoom(response.room._id);
        onSelectRoom(response.room._id);

        setChats((prev) =>
          prev.map((chat) =>
            chat.chatId === response.room._id
              ? { ...chat, unReadCount: 0, lastMessageRead: true }
              : chat
          )
        );

        localStorage.setItem("lastChattedRoom", response.room._id);

        if (socket) {
          socket.emit("mark-messages-read", { chatId: response.room._id, userId: tutor._id });
        } else {
          console.warn("Socket is null, cannot emit mark-messages-read");
          toast.error("Chat server not connected");
        }
      } else {
        toast.error("Failed to load chat room");
      }
    } catch (error: any) {
      console.error("Error selecting room:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error(error.response?.data?.message || "Error loading chat room");
    } finally {
      setLoadingRoomId(null);
    }
  }, [tutor?._id, socket, onSelectRoom, setChats, loadingRoomId]);

  const getProfilePictureSrc = useCallback((profilePicture?: string | null): string => {
    return profilePicture || "/logos/avatar.avif";
  }, []);

  const renderUserList = useCallback((users: Contact[]) => {
    if (isInitialLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <p className="text-gray-600 text-lg font-semibold">Loading chats...</p>
        </div>
      );
    }

    if (users.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <svg
            className="w-14 h-14 text-gray-500 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            ></path>
          </svg>
          <p className="text-gray-600 text-lg font-semibold">No Chats Yet</p>
          <p className="text-gray-500 text-sm">Start a new chat!</p>
        </div>
      );
    }

    return users.map((user) => {
      const isCurrentlyLoading = loadingRoomId === user._id;
      
      return (
        <div
          key={user._id || user.chatId}
          className={`p-4 cursor-pointer transition-all duration-200 rounded-lg mx-2 my-1 ${
            selectedRoom === user.chatId
              ? "text-white"
              : "hover:bg-gray-100"
          } ${isCurrentlyLoading ? "opacity-50" : ""}`}
          style={selectedRoom === user.chatId ? { background: "linear-gradient(to right, #8C2C2C, #A03333)" } : {}}
          onClick={() => {
            if (isCurrentlyLoading) return; // Prevent clicking while loading
            
            if (!user._id) {
              console.error("Invalid user ID:", user);
              toast.error("Cannot load chat: Invalid user ID");
              return;
            }
            handleRoomSelection(user._id);
          }}
        >
          <div className="flex items-center space-x-4">
            {/* Profile Picture */}
            <div className="relative">
              <img
                src={getProfilePictureSrc(user.profilePicture)}
                alt={user.name || "Unknown"}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-[0_4px_10px_rgba(0,0,0,0.3)]"
              />
              {/* Loading indicator */}
              {isCurrentlyLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-full">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            
            {/* Main content area */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={`text-sm font-semibold truncate ${user.unReadCount && user.unReadCount > 0 ? 'font-bold' : ''}`}>
                  {user.name || "Unknown"}
                </p>
                {/* Time - you can add timestamp here if available */}
                <span className={`text-xs ${selectedRoom === user.chatId ? 'text-gray-200' : 'text-gray-500'}`}>
                  {/* Add your timestamp logic here */}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1 min-w-0 pr-2">
                  {user.lastMessage && (
                    <>
                      <p className={`text-xs truncate flex-1 ${selectedRoom === user.chatId
                          ? "text-gray-200"
                          : user.unReadCount && user.unReadCount > 0
                            ? "text-gray-800 font-medium"
                            : "text-gray-500"
                        }`}>
                        {user.lastMessage}
                      </p>
                      <span className="flex items-center ml-2 flex-shrink-0">
                        {user.isOnline && user.lastMessageRead ? (
                          <>
                            <Check className={`h-3 w-3 ${selectedRoom === user.chatId ? "text-red-200" : "text-blue-500"}`} />
                            <Check className={`h-3 w-3 -ml-1 ${selectedRoom === user.chatId ? "text-red-200" : "text-blue-500"}`} />
                          </>
                        ) : (
                          <>
                            <Check className={`h-3 w-3 ${selectedRoom === user.chatId ? "text-gray-300" : "text-gray-400"}`} />
                            <Check className={`h-3 w-3 -ml-1 ${selectedRoom === user.chatId ? "text-gray-300" : "text-gray-400"}`} />
                          </>
                        )}
                      </span>
                    </>
                  )}
                </div>
                
                {/* Unread count badge - Fixed positioning and styling */}
                {user.unReadCount > 0 && (
                  <div 
                    className="rounded-full text-white text-xs font-bold min-w-[20px] h-5 flex items-center justify-center flex-shrink-0 ml-2"
                    style={{ 
                      backgroundColor: "#8C2C2C",
                      minWidth: user.unReadCount > 99 ? "28px" : "20px",
                      padding: "0 6px"
                    }}
                  >
                    {user.unReadCount > 99 ? "99+" : user.unReadCount.toString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    });
  }, [isInitialLoading, selectedRoom, handleRoomSelection, getProfilePictureSrc, loadingRoomId]);

  return (
    <div className="w-80 bg-[#D0A9A9] shadow-xl flex flex-col">
      <div
        className="bg-gradient-to-r p-4 shadow-lg flex items-center justify-between"
        style={{ background: "linear-gradient(to right, #8C2C2C, #A03333)" }}
      >
        <SearchInput
          onSearch={setSearchTerm}
          className="bg-white/90 backdrop-blur-sm rounded-full shadow-sm"
        />
      </div>
      <ScrollShadow className="flex-grow" hideScrollBar>
        {renderUserList(chats)}
      </ScrollShadow>
    </div>
  );
}