import { Routes, Route } from "react-router";
import Login from '../../Pages/admin/Login'
import Home from '../../Pages/admin/home'
import AddCategory from "../../Pages/admin/AddCategories";
import AdminProtectedRoute from "../../components/AdminProtectRoute";
import ListCategories from "../../Pages/admin/ListCategories";
import EditCategories from "../../Pages/admin/EditCategories";
import UserList from "../../Pages/admin/UserList";
import TutorList from "../../Pages/admin/TutorManagement";
import TutoManaging from "../../Pages/admin/TutorList";
import AddCourses from "../../Pages/admin/AddCourses";

function AdminRoute() {
    return (
        <Routes>
          
          <Route path="/login" element={<Login />} />
    
       
          <Route element={<AdminProtectedRoute />}>
            <Route path="/dashboard" element={<Home />} />
            <Route path="/categories" element={<AddCategory />} />
            <Route path="/listCategory" element={<ListCategories />} />
            <Route path="/editCategory/:categoryId" element={<EditCategories />} />
            <Route path="/userList" element={<UserList />} />
            <Route path="/tutorList" element={<TutorList />} />
            <Route path="/tutorManging" element={<TutoManaging />} />
            <Route path="/addCourse" element={<AddCourses />} />
          </Route>
        </Routes>
      );
}
export default AdminRoute;