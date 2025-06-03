import { useSelector } from "react-redux";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { RootState } from "../../redux/store";
import { useEffect, useState } from "react";

export default function RequireLanguage() {
  const selectedLanguage = useSelector(
    (state: RootState) => state.auth.selectedLanguageId
  );
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true); // Ensure rendering is complete
  }, []);

  if (!isReady) {
    return null; // Wait for router context
  }

  if (!selectedLanguage) {
    return (
      <Navigate to="/languages" state={{ from: location.pathname }} replace />
    );
  }

  return <Outlet />;
}