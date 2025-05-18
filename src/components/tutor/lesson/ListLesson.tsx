import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { listLessons, deleteLesson } from "../../../services/tutorAuth";
import { Button } from "../../UI/Button";
import { Card, CardContent, CardHeader } from "../../UI/card";
import { ILesson } from "../../../interfaces/tutor";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

const LessonsList: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<ILesson[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLessons, setTotalLessons] = useState(0);
  const limit = 5;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    if (!courseId) {
      setError("Course ID is missing.");
      return;
    }

    const fetchLessons = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await listLessons(courseId, currentPage, limit);
        console.log("Fetched lessons for course", courseId, ":", result.lessons);
        if (result.success) {
          setLessons(result.lessons || []);
          setTotalLessons(result.total);
        } else {
          setError("Failed to fetch lessons.");
        }
      } catch (err) {
        setError("An error occurred while fetching lessons.");
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [courseId, currentPage, refresh]);

  const totalPages = Math.ceil(totalLessons / limit);

  const handleAddLesson = () => {
    if (!courseId) {
      setError("Course ID is missing.");
      return;
    }
    navigate(`/tutor/courses/${courseId}/addLesson`);
  };

  const handleEditLesson = (lessonId: string) => {
    if (!courseId) {
      setError("Course ID is missing.");
      return;
    }
    navigate(`/tutor/courses/${courseId}/editLesson/${lessonId}`);
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!window.confirm("Are you sure you want to delete this lesson?")) return;

    try {
      setLoading(true);
      const result = await deleteLesson(lessonId);
      if (result.success) {
        toast.success(result.message);
        setRefresh((prev) => !prev);
      } else {
        throw new Error(result.message || "Failed to delete lesson");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete lesson";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E8D7D7] py-12">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto shadow-lg">
          <CardHeader className="flex flex-row justify-between items-center px-6 py-4">
            <h2 className="text-2xl font-bold text-[#8B5252]">Lessons</h2>
            <Button
              onClick={handleAddLesson}
              className="bg-[#8B5252] text-white hover:bg-[#723939] flex items-center gap-2"
              disabled={loading}
            >
              <Plus className="h-5 w-5" />
              Add Lesson
            </Button>
          </CardHeader>
          <CardContent className="px-6 py-4">
  {loading ? (
    <p className="text-center text-gray-500">Loading lessons...</p>
  ) : error ? (
    <p className="text-red-500 text-center">{error}</p>
  ) : lessons.length > 0 ? (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {lessons.map((lesson) => (
        <div key={lesson._id} className="bg-white shadow-md rounded-lg p-4">
          <h3 className="text-xl font-semibold text-[#8B5252]">{lesson.title}</h3>
          <p className="text-gray-700 mt-1 line-clamp-2">{lesson.description}</p>

          {lesson.syllabus && (
            <div className="mt-2">
              <h4 className="text-sm font-medium text-gray-800">Syllabus:</h4>
              <p className="text-gray-600">{lesson.syllabus.title}</p>
              {lesson.syllabus.description && (
                <p className="text-gray-500 text-sm">{lesson.syllabus.description}</p>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-4">
            {lesson.introVideoUrl ? (
              <video
                src={lesson.introVideoUrl}
                controls
                className="w-full sm:w-1/2 h-32 object-cover rounded"
              />
            ) : (
              <p className="text-sm text-gray-400 italic">No intro video</p>
            )}

            {lesson.videoUrl ? (
              <video
                src={lesson.videoUrl}
                controls
                className="w-full sm:w-1/2 h-32 object-cover rounded"
              />
            ) : (
              <p className="text-sm text-gray-400 italic">No main video</p>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => handleEditLesson(lesson._id!)}
              className="bg-blue-500 text-white hover:bg-blue-600 px-3 py-1 rounded-md flex items-center gap-1"
              disabled={loading}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button
              onClick={() => handleDeleteLesson(lesson._id!)}
              className="bg-red-500 text-white hover:bg-red-600 px-3 py-1 rounded-md flex items-center gap-1"
              disabled={loading}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-center text-gray-500 py-8">
      No lessons available for this course.
    </p>
  )}

  {totalLessons > 0 && (
    <div className="flex justify-between items-center mt-6">
      <Button
        className="bg-gray-500 text-white hover:bg-gray-600 px-4 py-2 rounded-md"
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1 || loading}
      >
        Previous
      </Button>
      <span className="text-gray-700 font-medium">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        className="bg-gray-500 text-white hover:bg-gray-600 px-4 py-2 rounded-md"
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages || loading}
      >
        Next
      </Button>
    </div>
  )}
</CardContent>

        </Card>
      </div>
    </div>
  );
};

export default LessonsList;