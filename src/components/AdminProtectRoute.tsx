import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store"; 
const AdminProtectedRoute = () => {
  const admin = useSelector((state: RootState) => state.admin.adminId);
  console.log(admin)

  return admin ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

export default AdminProtectedRoute;
