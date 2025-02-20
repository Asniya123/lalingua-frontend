import { useEffect, useState } from "react";
import { listCategories, deleteCategory} from "../../services/adminAuth"; 
import { Trash2, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../layouts/adminHeader";

interface Category {
  _id: string;
  name: string;
  description?: string;
}

const CategoryList = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchCategories = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await listCategories();
      console.log("API Response:", response);

      if (response.success && response.data && typeof response.data === "object" && "categories" in response.data) {
        const categoriesArray = response.data.categories as any[];
        setCategories(categoriesArray);
        console.log("Updated Categories:", categoriesArray);
      } else {
        setCategories([]);
        setError(response.message || "Failed to fetch categories.");
      }
    } catch (err) {
      setError("Error fetching categories.");
    } finally {
      setLoading(false);
    }
  };

  
  const handleEdit = (category: Category) => {
    navigate(`/admin/editCategory/${category._id}`, { state: { category } });
  };
  
  
  const handleDelete = async (categoryId: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      const response = await deleteCategory(categoryId);
      if (response.success) {
        setCategories((prevCategories) => prevCategories.filter((cat) => cat._id !== categoryId));
      } else {
        setError(response.message || "Failed to delete category.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-100 min-h-screen">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Category List</h1>
          <button
            onClick={() => navigate("/admin/categories")}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <Edit className="w-5 h-5 mr-2" /> Add New Category
          </button>
        </div>

        {/* Loading & Error Messages */}
        {loading && <p className="text-blue-600">Loading categories...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {/* Category Table */}
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
                    <button
  onClick={() => handleEdit(category)}
  className="bg-green-600 text-white px-3 py-1 rounded-lg flex items-center"
>
  <Edit className="w-5 h-5 mr-1" /> Edit
</button>

                      <button
                        onClick={() => handleDelete(category._id)}
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
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CategoryList;
