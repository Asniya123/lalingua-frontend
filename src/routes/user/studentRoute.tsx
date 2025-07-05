import { Routes, Route } from "react-router-dom";
import Signup from "../../Pages/User/Signup";
import Login from "../../Pages/User/Login";
import Home from "../../Pages/User/home";
import StudentProfile from "../../components/student/Profile/StudentProfile";
import ProtectedRoute from "../../components/Protector/UserProtector/ProtectRoute";
import EditProfile from "../../components/student/Profile/EditProfile";
import ChooseLearning from "../../Pages/User/Course/ChooseLearning";
import Courses from "../../Pages/User/Course/Courses";
import Layouts from "../../Pages/User/Layouts";
import CourseDetail from "../../components/student/Course/CourseDetail";
import LanguageSelectors from "../../Pages/User/LanguageSelectors";
import EnrollmentCourses from "../../Pages/User/Course/EnrollmentCourses";
import PathProtect from "../../components/Protector/UserProtector/PathProtect";
import Lessons from "../../components/student/Course/Lesson";
import TutorLists from "../../Pages/User/TutorLists";
import RequireLanguage from "../../components/student/RequireLanguage";
import TutorDetails from "../../Pages/User/TutorDetails";
import Wallets from "../../Pages/User/wallets";
import ChatPage from "../../Pages/User/Chat";
import UserNotification from "../../components/student/chat/Notification";

const StudentRoute = () => {
  return (
    <Routes>
      {/* Public home page - accessible to everyone */}
      <Route path="/" element={<Layouts />}>
        <Route index element={<Home />} />
      </Route>

      {/* Public routes - protected from authenticated users */}
      <Route element={<PathProtect />}>
        <Route path="/register" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Protected routes - require authentication */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layouts />}>
          <Route path="/getProfile" element={<StudentProfile />} />
          <Route path="/editProfile" element={<EditProfile />} />
          <Route path="/languages" element={<LanguageSelectors />} />
          <Route path="/learning" element={<ChooseLearning />} />

          {/* Routes that require language selection */}
          <Route element={<RequireLanguage />}>
            <Route path="/course" element={<Courses />} />
            <Route path="/courseDetail/:id" element={<CourseDetail />} />
            <Route path="/enrolled-Courses" element={<EnrollmentCourses />} />
            <Route path="/lessons/:courseId" element={<Lessons />} />
            <Route path="/tutors" element={<TutorLists />} />
            <Route path="/tutorDetail/:id" element={<TutorDetails />} />
            <Route path="/wallet" element={<Wallets />} />
            <Route path="/chat/:roomId?" element={<ChatPage />} />
            <Route path="/notification" element={<UserNotification />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
};

export default StudentRoute;