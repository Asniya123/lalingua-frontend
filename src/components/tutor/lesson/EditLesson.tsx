import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { editLesson, getLesson } from "../../../services/tutorAuth";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import { Button } from "../../UI/Button";
import { Input } from "../../UI/InputField";
import { Card, CardContent, CardHeader } from "../../UI/card";
import { VideoUpload } from "../../../utils/Cloudinary";
import { ILesson } from "../../../interfaces/tutor";
import { Loader } from "lucide-react";

const EditLesson: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [introVideoFile, setIntroVideoFile] = useState<File | null>(null);
  const [existingVideoUrl, setExistingVideoUrl] = useState<string | null>(null);
  const [existingIntroVideoUrl, setExistingIntroVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ intro: number; lesson: number }>({ intro: 0, lesson: 0 });
  const [isCancelled, setIsCancelled] = useState(false);

  useEffect(() => {
    if (!courseId || !lessonId) {
      setError("Course ID or Lesson ID is missing");
      return;
    }

    const fetchLesson = async () => {
      setLoading(true);
      try {
        const lesson = await getLesson(lessonId);
        setTitle(lesson.title || "");
        setDescription(lesson.description || "");
        setExistingVideoUrl(lesson.videoUrl || null);
        setExistingIntroVideoUrl(lesson.introVideoUrl || null);
      } catch (err) {
        const axiosError = err as AxiosError<{ message?: string }>;
        setError(axiosError.message || "An error occurred while fetching lesson data");
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [courseId, lessonId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isIntro: boolean = false) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
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
      isIntro ? setIntroVideoFile(file) : setVideoFile(file);
      setProgress((prev) => ({ ...prev, [isIntro ? "intro" : "lesson"]: 0 }));
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!courseId || !lessonId) {
      setError("Course ID or Lesson ID is missing");
      toast.error("Course ID or Lesson ID is missing");
      return;
    }
    if (!title || !description) {
      setError("Please fill in all fields");
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    setIsCancelled(false);

    try {
      let videoUrl = existingVideoUrl;
      let introVideoUrl = existingIntroVideoUrl;

      const uploadVideo = async (file: File, type: "intro" | "lesson") => {
        return await VideoUpload(file, (progress) => {
          if (isCancelled) throw new Error("Upload cancelled");
          setProgress((prev) => ({ ...prev, [type]: progress }));
        });
      };

      if (videoFile) {
        videoUrl = await uploadVideo(videoFile, "lesson");
        if (!videoUrl) throw new Error("Failed to upload lesson video");
      }
      if (introVideoFile) {
        introVideoUrl = await uploadVideo(introVideoFile, "intro");
        if (!introVideoUrl) throw new Error("Failed to upload intro video");
      }

      const lessonData: Partial<ILesson> = {
        courseId,
        title,
        description,
        videoUrl: videoUrl || undefined,
        introVideoUrl: introVideoUrl || undefined,
      };

      const result = await editLesson(lessonId, lessonData);

      if (result.success) {
        toast.success(result.message);
        setVideoFile(null);
        setIntroVideoFile(null);
        setProgress({ intro: 0, lesson: 0 });
        navigate(`/tutor/listLesson/${courseId}`);
      } else {
        throw new Error(result.message || "Failed to update lesson");
      }
    } catch (error) {
      if (isCancelled) {
        toast.info("Upload cancelled.");
      } else {
        const axiosError = error as AxiosError<{ message?: string }>;
        const errorMessage =
          axiosError.response?.data?.message || axiosError.message || "Failed to update lesson";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsCancelled(true);
    setLoading(false);
    setProgress({ intro: 0, lesson: 0 });
    setVideoFile(null);
    setIntroVideoFile(null);
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
            <h2 className="text-2xl font-bold text-orange-600">Edit Lesson</h2>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                placeholder="Enter lesson title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
                type="text"
              />
              <textarea
                placeholder="Enter lesson description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 h-32 resize-none"
              />
              {[
                { id: "introVideo", file: introVideoFile, existingUrl: existingIntroVideoUrl, label: "Intro Video", type: "intro" },
                { id: "lessonVideo", file: videoFile, existingUrl: existingVideoUrl, label: "Lesson Video", type: "lesson" },
              ].map(({ id, file, existingUrl, label, type }) => (
                <div key={id} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {label} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={id}
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileChange(e, type === "intro")}
                    disabled={loading}
                    className="block w-full text-sm text-gray-500 file:py-2 file:px-4 file:bg-orange-600 file:text-white hover:file:bg-orange-700"
                  />
                  {file && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-orange-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
                          style={{ width: `${progress[type as keyof typeof progress]}%` }}
                        />
                      </div>
                      {progress[type as keyof typeof progress] > 100 && (
                        <p className="text-xs text-green-600 font-semibold">Upload Completed</p>
                      )}
                    </div>
                  )}
                  {existingUrl && !file && (
                    <p className="text-sm text-gray-600">
                      Current video: <a href={existingUrl} target="_blank" className="text-blue-500">View</a>
                    </p>
                  )}
                </div>
              ))}
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  {loading ? "Updating..." : "Update Lesson"}
                </Button>
                <Button
                  type="button"
                  onClick={handleCancel}
                  disabled={!loading}
                  className="w-full bg-gray-500 hover Permanent Marker:bg-gray-600"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditLesson;