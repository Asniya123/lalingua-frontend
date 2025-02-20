import { BrowserRouter, Routes, Route } from "react-router-dom";
import StudenRoute from "./routes/user/studentRoute";
import TutorRoute from "./routes/tutor/tutorRoute";
import AdminRoute from "./routes/admin/adminRoute";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <GoogleOAuthProvider clientId="425216028651-ivvase8ps58950bqm1vk2mv766p625p5.apps.googleusercontent.com">
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
          <Route path="/*" element={<StudenRoute />} />
          <Route path="/tutor/*" element={<TutorRoute />} />
          <Route path="/admin/*" element={<AdminRoute />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
};

export default App;
