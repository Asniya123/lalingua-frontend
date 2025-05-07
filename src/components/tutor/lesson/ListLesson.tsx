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
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-700">
                  <thead className="text-xs uppercase bg-gray-100 text-[#8B5252]">
                    <tr>
                      <th className="px-6 py-3 rounded-tl-lg">Title</th>
                      <th className="px-6 py-3">Description</th>
                      <th className="px-6 py-3">Intro Video</th>
                      <th className="px-6 py-3">Main Video</th>
                      <th className="px-6 py-3 rounded-tr-lg">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lessons.map((lesson) => (
                      <tr 
                        key={lesson._id} 
                        className="bg-white border-b hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {lesson.title}
                        </td>
                        <td className="px-6 py-4 max-w-xs truncate">
                          {lesson.description}
                        </td>
                        <td className="px-6 py-4">
                          {lesson.introVideoUrl ? (
                            <video
                              src={lesson.introVideoUrl}
                              controls
                              className="w-32 h-20 object-cover rounded-md"
                            >
                              Your browser does not support the video tag.
                            </video>
                          ) : (
                            <span className="text-gray-400 italic">No video</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {lesson.videoUrl ? (
                            <video
                              src={lesson.videoUrl}
                              controls
                              className="w-32 h-20 object-cover rounded-md"
                            >
                              Your browser does not support the video tag.
                            </video>
                          ) : (
                            <span className="text-gray-400 italic">No video</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleEditLesson(lesson._id!)}
                              className="bg-blue-500 text-white hover:bg-blue-600 p-2 rounded-md flex items-center gap-1"
                              disabled={loading}
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              onClick={() => handleDeleteLesson(lesson._id!)}
                              className="bg-red-500 text-white hover:bg-red-600 p-2 rounded-md flex items-center gap-1"
                              disabled={loading}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No lessons available for this course.</p>
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