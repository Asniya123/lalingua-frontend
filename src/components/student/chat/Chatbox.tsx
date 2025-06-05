import { useEffect, useRef, useState } from "react";
import { Paperclip, Smile, Send, Check } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../redux/store";
import { fetch_room_message, fetch_room } from "../../../services/chatService";
import { format, isValid } from "date-fns";
import toast from "react-hot-toast";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { useSocket } from "../../context/useSocket";
import uploadToCloudinary from "../../../utils/Cloudinary";
import { ScrollShadow, CardBody, Card } from "@nextui-org/react";
import { Button } from "../../UI/Button";
import { Input } from "../../UI/InputField";

export interface Message {
  _id?: string;
  senderId: string;
  message: string;
  message_time: Date | string;
  message_type: string;
  isRead: boolean;
  chatId?: string;
}

interface ChatProps {
  roomId: string;
  userId: string;
  tutorId?: string;
}

export interface recieverData {
  name: string;
  _id: string;
  profilePicture: string;
}

export default function ChatBox({ roomId, userId, tutorId }: ChatProps) {
  const user = useSelector((state: RootState) => state.auth.student);
  const dispatch = useDispatch<AppDispatch>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [reciever, setReciever] = useState<recieverData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { socket, onlineUsers } = useSocket();
  const isOnline = reciever?._id ? onlineUsers?.includes(reciever._id) : false;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);

  console.log("ChatBox state:", {
    socketId: socket?.id,
    userId: user?._id,
    roomId,
    tutorId,
  });

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (!socket || !socket.connected) {
      console.error("Socket is null or not connected");
      setIsLoading(false);
      toast.error("Chat server not connected");
      return;
    }

    if (!roomId || !user?._id) {
      console.error("Invalid roomId or userId:", { roomId, userId: user?._id });
      setIsLoading(false);
      toast.error("Invalid room or user data");
      return;
    }

    if (socket && user?._id) {
      console.log("Registering student with socket:", user._id);
      socket.emit("register-user", { userId: user._id, role: "user" });

      socket.emit("joined-room", roomId);

      socket.off("new-message").on("new-message", (message: Message) => {
        console.log("New message received:", message);
        if (message.chatId === roomId) {
          const normalizedMessage = {
            ...message,
            message_time: message.message_time ? new Date(message.message_time) : new Date(),
          };
          setMessages((prev) => [...prev, normalizedMessage]);
          if (document.visibilityState === "visible") {
            socket.emit("mark-messages-read", { chatId: roomId, userId: user._id });
          }
        }
      });

      socket.off("message-read").on("message-read", (data: { chatId: string; userId: string }) => {
        if (data.chatId === roomId && data.userId !== user._id) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.senderId === user._id && !msg.isRead ? { ...msg, isRead: true } : msg
            )
          );
        }
      });

      socket.off("reject-call").on("reject-call", (data: any) => {
        console.log("Received reject-call:", data);
        if (data.sender === "tutor") {
          toast.error("Call rejected by tutor");
        } else if (data.sender === "user") {
          toast.error("Call rejected");
        }
      });
    }

    const fetchRecieverData = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching room messages for:", { roomId, userId: user._id });

        // First attempt to fetch room messages with the provided roomId
        let recieverUser = await fetch_room_message(roomId, user._id);
        console.log("fetch_room_message response:", recieverUser);

        if (recieverUser.success && recieverUser.room) {
          const roomData = recieverUser.room;
          console.log("Room data from fetch_room_message:", roomData);

          if (!Array.isArray(roomData.participants) || roomData.participants.length < 2) {
            throw new Error("Invalid room data: missing or insufficient participants");
          }

          const otherParticipant = roomData.participants.find(
            (p: { _id: string }) => p._id !== user._id
          );
          if (!otherParticipant) {
            throw new Error("No other participant found in room");
          }

          setReciever({
            _id: otherParticipant._id,
            name: roomData.name || otherParticipant.name || "Unknown",
            profilePicture: roomData.profilePicture || otherParticipant.profilePicture || "/logos/avatar.avif",
          });

          setMessages(
            Array.isArray(roomData.messages)
              ? roomData.messages.map((msg: Message) => ({
                  ...msg,
                  message_time: msg.message_time ? new Date(msg.message_time) : new Date(),
                }))
              : []
          );

          if (socket) {
            socket.emit("mark-messages-read", { chatId: roomId, userId: user._id });
          }
        } else if (tutorId) {
          // Fallback: Create or fetch a room using tutorId
          console.log("Falling back to fetch_room with tutorId:", tutorId);
          const roomResponse = await fetch_room(tutorId, user._id);
          console.log("fetch_room response:", roomResponse);

          if (roomResponse.success && roomResponse.room) {
            const roomData = roomResponse.room;
            if (!Array.isArray(roomData.participants) || roomData.participants.length < 2) {
              throw new Error("Invalid room data in fallback: missing or invalid participants");
            }

            const tutor = roomData.participants.find(
              (u: { _id: string }) => u._id !== user._id
            );
            if (tutor) {
              setReciever({
                _id: tutor._id,
                name: tutor.name || roomData.name || "Unknown",
                profilePicture: tutor.profilePicture || roomData.profilePicture || "/logos/avatar.avif",
              });
              setMessages(
                Array.isArray(roomData.messages)
                  ? roomData.messages.map((msg: Message) => ({
                      ...msg,
                      message_time: msg.message_time ? new Date(msg.message_time) : new Date(),
                    }))
                  : []
              );
            } else {
              throw new Error("No tutor found in room participants");
            }
          } else {
            throw new Error("Failed to load tutor data: " + (roomResponse.message || "Unknown error"));
          }
        } else {
          throw new Error("No tutorId provided and room data not found");
        }
      } catch (error: any) {
        console.error("Error fetching room messages:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          tutorId,
        });
        toast.error("Error loading chat room: " + (error.message || "Unknown error"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecieverData();

    return () => {
      if (socket) {
        socket.off("new-message");
        socket.off("message-read");
        socket.off("reject-call");
      }
    };
  }, [socket, user?._id, roomId, tutorId, dispatch]); // Removed isLoading from dependencies

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !user?._id || !reciever?._id) {
      console.error("Cannot send message: Missing required data", {
        socket: !!socket,
        userId: user?._id,
        recieverId: reciever?._id,
      });
      toast.error("Cannot send message: Missing required data");
      return;
    }

    if (newMessage.trim() === "") {
      console.log("Empty message ignored");
      return;
    }

    const message: Message = {
      senderId: user._id,
      message: newMessage,
      message_time: new Date(),
      message_type: "text",
      isRead: false,
      chatId: roomId,
    };

    console.log("Emitting message:", message);
    socket.emit("message", {
      ...message,
      roomId,
      recieverId: reciever._id,
      to: reciever._id,
    });

    setMessages((prev) => [...prev, message]);
    setNewMessage("");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!socket || !user?._id || !reciever?._id) {
      toast.error("Cannot upload image: Missing required data");
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validImageTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload an image in JPEG, PNG, GIF, or WEBP format.");
      return;
    }

    try {
      const url = await uploadToCloudinary(file);
      const message: Message = {
        senderId: user._id,
        message: url,
        message_time: new Date(),
        message_type: "image",
        isRead: false,
        chatId: roomId,
      };

      console.log("Emitting image message:", message);
      socket.emit("message", {
        ...message,
        roomId,
        recieverId: reciever._id,
        to: reciever._id,
      });

      setMessages((prev) => [...prev, message]);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    }
  };

  const handleEmojiClick = (data: EmojiClickData): void => {
    setNewMessage((prev) => prev + data.emoji);
  };

  const getProfilePictureSrc = (profilePicture?: string | null): string => {
    return profilePicture || "/logos/avatar.avif";
  };

  if (isLoading) {
    return <div className="flex h-full items-center justify-center text-gray-500">Loading chat...</div>;
  }

  if (!reciever) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium">Unable to load chat</p>
          <p className="text-sm">Please select another contact or try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 shadow-lg flex items-center justify-between">
        <div className="flex items-center">
          <img
            src={getProfilePictureSrc(reciever.profilePicture)}
            alt={reciever.name}
            className="w-[5%] rounded-[50%]"
          />
          <div className="ml-3">
            <p className="text-lg font-semibold text-white">{reciever.name || "Unknown"}</p>
            <p className="text-sm text-green-300">{isOnline ? "Online" : "Offline"}</p>
          </div>
        </div>
      </div>
      <ScrollShadow hideScrollBar className="flex-1 p-6 overflow-y-auto">
        {(!Array.isArray(messages) || messages.length === 0) ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <svg
              className="w-20 h-20 text-gray-300 mb-4"
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
            <p className="text-gray-500 text-lg font-medium">Say Hello</p>
            <p className="text-gray-400 text-sm">Start the conversation with {reciever.name || "this tutor"}!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const messageTime = new Date(msg.message_time);
            if (!isValid(messageTime)) {
              console.error("Invalid message_time:", { msgId: msg._id, message_time: msg.message_time, senderId: msg.senderId });
              return null;
            }
            return (
              <div
                key={msg._id || `${msg.senderId}-${msg.message_time}`}
                className={`flex mb-4 ${msg.senderId === user?._id ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`rounded-2xl p-4 max-w-md shadow-md transition-all duration-200 ${
                    msg.senderId === user?._id ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white" : "bg-white text-gray-800"
                  }`}
                >
                  {msg.message_type === "image" && <img src={msg.message} alt="Image" className="max-w-full h-auto rounded-lg" />}
                  {msg.message_type === "text" && <p className="text-sm">{msg.message}</p>}
                  {msg.message_type === "video-call" && (
                    <Card className="max-w-md bg-gray-800/90 backdrop-blur-sm">
                      <CardBody className="flex flex-row items-center gap-4 py-3 px-4">
                        <div className="relative">
                          <Check className="w-5 h-5 text-white" />
                          <span className="absolute -right-1 -top-1 block w-2 h-2 border-2 border-gray-800 bg-green-400 rounded-full" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white text-sm font-medium">Video call</h3>
                          <div className="text-gray-300 text-xs">{msg.message}</div>
                        </div>
                      </CardBody>
                    </Card>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-300">{format(messageTime, "hh:mm a")}</span>
                    {msg.senderId === user?._id && (
                      <span className="flex items-center ml-2">
                        {!isOnline ? (
                          <Check className="h-3 w-3 text-gray-500" />
                        ) : msg.isRead ? (
                          <>
                            <Check className="h-3 w-3 text-blue-300" />
                            <Check className="h-3 w-3 -ml-1 text-blue-300" />
                          </>
                        ) : (
                          <>
                            <Check className="h-3 w-3 text-gray-400" />
                            <Check className="h-3 w-3 -ml-1 text-gray-400" />
                          </>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef}></div>
      </ScrollShadow>
      <form
        onSubmit={handleSendMessage}
        className="bg-white p-4 border-t border-gray-200 flex items-center space-x-3 shadow-inner"
      >
        <div className="relative">
          {isEmojiPickerVisible && (
            <div className="absolute bottom-16 left-0 z-50">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
          <Button
            isIconOnly
            variant="light"
            aria-label="Insert emoji"
            onClick={() => setIsEmojiPickerVisible(!isEmojiPickerVisible)}
            className="text-gray-600 hover:bg-gray-100"
          >
            <Smile className="h-6 w-6" />
          </Button>
        </div>
        <Button
          isIconOnly
          variant="light"
          aria-label="Attach file"
          onClick={() => fileInput.current?.click()}
          className="text-gray-600 hover:bg-gray-100"
        >
          <Paperclip className="h-6 w-6" />
        </Button>
        <input
          type="file"
          ref={fileInput}
          onChange={handleImageUpload}
          className="hidden"
          accept="image/*"
        />
        <Input
          type="text"
          placeholder="Type a message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button
          type="submit"
          isIconOnly
          color="primary"
          aria-label="Send message"
          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600"
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
}