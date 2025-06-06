import { useEffect, useRef, useState } from "react";
import { Paperclip, Smile, Send, Video, Check } from "lucide-react";
import { Message, OutgoingCallPayload, VideoCallPayload } from "../../../interfaces/chat";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../redux/store";
import { fetch_tutor_room_message, fetch_tutor_room } from "../../../services/tutorChatService";
import { format } from "date-fns";
import toast from "react-hot-toast";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { useSocket } from "../../context/useSocket";
import uploadToCloudinary from "../../../utils/Cloudinary";
import { CardBody, ScrollShadow } from "@nextui-org/react";
import { Button } from "../../UI/Button";
import { Card } from "../../student/UI/card";
import { Input } from "../../UI/InputField";
import { setOutgoingCall, setShowOutgoingCall, setVideoCall } from "../../../redux/slice/tutorSlice";
import OutgoingVideoCall from "./outGoingModal";

interface ChatProps {
  roomId: string;
  tutorId: string;
  userId?: string;
}

export interface recieverData {
  name: string;
  _id: string;
  profilePicture: string;
}

export default function TutorChatBox({ roomId, tutorId, userId }: ChatProps) {
  const tutor = useSelector((state: RootState) => state.tutor.tutor);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [reciever, setReciever] = useState<recieverData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { socket, onlineUsers, isSocketLoading } = useSocket();
  const isOnline = reciever?._id ? onlineUsers?.includes(reciever._id) : false;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (!roomId || !tutor?._id) {
      console.error("Invalid roomId or tutorId:", { roomId, tutorId: tutor?._id });
      setIsLoading(false);
      toast.error("Invalid room or tutor data");
      return;
    }

    if (socket && !isSocketLoading) {
      socket.emit("joined-room", roomId);
      setMessages([]);
    }

    const fetchRecieverData = async () => {
      try {
        setIsLoading(true);
        console.log("fetchRecieverData called with:", { roomId, tutorId: tutor._id });
        const response = await fetch_tutor_room_message(roomId, tutor._id);
        console.log("fetch_tutor_room_message response:", JSON.stringify(response, null, 2));

        if (response.success && response.room) {
          let roomData = response.room;
          if (Array.isArray(roomData)) {
            console.warn("Received room as array, using first element:", roomData);
            roomData = roomData[0] || {};
          }
          if (!roomData || !Array.isArray(roomData.participants)) {
            throw new Error("Invalid room data: missing or invalid participants");
          }
          const otherParticipant = roomData.participants.find(
            (p: { _id: string }) => p._id !== tutor._id
          );
          if (!otherParticipant) {
            throw new Error("No other participant found in room");
          }

          setReciever({
            _id: otherParticipant._id,
            name: otherParticipant.name || otherParticipant.username || "Unknown",
            profilePicture: otherParticipant.profilePicture || "/logos/avatar.x",
          });

          setMessages(Array.isArray(roomData.messages) ? roomData.messages : []);
          if (socket && !isSocketLoading) {
            socket.emit("mark-messages-read", { chatId: roomId, userId: tutor._id });
          }
        } else if (userId) {
          console.log("Falling back to fetch_tutor_room with userId:", userId);
          const roomResponse = await fetch_tutor_room(userId, tutor._id);
          console.log("fetch_tutor_room response:", JSON.stringify(roomResponse, null, 2));
          if (roomResponse.success && roomResponse.room) {
            let roomData = roomResponse.room;
            if (Array.isArray(roomData)) {
              console.warn("Received room as array in fallback, using first element:", roomData);
              roomData = roomData[0] || {};
            }
            if (!roomData || !Array.isArray(roomData.participants)) {
              throw new Error("Invalid room data in fallback: missing or invalid participants");
            }
            const user = roomData.participants.find((u: { _id: string }) => u._id !== tutor._id);
            if (user) {
              setReciever({
                _id: user._id,
                name: user.name || user.username || "Unknown",
                profilePicture: user.profilePicture || "/logos/avatar.x",
              });
              setMessages(Array.isArray(roomData.messages) ? roomData.messages : []);
            } else {
              toast.error("Failed to load user data");
            }
          } else {
            toast.error("Failed to load room data");
          }
        } else {
          toast.error("No user found for this chat");
        }
      } catch (error: any) {
        console.error("Error fetching room messages:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          responseMessage: error.response?.data?.message || "No response message",
        });
        toast.error(`Error loading chat room: ${error.response?.data?.message || error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecieverData();
  }, [roomId, socket, tutor?._id, userId, dispatch, isSocketLoading]);

  useEffect(() => {
    if (!socket || isSocketLoading) return;

    const handleNewMessage = (message: Message) => {
      console.log("New message received:", message);
      if (message.senderId === reciever?._id) {
        setMessages((prev) => [...prev, message]);
        if (document.visibilityState === "visible" && tutor?._id) {
          socket.emit("mark-messages-read", { chatId: roomId, userId: tutor._id });
        } else if (!tutor?._id) {
          console.warn("Cannot mark messages as read: tutor is null or missing _id");
        }
      }
    };

    const handleMessageRead = (data: { chatId: string; userId: string }) => {
      if (data.chatId === roomId && data.userId === reciever?._id) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.senderId === tutor?._id && !msg.isRead ? { ...msg, isRead: true } : msg
          )
        );
      }
    };

    socket.on("new-message", handleNewMessage);
    socket.on("message-read", handleMessageRead);

    return () => {
      socket.off("new-message", handleNewMessage);
      socket.off("message-read", handleMessageRead);
    };
  }, [socket, reciever?._id, roomId, tutor?._id, isSocketLoading]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || isSocketLoading || !tutor?._id || !reciever?._id) {
      toast.error("Cannot send message: Missing required data");
      return;
    }

    if (newMessage.trim() === "") return;

    const message: Message = {
      senderId: tutor._id,
      message: newMessage,
      message_time: new Date(),
      message_type: "text",
      isRead: false,
    };

    socket.emit("message", { ...message, roomId, recieverId: reciever._id });
    setMessages((prev) => [...prev, message]);
    setNewMessage("");
  };

  const navigateVideoChat = () => {
  if (isSocketLoading) {
    console.error("Socket is still loading");
    toast.error("Chat server is connecting, please wait");
    return;
  }

  if (!socket || !socket.connected) {
    console.error("Socket is null or not connected");
    toast.error("Chat server not connected");
    return;
  }

  if (!tutor) {
    console.error("Cannot initiate video call: missing tutor ID found", { tutor });
    toast.error("Cannot start call: Tutor not logged in");
    return;
  }

  if (!reciever) {
    console.error("Cannot initiate video call: missing receiver ID found", { reciever });
    toast.error("Cannot start call: No recipient selected");
    return;
  }

  const callData: OutgoingCallPayload = {
    to: reciever._id,
    from: tutor._id,
    roomId,
    callType: "video",
    studentName: reciever.name || "Unknown Student",
    studentImage: reciever.profilePicture || "/logos/avatar.x",
    tutorName: tutor.name || "Unknown Tutor",
    tutorImage: tutor.profilePicture || "/logos/avatar.x",
  };

  const videoCallPayload: VideoCallPayload = {
    ...callData,
    type: "out-going",
    userID: reciever._id,
    userName: reciever.name || "Unknown Student",
    userImage: reciever.profilePicture || "/logos/avatar.x",
  };

  console.log("Emitting outgoing-video-call with data:", callData);
  console.log("Setting video call and outgoing call state:", videoCallPayload);

  try {
    socket.emit("outgoing-video-call", callData);
    dispatch(setVideoCall(videoCallPayload)); 
    dispatch(setOutgoingCall(videoCallPayload));
    dispatch(setShowOutgoingCall(true));
  } catch (error) {
    console.error("Error initiating video call:", error);
    toast.error("Failed to initiate video call");
  }
};

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!socket || isSocketLoading || !tutor?._id) {
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
        senderId: tutor._id,
        message: url,
        message_time: new Date(),
        message_type: "image",
        isRead: false,
      };

      socket.emit("message", { ...message, roomId });
      setMessages((prev) => [...prev, message]);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    }
  };

  const handleEmojiClick = (emojiObject: EmojiClickData): void => {
    setNewMessage((prev) => prev + emojiObject.emoji);
  };

  const getProfilePictureSrc = (profilePicture?: string | null): string => {
    return profilePicture || "/logos/avatar.x";
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        Loading chat...
      </div>
    );
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
    <div className="flex flex-col w-full h-full bg-pink-200">
      <div
        className="bg-gradient-to-r p-4 shadow-lg flex items-center justify-between"
        style={{ background: "linear-gradient(to right, #8C2C2C, #A03333)" }}
      >
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
        <Button
          isIconOnly
          variant="light"
          aria-label="Start video call"
          onClick={navigateVideoChat}
          className="text-white hover:bg-blue-700"
        >
          <Video className="h-6 w-6" />
        </Button>
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
            <p className="text-gray-400 text-sm">
              Start the conversation with {reciever.name || "this user"}!
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id || `${msg.senderId}-${msg.message_time}`}
              className={`flex mb-4 ${
                msg.senderId === tutor?._id ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`rounded-2xl p-4 max-w-md shadow-md transition-all duration-200 ${
                  msg.senderId === tutor?._id
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                    : "bg-white text-gray-800"
                }`}
              >
                {msg.message_type === "image" && (
                  <img src={msg.message} alt="Image" className="max-w-full h-auto rounded-lg" />
                )}
                {msg.message_type === "text" && <p className="text-sm">{msg.message}</p>}
                {msg.message_type === "video-call" && (
                  <Card className="max-w-md bg-gray-800/90 backdrop-blur-sm">
                    <CardBody className="flex flex-row items-center gap-4 py-3 px-4">
                      <div className="relative">
                        <Video className="w-5 h-5 text-white" />
                        <span className="absolute -right-1 -top-1 block w-2 h-2 border-2 border-gray-800 bg-green-400 rounded-full" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white text-sm font-medium">Video call</h3>
                        <p className="text-gray-300 text-xs">{msg.message}</p>
                      </div>
                    </CardBody>
                  </Card>
                )}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-300">
                    {format(new Date(msg.message_time), "hh:mm a")}
                  </span>
                  {msg.senderId === tutor?._id && (
                    <span className="flex items-center ml-2">
                      {!isOnline ? (
                        <Check className="h-3 w-3 text-gray-400" />
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
          ))
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