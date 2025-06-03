import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import { useSocket } from "../../context/useSocket";
import { useEffect, useRef } from "react";
import { endCallTutor, setShowOutgoingCall } from "../../../redux/slice/tutorSlice";
import { CallEnd } from "@mui/icons-material";
import toast from "react-hot-toast";

function OutgoingVideoCall() {
  const { videoCall, tutor } = useSelector((state: RootState) => state.tutor);
  const { socket, isSocketLoading } = useSocket();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    console.log("OutgoingVideoCall useEffect triggered:", {
      videoCall,
      tutorId: tutor?._id,
      socket: !!socket,
      socketConnected: socket?.connected,
      isSocketLoading,
    });

    if (isSocketLoading) {
      console.log("Socket is loading, waiting...");
      return;
    }

    if (!socket || !socket.connected) {
      console.error("Socket is null or not connected");
      toast.error("Connection lost. Please try again.");
      dispatch(endCallTutor());
      return;
    }

    if (!tutor?._id) {
      console.error("Cannot display outgoing call: No tutor ID found", { tutor });
      toast.error("Failed to start video call: Tutor not logged in");
      dispatch(endCallTutor());
      return;
    }

    if (!videoCall || videoCall.type !== "out-going") {
      console.log("No outgoing call to display");
      dispatch(endCallTutor());
      return;
    }

    // Set up timeout for unanswered calls
    timeoutRef.current = setTimeout(() => {
      console.log("Call timeout - ending call");
      toast.error("Call timeout - no response");
      handleEndCall();
    }, 60000);

    // Handle call rejection from student
    const handleCallRejection = (data: any) => {
      console.log("Call rejected:", data);
      toast.error(data.message || "Call was rejected or user is offline");
      handleEndCall();
    };

    socket.on("reject-call", handleCallRejection);

    return () => {
      console.log("Cleaning up OutgoingVideoCall useEffect");
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      socket.off("reject-call", handleCallRejection);
    };
  }, [videoCall, socket, tutor, dispatch, isSocketLoading]);

  const handleEndCall = () => {
    console.log("Ending video call");

    if (socket && socket.connected && videoCall && tutor?._id) {
      console.log("Emitting reject-call to end outgoing call", {
        to: videoCall.userID,
        sender: "tutor",
        name: videoCall.studentName || videoCall.userName || "Unknown Student",
        from: tutor._id,
      });
      socket.emit("reject-call", {
        to: videoCall.userID,
        sender: "tutor",
        name: videoCall.studentName || videoCall.userName || "Unknown Student",
        from: tutor._id,
      });
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    dispatch(endCallTutor());
  };

  if (!videoCall || videoCall.type !== "out-going") {
    console.log("OutgoingVideoCall not rendering: no valid outgoing call");
    return null;
  }

  console.log("OutgoingVideoCall rendering with data:", {
    studentName: videoCall.studentName || videoCall.userName,
    studentImage: videoCall.studentImage || videoCall.userImage,
    to: videoCall.userID,
  });

  return (
    <div className="w-full h-full fixed flex justify-center items-center z-50 top-0 left-0 bg-black bg-opacity-50">
      <div className="w-96 bg-cyan-950 flex justify-center items-center z-50 rounded-xl shadow-2xl shadow-black">
        <div className="flex flex-col gap-6 items-center py-8">
          <span className="text-lg text-white">Calling...</span>
          <span className="text-3xl text-white font-semibold">
            {videoCall.studentName || videoCall.userName || "Student"}
          </span>
          <div className="flex justify-center">
            <img
              className="w-24 h-24 rounded-full object-cover border-4 border-white"
              src={videoCall.studentImage || videoCall.userImage || "/logos/avatar.x"}
              alt="Student profile"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/logos/avatar.x";
              }}
            />
          </div>
          {(!socket || !socket.connected || isSocketLoading) && (
            <div className="text-red-500 text-sm">
              {isSocketLoading ? "Connecting..." : "Connection lost - reconnecting..."}
            </div>
          )}
          <div
            className="bg-red-600 w-12 h-12 text-white rounded-full flex justify-center items-center cursor-pointer hover:bg-red-700 transition-colors"
            onClick={handleEndCall}
          >
            <CallEnd className="text-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default OutgoingVideoCall;