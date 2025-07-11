import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import { useSocket } from "../../context/useSocket";
import { useEffect } from "react";
import { endCallUser, setRoomIdUser, setShowVideoCallUser } from "../../../redux/slice/studentSlice";
import { Call, CallEnd } from "@mui/icons-material";
import toast from "react-hot-toast";

function IncomingVideoCall() {
  const { showIncomingVideoCall, student } = useSelector((state: RootState) => state.auth);
  const { socket, isSocketLoading } = useSocket();
  const dispatch = useDispatch<AppDispatch>();

  console.log("IncomingVideoCall:", {
    showIncomingVideoCall,
    studentId: student?._id,
    socket: !!socket,
    socketConnected: socket?.connected,
    isSocketLoading,
  });

  useEffect(() => {
    if (!socket || !socket.connected || isSocketLoading) {
      console.log("Socket not ready:", { socket: !!socket, connected: socket?.connected, isSocketLoading });
      return;
    }

    const handleCallRejection = (data: any) => {
      console.log("Received reject-call:", data);
      toast.error(data.message || "Call was ended by tutor");
      dispatch(endCallUser());
    };

    socket.on("reject-call", handleCallRejection);

    return () => {
      console.log("Cleaning up IncomingVideoCall useEffect");
      socket.off("reject-call", handleCallRejection);
    };
  }, [socket, isSocketLoading, dispatch]);

  if (isSocketLoading) {
    return (
      <div className="w-full h-full flex justify-center items-center z-50 fixed top-0 bg-black bg-opacity-50">
        <div className="text-white">Connecting...</div>
      </div>
    );
  }

  if (!socket || !socket.connected) {
    console.error("Socket not connected");
    toast.error("Chat server not connected");
    dispatch(endCallUser());
    return null;
  }

  if (!showIncomingVideoCall) {
    return null;
  }

  const handleEndCall = async () => {
    if (!showIncomingVideoCall) {
      console.error("No incoming call to end");
      return;
    }

    console.log("Emitting reject-call:", {
      to: showIncomingVideoCall.tutorId,
      sender: "student",
      name: student?.name,
      from: student?._id,
    });

    socket.emit("reject-call", {
      to: showIncomingVideoCall.tutorId,
      sender: "student",
      name: student?.name || "Student",
      from: student?._id,
      message: "Call rejected by student",
    });

    dispatch(endCallUser());
  };

  const handleAcceptCall = async () => {
    if (!showIncomingVideoCall || !student?._id) {
      console.error("Cannot accept call: Missing data", {
        showIncomingVideoCall,
        studentId: student?._id,
      });
      toast.error("Cannot accept call");
      return;
    }

    const acceptData = {
      roomId: showIncomingVideoCall.roomId,
      from: student._id,
      to: showIncomingVideoCall.tutorId,
    };

    console.log("Emitting accept-incoming-call with payload:", acceptData);
    socket.emit("accept-incoming-call", acceptData);

    // Update state to show video call
    dispatch(setRoomIdUser(showIncomingVideoCall.roomId));
    dispatch(setShowVideoCallUser(true));
    dispatch(endCallUser()); // Clear incoming call modal
    toast.success("Call accepted! Joining video call...");
  };

  return (
    <div className="w-full h-full flex justify-center items-center z-50 fixed top-0 bg-black bg-opacity-50">
      <div className="w-96 bg-cyan-950 rounded-xl flex flex-col items-center shadow-2xl shadow-black">
        <div className="flex flex-col gap-7 items-center">
          <span className="text-lg text-white mt-4">Incoming video call</span>
          <span className="text-3xl text-white font-bold">{showIncomingVideoCall?.tutorName}</span>
        </div>
        <div className="flex m-5">
          <img
            className="w-24 h-24 rounded-full object-cover"
            src={showIncomingVideoCall?.tutorImage || "/logos/avatar.avif"}
            alt="Tutor profile"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/logos/avatar.avif";
            }}
          />
        </div>
        <div className="flex m-2 mb-5 gap-7">
          <div
            className="bg-green-500 w-12 h-12 text-white rounded-full flex justify-center items-center m-1 cursor-pointer hover:bg-green-600"
            onClick={handleAcceptCall}
          >
            <Call className="w-6 h-6" />
          </div>
          <div
            className="bg-red-500 w-12 h-12 text-white rounded-full flex justify-center items-center m-1 cursor-pointer hover:bg-red-600"
            onClick={handleEndCall}
          >
            <CallEnd className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default IncomingVideoCall;