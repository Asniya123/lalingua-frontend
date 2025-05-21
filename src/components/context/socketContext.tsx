import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSelector } from "react-redux";
import { io, Socket } from "socket.io-client";
import { RootState } from "../../redux/store";


interface SocketContextType {
  socket: Socket | null;
  onlineUsers: string[];
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  onlineUsers: [],
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  const user = useSelector((state: RootState) => state.auth.student);
  const admin = useSelector((state: RootState) => state.admin);
  const tutor = useSelector((state: RootState) => state.tutor);
  const loggedUser = user || admin || tutor;

  const getRole = React.useCallback((): string | null => {
    if (user) return "user";
    if (admin) return "admin";
    if (tutor) return "agent";
    return null;
  }, [user, admin, tutor]);

  useEffect(() => {
    if (loggedUser && "_id" in loggedUser) {
      const role = getRole();
      const newSocket = io("http://localhost:5000", {
        query: {
          userId: loggedUser._id,
          role,
        },
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log("Socket connected:", newSocket.id);
      });

      newSocket.on("get-online-users", (users) => {
        setOnlineUsers(users);
      });

      newSocket.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message);
      });

      newSocket.on("disconnect", (reason) => {
        console.warn("Socket disconnected:", reason);
      });

      return () => {
        newSocket.off("get-online-users");
        newSocket.disconnect();
      };
    }
  }, [getRole, loggedUser]);

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
