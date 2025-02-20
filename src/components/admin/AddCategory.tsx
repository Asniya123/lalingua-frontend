import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {  Loader2 } from "lucide-react";
import { addCategory } from "../../services/adminAuth";
import AdminLayout from "../../components/layouts/adminHeader";

const AddCategory = () => {
  const navigate = useNavigate();
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");




  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);
  
    if (!categoryName.trim()) {
      setError("Category name is required.");
      setLoading(false);
      return;
    }
  
    try {
      const response = await addCategory(categoryName, description);
  
      if (!response.success) {
        setError(response.message); 
        setLoading(false);
        return;
      }
  
      setSuccessMessage("Category added successfully!");
      setTimeout(() => navigate("/admin/listCategory"), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add category. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-100 min-h-screen">
        {/* Main Content */}
        <main className="w-full max-w-[900px] bg-white p-6 rounded-lg shadow-md">

          <h1 className="text-2xl font-bold mb-4">Add New Category</h1>

          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          {successMessage && <p className="text-green-500 text-sm mb-2">{successMessage}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category Name */}
            <div>
              <label className="block text-gray-700 font-medium">Category Name</label>
              <input
                type="text"
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter category name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-gray-700 font-medium">Description</label>
              <textarea
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows={3}
                placeholder="Enter category description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

           

           
            <button
              type="submit"
              className="w-full bg-orange-500 text-white font-semibold py-2 rounded-lg hover:bg-orange-600 transition"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-5 w-5 mx-auto animate-spin" /> : "Add Category"}
            </button>
          </form>
        </main>
      </div>
    </AdminLayout>
  );
};

export default AddCategory;
