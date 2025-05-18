import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader } from "../UI/card";
import { Button } from "../UI/button";
import { ILesson } from "../../../interfaces/user";
import { listLessons } from "../../../services/userAuth";

const Lessons: React.FC = () => {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const [lessons, setLessons] = useState<ILesson[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  useEffect(() => {
    if (!courseId) {
      navigate("/enrolled-courses");
      return;
    }
    fetchLessons();
  }, [courseId, navigate]);

  const fetchLessons = async () => {
    if (!courseId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await listLessons(courseId);
      if (response.success && Array.isArray(response.lessons)) {
        console.log("Lessons fetched:", JSON.stringify(response.lessons, null, 2));
        setLessons(response.lessons);
      } else {
        setError("No lessons found for this course");
      }
    } catch (err) {
      setError("Failed to load lessons");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteLesson = (lessonId: string) => {
    if (!completedLessons.includes(lessonId)) {
      setCompletedLessons((prev) => [...prev, lessonId]);
    }
  };

  const isLessonUnlocked = (lessonIndex: number): boolean => {
    if (lessonIndex === 0) return true; // First lesson is always unlocked
    const previousLessonId = lessons[lessonIndex - 1]?._id;
    return previousLessonId ? completedLessons.includes(previousLessonId) : false;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-gray-100 to-gray-200">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#E8D7D7] from-gray-100 to-gray-200 flex items-center justify-center px-4">
        <Card className="max-w-md w-full shadow-xl rounded-xl border border-gray-200">
          <CardContent className="p-8 text-center">
            <p className="text-red-600 font-medium mb-6">{error}</p>
            <Button
              onClick={() => navigate("/enrolled-courses")}
              className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-lg transition-colors"
            >
              Back to Courses
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E8D7D7] flex items-center justify-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-10 text-center md:text-left">
          Course Lessons
        </h1>
        {lessons.length === 0 ? (
          <Card className="shadow-xl rounded-xl border border-gray-200">
            <CardContent className="p-8 text-center">
              <p className="text-gray-600 font-medium mb-6">
                No lessons available for this course yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson, index) => {
              const isUnlocked = isLessonUnlocked(index);
              const isCompleted = completedLessons.includes(lesson._id || '');

              return (
                <Card
                  key={lesson._id}
                  className="shadow-md hover:shadow-xl rounded-xl border border-gray-200 transition-all duration-300"
                >
                  <CardHeader className="pb-4">
                    <h2 className="text-xl font-semibold text-gray-800 line-clamp-2">
                      {lesson.title}
                    </h2>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {lesson.description || "No description available"}
                    </p>
                    {lesson.syllabus ? (
                      <div className="mb-2">
                        <p className="text-sm font-medium text-gray-700">Syllabus:</p>
                        <div className="text-muted-foreground text-sm">
                          <p className="font-medium">{lesson.syllabus.title}</p>
                          {lesson.syllabus.description && (
                            <p className="mt-1">{lesson.syllabus.description}</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm mb-2">No syllabus available</p>
                    )}
                    {lesson.videoUrl ? (
                      <div className="relative">
                        <video
                          controls={isUnlocked}
                          src={lesson.videoUrl}
                          className={`w-full h-48 object-cover rounded-lg ${
                            !isUnlocked ? "filter grayscale" : ""
                          }`}
                        >
                          Your browser does not support the video tag.
                        </video>
                        {!isUnlocked && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg pointer-events-none">
                            <span className="text-white font-medium">
                              Complete the previous lesson to unlock
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-lg">
                        <span className="text-gray-500">No Video Available</span>
                      </div>
                    )}
                    {isUnlocked && lesson.videoUrl && (
                      <Button
                        onClick={() => handleCompleteLesson(lesson._id || '')}
                        disabled={isCompleted}
                        className={`w-full py-2 rounded-lg transition-colors ${
                          isCompleted
                            ? "bg-green-600 text-white cursor-not-allowed"
                            : "bg-yellow-400 text-black hover:bg-yellow-500"
                        }`}
                      >
                        {isCompleted ? "Completed" : "Complete"}
                      </Button>
                    )}
                    {/* <Button
                      onClick={() => navigate(`/lesson/${lesson._id}`)}
                      disabled={!isUnlocked}
                      className={`w-full py-2 rounded-lg transition-colors ${
                        isUnlocked
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-400 text-gray-700 cursor-not-allowed"
                      }`}
                    >
                      View Lesson
                    </Button> */}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Lessons;