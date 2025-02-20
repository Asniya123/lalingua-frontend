import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { editCategory, getCategoryById } from "../../services/adminAuth";
import AdminLayout from "../layouts/adminHeader";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditCategory = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { categoryId } = useParams();

  const [category, setCategory] = useState<{ name: string; description?: string }>(
    {
      name: "",
      description: "",
    }
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (location.state?.category) {
      setCategory(location.state.category);
    } else if (categoryId) {
      fetchCategoryDetails(categoryId);
    }
  }, [categoryId, location.state]);

  const fetchCategoryDetails = async (id: string) => {
    setLoading(true);
    try {
      const response = await getCategoryById(id);
      if (response.success && response.data) {
        setCategory(response.data);
      } else {
        setError("Failed to fetch category.");
      }
    } catch (error) {
      setError("Error fetching category details.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!categoryId) {
      console.error("Category ID is undefined");
      toast.error("Category ID is missing. Please try again.");
      return;
    }

    try {
      const response = await editCategory(categoryId, category.name, category.description || "");

      if (response.success) {
        toast.success("Category updated successfully!");
        navigate("/admin/listCategory");
      } else {
        toast.error(response.message || "Failed to update category.");
      }
    } catch (error) {
      console.error("Update failed", error);
      toast.error("An error occurred while updating the category.");
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-semibold mb-4">Edit Category</h1>
        <div className="bg-white shadow-md rounded-lg p-4">
          {loading ? (
            <p className="text-blue-600">Loading category...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <>
              <label className="block mb-2">Category Name</label>
              <input
                type="text"
                className="border p-2 w-full rounded"
                value={category.name}
                onChange={(e) => setCategory({ ...category, name: e.target.value })}
              />

              <label className="block mt-4 mb-2">Description</label>
              <textarea
                className="border p-2 w-full rounded"
                value={category.description || ""}
                onChange={(e) => setCategory({ ...category, description: e.target.value })}
              />

              <button onClick={handleUpdate} className="bg-orange-500 text-white px-4 py-2 mt-4 rounded">
                Update Category
              </button>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default EditCategory;
