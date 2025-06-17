import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { Card, CardContent, CardHeader } from "../UI/card";
import { Button } from "../UI/button";
import { ILesson } from "../../../interfaces/user";
import { listLessons, completeLesson, getCompletedLessons, markCourseCompleted } from "../../../services/userAuth";
import { toast } from "react-toastify";

interface Student {
  _id: string;
}

const Lessons: React.FC = () => {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const user = useSelector((state: RootState) => state.auth.student) as Student | null;
  const [lessons, setLessons] = useState<ILesson[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [completingLesson, setCompletingLesson] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) {
      navigate("/enrolled-courses");
      return;
    }
    if (!user || !user._id) {
      navigate("/login");
      return;
    }
    fetchLessons();
    fetchCompletedLessons();
  }, [courseId, user, navigate]);

  const fetchCompletedLessons = async () => {
    if (!courseId || !user?._id) return;
    try {
      const response = await getCompletedLessons(courseId);
      if (response.success && Array.isArray(response.completedLessons)) {
        setCompletedLessons(response.completedLessons);
        console.log(`Fetched ${response.completedLessons.length} completed lessons for course ${courseId}`);
      } else {
        console.log("No completed lessons found for this course");
        setCompletedLessons([]);
      }
    } catch (error) {
      console.error("Error fetching completed lessons:", error);
      setCompletedLessons([]);
    }
  };

  const fetchLessons = async () => {
    if (!courseId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await listLessons(courseId);
      if (response.success && Array.isArray(response.lessons)) {
        console.log("Lessons fetched:", response.lessons.length);
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

  const handleCompleteLesson = async (lessonId: string) => {
  if (!courseId || !user?._id || !lessonId) {
    toast.error("Missing required information");
    return;
  }

  console.log(`Completing lesson: courseId=${courseId}, lessonId=${lessonId}, userId=${user._id}`);

  if (completedLessons.includes(lessonId)) {
    toast.info("Lesson already completed");
    return;
  }

  setCompletingLesson(lessonId);
  
  try {
    const response = await completeLesson(courseId, lessonId);
    if (response.success) {
      const updatedCompleted = [...completedLessons, lessonId];
      setCompletedLessons(updatedCompleted);
      toast.success("Lesson completed successfully!");

      // Check if all lessons are completed
      if (updatedCompleted.length === lessons.length && lessons.length > 0) {
  try {
    console.log(`Marking course as completed: courseId=${courseId}`);
    const completionResponse = await markCourseCompleted(courseId);
    if (completionResponse.success) {
      toast.success("🎉 Congratulations! Course completed!");
      navigate("/enrolled-courses", { state: { refresh: true, timestamp: Date.now() } });
    } else {
      console.error("Failed to mark course as completed:", completionResponse.message);
      toast.error(completionResponse.message || "Failed to mark course as completed");
      navigate("/enrolled-courses", { state: { refresh: true, timestamp: Date.now() } });
    }
  } catch (error) {
    console.error("Error marking course as completed:", error);
    toast.error("Failed to mark course as completed");
    navigate("/enrolled-courses", { state: { refresh: true, timestamp: Date.now() } });
  }
} else {
        navigate("/enrolled-courses", { state: { refresh: true, timestamp: Date.now() } });
      }
    } else {
      toast.error(response.message || "Failed to mark lesson as completed");
    }
  } catch (error) {
    console.error("Error completing lesson:", error);
    toast.error("Failed to complete lesson");
  } finally {
    setCompletingLesson(null);
  }
};

  const isLessonUnlocked = (lessonIndex: number): boolean => {
    if (lessonIndex === 0) return true;
    const previousLessonId = lessons[lessonIndex - 1]?._id;
    return previousLessonId ? completedLessons.includes(previousLessonId) : false;
  };

  const getProgressPercentage = (): number => {
    if (lessons.length === 0) return 0;
    return Math.round((completedLessons.length / lessons.length) * 100);
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
      <div className="min-h-screen bg-[#E8D7D7] flex items-center justify-center px-4">
        <Card className="max-w-md w-full shadow-xl rounded-xl border border-gray-200">
          <CardContent className="p-8 text-center">
            <p className="text-red-600 font-medium mb-6">{error}</p>
            <Button
              onClick={() => navigate("/enrolled-courses", { state: { refresh: true } })}
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
    <div className="min-h-screen bg-[#E8D7D7] py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button
            onClick={() => navigate("/enrolled-courses", { state: { refresh: true } })}
            className="mb-4 bg-gray-600 text-white hover:bg-gray-700"
          >
            ← Back to Enrolled Courses
          </Button>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Course Lessons</h1>
          
          <div className="bg-white rounded-lg p-4 shadow-md mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Course Progress</span>
              <span className="text-sm font-medium text-gray-700">
                {completedLessons.length} of {lessons.length} lessons completed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
            <div className="text-center mt-2">
              <span className="text-lg font-bold text-green-600">{getProgressPercentage()}%</span>
            </div>
          </div>
        </div>

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
              const isCompletingThis = completingLesson === lesson._id;

              return (
                <Card
                  key={lesson._id}
                  className={`shadow-md hover:shadow-xl rounded-xl border transition-all duration-300 ${
                    isCompleted ? 'border-green-500 bg-green-50' : 
                    isUnlocked ? 'border-gray-200' : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <h2 className="text-xl font-semibold text-gray-800 line-clamp-2 flex-1">
                        {lesson.title}
                      </h2>
                      <div className="ml-2 flex flex-col items-center">
                        <span className="text-xs text-gray-500">Lesson {index + 1}</span>
                        {isCompleted && (
                          <span className="text-green-500 text-lg">✅</span>
                        )}
                        {!isUnlocked && (
                          <span className="text-gray-400 text-lg">🔒</span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {lesson.description || "No description available"}
                    </p>
                    
                    {lesson.syllabus && (
                      <div className="mb-2">
                        <p className="text-sm font-medium text-gray-700">Syllabus:</p>
                        <div className="text-muted-foreground text-sm bg-gray-100 p-2 rounded">
                          <p className="font-medium">{lesson.syllabus.title}</p>
                          {lesson.syllabus.description && (
                            <p className="mt-1">{lesson.syllabus.description}</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {lesson.videoUrl ? (
                      <div className="relative">
                        <video
                          controls={isUnlocked}
                          src={lesson.videoUrl}
                          className={`w-full h-48 object-cover rounded-lg ${
                            !isUnlocked ? "filter grayscale" : ""
                          }`}
                          poster={lesson.title || undefined}
                        >
                          Your browser does not support the video tag.
                        </video>
                        {!isUnlocked && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg pointer-events-none">
                            <div className="text-center text-white">
                              <span className="block text-lg mb-1">🔒</span>
                              <span className="text-sm font-medium">
                                Complete the previous lesson to unlock
                              </span>
                            </div>
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
                        disabled={isCompleted || isCompletingThis}
                        className={`w-full py-2 rounded-lg transition-colors ${
                          isCompleted
                            ? "bg-green-600 text-white cursor-not-allowed"
                            : isCompletingThis
                            ? "bg-yellow-300 text-black cursor-not-allowed"
                            : "bg-yellow-400 text-black hover:bg-yellow-500"
                        }`}
                      >
                        {isCompletingThis ? "Completing..." : isCompleted ? "✅ Completed" : "Mark as Complete"}
                      </Button>
                    )}
                    
                    {!isUnlocked && (
                      <div className="text-center text-gray-500 text-sm py-2">
                        Complete lesson {index} to unlock this lesson
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        
        {lessons.length > 0 && completedLessons.length === lessons.length && (
          <div className="mt-8 text-center">
            <Card className="bg-green-100 border-green-500">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-green-800 mb-2">🎉 Congratulations!</h2>
                <p className="text-green-700">You have completed all lessons in this course!</p>
                <Button
                  onClick={() => navigate("/enrolled-courses", { state: { refresh: true } })}
                  className="mt-4 bg-green-600 hover:bg-green-700 text-white"
                >
                  View All Courses
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Lessons;