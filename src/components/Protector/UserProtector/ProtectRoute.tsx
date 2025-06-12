import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";

const ProtectedRoute = () => {
  const student = useSelector((state: RootState) => state.auth.student);
  const selectedLanguageId = useSelector((state: RootState) => state.auth.selectedLanguageId);
  const location = useLocation();

  // If user is not logged in, redirect to login
  if (!student) {
    return <Navigate to="/login" replace />;
  }

  // Check if current path requires language selection
  const languageRequiredPaths = ["/tutors", "/course"];
  const requiresLanguage = languageRequiredPaths.some(path => 
    location.pathname.startsWith(path)
  );

  // If language is required but not selected, redirect to language selection
  if (requiresLanguage && !selectedLanguageId) {
    return <Navigate to="/languages" state={{ from: location.pathname }} replace />;
  }

  // User is authenticated, render protected content
  return <Outlet />;
};

export default ProtectedRoute;