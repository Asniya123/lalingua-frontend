import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store"; 
const ProtectedRoute = () => {
  const student = useSelector((state: RootState) => state.auth.student);
console.log(student,"++++++++++++++++++")
  return student ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
