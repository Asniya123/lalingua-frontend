import { Avatar, Badge, ScrollShadow } from "@nextui-org/react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import SearchInput from "../../UI/SearchInput";
import { fetch_room } from "../../../services/chatService";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { useSocket } from "../../context/useSocket";
import { Message } from "../../../interfaces/chat";
import toast from "react-hot-toast";
import { Check } from "lucide-react";
import { Contact } from "../../../Pages/User/Chat";

interface ChatSidebarProps {
  onSelectRoom: (roomId: string) => void;
  chats: Contact[];
  setChats: Dispatch<SetStateAction<Contact[]>>;
  setSearchTerm: Dispatch<SetStateAction<string>>;
}

export default function ChatSidebar({ onSelectRoom, chats, setChats, setSearchTerm }: ChatSidebarProps) {
  const user = useSelector((state: RootState) => state.auth.student);
  const { socket } = useSocket();
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  useEffect(() => {
    console.log("ChatSidebar chats:", JSON.stringify(chats, null, 2));
    if (!socket) {
      console.warn("Socket is null, skipping event listeners setup");
      return;
    }

    const handleNewBadge = (message: Message) => {
      console.log("new-badge message:", JSON.stringify(message, null, 2));
      console.log("Setting lastMessage to:", message.message_type === "text" ? message.message : "Media");
      if (!message.chatId || message.senderId === user?._id) return;

      setChats((prev) =>
        prev.map((chat) =>
          chat.chatId === message.chatId
            ? {
                ...chat,
                unReadCount: (chat.unReadCount || 0) + 1,
                lastMessage: message.message_type === "text" ? message.message : "Media",
                lastMessageRead: false,
              }
            : chat
        )
      );
      toast("New message!", { icon: "👥" });
    };

    const handleNewMessage = (message: Message) => {
      console.log("new-message message:", JSON.stringify(message, null, 2));
      console.log("Setting lastMessage to:", message.message_type === "text" ? message.message : "Media");
      if (!message.chatId || message.senderId === user?._id) return;

      setChats((prev) =>
        prev.map((chat) =>
          chat.chatId === message.chatId
            ? {
                ...chat,
                unReadCount: selectedRoom === message.chatId ? 0 : (chat.unReadCount || 0) + 1,
                lastMessage: message.message_type === "text" ? message.message : "Media",
                lastMessageRead: message.isRead || false,
              }
            : chat
        )
      );

      if (selectedRoom !== message.chatId) {
        toast("New message!", { icon: "💬" });
      }
    };

    const handleMessageRead = (data: { chatId: string; userId: string }) => {
      console.log("Received message-read:", JSON.stringify(data, null, 2));
      if (data.userId === user?._id) return;

      setChats((prev) =>
        prev.map((chat) =>
          chat.chatId === data.chatId
            ? { ...chat, unReadCount: 0, lastMessageRead: true }
            : chat
        )
      );
    };

    socket.on("new-badge", handleNewBadge);
    socket.on("new-message", handleNewMessage);
    socket.on("message-read", handleMessageRead);

    return () => {
      socket.off("new-badge", handleNewBadge);
      socket.off("new-message", handleNewMessage);
      socket.off("message-read", handleMessageRead);
    };
  }, [socket, setChats, user?._id, selectedRoom]);

  const handleRoomSelection = async (receiverId: string) => {
    try {
      if (!receiverId || !user?._id) {
        console.error("Missing receiverId or userId:", { receiverId, userId: user?._id });
        toast.error("Invalid user data");
        return;
      }
      console.log("handleRoomSelection called with:", { receiverId, userId: user._id });
      const response = await fetch_room(receiverId, user._id);
      console.log("fetch_room response:", JSON.stringify(response, null, 2));
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
          socket.emit("mark-messages-read", { chatId: response.room._id, userId: user._id });
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
    }
  };

  const getProfilePictureSrc = (profilePicture?: string | null): string => {
    return profilePicture || "/logos/avatar.avif";
  };

  const gradientStyle = {
    background: "linear-gradient(to right, #8C2C2C, #A03333)",
  };

  const getLastMessageText = (lastMessage: string | Message | undefined): string => {
    if (typeof lastMessage === "string") {
      return lastMessage;
    }
    if (lastMessage && typeof lastMessage === "object" && "message" in lastMessage) {
      console.warn("lastMessage is an object, extracting message field:", lastMessage);
      return lastMessage.message_type === "text" ? lastMessage.message : "Media";
    }
    return "";
  };

  const renderUserList = (users: Contact[]) => {
    console.log("Chats in renderUserList:", JSON.stringify(users, null, 2));
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
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            ></path>
          </svg>
          <p className="text-gray-600 text-lg font-semibold">No Chats Yet</p>
          <p className="text-gray-500 text-sm">Start a new chat!</p>
        </div>
      );
    }

    return users.map((user) => (
      <div
        key={user._id || user.chatId}
        className={`p-4 cursor-pointer transition-all duration-200 rounded-lg mx-2 my-1 ${
          selectedRoom === user.chatId ? "text-white" : "hover:bg-gray-100"
        }`}
        style={selectedRoom === user.chatId ? gradientStyle : {}}
        onClick={() => {
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
          </div>
          
          {/* Main content area */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p
                className={`text-sm font-semibold truncate ${
                  user.unReadCount && user.unReadCount > 0 ? "font-bold" : ""
                }`}
              >
                {user.name || "Unknown"}
              </p>
              {/* Time - you can add timestamp here if available */}
              <span className={`text-xs ${selectedRoom === user.chatId ? 'text-gray-200' : 'text-gray-500'}`}>
                {/* Add your timestamp logic here */}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1 min-w-0 pr-2">
                {user.lastMessage ? (
                  <>
                    <p
                      className={`text-xs truncate flex-1 ${
                        selectedRoom === user.chatId
                          ? "text-gray-200"
                          : user.unReadCount && user.unReadCount > 0
                          ? "text-gray-800 font-medium"
                          : "text-gray-500"
                      }`}
                    >
                      {getLastMessageText(user.lastMessage)}
                    </p>
                    <span className="flex items-center ml-2 flex-shrink-0">
                      {user.isOnline && user.lastMessageRead ? (
                        <>
                          <Check
                            className={`h-3 w-3 ${
                              selectedRoom === user.chatId ? "text-red-200" : "text-blue-500"
                            }`}
                          />
                          <Check
                            className={`h-3 w-3 -ml-1 ${
                              selectedRoom === user.chatId ? "text-red-200" : "text-blue-500"
                            }`}
                          />
                        </>
                      ) : (
                        <>
                          <Check
                            className={`h-3 w-3 ${
                              selectedRoom === user.chatId ? "text-gray-300" : "text-gray-400"
                            }`}
                          />
                          <Check
                            className={`h-3 w-3 -ml-1 ${
                              selectedRoom === user.chatId ? "text-gray-300" : "text-gray-400"
                            }`}
                          />
                        </>
                      )}
                    </span>
                  </>
                ) : (
                  <span className="flex items-center ml-2 flex-shrink-0">
                    <Check
                      className={`h-3 w-3 ${
                        selectedRoom === user.chatId ? "text-gray-300" : "text-gray-400"
                      }`}
                    />
                    <Check
                      className={`h-3 w-3 -ml-1 ${
                        selectedRoom === user.chatId ? "text-gray-300" : "text-gray-400"
                      }`}
                    />
                  </span>
                )}
              </div>
              
              {/* Unread count badge - Fixed positioning and styling */}
              { user.unReadCount > 0 && (
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
    ));
  };

  return (
    <div className="w-80 bg-[#D0A9A9] shadow-xl flex flex-col">
      <div
        className="bg-gradient-to-r p-4 shadow-lg"
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