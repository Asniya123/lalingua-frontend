import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../redux/store";
import { useSocket } from "../../context/useSocket";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { setRoomId, setShowVideoCall, setVideoCall } from "../../../redux/slice/tutorSlice";
import toast from "react-hot-toast";

const TutorVideoCall = () => {
  const { roomIdTutor, videoCall, tutor } = useSelector((state: RootState) => state.tutor);
  const meetingRef = useRef<HTMLDivElement | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const { socket } = useSocket();
  const zegoInstanceRef = useRef<any>(null);

  useEffect(() => {
    console.log("TutorVideoCall useEffect triggered:", {
      roomIdTutor,
      videoCall,
      tutorId: tutor?._id,
      hasContainer: !!meetingRef.current,
    });

    if (!roomIdTutor || !videoCall || !tutor?._id) {
      console.log("Missing required data for video call initialization:", {
        roomIdTutor,
        videoCall: !!videoCall,
        tutorId: tutor?._id,
      });
      return;
    }

    const appId = parseInt(import.meta.env.VITE_ZEGO_APP_ID);
    const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET;

    if (!appId || !serverSecret) {
      console.error("Zego configuration missing:", { appId: !!appId, serverSecret: !!serverSecret });
      toast.error("Failed to initialize video call: Configuration error");
      return;
    }

    if (!meetingRef.current) {
      console.error("Meeting container not ready");
      return;
    }

    if (zegoInstanceRef.current) {
      console.log("Cleaning up existing Zego instance");
      zegoInstanceRef.current.destroy();
      zegoInstanceRef.current = null;
    }

    try {
      console.log("Initializing Zego with:", {
        roomId: roomIdTutor,
        userId: tutor._id,
        userName: tutor.name || "Tutor",
      });

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appId,
        serverSecret,
        roomIdTutor.toString(),
        tutor._id.toString(),
        tutor.name || "Tutor"
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);
      zegoInstanceRef.current = zp;

      zp.joinRoom({
        container: meetingRef.current,
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall,
        },
        turnOnMicrophoneWhenJoining: true,
        turnOnCameraWhenJoining: true,
        showPreJoinView: false,
        onJoinRoom: () => {
          console.log("Tutor successfully joined the room:", roomIdTutor);
          socket?.emit("joined-room", roomIdTutor); // Notify server of room join
          toast.success("Joined video call successfully");
        },
        onUserJoin: (users) => {
          console.log("Student joined the room:", users);
          toast.success("Student joined the call");
        },
        onUserLeave: (users) => {
          console.log("Student left the room:", users);
          toast("Student left the call");
          handleCleanup();
        },
        onLeaveRoom: () => {
          console.log("Tutor leaving room...");
          handleCleanup();
        },
      });
    } catch (error) {
      console.error("Error initializing Zego:", error);
      toast.error("Failed to initialize video call");
    }

    const handleUserLeft = () => {
      console.log("Received user-left event");
      toast("Student left the call");
      handleCleanup();
    };

    socket?.on("user-left", handleUserLeft);

    return () => {
      console.log("TutorVideoCall cleanup");
      socket?.off("user-left", handleUserLeft);
      if (zegoInstanceRef.current) {
        zegoInstanceRef.current.destroy();
        zegoInstanceRef.current = null;
      }
    };
  }, [roomIdTutor, videoCall, tutor, socket, dispatch]);

  const handleCleanup = () => {
    console.log("Cleaning up video call state");
    if (socket && videoCall?.userID) {
      socket.emit("leave-room", { to: videoCall.userID });
    }
    dispatch(setShowVideoCall(false));
    dispatch(setRoomId(null));
    dispatch(setVideoCall(null));

    if (zegoInstanceRef.current) {
      zegoInstanceRef.current.destroy();
      zegoInstanceRef.current = null;
    }
  };

  if (!roomIdTutor || !videoCall || !tutor?._id) {
    console.log("TutorVideoCall not rendering - missing data");
    return null;
  }

  return (
    <div className="w-screen h-screen bg-black absolute z-[100]">
      <div ref={meetingRef} className="w-full h-full" />
    </div>
  );
};

export default TutorVideoCall;