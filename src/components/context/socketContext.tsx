import { createContext, useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io, Socket } from "socket.io-client";
import { RootState, AppDispatch } from "../../redux/store";
import { toast } from "react-toastify";
import {
  endCallUser,
  setRoomIdUser,
  setShowIncomingVideoCall,
  setShowVideoCallUser,
  setVideoCallUser,
} from "../../redux/slice/studentSlice";
import {
  endCallTutor,
  setRoomId,
  setShowVideoCall,
  setVideoCall,
} from "../../redux/slice/tutorSlice";
import React from "react";

export interface SocketContextType {
  socket: Socket | null;
  onlineUsers: string[];
  isSocketLoading: boolean;
}

export const SocketContext = createContext<SocketContextType>({
  socket: null,
  onlineUsers: [],
  isSocketLoading: true,
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isSocketLoading, setIsSocketLoading] = useState(true);
  const connectionAttemptRef = useRef<number>(0);
  const maxReconnectAttempts = 5;

  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.student);
  const admin = useSelector((state: RootState) => state.admin.adminId);
  const tutor = useSelector((state: RootState) => state.tutor.tutor);

  const getRole = useCallback((): string | null => {
    if (user) return "user";
    if (admin) return "admin";
    if (tutor) return "tutor";
    return null;
  }, [user, admin, tutor]);

  const getLoggedUserId = useCallback(() => {
    return user?._id || admin || tutor?._id || null;
  }, [user, admin, tutor]);

  const initializeSocket = useCallback(() => {
    const userId = getLoggedUserId();
    const role = getRole();

    console.log("Initializing socket with:", { userId, role });

    if (!userId || !role) {
      console.log("No logged user or role found, skipping socket connection");
      setIsSocketLoading(false);
      return () => {};
    }

    if (socketRef.current) {
      console.log("Disconnecting existing socket");
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
    }

    console.log("Creating new socket connection...");
    const newSocket = io("http://localhost:5000", {
      query: { userId, role },
      transports: ["websocket", "polling"],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);
    setIsSocketLoading(true);

    newSocket.on("connect", () => {
      console.log("Socket connected successfully:", newSocket.id);
      connectionAttemptRef.current = 0;
      newSocket.emit("register-user", { userId, role });
      setIsSocketLoading(false);
      toast.success("Connected to chat server");
    });

    newSocket.on("getOnlineUsers", (users) => {
      console.log("Received online users:", users);
      setOnlineUsers(Array.isArray(users) ? users : []);
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
      connectionAttemptRef.current += 1;
      if (connectionAttemptRef.current >= maxReconnectAttempts) {
        setIsSocketLoading(false);
        toast.error("Failed to connect to server after multiple attempts");
      }
    });

    newSocket.on("error", (error: { message: string }) => {
      console.error("Socket error:", error.message);
      toast.error(error.message || "An error occurred");
    });

    newSocket.on("disconnect", (reason) => {
      console.warn("Socket disconnected:", reason);
      setIsSocketLoading(true);
      toast.warn("Disconnected from server, attempting to reconnect...");
    });

    return () => {
      console.log("Cleaning up socket connection");
      newSocket.off("connect");
      newSocket.off("getOnlineUsers");
      newSocket.off("connect_error");
      newSocket.off("error");
      newSocket.off("disconnect");
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsSocketLoading(false);
    };
  }, [getLoggedUserId, getRole]);

  useEffect(() => {
    const cleanup = initializeSocket();
    return cleanup;
  }, [initializeSocket]);

  useEffect(() => {
    if (!socket || isSocketLoading) {
      console.log("Socket is null or loading, skipping event listeners");
      return;
    }

    const handleIncomingVideoCall = (data: any) => {
      console.log("Received incoming-video-call:", JSON.stringify(data, null, 2));
      if (!data || typeof data !== "object") {
        console.error("Invalid incoming-video-call data", data);
        toast.error("Invalid video call data received");
        return;
      }

      const missingFields = [];
      if (!data._id) missingFields.push("_id");
      if (!data.from) missingFields.push("from");
      if (!data.roomId) missingFields.push("roomId");
      if (!data.callType) missingFields.push("callType");

      if (missingFields.length > 0) {
        console.error(`Invalid video call data. Missing: ${missingFields.join(", ")}`, data);
        toast.error("Invalid video call data received");
        return;
      }

      if (user && user._id === data._id && getRole() === "user") {
        dispatch(setShowIncomingVideoCall({
          _id: data._id,
          tutorId: data.from,
          callType: data.callType,
          tutorName: data.tutorName || "Unknown Tutor",
          tutorImage: data.tutorImage || "/logos/avatar.avif",
          roomId: data.roomId,
        }));
      } else {
        console.log("Ignoring incoming-video-call: not a student or ID mismatch", {
          userId: user?._id,
          dataId: data._id,
          role: getRole(),
        });
      }
    };

    const handleAcceptedCall = (data: any) => {
      console.log("Received accepted-call:", data);
      const missingFields = [];
      if (!data.roomId) missingFields.push("roomId");
      if (!data.from) missingFields.push("from");
      if (!data._id) missingFields.push("_id");

      if (missingFields.length > 0) {
        console.error(`Invalid accepted-call data. Missing: ${missingFields.join(", ")}`, data);
        toast.error("Invalid call acceptance data received");
        return;
      }

      if (tutor && tutor._id === data.from && getRole() === "tutor") {
        dispatch(setRoomId(data.roomId));
        dispatch(setShowVideoCall(true));
        socket.emit("tutor-call-accept", {
          roomId: data.roomId,
          tutorId: data.from,
          from: data._id,
        });
      }
    };

    const handleTutorCallAccept = (data: any) => {
      console.log("Received tutor-call-accept:", data);
      if (!data.roomId) {
        console.error("Invalid tutor-call-accept data. Missing: roomId", data);
        toast.error("Invalid tutor acceptance data received");
        return;
      }

      if (user && getRole() === "user") {
        dispatch(setRoomIdUser(data.roomId));
        dispatch(setShowVideoCallUser(true));
      }
    };

    const handleRejectCall = (data: any) => {
      console.log("Received reject-call:", data);
      toast.error("Call ended/rejected");
      dispatch(setVideoCall(null));
      dispatch(endCallTutor());
      dispatch(endCallUser());
    };

    const handleUserLeft = (data: string | undefined) => {
      console.log("Received user-left:", data);
      if (!data) {
        console.error("Invalid user-left data: userId is undefined");
        return;
      }

      if (data === user?._id) {
        dispatch(setShowVideoCallUser(false));
        dispatch(setRoomIdUser(null));
        dispatch(setVideoCallUser(null));
        dispatch(setShowIncomingVideoCall(null));
      } else if (data === tutor?._id) {
        dispatch(setShowVideoCall(false));
        dispatch(setRoomId(null));
        dispatch(setVideoCall(null));
      }
    };

    socket.on("incoming-video-call", handleIncomingVideoCall);
    socket.on("accepted-call", handleAcceptedCall);
    socket.on("tutor-call-accept", handleTutorCallAccept);
    socket.on("reject-call", handleRejectCall);
    socket.on("user-left", handleUserLeft);

    return () => {
      console.log("Cleaning up socket event listeners");
      socket.off("incoming-video-call", handleIncomingVideoCall);
      socket.off("accepted-call", handleAcceptedCall);
      socket.off("tutor-call-accept", handleTutorCallAccept);
      socket.off("reject-call", handleRejectCall);
      socket.off("user-left", handleUserLeft);
    };
  }, [socket, dispatch, user, tutor, isSocketLoading, getRole]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, isSocketLoading }}>
      {children}
    </SocketContext.Provider>
  );
};