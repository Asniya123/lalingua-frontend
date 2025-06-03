// App.tsx
import { Routes, Route } from "react-router-dom";
import StudentRoute from "./routes/user/studentRoute";
import TutorRoute from "./routes/tutor/tutorRoute";
import AdminRoute from "./routes/admin/adminRoute";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { HeroUIProvider } from "@heroui/react";
import { SocketProvider } from "./components/context/socketContext";
import { useSelector } from "react-redux";
import { RootState } from "./redux/store";
import OutgoingVideoCall from "./components/tutor/chat/outGoingModal";
import IncomingVideoCall from "./components/student/chat/incomingVideoCall";
import UserVideoCall from "./components/student/chat/userVideoCall";
import VideoCall from "./components/tutor/chat/videoCall";

const App = () => {
  const { videoCall, showVideoCallTutor } = useSelector((state: RootState) => state.tutor);
  const { showIncomingVideoCall, showVideoCallUser } = useSelector((state: RootState) => state.auth);

  console.log("App.tsx tutor state:", { videoCall, showVideoCallTutor });
  console.log("App.tsx student state:", { showIncomingVideoCall, showVideoCallUser });

  return (
    <GoogleOAuthProvider clientId="425216028651-ivvase8ps58950bqm1vk2mv766p625p5.apps.googleusercontent.com">
      <HeroUIProvider>
        <SocketProvider>
          <>
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
            />
            {videoCall && videoCall.type === "out-going" && (
              <>
                {console.log("Rendering OutgoingVideoCall with:", videoCall)}
                <OutgoingVideoCall />
              </>
            )}
            {showVideoCallTutor && (
              <>
                {console.log("Rendering VideoCall with:", showVideoCallTutor)}
                <VideoCall />
              </>
            )}
            {showIncomingVideoCall && (
              <>
                {console.log("Rendering IncomingVideoCall with:", showIncomingVideoCall)}
                <IncomingVideoCall />
              </>
            )}
            {showVideoCallUser && (
              <>
                {console.log("Rendering UserVideoCall with:", showVideoCallUser)}
                <UserVideoCall />
              </>
            )}
            <Routes>
              <Route path="/*" element={<StudentRoute />} />
              <Route path="/tutor/*" element={<TutorRoute />} />
              <Route path="/admin/*" element={<AdminRoute />} />
            </Routes>
          </>
        </SocketProvider>
      </HeroUIProvider>
    </GoogleOAuthProvider>
  );
};

export default App;