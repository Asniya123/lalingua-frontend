import { BrowserRouter, Routes, Route } from "react-router-dom";
import StudentRoute from './routes/user/studentRoute.js';
import TutorRoute from "./routes/tutor/tutorRoute.js";
import AdminRoute from "./routes/admin/adminRoute.js";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { HeroUIProvider } from '@heroui/react';
import { SocketProvider, useSocket  } from "./components/context/socketContext.js";

const App = () => {
  return (
    <GoogleOAuthProvider clientId="425216028651-ivvase8ps58950bqm1vk2mv766p625p5.apps.googleusercontent.com">
      <HeroUIProvider> 
        <SocketProvider>
        <BrowserRouter>
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
          
          <Routes>
            <Route path="/*" element={<StudentRoute />} />
            <Route path="/tutor/*" element={<TutorRoute />} />
            <Route path="/admin/*" element={<AdminRoute />} />
          </Routes>
        </BrowserRouter>
        </SocketProvider>
      </HeroUIProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
