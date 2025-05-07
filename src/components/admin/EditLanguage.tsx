import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { editLanguage, getLanguageById } from "../../services/adminAuth";
import AdminLayout from "../layouts/adminHeader";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ILanguage } from "../../interfaces/admin";

const EditLanguage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { languageId } = useParams<{ languageId: string }>();

  const [language, setLanguage] = useState<ILanguage>({
    _id: "",
    name: "",
    imageUrl: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (location.state?.language) {
      setLanguage(location.state.language);
      setPreviewUrl(location.state.language.imageUrl);
    } else if (languageId) {
      fetchLanguageDetails(languageId);
    }
  }, [languageId, location.state]);

  const fetchLanguageDetails = async (id: string) => {
    setLoading(true);
    try {
      const response = await getLanguageById(id);
      if (response && "success" in response && response.success && response.data) {
        setLanguage(response.data);
        setPreviewUrl(response.data.imageUrl);
      } else if (response && "_id" in response) {
        setLanguage(response as ILanguage);
        setPreviewUrl((response as ILanguage).imageUrl);
      } else {
        setError("Failed to fetch language.");
      }
    } catch (error) {
      setError("Error fetching language details.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async () => {
    if (!languageId) {
      console.error("Language ID is undefined");
      toast.error("Language ID is missing. Please try again.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", language.name);
      if (selectedFile) {
        formData.append("image", selectedFile); 
      }

      console.log("Sending FormData:", {
        name: language.name,
        hasFile: !!selectedFile,
        fileName: selectedFile?.name,
      });

      const response = await editLanguage(languageId, formData);

      if (response.success) {
        toast.success("Language updated successfully!");
        navigate("/admin/listLanguage");
      } else {
        toast.error(response.message || "Failed to update language.");
      }
    } catch (error: any) {
      console.error("Update failed:", error.message);
      toast.error("An error occurred while updating the language.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-semibold mb-4">Edit Language</h1>
        <div className="bg-white shadow-md rounded-lg p-4">
          {loading ? (
            <p className="text-blue-600">Loading language...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <>
              <label className="block mb-2">Language Name</label>
              <input
                type="text"
                className="border p-2 w-full rounded"
                value={language.name}
                onChange={(e) => setLanguage({ ...language, name: e.target.value })}
              />

              <label className="block mt-4 mb-2">Language Image</label>
              {previewUrl && (
                <div className="mt-2 mb-4">
                  <img
                    src={previewUrl}
                    alt={language.name}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="border p-2 w-full rounded"
                onChange={handleFileChange}
              />

              <button
                onClick={handleUpdate}
                className="bg-orange-500 text-white px-4 py-2 mt-4 rounded"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Language"}
              </button>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default EditLanguage;