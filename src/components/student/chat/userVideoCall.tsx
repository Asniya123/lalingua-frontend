import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { useSocket } from "../../context/useSocket";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { setRoomIdUser, setShowIncomingVideoCall, setShowVideoCallUser, setVideoCallUser } from "../../../redux/slice/studentSlice";

function UserVideoCall(){
    const videoCallRef = useRef<HTMLDivElement | null>(null)
    const {roomIdUser, showIncomingVideoCall, videoCall} = useSelector((state: RootState) => state.auth)
    let{socket} = useSocket()
    
    const dispatch = useDispatch()
    useEffect(() => {
        if(!roomIdUser) return
    }, [roomIdUser])

    useEffect(() => {
        if(!roomIdUser) return

        const appId = 630691153;
        const serverSecret = '9e3c10e2ca2444f75e43cf1b640f8af3'

        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
            appId,
            serverSecret,
            roomIdUser.toString(),
            Date.now().toString(),
            'User'
        )

        const zp = ZegoUIKitPrebuilt.create(kitToken)

        zp.joinRoom({
            container: videoCallRef.current,
            scenario: {
                mode: ZegoUIKitPrebuilt.OneONoneCall,
            },
            turnOnCameraWhenJoining: true,
            showPreJoinView: false,
            onLeaveRoom: () => {
                socket?.emit('leave-room', {to: showIncomingVideoCall?._id})

                dispatch(setShowVideoCallUser(false))
                dispatch(setRoomIdUser(null))
                dispatch(setVideoCallUser(null))
                dispatch(setShowIncomingVideoCall(null))
            },
        })

        socket?.on('user-left', () => {
            zp.destroy()

            dispatch(setShowVideoCallUser(false))
            dispatch(setRoomIdUser(null))
            dispatch(setVideoCallUser(null))
            dispatch(setShowIncomingVideoCall(null))

            localStorage.removeItem('roomId')
            localStorage.removeItem('showVideoCall')
        })

        return () => {
            window.location.reload()

            zp.destroy()
        }
    }, [roomIdUser, dispatch, socket])

    return(
         <div
              className="w-screen bg-black h-screen absolute z-[100]"
              ref={videoCallRef}
            />
          );
}

export default UserVideoCall