import { createContext, useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import { RootState, AppDispatch } from '../../redux/store';
import { toast } from 'react-toastify';
import {
  endCallUser,
  setRoomIdUser,
  setShowIncomingVideoCall,
  setShowVideoCallUser,
  setVideoCallUser,
} from '../../redux/slice/studentSlice';
import {
  endCallTutor,
  setRoomId,
  setShowOutgoingCall,
  setShowVideoCall,
  setVideoCall,
} from '../../redux/slice/tutorSlice';
import React from 'react';

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
  const connectionAttempt = useRef<number>(0);
  const maxReconnectAttempts = 5;

  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.student);
  const admin = useSelector((state: RootState) => state.admin.adminId);
  const tutor = useSelector((state: RootState) => state.tutor.tutor); // Fixed: renamed from tutorId to tutor

  const getRole = useCallback((): string | null => {
    if (user) return 'user';
    if (admin) return 'admin';
    if (tutor) return 'tutor'; // Fixed: using tutor instead of tutorId
    return null;
  }, [user, admin, tutor]); // Fixed: added tutor to dependencies

  const getLoggedUser = useCallback(() => {
    return user?._id || admin || tutor?._id || null; // Fixed: using tutor instead of tutorId
  }, [user, admin, tutor]); // Fixed: added admin and tutor to dependencies

  const initializeSocket = useCallback(() => {
    const userId = getLoggedUser(); // Fixed: removed _id parameter
    const role = getRole();

    console.log('Initializing socket with:', { userId, role });

    if (!userId || !role) {
      console.log('No logged user or role found, skipping socket connection');
      setIsSocketLoading(false);
      return () => {};
    }

    if (socketRef.current) {
      console.log('Disconnecting existing socket');
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
    }

    console.log('Creating new socket connection...');
    const newSocket = io('http://localhost:5000', {
      query: { userId, role },
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);
    setIsSocketLoading(true);

    newSocket.on('connect', () => {
      console.log('Socket connected successfully:', newSocket.id);
      connectionAttempt.current = 0;
      newSocket.emit('register-user', { userId, role });
      setIsSocketLoading(false);
      toast.success('Connected to chat server');
    });

    newSocket.on('getOnlineUsers', (users) => {
      console.log('Received online users:', JSON.stringify(users, null, 2));
      setOnlineUsers(Array.isArray(users) ? users : []);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      connectionAttempt.current += 1;
      if (connectionAttempt.current >= maxReconnectAttempts) {
        setIsSocketLoading(false);
        toast.error('Failed to connect to server after multiple attempts');
      }
    });

    newSocket.on('error', (error: { message: string }) => {
      console.error('Socket error:', error.message);
      toast.error(error.message || 'An error occurred');
    });

    newSocket.on('disconnect', (reason) => {
      console.warn('Socket disconnected:', reason);
      setIsSocketLoading(true);
      toast.warn('Disconnected from server, attempting to reconnect...');
    });

    return () => {
      console.log('Cleaning up socket connection');
      newSocket.off('connect');
      newSocket.off('getOnlineUsers');
      newSocket.off('connect_error');
      newSocket.off('error');
      newSocket.off('disconnect');
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsSocketLoading(false);
    };
  }, [getLoggedUser, getRole]);

  useEffect(() => {
    const cleanup = initializeSocket();
    return cleanup;
  }, [initializeSocket]);

  useEffect(() => {
    if (!socket || isSocketLoading) {
      console.log('Socket is null or loading, skipping event listeners');
      return;
    }

    const handleIncomingVideoCall = (data: any) => {
      console.log('Received incoming-video-call:', JSON.stringify(data, null, 2));
      if (!data || typeof data !== 'object') {
        console.error('Invalid incoming-video-call data', data);
        toast.error('Invalid video call data received');
        return;
      }

      const missingFields = [];
      if (!data._id) missingFields.push('_id');
      if (!data.from) missingFields.push('from');
      if (!data.roomId) missingFields.push('roomId');
      if (!data.callType) missingFields.push('callType');

      if (missingFields.length > 0) {
        console.error(`Invalid video call data. Missing: ${missingFields.join(', ')}`, data);
        toast.error('Invalid video call data received');
        return;
      }

      const role = getRole();
      if (role !== 'user' || !user || user._id !== data._id) {
        console.log('Ignoring incoming-video-call: not a student or ID mismatch', {
          userId: user?._id,
          tutorId: tutor?._id, // Fixed: using tutor instead of undefined tutor
          dataId: data._id,
          role,
        });
        if (tutor || admin) { // Fixed: using tutor instead of undefined tutor
          dispatch(setShowIncomingVideoCall(null));
        }
        return;
      }

      console.log(`Student ${user._id} received incoming call from tutor ${data.from}`);
      dispatch(setShowIncomingVideoCall({
        _id: data._id,
        tutorId: data.from,
        callType: data.callType,
        tutorName: data.tutorName || 'Unknown Tutor',
        tutorImage: data.tutorImage || '/logos/avatar.avif',
        roomId: data.roomId,
      }));
    };

    const handleAcceptedCall = (data: any) => {
      console.log('Received accepted-call:', JSON.stringify(data, null, 2));
      const missingFields = [];
      if (!data.roomId) missingFields.push('roomId');

      if (missingFields.length > 0) {
        console.error(`Invalid accepted-call data. Missing: ${missingFields.join(', ')}`, data);
        toast.error('Invalid call acceptance data received');
        return;
      }

      const role = getRole();
      if (tutor && tutor._id === data.tutorId && role === 'tutor') {
        console.log(`Tutor ${tutor._id} received accepted-call, joining room ${data.roomId}`);
        dispatch(setRoomId(data.roomId));
        dispatch(setShowVideoCall(true));
        dispatch(setShowOutgoingCall(false));
      } else if (user && user._id === data.from && role === 'user') {
        console.log(`Student ${user._id} received accepted-call confirmation, joining room ${data.roomId}`);
        dispatch(setRoomIdUser(data.roomId));
        dispatch(setShowVideoCallUser(true));
        dispatch(setShowIncomingVideoCall(null));
      } else {
        console.log('Ignoring accepted-call: ID or role mismatch', {
          tutorId: tutor?._id,
          userId: user?._id,
          dataTutorId: data.tutorId,
          dataFrom: data.from,
          role,
        });
      }
    };

    const handleRejectCall = (data: any) => {
      console.log('Received reject-call:', JSON.stringify(data, null, 2));
      toast.error(data.message || 'Call ended/rejected');

      const role = getRole();
      if (role === 'user') {
        dispatch(setVideoCallUser(null));
        dispatch(setShowIncomingVideoCall(null));
        dispatch(setShowVideoCallUser(false));
        dispatch(setRoomIdUser(null));
        dispatch(endCallUser());
      } else if (role === 'tutor') {
        dispatch(setVideoCall(null));
        dispatch(setShowOutgoingCall(false));
        dispatch(setShowVideoCall(false));
        dispatch(setRoomId(null));
        dispatch(endCallTutor());
      }
      console.log(`Call cleanup completed for ${role}`);
    };

    socket.on('incoming-video-call', handleIncomingVideoCall);
    socket.on('tutor-call-accept', handleAcceptedCall);
    socket.on('reject-call', handleRejectCall);

    return () => {
      console.log('Cleaning up socket event listeners');
      socket.off('incoming-video-call', handleIncomingVideoCall);
      socket.off('tutor-call-accept', handleAcceptedCall);
      socket.off('reject-call', handleRejectCall);
    };
  }, [socket, dispatch, user, tutor, admin, isSocketLoading, getRole]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, isSocketLoading }}>
      {children}
    </SocketContext.Provider>
  );
};