import { useEffect, useState } from "react";
import { deleteLanguage, listLanguage } from "../../services/adminAuth";
import { Trash2, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../layouts/adminHeader";
import { ILanguage } from "../../interfaces/admin";
import { Button } from "../../components/UI/Button";
import  SearchBar  from "../../components/UI/SearchBar";

const ListLanguage = () => {
  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalLanguages, setTotalLanguages] = useState(0);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
      fetchLanguages();
    }, [currentPage, searchTerm]); 
  
    
    useEffect(() => {
      if (searchTerm) {
        setCurrentPage(1);
      }
    }, [searchTerm]);

  const fetchLanguages = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await listLanguage(currentPage, itemsPerPage, searchTerm);
      console.log("API Response:", response);

      if (response.success && response.data && Array.isArray(response.data.languages)) {
        setLanguages(response.data.languages);
        setTotalLanguages(response.total);
        console.log("Total Languages Set:", response.total);
        console.log("Total Pages Calculated:", Math.ceil(response.total / itemsPerPage));
      } else {
        setLanguages([]);
        setError(response.message || "Failed to fetch languages.");
      }
    } catch (err) {
      setError("Error fetching languages: Check console for details.");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (language: ILanguage) => {
    navigate(`/admin/editLanguage/${language._id}`, { state: { language } });
  };

  const handleDelete = async (languageId: string) => {
    if (!window.confirm("Are you sure you want to delete this language?")) return;

    try {
      const response = await deleteLanguage(languageId);
      if (response.success) {
        setLanguages((prevLanguages) =>
          prevLanguages.filter((lang) => lang._id !== languageId)
        );
      } else {
        setError(response.message || "Failed to delete language.");
      }
    } catch (err) {
      setError("An unexpected error occurred during deletion.");
      console.error("Delete error:", err);
    }
  };



  const totalPage = Math.ceil(totalLanguages / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchLanguages();
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  useEffect(() => {
      const timeoutId = setTimeout(() => {
        if (searchTerm !== '') {
          fetchLanguages();
        }
      }, 300); // 300ms delay
  
      return () => clearTimeout(timeoutId);
    }, [searchTerm]);

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Language List</h1>
          <button
            onClick={() => navigate("/admin/addLanguage")}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <Edit className="w-5 h-5 mr-2" /> Add New Language
          </button>
        </div>
        <SearchBar
          onSearch={setSearchTerm}
          placeholder="Search languages by name..."
        />
        {loading && <p className="text-blue-600">Loading languages...</p>}
        {error && <p className="text-red-500">{error}</p>}

        <div className="bg-white shadow-md rounded-lg p-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3 text-left">Language Name</th>
                <th className="p-3 text-left">Image</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {languages.length > 0 ? (
                languages.map((language) => (
                  <tr key={language._id} className="border-b">
                    <td className="p-3">{language.name}</td>
                    <td className="p-3">
                      <tr>
                  <td colSpan={4} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                    {searchTerm ? `No users found matching "${searchTerm}"` : "No users found"}
                  </td>
                </tr>
                      {language.imageUrl ? (
                        <img
                          src={language.imageUrl}
                          alt={language.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        "No image"
                      )}
                    </td>
                    <td className="p-3 flex gap-3">
                      <button
                        onClick={() => handleEdit(language)}
                        className="bg-green-600 text-white px-3 py-1 rounded-lg flex items-center"
                      >
                        <Edit className="w-5 h-5 mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(language._id)}
                        className="bg-red-600 text-white px-3 py-1 rounded-lg flex items-center"
                      >
                        <Trash2 className="w-5 h-5 mr-1" /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="p-3 text-center">
                    No languages found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPage > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="text-gray-500"
              >
                Previous
              </Button>

              {Array.from({ length: totalPage }).map((_, index) => (
                <Button
                  key={index}
                  variant={currentPage === index + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(index + 1)}
                  className={currentPage === index + 1 ? "bg-primary text-white" : "text-gray-700"}
                >
                  {index + 1}
                </Button>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPage}
                className="text-gray-500"
              >
                Next
              </Button>
            </nav>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ListLanguage;