import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../redux/store";
import { useSocket } from "../../context/useSocket";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { setRoomId, setShowVideoCall, setVideoCall } from "../../../redux/slice/tutorSlice";
import toast from "react-hot-toast";

const TutorVideoCall = () => {
  const { roomIdTutor, videoCall } = useSelector((state: RootState) => state.tutor);
  const meetingRef = useRef<HTMLDivElement | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const { socket } = useSocket();

  useEffect(() => {
    if (!roomIdTutor || !videoCall) {
      console.log("No roomIdTutor or videoCall, skipping initialization");
      return;
    }

    const appId = parseInt(import.meta.env.VITE_ZEGO_APP_ID);
    const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET;

    if (!appId || !serverSecret) {
      console.error("Zego app ID or server secret is missing");
      toast.error("Failed to initialize video call: Configuration error");
      return;
    }

    if (!meetingRef.current) {
      console.error("Meeting container not ready");
      toast.error("Video call container not found");
      return;
    }

    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appId,
      serverSecret,
      roomIdTutor.toString(),
      Date.now().toString(),
      "Tutor"
    );

    const zp = ZegoUIKitPrebuilt.create(kitToken);
    zp.joinRoom({
      container: meetingRef.current,
      scenario: {
        mode: ZegoUIKitPrebuilt.OneONoneCall,
      },
      turnOnMicrophoneWhenJoining: true,
      turnOnCameraWhenJoining: true,
      showPreJoinView: false,
      onUserJoin: (users) => {
        console.log("User joined the room:", users);
        toast.success("Student joined the call");
      },
      onLeaveRoom: () => {
        console.log("Leaving room...");
        if (socket) {
          socket.emit("leave-room", { to: videoCall.userID });
        }
        // Note: Removed setPrescription as it's not defined in the slice
        dispatch(setShowVideoCall(false));
        dispatch(setRoomId(null));
        dispatch(setVideoCall(null));
      },
    });

    const handleUserLeft = () => {
      console.log("User left the room.");
      zp.destroy();
      dispatch(setShowVideoCall(false));
      dispatch(setRoomId(null));
      dispatch(setVideoCall(null));
    };

    socket?.on("user-left", handleUserLeft);

    return () => {
      console.log("Cleaning up Zego instance and socket listeners");
      zp.destroy();
      socket?.off("user-left", handleUserLeft);
    };
  }, [roomIdTutor, videoCall, socket, dispatch]);

  return (
    <div className="w-screen h-screen bg-black absolute z-[100]">
      <div ref={meetingRef} className="w-full h-full" />
    </div>
  );
};

export default TutorVideoCall;