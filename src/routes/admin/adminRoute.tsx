import { Routes, Route } from "react-router-dom";
import Login from "../../Pages/admin/Login";
import Home from "../../Pages/admin/home";
import AddCategory from "../../Pages/admin/AddCategories";
import AdminProtectedRoute from "../../components/Protector/AdminProtector/AdminProtectRoute";
import ListCategories from "../../Pages/admin/ListCategories";
import EditCategories from "../../Pages/admin/EditCategories";
import UserList from "../../Pages/admin/UserList";
import TutorList from "../../Pages/admin/TutorManagement";
import TutoManaging from "../../Pages/admin/TutorList";
import AddLanguages from "../../Pages/admin/AddLanguages";
import ListLanguages from "../../Pages/admin/ListLanguages";
import EditLanguages from "../../Pages/admin/EditLanguages";
import CourseManaging from "../../Pages/admin/CourseManging";
import PathProtect from "../../components/Protector/AdminProtector/PathProtector";

function AdminRoute() {
    return (
        <Routes>
            <Route element={<PathProtect />}>
                <Route path="/login" element={<Login />} />
            </Route>

            <Route element={<AdminProtectedRoute />}>
                <Route path="/dashboard" element={<Home />} />
                
                {/* Category */}
                <Route path="/categories" element={<AddCategory />} />
                <Route path="/listCategory" element={<ListCategories />} />
                <Route path="/editCategory/:categoryId" element={<EditCategories />} />
                
                {/* User */}
                <Route path="/userList" element={<UserList />} />
                
                {/* Tutor */}
                <Route path="/tutorList" element={<TutorList />} />
                <Route path="/tutorManging" element={<TutoManaging />} />
                
                {/* Language */}
                <Route path="/addLanguage" element={<AddLanguages />} />
                <Route path="/listLanguage" element={<ListLanguages />} />
                <Route path="/editLanguage/:languageId" element={<EditLanguages />} />

                {/* Course */}
                <Route path="/course" element={<CourseManaging />} />
            </Route>
        </Routes>
    );
}

export default AdminRoute;
