import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Loader2 } from "lucide-react";
import { addCategory } from "../../services/adminAuth";
import AdminLayout from "../../components/layouts/adminHeader";

const AddCategory = () => {
  const navigate = useNavigate();

 
  const validationSchema = Yup.object({
    categoryName: Yup.string()
      .trim()
      .min(3, "Category name must be at least 3 characters")
      .max(50, "Category name must not exceed 50 characters")
      .required("Category name is required"),
    description: Yup.string()
      .max(200, "Description must not exceed 200 characters")
      .optional(),
  });

  const formik = useFormik({
    initialValues: {
      categoryName: "",
      description: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const response = await addCategory(values.categoryName, values.description);
  
        if (!response.success) {
          formik.setErrors({ categoryName: response.message || "Failed to add category." });
          return;
        }
  
        resetForm(); 
        setTimeout(() => navigate("/admin/listCategory"), 1000); 
      } catch (err) {
        formik.setErrors({ categoryName: "Failed to add category. Please try again." });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-100 min-h-screen">
        <main className="w-full max-w-[900px] bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Add New Category</h1>

          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {/* Category Name */}
            <div>
              <label className="block text-gray-700 font-medium">Category Name</label>
              <input
                type="text"
                name="categoryName"
                className={`w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none 
                  focus:ring-2 focus:ring-orange-500 ${formik.errors.categoryName && formik.touched.categoryName ? "border-red-500" : ""}`}
                placeholder="Enter category name"
                value={formik.values.categoryName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.categoryName && formik.errors.categoryName && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.categoryName}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-gray-700 font-medium">Description</label>
              <textarea
                name="description"
                className={`w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none 
                  focus:ring-2 focus:ring-orange-500 ${formik.errors.description && formik.touched.description ? "border-red-500" : ""}`}
                rows={3}
                placeholder="Enter category description (optional)"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.description && formik.errors.description && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.description}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-orange-500 text-white font-semibold py-2 rounded-lg hover:bg-orange-600 transition"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? <Loader2 className="h-5 w-5 mx-auto animate-spin" /> : "Add Category"}
            </button>
          </form>
        </main>
      </div>
    </AdminLayout>
  );
};

export default AddCategory;
