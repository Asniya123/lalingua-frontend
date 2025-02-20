import { Routes, Route } from "react-router";
import Signup from "../../Pages/Tutor/signup";
import Login from '../../Pages/Tutor/Login'
import  Home from '../../Pages/Tutor/home'


function StudenRoute() {
    return (
        <Routes>
            <Route path="/register" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/home" element={<Home />} />
        </Routes>
    );
}
export default StudenRoute;