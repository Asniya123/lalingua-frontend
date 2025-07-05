import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { addLesson } from "../../../services/tutorAuth";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import { Button } from "../../UI/Button";
import { Input } from "../../UI/InputField";
import { Card, CardContent, CardHeader } from "../../UI/card";
import { VideoUpload } from "../../../utils/Cloudinary";
import { ILesson } from "../../../interfaces/tutor";
import { Loader } from "lucide-react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

interface Syllabus {
  title: string;
  description?: string;
}

interface FormValues {
  title: string;
  description: string;
  videoFile: File | null;
  introVideoFile: File | null;
  syllabus: Syllabus;
}

const validationSchema = Yup.object({
  title: Yup.string()
    .min(3, "Lesson title must be at least 3 characters")
    .max(100, "Lesson title must not exceed 100 characters")
    .required("Lesson title is required"),
  description: Yup.string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must not exceed 1000 characters")
    .required("Description is required"),
  videoFile: Yup.mixed<File>()
    .required("Lesson video is required")
    .test("fileType", "Unsupported file format", (value) => {
      if (!value || !(value instanceof File)) return false;
      return value.type.startsWith("video/");
    })
    .test("fileSize", "Video file size must be less than 100MB", (value) => {
      if (!value || !(value instanceof File)) return false;
      return value.size <= 100 * 1024 * 1024;
    }),
  introVideoFile: Yup.mixed<File>()
    .required("Intro video is required")
    .test("fileType", "Unsupported file format", (value) => {
      if (!value || !(value instanceof File)) return false;
      return value.type.startsWith("video/");
    })
    .test("fileSize", "Video file size must be less than 100MB", (value) => {
      if (!value || !(value instanceof File)) return false;
      return value.size <= 100 * 1024 * 1024;
    }),
  syllabus: Yup.object({
    title: Yup.string()
      .min(3, "Syllabus title must be at least 3 characters")
      .max(100, "Syllabus title must not exceed 100 characters")
      .required("Syllabus title is required"),
    description: Yup.string()
      .max(500, "Syllabus description must not exceed 500 characters")
      .optional(),
  }).required("Syllabus is required"),
});

