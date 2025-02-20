import { Routes, Route } from "react-router";
import Signup from "../../Pages/User/Signup";
import Login from '../../Pages/User/Login'
import Home from '../../Pages/User/home'
import StudentProfile from "../../components/student/StudentProfile";
import ProtectedRoute from "../../components/ProtectRoute";



function StudentRoute() {
    return (
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/login" element={<Login />} />
  
        {/* Protected Routes (Requires authentication) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/getProfile" element={<StudentProfile />} />
        </Route>
      </Routes>
    );
  }
export default StudentRoute;
