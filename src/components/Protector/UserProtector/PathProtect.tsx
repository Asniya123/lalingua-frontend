import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";

const PathProtect = () => {
  const student = useSelector((state: RootState) => state.auth.student);

  // If user is already logged in, redirect to home page
  // If user is not logged in, allow access to login/register pages
  return student ? <Navigate to="/" replace /> : <Outlet />;
};

export default PathProtect;