import { Avatar, Badge, ScrollShadow } from "@nextui-org/react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import SearchInput from "../UI/SearchInput";
import { fetch_tutor_room } from "../../services/tutorChatService";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useSocket } from "../context/socketContext";
import { Message } from "../../interfaces/chat";
import toast from "react-hot-toast";
import { Check } from "lucide-react";
import { Contact } from "../../Pages/Tutor/ChatPage";

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

  useEffect(() => {
    console.log("TutorChatSidebar chats:", JSON.stringify(chats, null, 2));
    if (!socket) return;
    socket.on("new-badge", (message: Message) => {
      const lastChattedRoom = localStorage.getItem("lastChattedRoom");
      if (lastChattedRoom !== message.chatId) {
        setChats((prev) =>
          prev.map((chat) =>
            chat._id === message.senderId
              ? { ...chat, unReadCount: chat.unReadCount + 1, lastMessageRead: false }
              : chat
          )
        );
        toast("New message!", { icon: "👏" });
      }
    });
    socket.on("new-message", (message: Message) => {
      setChats((prevChats) =>
        prevChats.map((chat) =>
          message.senderId === chat._id
            ? {
                ...chat,
                lastMessage: message.message,
                lastMessageRead: message.isRead || false,
              }
            : chat
        )
      );
    });
    socket.on("message-read", (data: { chatId: string; userId: string }) => {
      setChats((prev) =>
        prev.map((chat) =>
          chat.chatId === data.chatId && chat._id !== data.userId
            ? { ...chat, unReadCount: 0, lastMessageRead: true }
            : chat
        )
      );
    });

    return () => {
      socket.off("new-badge");
      socket.off("new-message");
      socket.off("message-read");
    };
  }, [socket, setChats]);

  const handleRoomSelection = async (receiverId: string) => {
    try {
      if (!receiverId || !tutor?._id) {
        throw new Error("Receiver ID or Tutor ID is missing");
      }
      console.log("handleRoomSelection called with:", { receiverId, tutorId: tutor?._id });
      const response = await fetch_tutor_room(receiverId, tutor?._id);
      console.log("handleRoomSelection response:", response);
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
      } else {
        toast.error("Failed to load chat room");
      }
    } catch (error: any) {
      console.error("Error selecting room:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        responseMessage: error.response?.data?.message
      });
      toast.error("Error loading chat room");
    }
  };

  const getProfilePictureSrc = (profilePicture?: string | null): string => {
    return profilePicture || "/logos/avatar.avif";
  };

  const renderUserList = (users: Contact[]) => {
    if (users.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <svg
            className="w-14 h-14 text-gray-400 mb-4"
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
          <p className="text-gray-500 text-lg font-medium">No Chats Yet</p>
          <p className="text-gray-400 text-sm">Start a new chat!</p>
        </div>
      );
    }

    return users.map((user) => (
      <div
        key={user._id || user.chatId} // Fallback to chatId if _id is undefined
        className={`p-4 cursor-pointer transition-all duration-200 rounded-lg mx-2 my-1 ${
          selectedRoom === user.chatId
            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
            : "hover:bg-gray-100"
        }`}
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
          <img
            src={getProfilePictureSrc(user.profilePicture)}
            alt={user.name || "Unknown"}
            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-[0_4px_10px_rgba(0,0,0,0.3)]"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user.name || "Unknown"}</p>
            <div className="flex items-center">
              {user.lastMessage && (
                <>
                  <p className="text-xs text-gray-500 truncate flex-1">{user.lastMessage}</p>
                  <span className="flex items-center ml-2">
                    {!user.isOnline ? (
                      <Check className="h-3 w-3 text-gray-400" />
                    ) : user.lastMessageRead ? (
                      <>
                        <Check className="h-3 w-3 text-blue-500" />
                        <Check className="h-3 w-3 -ml-1 text-blue-500" />
                      </>
                    ) : (
                      <>
                        <Check className="h-3 w-3 text-gray-400" />
                        <Check className="h-3 w-3 -ml-1 text-gray-400" />
                      </>
                    )}
                  </span>
                </>
              )}
            </div>
          </div>
          {user.unReadCount > 0 && (
            <Badge color="danger" content={user.unReadCount} shape="circle" size="sm">
              <span>Notifications</span>
            </Badge>
          )}
        </div>
      </div>
    ));
  };

  return (
    <div className="w-80 bg-white shadow-xl flex flex-col">
      <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600">
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