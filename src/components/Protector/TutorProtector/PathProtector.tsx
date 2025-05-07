import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store"; 
const PathProtect= () => {
  const student = useSelector((state: RootState) => state.tutor.tutor);

  return student == null ? <Outlet /> : <Navigate to="/tutor/home" replace />;
};

export default PathProtect;