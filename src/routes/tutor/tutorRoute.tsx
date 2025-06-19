import { Routes, Route } from "react-router-dom";
import Signup from "../../Pages/Tutor/signup";
import Login from "../../Pages/Tutor/Login";
import TutorDashboard from "../../Pages/Tutor/home";
import TutorProtectRoute from "../../components/Protector/TutorProtector/TutorProtectRoute";
import TutorProfile from "../../components/tutor/profile/TutorProfile";
import EditProfile from "../../components/tutor/profile/EditTutorProfile";
import AddCourses from "../../Pages/Tutor/course/AddCourses";
import ListCourses from "../../Pages/Tutor/course/ListCourses";
import AddLessons from "../../Pages/Tutor/lesson/AddLessons";
import ListLessons from "../../Pages/Tutor/lesson/ListLessons";
import EditCourses from "../../Pages/Tutor/course/EditCourses";
import Layouts from "../../Pages/Tutor/Layouts";
import EditLessons from "../../Pages/Tutor/lesson/EditLessons";
import PathProtect from "../../components/Protector/TutorProtector/PathProtector";
import TutorChatPage from "../../Pages/Tutor/ChatPage";
import EnrolledStudent from "../../Pages/Tutor/course/EnrolledStudent";

function TutorRoute() {
    return (
        <Routes>
            <Route element={<PathProtect />}>
                <Route path="/register" element={<Signup />} />
                <Route path="/login" element={<Login />} />
            </Route>
            
            <Route path="/home" element={<Layouts />}>
                <Route index element={<TutorDashboard />} /> 
            </Route>

            <Route element={<TutorProtectRoute />}>
                <Route element={<Layouts />}>
                    <Route path="/getProfile" element={<TutorProfile />} />
                    <Route path="/editProfile" element={<EditProfile />} />
                    
                    <Route path="/addCourse" element={<AddCourses />} />
                    <Route path="/listCourse" element={<ListCourses />} />
                    
                    <Route path="/courses/:courseId/editLesson/:lessonId" element={<EditLessons />} />
                    <Route path="/courses/:courseId/addLesson" element={<AddLessons />} />
                    <Route path="/listLesson/:courseId" element={<ListLessons />} />
                    <Route path='/editCourse/:courseId' element={<EditCourses />} />
                    <Route path="/chatPage" element={<TutorChatPage />} />
                    <Route path="/enrolled-students" element={<EnrolledStudent />} />
                </Route>
            </Route>
        </Routes>
    );
}

export default TutorRoute;
