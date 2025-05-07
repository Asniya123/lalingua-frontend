import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store"; 
const PathProtect= () => {
  const student = useSelector((state: RootState) => state.admin.adminId);

  return student == null ? <Outlet /> : <Navigate to="/admin/dashboard" replace />;
};

export default PathProtect;