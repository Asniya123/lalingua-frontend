import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../redux/store";
import { useSocket } from "../../context/useSocket";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import {
  setRoomIdUser,
  setShowIncomingVideoCall,
  setShowVideoCallUser,
  setVideoCallUser,
} from "../../../redux/slice/studentSlice";
import toast from "react-hot-toast";

function UserVideoCall() {
  const videoCallRef = useRef<HTMLDivElement | null>(null);
  const zpRef = useRef<ZegoUIKitPrebuilt | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDestroying, setIsDestroying] = useState(false);
  const { roomIdUser, showIncomingVideoCall, student } = useSelector((state: RootState) => state.auth);
  const { socket } = useSocket();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!roomIdUser || !student?._id || isDestroying) {
      console.error("Missing roomIdUser or student ID", { roomIdUser, studentId: student?._id });
      toast.error("Cannot start video call: Invalid data");
      dispatch(setShowVideoCallUser(false));
      return;
    }

    // Prevent multiple initializations
    if (isInitialized || zpRef.current) {
      console.log("ZegoUIKit already initialized, skipping...");
      return;
    }

     const appId = parseInt(import.meta.env.VITE_ZEGO_APP_ID)
    const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET;

    // Add a small delay to ensure DOM is ready and prevent race conditions
    const initTimer = setTimeout(() => {
      if (isDestroying || zpRef.current) return;

      try {
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appId,
          serverSecret,
          roomIdUser.toString(),
          student._id!,
          student.name || "Student"
        );

        // Wait for container to be ready
        if (!videoCallRef.current) {
          console.error("Video call container not ready");
          return;
        }

        console.log("Creating ZegoUIKit instance...");
        zpRef.current = ZegoUIKitPrebuilt.create(kitToken);

        if (!zpRef.current) {
          console.error("Failed to create ZegoUIKit instance");
          return;
        }

        console.log("Joining room...");
        zpRef.current.joinRoom({
          container: videoCallRef.current,
          scenario: {
            mode: ZegoUIKitPrebuilt.OneONoneCall,
          },
          turnOnMicrophoneWhenJoining: true,
          turnOnCameraWhenJoining: true,
          showPreJoinView: false,
          onUserJoin: (users) => {
            console.log("Tutor joined the room:", users);
            toast.success("Tutor joined the call");
          },
          onUserLeave: (users) => {
            console.log("Tutor left the room:", users);
            toast("Tutor left the call");
            // Add delay to prevent race condition
            setTimeout(() => {
              if (!isDestroying) {
                endCall();
              }
            }, 100);
          },
          onLeaveRoom: () => {
            console.log("Student left the room");
            // Add delay to prevent race condition
            setTimeout(() => {
              if (!isDestroying) {
                endCall();
              }
            }, 100);
          },
        });

        setIsInitialized(true);
        console.log("ZegoUIKit initialized successfully");
      } catch (error) {
        console.error("Failed to initialize ZegoUIKit:", error);
        toast.error("Failed to start video call");
        dispatch(setShowVideoCallUser(false));
      }
    }, 100);

    return () => {
      clearTimeout(initTimer);
    };

    const handleUserLeft = () => {
      console.log("Tutor left the call");
      toast("Tutor ended the call");
      setTimeout(() => {
        if (!isDestroying) {
          endCall();
        }
      }, 100);
    };

    socket?.on("user-left", handleUserLeft);

    return () => {
      console.log("Cleaning up UserVideoCall");
      setIsDestroying(true);
      socket?.off("user-left", handleUserLeft);
      
      // Safe cleanup with error handling
      if (zpRef.current) {
        try {
          console.log("Attempting to hang up...");
          zpRef.current.hangUp();
        } catch (error) {
          console.warn("Error during hangUp:", error);
        }
        
        setTimeout(() => {
          try {
            if (zpRef.current) {
              console.log("Destroying ZegoUIKit instance...");
              zpRef.current.destroy();
              zpRef.current = null;
            }
          } catch (error) {
            console.warn("Error during destroy:", error);
          }
          setIsInitialized(false);
        }, 500);
      } else {
        setIsInitialized(false);
      }
    };
  }, []); // Empty dependency array to prevent re-initialization

  const endCall = async () => {
    if (isDestroying) return;
    
    setIsDestroying(true);
    
    try {
      // Emit socket event first
      if (socket && showIncomingVideoCall?.tutorId) {
        socket.emit("leave-room", { to: showIncomingVideoCall.tutorId, from: student?._id });
      }

      // Clean up ZegoUIKit
      if (zpRef.current) {
        try {
          await zpRef.current.hangUp();
        } catch (error) {
          console.warn("Error during hangUp in endCall:", error);
        }
        
        setTimeout(() => {
          try {
            if (zpRef.current) {
              zpRef.current.destroy();
              zpRef.current = null;
            }
          } catch (error) {
            console.warn("Error during destroy in endCall:", error);
          }
        }, 300);
      }

      // Update Redux state
      dispatch(setShowVideoCallUser(false));
      dispatch(setRoomIdUser(null));
      dispatch(setVideoCallUser(null));
      dispatch(setShowIncomingVideoCall(null));
      setIsInitialized(false);
    } catch (error) {
      console.error("Error in endCall:", error);
    }
  };

  if (!roomIdUser || isDestroying) {
    return null;
  }

  return (
    <div
      className="w-screen bg-black h-screen absolute z-[100]"
      ref={videoCallRef}
    />
  );
}

export default UserVideoCall;