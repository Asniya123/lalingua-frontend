import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store"; 
const ProtectedRoute = () => {
  const tutor = useSelector((state: RootState) => state.tutor.tutor);
  return tutor ? <Outlet /> : <Navigate to="/tutor/login" replace />;
};

export default ProtectedRoute;
