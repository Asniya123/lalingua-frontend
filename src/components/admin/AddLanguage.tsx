import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Loader2 } from "lucide-react";
import { addLanguage } from "../../services/adminAuth";
import AdminLayout from "../../components/layouts/adminHeader";
import ImageUpload from "../../utils/Cloudinary";

// Define the form values interface
interface FormValues {
  languageName: string;
  image: File | null;
}

// Yup validation schema
const validationSchema = Yup.object({
  languageName: Yup.string()
    .min(2, "Language name must be at least 2 characters")
    .max(50, "Language name must not exceed 50 characters")
    .required("Language name is required"),
  image: Yup.mixed<File>()
    .nullable()
    .test("fileSize", "File size too large (max 5MB)", (value) => {
      if (!value) return true; // Allow null (optional image)
      return value.size <= 5 * 1024 * 1024; // 5MB limit
    })
    .test("fileType", "Unsupported file format (JPEG, PNG, GIF only)", (value) => {
      if (!value) return true; // Allow null
      return ["image/jpeg", "image/png", "image/gif"].includes(value.type);
    }),
});

const AddLanguage = () => {
  const navigate = useNavigate();

  // Initial form values
  const initialValues: FormValues = {
    languageName: "",
    image: null,
  };

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting, setStatus }: any
  ) => {
    setStatus({ error: "", successMessage: "" });

    try {
      let imageUrl = "";
      if (values.image) {
        imageUrl = await ImageUpload(values.image);
      }

      const response = await addLanguage(values.languageName, imageUrl);

      if (!response.success) {
        if (response.message.includes("already exists")) {
          setStatus({ error: "This language already exists. Please choose a different name." });
        } else {
          setStatus({ error: response.message || "Failed to add language." });
        }
        return;
      }

      setStatus({ successMessage: "Language added successfully!" });
      setTimeout(() => navigate("/admin/listLanguage"), 1500);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to add language. Please try again.";
      setStatus({ error: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-100 min-h-screen">
        <main className="w-full max-w-[900px] bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Add New Language</h1>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, setFieldValue, status }) => (
              <Form className="space-y-4">
              
                {status?.error && (
                  <p className="text-red-500 text-sm mb-2">{status.error}</p>
                )}
                {status?.successMessage && (
                  <p className="text-green-500 text-sm mb-2">{status.successMessage}</p>
                )}

        
                <div>
                  <label className="block text-gray-700 font-medium">Language Name</label>
                  <Field
                    type="text"
                    name="languageName"
                    className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter language name"
                  />
                  <ErrorMessage
                    name="languageName"
                    component="p"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

               
                <div>
                  <label className="block text-gray-700 font-medium">Language Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const file = e.target.files?.[0] || null;
                      setFieldValue("image", file);
                      if (file) {
                        const previewUrl = URL.createObjectURL(file);
                        
                        (document.getElementById("imagePreview") as HTMLImageElement).src = previewUrl;
                      } else {
                        (document.getElementById("imagePreview") as HTMLImageElement).src = "";
                      }
                    }}
                    className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <img
                    id="imagePreview"
                    src=""
                    alt="Preview"
                    className="mt-2 w-32 h-32 object-cover rounded-lg hidden"
                    onLoad={(e) => e.currentTarget.classList.remove("hidden")}
                    onError={(e) => e.currentTarget.classList.add("hidden")}
                  />
                  <ErrorMessage
                    name="image"
                    component="p"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

           
                <button
                  type="submit"
                  className="w-full bg-orange-500 text-white font-semibold py-2 rounded-lg hover:bg-orange-600 transition"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 mx-auto animate-spin" />
                  ) : (
                    "Add Language"
                  )}
                </button>
              </Form>
            )}
          </Formik>
        </main>
      </div>
    </AdminLayout>
  );
};

export default AddLanguage;