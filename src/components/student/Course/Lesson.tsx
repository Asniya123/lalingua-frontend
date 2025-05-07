import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader } from "../UI/card";
import { Button } from "../UI/button"
import { ILesson } from "../../../interfaces/user";
import { listLessons } from "../../../services/userAuth";


const Lessons: React.FC = () => {
    const navigate = useNavigate();
    const { courseId } = useParams<{ courseId: string }>();
    const [lessons, setLessons] = useState<ILesson[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
  
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
  
    if (loading) {
      return (
        <div className="min-h-screen flex justify-center items-center bg-[#E8D7D7]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }
  
    if (error) {
      return (
        <div className="min-h-screen bg-[#E8D7D7] flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="p-6 text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => navigate("/enrolled-courses")}>Back to Courses</Button>
            </CardContent>
          </Card>
        </div>
      );
    }
  
    return (
      <div className="min-h-screen bg-[#E8D7D7] py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-primary mb-8">Course Lessons</h1>
          {lessons.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground mb-4">No lessons available for this course yet.</p>
                <Button onClick={() => navigate("/enrolled-courses")}>Back to Courses</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lessons.map((lesson) => (
                <Card key={lesson._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <h2 className="text-xl font-semibold text-primary">{lesson.title}</h2>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {lesson.videoUrl && (
                      <video
                        controls
                        src={lesson.videoUrl}
                        className="w-full h-40 object-cover rounded-md"
                      >
                        Your browser does not support the video tag.
                      </video>
                    )}
                    
                    <p className="text-muted-foreground text-sm line-clamp-3">
                      {lesson.description || "No description available"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  export default Lessons;