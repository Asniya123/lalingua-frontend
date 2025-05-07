import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store"; 
import { Button } from "../../components/UI/Button";
import { getLanguages } from "../../services/userAuth";
import { ILanguage } from "../../interfaces/admin";
import { setLanguage } from "../../redux/slice/studentSlice";

export default function LanguageSelector() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const intendedDestination =
    (location.state && typeof location.state === "object" && "from" in location.state
      ? (location.state as { from: string }).from
      : "/") || "/";

  const fetchLanguages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getLanguages();
      if (response.success && Array.isArray(response.data)) {
        setLanguages(response.data);
      } else {
        setError(response.message || "Failed to fetch languages.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Error fetching languages.");
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageSelect = (languageId: string): void => {
    dispatch(setLanguage(languageId));
    navigate(intendedDestination);
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f3f0] p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-serif mb-8 md:mb-12">
          Please select a language
        </h1>

        {loading ? (
          <p className="text-blue-600">Loading languages...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : languages.length === 0 ? (
          <p>No languages available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {languages.map((language) => (
              <Button
                key={language._id}
                variant="outline"
                className="h-auto p-4 bg-white hover:bg-white/90 flex items-center justify-start gap-2 text-md"
                onClick={() => handleLanguageSelect(language._id)}
              >
                <div className="w-8 h-8 relative overflow-hidden rounded-full">
                  <img
                    src={language.imageUrl || "/placeholder.svg"}
                    alt={`${language.name} flag`}
                    className="object-cover w-full h-full"
                  />
                </div>
                {language.name}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
