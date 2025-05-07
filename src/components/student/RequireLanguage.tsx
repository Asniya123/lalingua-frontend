import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { RootState } from "../../redux/store";

interface Props {
  children: JSX.Element;
}

export default function RequireLanguage({ children }: Props) {
  const selectedLanguage = useSelector(
    (state: RootState) => state.auth.selectedLanguageId
  );
  const location = useLocation();

  if (!selectedLanguage) {
    return (
      <Navigate to="/select-language" state={{ from: location.pathname }} replace />
    );
  }

  return children;
}
