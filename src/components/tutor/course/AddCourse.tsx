"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import type { RootState } from "../../../redux/store"
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik"
import * as Yup from "yup"
import { addCourse } from "../../../services/tutorAuth"
import { listCategories, listLanguage } from "../../../services/adminAuth"
import type { AxiosError } from "axios"
import { toast } from "react-toastify"
import ImageUpload from "../../../utils/Cloudinary"
import type { ILanguage } from "../../../interfaces/admin"

interface Category {
  _id: string
  name: string
  description?: string
}



interface FormValues {
  courseTitle: string
  category: string
  language: string
  description: string
  price: number
  image: File | null
 
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
      if (!value || !(value instanceof File)) return false
      return value.size <= 5 * 1024 * 1024
    })
    .test("fileType", "Unsupported file format", (value) => {
      if (!value || !(value instanceof File)) return false
      return ["image/jpeg", "image/png", "image/gif"].includes(value.type)
    }),
  syllabus: Yup.array()
    .of(
      Yup.object({
        title: Yup.string()
          .min(3, "Syllabus item title must be at least 3 characters")
          .max(100, "Syllabus item title must not exceed 100 characters")
          .required("Syllabus item title is required"),
        description: Yup.string().max(500, "Syllabus item description must not exceed 500 characters").optional(),
      }),
    )
    .min(1, "At least one syllabus item is required")
    .required("Syllabus is required"),
})

const AddCourse: React.FC = () => {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [languages, setLanguages] = useState<ILanguage[]>([])
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [generalError, setGeneralError] = useState<string | null>(null)

  const tutor = useSelector((state: RootState) => state.tutor.tutor)
  const tutorId = tutor?._id

  const initialValues: FormValues = {
    courseTitle: "",
    category: "",
    language: "",
    description: "",
    price: 0,
    image: null,
   
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoryResponse = await listCategories()
        if (categoryResponse.success && categoryResponse.data && "categories" in categoryResponse.data) {
          setCategories(categoryResponse.data.categories as Category[])
        } else {
          console.warn("No categories found in response")
        }

        const languageResponse = await listLanguage()
        if (languageResponse.success && languageResponse.data && Array.isArray(languageResponse.data.languages)) {
          setLanguages(languageResponse.data.languages)
        } else {
          console.warn("No languages found or invalid response format:", languageResponse)
          toast.error("No languages available")
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        toast.error("Error fetching data: " + (err instanceof Error ? err.message : "Unknown error"))
      }
    }
    fetchData()
  }, [])

  const handleSubmit = async (values: FormValues, { setSubmitting }: any) => {
    setSubmitting(true)
    setGeneralError(null)

    try {
      const imageUrl = await ImageUpload(values.image!)

      const courseData = {
        courseTitle: values.courseTitle,
        imageUrl,
        category: values.category,
        language: values.language,
        description: values.description,
        regularPrice: values.price,
        tutorId: tutorId || "",
     
      }

      const result = await addCourse(courseData)
      if (result.success) {
        toast.success(result.message)
        navigate("/tutor/listCourse")
      } else {
        throw new Error("API did not return success")
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string }>
      const errorMessage = axiosError.response?.data?.error || axiosError.message || "Failed to add course"
      setGeneralError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#CFB0B0] flex flex-col">
      <div className="flex-1 flex p-6">
        <div className="flex-1">
          <div className="max-w-4xl mx-auto bg-white p-8 shadow-lg rounded-lg border border-gray-200">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-extrabold text-gray-800">Add New Course</h1>
              <div className="w-16 h-1 bg-emerald-500 mx-auto mt-2 rounded-full"></div>
            </div>

            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
              {({ isSubmitting, values }) => (
                <Form className="space-y-6">
                  <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2">Course Title</label>
                    <Field
                      type="text"
                      name="courseTitle"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter course title"
                    />
                    <ErrorMessage name="courseTitle" component="p" className="text-red-500 text-sm mt-1" />
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2">Course Category</label>
                    <Field
                      as="select"
                      name="category"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="" className="text-gray-500">
                        Select a category
                      </option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id} className="text-gray-800">
                          {cat.name}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="category" component="p" className="text-red-500 text-sm mt-1" />
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2">Course Language</label>
                    <Field
                      as="select"
                      name="language"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="" className="text-gray-500">
                        Select a language
                      </option>
                      {languages.map((lang) => (
                        <option key={lang._id} value={lang._id} className="text-gray-800">
                          {lang.name}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="language" component="p" className="text-red-500 text-sm mt-1" />
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2">Description</label>
                    <Field
                      as="textarea"
                      name="description"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter course description"
                      rows={4}
                    />
                    <ErrorMessage name="description" component="p" className="text-red-500 text-sm mt-1" />
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2">Regular Price</label>
                    <Field
                      type="number"
                      name="price"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter regular price"
                      min="1"
                      step="0.01"
                    />
                    <ErrorMessage name="price" component="p" className="text-red-500 text-sm mt-1" />
                  </div>

                 

                  <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2">Course Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        const file = event.target.files?.[0] || null
                        values.image = file
                        if (file) {
                          setImagePreview(URL.createObjectURL(file))
                        } else {
                          setImagePreview(null)
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-500 file:text-white hover:file:bg-emerald-600"
                    />
                    {imagePreview && (
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Image Preview"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-300 shadow-md mt-2"
                      />
                    )}
                    <ErrorMessage name="image" component="p" className="text-red-500 text-sm mt-1" />
                  </div>

                  {generalError && <p className="text-red-500 text-sm mb-4 text-center">{generalError}</p>}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-emerald-600 text-white py-3 px-6 rounded-lg hover:bg-emerald-700 transition duration-300"
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
  )
}

export default AddCourse
