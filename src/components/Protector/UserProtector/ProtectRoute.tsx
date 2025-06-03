import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";

const ProtectedRoute = () => {
  const student = useSelector((state: RootState) => state.auth.student);
  const selectedLanguageId = useSelector((state: RootState) => state.auth.selectedLanguageId);
  const location = useLocation();

  const languageRequiredPaths = ["/tutors", "/course"];
  const requiresLanguage = languageRequiredPaths.includes(location.pathname);

  if (!student) {
    return <Navigate to="/login" replace />;
  }

  if (requiresLanguage && !selectedLanguageId) {
    return <Navigate to="/languages" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;