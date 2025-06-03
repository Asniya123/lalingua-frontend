import { useParams } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useRef, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { useSocket } from "../../context/useSocket";
import { setRoomId, setShowVideoCall, setVideoCall } from "../../../redux/slice/tutorSlice";

const TutorVideoCall = () => {
  const { roomIdTutor, videoCall } = useSelector((state: RootState) => state.tutor);
  const meetingRef = useRef<HTMLDivElement | null>(null);

  const dispatch = useDispatch()
  let { socket } = useSocket()
  useEffect(() => {
    if(!roomIdTutor) return

    const appId = 630691153;
    const serverSecret = '9e3c10e2ca2444f75e43cf1b640f8af3'
  

  const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
    appId,
    serverSecret,
    roomIdTutor.toString(),
    Date.now().toString(),
    'Tutor'
  )

  const zp = ZegoUIKitPrebuilt.create(kitToken)

  zp.joinRoom({
    container: meetingRef.current, scenario: {
      mode: ZegoUIKitPrebuilt.OneONoneCall,
    },
    turnOnMicrophoneWhenJoining: true,
    turnOnCameraWhenJoining: true,
    showPreJoinView: false,
    onUserJoin:(users) => {
      users.forEach((user) => {
        console.log('User joined the room:', user)
      })
    },
    onLeaveRoom: () => {
      console.log('Leave Room.......')

      if(socket){
        socket.emit('leave-room', { to: videoCall?. userID})
      }

      dispatch(setShowVideoCall(false))
      dispatch(setRoomId(null))
      dispatch(setVideoCall(null))
    },
  })

  socket?.on('user-left', () => {
    console.log('User left  the room')
    zp.destroy()
    dispatch(setShowVideoCall(false))
    dispatch(setRoomId(null))
    dispatch(setVideoCall(null))
  })

  return () => {
    zp.destroy()
    socket?.off('user-left')
  }
}, [roomIdTutor, dispatch, socket])

  return (
        <div
          className="w-screen bg-black h-screen absolute z-[100]"
          ref={meetingRef}
        />
      );
};

export default TutorVideoCall;