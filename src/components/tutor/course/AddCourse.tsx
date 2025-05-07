import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux"; 
import { RootState } from "../../../redux/store"; 
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { addCourse } from "../../../services/tutorAuth";
import { listCategories, listLanguage } from "../../../services/adminAuth";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import ImageUpload from "../../../utils/Cloudinary";
import { ILanguage } from "../../../interfaces/admin";

interface Category {
  _id: string;
  name: string;
  description?: string;
}

interface FormValues {
  courseTitle: string;
  category: string;
  language: string;
  description: string;
  price: number;
  image: File | null;
}

const validationSchema = Yup.object({
  courseTitle: Yup.string()
    .min(3, "Course title must be at least 3 characters")
    .max(100, "Course title must not exceed 100 characters")
    .required("Course title is required"),
  category: Yup.string().required("Please select a category"),
  language: Yup.string().required("Please select a language"),
  description: Yup.string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must not exceed 1000 characters")
    .required("Description is required"),
  price: Yup.number().min(1, "Price must be greater than 0").required("Price is required"),
  image: Yup.mixed<File>()
    .required("Course image is required")
    .test("fileSize", "File size too large", (value) => {
      if (!value || !(value instanceof File)) return false;
      return value.size <= 5 * 1024 * 1024;
    })
    .test("fileType", "Unsupported file format", (value) => {
      if (!value || !(value instanceof File)) return false;
      return ["image/jpeg", "image/png", "image/gif"].includes(value.type);
    }),
});

const AddCourse: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);


  const tutor = useSelector((state: RootState) => state.tutor.tutor); 
  const tutorId = tutor?._id; 

  const initialValues: FormValues = {
    courseTitle: "",
    category: "",
    language: "",
    description: "",
    price: 0,
    image: null,
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoryResponse = await listCategories();
        console.log("Category Response:", categoryResponse);
        if (categoryResponse.success && categoryResponse.data && "categories" in categoryResponse.data) {
          setCategories(categoryResponse.data.categories as Category[]);
          console.log("Categories set:", categoryResponse.data.categories);
        } else {
          console.warn("No categories found in response");
        }

        const languageResponse = await listLanguage();
        console.log("Language Response:", languageResponse);
        if (
          languageResponse.success &&
          languageResponse.data &&
          Array.isArray(languageResponse.data.languages)
        ) {
          setLanguages(languageResponse.data.languages);
          console.log("Languages set:", languageResponse.data.languages);
        } else {
          console.warn("No languages found or invalid response format:", languageResponse);
          toast.error("No languages available");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Error fetching data: " + (err instanceof Error ? err.message : "Unknown error"));
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (values: FormValues, { setSubmitting }: any) => {
    console.log("Form submission started with values:", values);
    setSubmitting(true);
    setGeneralError(null);

    try {
      console.log("Uploading image...");
      const imageUrl = await ImageUpload(values.image!);
      console.log("Image URL:", imageUrl);

      
      const courseData = {
        courseTitle: values.courseTitle,
        imageUrl,
        category: values.category,
        language: values.language,
        description: values.description,
        regularPrice: values.price,
        tutorId: tutorId || "", 
      };
      console.log("Sending course data:", courseData);

      const result = await addCourse(courseData);
      console.log("API result:", result);

      if (result.success) {
        console.log("Success! Navigating...");
        toast.success(result.message);
        navigate("/tutor/listCourse");
      } else {
        console.log("API returned success: false", result);
        throw new Error("API did not return success");
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string }>;
      const errorMessage = axiosError.response?.data?.error || axiosError.message || "Failed to add course";
      console.error("Error:", errorMessage, axiosError.response?.data);
      setGeneralError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
      console.log("Submission complete");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex flex-col">
      <div className="flex-1 flex p-6">
        <div className="flex-1">
          <div className="max-w-4xl mx-auto bg-gray-800 p-8 shadow-lg rounded-lg border-2 border-gray-700">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-extrabold text-yellow-400">Add New Course</h1>
              <div className="w-16 h-1 bg-green-500 mx-auto mt-2 rounded-full"></div>
            </div>

            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
              {({ isSubmitting, setFieldValue }) => (
                <Form className="space-y-6">
                  <div className="mb-6">
                    <label className="block text-cyan-400 font-medium mb-2">Course Title</label>
                    <Field
                      type="text"
                      name="courseTitle"
                      className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter course title"
                    />
                    <ErrorMessage name="courseTitle" component="p" className="text-red-400 text-sm mt-1" />
                  </div>

                  <div className="mb-6">
                    <label className="block text-cyan-400 font-medium mb-2">Course Category</label>
                    <Field
                      as="select"
                      name="category"
                      className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="" className="text-gray-400">
                        Select a category
                      </option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id} className="text-white bg-gray-700">
                          {cat.name}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="category" component="p" className="text-red-400 text-sm mt-1" />
                  </div>

                  <div className="mb-6">
                    <label className="block text-cyan-400 font-medium mb-2">Course Language</label>
                    <Field
                      as="select"
                      name="language"
                      className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="" className="text-gray-400">
                        Select a language
                      </option>
                      {languages.map((lang) => (
                        <option key={lang._id} value={lang._id} className="text-white bg-gray-700">
                          {lang.name}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="language" component="p" className="text-red-400 text-sm mt-1" />
                  </div>

                  <div className="mb-6">
                    <label className="block text-cyan-400 font-medium mb-2">Description</label>
                    <Field
                      as="textarea"
                      name="description"
                      className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter course description"
                      rows={4}
                    />
                    <ErrorMessage name="description" component="p" className="text-red-400 text-sm mt-1" />
                  </div>

                  <div className="mb-6">
                    <label className="block text-cyan-400 font-medium mb-2">Regular Price</label>
                    <Field
                      type="number"
                      name="price"
                      className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter regular price"
                      min="1"
                      step="0.01"
                    />
                    <ErrorMessage name="price" component="p" className="text-red-400 text-sm mt-1" />
                  </div>

                  <div className="mb-6">
                    <label className="block text-cyan-400 font-medium mb-2">Course Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        const file = event.target.files?.[0] || null;
                        setFieldValue("image", file);
                        if (file) {
                          setImagePreview(URL.createObjectURL(file));
                        } else {
                          setImagePreview(null);
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                    />
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Image Preview"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-600 shadow-md mt-2"
                      />
                    )}
                    <ErrorMessage name="image" component="p" className="text-red-400 text-sm mt-1" />
                  </div>

                  {generalError && <p className="text-red-400 text-sm mb-4 text-center">{generalError}</p>}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-cyan-600 text-white py-3 px-6 rounded-lg hover:bg-cyan-700 transition duration-300"
                  >
                    {isSubmitting ? "Adding Course..." : "Add Course"}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCourse;