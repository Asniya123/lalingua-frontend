import { useEffect, useState } from "react";
import { listCategories, deleteCategory } from "../../services/adminAuth";
import { Trash2, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../layouts/adminHeader";
import { Button } from "../../components/UI/Button";
import SearchBar from "../../components/UI/SearchBar";


interface Category {
  _id: string;
  name: string;
  description?: string;
}

const CategoryList = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalCategories, setTotalCategories] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const navigate = useNavigate();

  const fetchCategories = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await listCategories(currentPage, itemsPerPage, searchTerm); 
      console.log("API Response:", response);

      if (response.success && response.data) {
        const { categories: categoriesArray, total } = response.data;
        setCategories(categoriesArray || []);
        setTotalCategories(total || 0);
        console.log("Updated Categories:", categoriesArray, "Total:", total);
      } else {
        setCategories([]);
        setTotalCategories(0);
        setError(response.message || "Failed to fetch categories.");
      }
    } catch (err) {
      setError("Error fetching categories.");
      setTotalCategories(0);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    navigate(`/admin/editCategory/${category._id}`, { state: { category } });
  };

  const handleDelete = async (categoryId: string) => {
    try {
      const response = await deleteCategory(categoryId);
      if (response.success) {
        setCategories((prevCategories) => prevCategories.filter((cat) => cat._id !== categoryId));
        setTotalCategories((prev) => prev - 1); 
      } else {
        setError(response.message || "Failed to delete category.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [currentPage, searchTerm]); 

  useEffect(() => {
      if (searchTerm) {
        setCurrentPage(1);
      }
    }, [searchTerm]);

  // Pagination
  const totalPages = Math.ceil(totalCategories / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

   const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  useEffect(() => {
      const timeoutId = setTimeout(() => {
        if (searchTerm !== '') {
          fetchCategories();
        }
      }, 300); // 300ms delay
  
      return () => clearTimeout(timeoutId);
    }, [searchTerm]);

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Category List</h1>
          <Button
            onClick={() => navigate("/admin/categories")}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <Edit className="w-5 h-5 mr-2" /> Add New Category
          </Button>
        </div>
        <SearchBar
          onSearch={setSearchTerm}
          placeholder="Search categories by name or description..."
        />
        {loading && <p className="text-blue-600">Loading categories...</p>}
        {error && <p className="text-red-500">{error}</p>}

        <div className="bg-white shadow-md rounded-lg p-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3 text-left">Category Name</th>
                <th className="p-3 text-left">Category Description</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length > 0 ? (
                categories.map((category) => (
                  <tr key={category._id} className="border-b">
                    <td className="p-3">{category.name}</td>
                    <td className="p-3">{category.description || "No description"}</td>
                    <td className="p-3 flex gap-3">
                      <tr>
                  <td colSpan={4} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                    {searchTerm ? `No users found matching "${searchTerm}"` : "No users found"}
                  </td>
                </tr>
                      <Button
                        onClick={() => handleEdit(category)}
                        className="bg-green-600 text-white px-3 py-1 rounded-lg flex items-center"
                      >
                        <Edit className="w-5 h-5 mr-1" /> Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(category._id)}
                        className="bg-red-600 text-white px-3 py-1 rounded-lg flex items-center"
                      >
                        <Trash2 className="w-5 h-5 mr-1" /> Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="p-3 text-center">
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
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

              {Array.from({ length: totalPages }).map((_, index) => (
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
                disabled={currentPage === totalPages}
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

export default CategoryList;