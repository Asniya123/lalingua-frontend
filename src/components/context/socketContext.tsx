import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { io, Socket } from "socket.io-client";
import { RootState } from "../../redux/store";

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: string[];
}

export interface LoggedUser {
  _id: string;
  role: "student" | "admin" | "tutor";
}

let globalSocket: Socket | null = null;

const SocketContext = createContext<SocketContextType>({
  socket: null,
  onlineUsers: [],
});

const hasId = (user: any): user is { _id: string } => {
  return user && typeof user._id === "string";
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  const student = useSelector((state: RootState) => state.auth.student);
  const admin = useSelector((state: RootState) => state.admin.adminId);
  const tutor = useSelector((state: RootState) => state.tutor.tutor);

  const getLoggedInUser = () => student || admin || tutor;

  const getRole = useCallback((): LoggedUser["role"] | null => {
    if (student) return "student";
    if (admin) return "admin";
    if (tutor) return "tutor";
    return null;
  }, [student, admin, tutor]);

  useEffect(() => {
    const loggedUser = getLoggedInUser();
    const role = getRole();

    if (hasId(loggedUser) && role && !globalSocket) {
      const newSocket = io("http://localhost:5000", {
        withCredentials: true,
        query: {
          userId: loggedUser._id,
          role,
        },
      });

      globalSocket = newSocket;
      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log("Socket connected");
      });

      newSocket.on("get-online-users", (users: string[]) => {
        setOnlineUsers(users);
      });

      newSocket.on("connect_error", (err) => {
        console.error("Socket error:", err);
      });

      newSocket.on("disconnect", (reason) => {
        console.warn("Socket disconnected:", reason);
      });
    }

    return () => {
      // Don't disconnect globalSocket on unmount if you want persistence
    };
  }, [getRole]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};


export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