const AddLesson: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ intro: number; lesson: number }>({ intro: 0, lesson: 0 });
  const [isCancelled, setIsCancelled] = useState(false);

  const initialValues: FormValues = {
    title: "",
    description: "",
    videoFile: null,
    introVideoFile: null,
    syllabus: { title: "", description: "" },
  };

  const handleSubmit = async (values: FormValues, { setSubmitting }: any) => {
  if (!courseId) {
    toast.error("Invalid course ID");
    setSubmitting(false);
    return;
  }

  setLoading(true);
  setIsCancelled(false);

  try {
    const uploadVideo = async (file: File, type: "intro" | "lesson") => {
      return await VideoUpload(file, (progress) => {
        if (isCancelled) throw new Error("Upload cancelled");
        setProgress((prev) => ({ ...prev, [type]: progress }));
      });
    };

    const [introVideoUrl, videoUrl] = await Promise.all([
      uploadVideo(values.introVideoFile!, "intro"),
      uploadVideo(values.videoFile!, "lesson"),
    ]);

    if (!introVideoUrl || !videoUrl) throw new Error("Video upload failed.");

    const lessonData: ILesson = {
      courseId,
      title: values.title,
      description: values.description,
      videoUrl,
      introVideoUrl,
      syllabus: values.syllabus, // Ensure syllabus is included
    };

    const result = await addLesson(lessonData);

    if (result.success) {
      toast.success(result.message);
      navigate(`/tutor/listLesson/${courseId}`);
    } else {
      throw new Error(result.message || "Failed to add lesson");
    }
  } catch (error) {
    if (isCancelled) {
      toast.info("Upload cancelled.");
    } else {
      const axiosError = error as AxiosError<{ error?: string }>;
      toast.error(axiosError.response?.data?.error || "Failed to add lesson");
    }
  } finally {
    setLoading(false);
    setSubmitting(false);
  }
};

  const handleCancel = () => {
    setIsCancelled(true);
    setLoading(false);
    setProgress({ intro: 0, lesson: 0 });
    toast.info("Upload cancelled.");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {loading && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
          <Loader className="w-12 h-12 animate-spin text-white" />
        </div>
      )}
      <div className="container mx-auto px-4">
        <Card className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg">
          <CardHeader className="p-6 border-b">
            <h2 className="text-2xl font-bold text-orange-600">Add New Lesson</h2>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
              {({ isSubmitting, values, setFieldValue }) => (
                <Form className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Lesson Title <span className="text-red-500">*</span></label>
                    <Field
                      as="textarea"
                      name="title"
                      placeholder="Enter lesson title"
                      disabled={loading}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                    <ErrorMessage name="title" component="p" className="text-red-500 text-sm mt-1" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description <span className="text-red-500">*</span></label>
                    <Field
                      as="textarea"
                      name="description"
                      placeholder="Enter lesson description"
                      disabled={loading}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 h-32 resize-none"
                    />
                    <ErrorMessage name="description" component="p" className="text-red-500 text-sm mt-1" />
                  </div>

                  {[
                    { id: "introVideo", name: "introVideoFile", label: "Intro Video", type: "intro" },
                    { id: "lessonVideo", name: "videoFile", label: "Lesson Video", type: "lesson" },
                  ].map(({ id, name, label, type }) => (
                    <div key={id} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">{label} <span className="text-red-500">*</span></label>
                      <input
                        id={id}
                        type="file"
                        accept="video/*"
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                          const file = event.target.files?.[0] || null;
                          if (file) {
                            if (!file.type.startsWith("video/")) {
                              setError("Please upload a valid video file");
                              toast.error("Please upload a valid video file");
                              return;
                            }
                            if (file.size > 100 * 1024 * 1024) {
                              setError("Video file size must be less than 100MB");
                              toast.error("Video file size must be less than 100MB");
                              return;
                            }
                            setFieldValue(name, file);
                            setProgress((prev) => ({ ...prev, [type]: 0 }));
                            setError(null);
                          }
                        }}
                        disabled={loading}
                        className="block w-full text-sm text-gray-500 file:py-2 file:px-4 file:bg-orange-600 file:text-white hover:file:bg-orange-700"
                      />
                      {values[name as keyof FormValues] && (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            {(values[name as keyof FormValues] as File).name} (
                            {((values[name as keyof FormValues] as File).size / 1024 / 1024).toFixed(2)} MB)
                          </p>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                            <div
                              className="bg-orange-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
                              style={{ width: `${progress[type as keyof typeof progress]}%` }}
                            />
                          </div>
                          {progress[type as keyof typeof progress] >= 100 && (
                            <p className="text-xs text-green-600 font-semibold">Upload Completed</p>
                          )}
                        </div>
                      )}
                      <ErrorMessage name={name} component="p" className="text-red-500 text-sm mt-1" />
                    </div>
                  ))}

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Lesson Syllabus <span className="text-red-500">*</span></label>
                    <div className="border border-gray-300 rounded-lg p-4 bg-gray-100 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Syllabus Title <span className="text-red-500">*</span></label>
                        <Field
                          type="text"
                          name="syllabus.title"
                          placeholder="Enter syllabus title"
                          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
                          disabled={loading}
                        />
                        <ErrorMessage name="syllabus.title" component="p" className="text-red-500 text-sm mt-1" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Syllabus Description (Optional)</label>
                        <Field
                          as="textarea"
                          name="syllabus.description"
                          placeholder="Enter syllabus description"
                          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 h-24 resize-none"
                          disabled={loading}
                        />
                        <ErrorMessage name="syllabus.description" component="p" className="text-red-500 text-sm mt-1" />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" disabled={loading || isSubmitting} className="w-full bg-orange-600 hover:bg-orange-700">
                      {loading || isSubmitting ? "Uploading..." : "Add Lesson"}
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCancel}
                      disabled={!loading}
                      className="w-full bg-gray-500 hover:bg-gray-600"
                    >
                      Cancel
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddLesson;