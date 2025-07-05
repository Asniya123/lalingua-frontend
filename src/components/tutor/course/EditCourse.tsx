import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCourse, editCourse } from "../../../services/tutorAuth";
import { listCategories } from "../../../services/adminAuth";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import ImageUpload from "../../../utils/Cloudinary";

interface Category {
  _id: string;
  name: string;
  description?: string;
}

const EditCourse: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<{
    courseTitle?: string;
    description?: string;
    regularPrice?: number;
    imageUrl?: string;
    category?: string;
  }>({
    courseTitle: "",
    description: "",
    regularPrice: 0,
    imageUrl: "",
    category: "",
  });
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!courseId) {
      toast.error("Course ID is missing");
      navigate("/tutor/listCourse");
      return;
    }
    fetchCourseDetails(courseId);
    fetchCategories();
  }, [courseId, navigate]);

  const fetchCourseDetails = async (id: string) => {
    setLoading(true);
    try {
      const course = await getCourse(id);
      setFormData({
        courseTitle: course.courseTitle || "",
        description: course.description || "",
        regularPrice: course.regularPrice || 0,
        imageUrl: course.imageUrl || "",
        category: typeof course.category === "string" ? course.category : course.category?._id || "",
      });
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setError(axiosError.message || "Failed to fetch course");
      toast.error(axiosError.message || "Failed to fetch course");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await listCategories();
      if (response.success && response.data && "categories" in response.data) {
        setCategories(response.data.categories as Category[]);
      } else {
        setError("Failed to fetch categories");
      }
    } catch (err) {
      setError("Error fetching categories");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "regularPrice" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        setError("Please upload a valid image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Image file size must be less than 5MB");
        return;
      }
      setNewImageFile(file);
      setError("");
    }
  };

  const handleUpdate = async () => {
    if (!courseId) {
      console.error("Course ID is undefined");
      toast.error("Course ID is missing. Please try again.");
      return;
    }

    setLoading(true);
    try {
      let updatedFormData = { ...formData };

      // Upload new image if provided
      if (newImageFile) {
        const uploadedImageUrl = await ImageUpload(newImageFile);
        if (!uploadedImageUrl) {
          throw new Error("Failed to upload image to Cloudinary");
        }
        updatedFormData.imageUrl = uploadedImageUrl;
      }

      const response = await editCourse(courseId, updatedFormData);
      if (response.success) {
        toast.success(response.message);
        navigate("/tutor/listCourse");
      } else {
        toast.error(response.message || "Failed to update course");
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      console.error("Update failed", error);
      toast.error(axiosError.message || "An error occurred while updating the course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <div className="flex-1 flex p-6">
        <div className="flex-1 px-4">
          <div className="bg-white shadow-md rounded-lg p-4">
            <h1 className="text-2xl font-semibold mb-4">Edit Course</h1>
            {loading ? (
              <p className="text-blue-600">Loading course...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <>
                <label className="block mb-2">Course Title</label>
                <input
                  type="text"
                  name="courseTitle"
                  className="border p-2 w-full rounded"
                  value={formData.courseTitle || ""}
                  onChange={handleInputChange}
                  disabled={loading}
                />

                <label className="block mt-4 mb-2">Description</label>
                <textarea
                  name="description"
                  className="border p-2 w-full rounded"
                  value={formData.description || ""}
                  onChange={handleInputChange}
                  disabled={loading}
                />

                <label className="block mt-4 mb-2">Price ($)</label>
                <input
                  type="number"
                  name="regularPrice"
                  className="border p-2 w-full rounded"
                  value={formData.regularPrice || 0}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  disabled={loading}
                />

                <label className="block mt-4 mb-2">Course Image</label>
                {formData.imageUrl && !newImageFile ? (
                  <div className="mb-2">
                    <img
                      src={formData.imageUrl}
                      alt="Course Preview"
                      className="max-w-xs rounded-lg shadow-md"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Current image - Upload a new one to replace
                    </p>
                  </div>
                ) : newImageFile ? (
                  <p className="text-sm text-gray-600 mb-2">
                    New image selected: {newImageFile.name} (
                    {(newImageFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                ) : null}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="border p-2 w-full rounded file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-orange-500 file:text-white hover:file:bg-orange-600"
                  disabled={loading}
                />

                <label className="block mt-4 mb-2">Course Category</label>
                <select
                  name="category"
                  value={formData.category || ""}
                  onChange={handleInputChange}
                  className="border p-2 w-full rounded"
                  disabled={loading}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                {error && <p className="text-red-500 mt-2">{error}</p>}

                <button
                  onClick={handleUpdate}
                  className="bg-orange-500 text-white px-4 py-2 mt-4 rounded hover:bg-orange-600"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Course"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCourse;