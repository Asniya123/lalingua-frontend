import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { Card, CardContent, CardHeader } from "../../UI/card";
import { Button } from "../../UI/Button";
import { Star, User, BookOpen, TrendingUp } from "lucide-react";
import { getEnrolledStudentsByTutor } from "../../../services/tutorAuth";
import { IEnrolledStudent } from "../../../interfaces/tutor";
import { toast } from "react-toastify";

interface Tutor {
  _id: string;
  name?: string;
}

const EnrolledStudents: React.FC = () => {
  const navigate = useNavigate();
  const tutor = useSelector((state: RootState) => state.tutor.tutor) as Tutor | null;
  const [enrolledStudents, setEnrolledStudents] = useState<IEnrolledStudent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tutor || !tutor._id) {
      console.error("No tutor found in Redux state");
      toast.error("Please login as a tutor");
      navigate("/login");
      return;
    }
    console.log("Tutor found:", tutor);
    fetchEnrolledStudents();
  }, [tutor, navigate]);

  const fetchEnrolledStudents = async () => {
    if (!tutor?._id) {
      setError("Tutor ID not found");
      setLoading(false);
      return;
    }

    console.log(`Fetching enrolled students for tutorId: ${tutor._id}`);
    setLoading(true);
    setError(null);
    
    try {
      const response = await getEnrolledStudentsByTutor();
      console.log("Fetch Response:", response);
      
      if (response.success && Array.isArray(response.enrolledStudents)) {
        setEnrolledStudents(response.enrolledStudents);
        console.log(`Successfully fetched ${response.enrolledStudents.length} enrolled students`);
        
        if (response.enrolledStudents.length === 0) {
          console.log("No enrolled students found. This could mean:");
          console.log("1. No courses created by this tutor");
          console.log("2. No students enrolled in tutor's courses");
          console.log("3. Database connection issues");
        }
      } else {
        const errorMsg = response.message || "No enrolled students found";
        setError(errorMsg);
        setEnrolledStudents([]);
        toast.error(errorMsg);
      }
    } catch (err: any) {
      console.error("Fetch error details:", {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        url: err.config?.url
      });
      
      const errorMessage = err.response?.data?.message || err.message || "Failed to load enrolled students";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < Math.floor(rating)
                ? "fill-amber-400 text-amber-400"
                : i < rating
                ? "fill-amber-400/50 text-amber-400/50"
                : "fill-gray-300 text-gray-300"
            }`}
          />
        ))}
        <span className="text-xs text-gray-600 ml-1">({rating.toFixed(1)})</span>
      </div>
    );
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const handleRetry = () => {
    fetchEnrolledStudents();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading enrolled students...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#E8D7D7] flex items-center justify-center px-4">
        <Card className="max-w-lg w-full shadow-xl rounded-xl border border-red-200">
          <CardContent className="p-8 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Students</h2>
            <p className="text-red-600 font-medium mb-6">{error}</p>
            <div className="space-y-3">
              <Button
                onClick={handleRetry}
                className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-lg transition-colors w-full"
              >
                Try Again
              </Button>
              <Button
                onClick={() => navigate("/tutor-dashboard")}
                variant="outline"
                className="w-full"
              >
                Back to Dashboard
              </Button>
            </div>
            <div className="mt-6 text-sm text-gray-500">
              <p>Debug Info:</p>
              <p>Tutor ID: {tutor?._id}</p>
              <p>Check browser console for more details</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E8D7D7] py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <Button
            onClick={() => navigate("/tutor-dashboard")}
            className="mb-4 bg-gray-600 text-white hover:bg-gray-700 flex items-center gap-2"
          >
            ← Back to Dashboard
          </Button>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Enrolled Students</h1>
            <p className="text-gray-600 mb-4">
              View all students enrolled in your courses, their progress, reviews, and ratings.
            </p>
            
            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <User className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{enrolledStudents.length}</p>
                <p className="text-sm text-gray-600">Total Students</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">
                  {enrolledStudents.length > 0 
                    ? Math.round(enrolledStudents.reduce((acc, s) => acc + s.progress, 0) / enrolledStudents.length)
                    : 0}%
                </p>
                <p className="text-sm text-gray-600">Avg Progress</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <Star className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-600">
                  {enrolledStudents.filter(s => s.review).length > 0
                    ? (enrolledStudents
                        .filter(s => s.review)
                        .reduce((acc, s) => acc + (s.review?.rating || 0), 0) / 
                       enrolledStudents.filter(s => s.review).length
                      ).toFixed(1)
                    : "N/A"}
                </p>
                <p className="text-sm text-gray-600">Avg Rating</p>
              </div>
            </div>
          </div>
        </div>

        {/* Students Grid */}
        {enrolledStudents.length === 0 ? (
          <Card className="shadow-xl rounded-xl border border-gray-200">
            <CardContent className="p-12 text-center">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Students Enrolled Yet</h3>
              <p className="text-gray-600 mb-6">
                Students haven't enrolled in your courses yet. Keep creating great content to attract learners!
              </p>
              <Button
                onClick={() => navigate("/tutor-dashboard")}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Manage Your Courses
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {enrolledStudents.map((enrollment, index) => (
              <Card
                key={`${enrollment.student._id}-${enrollment.course._id}-${index}`}
                className="shadow-md hover:shadow-xl rounded-xl border border-gray-200 transition-all duration-300 hover:scale-105"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    {enrollment.student.profilePicture ? (
                      <img
                        src={enrollment.student.profilePicture}
                        alt={enrollment.student.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                        onError={(e) => {
                          console.log("Image failed to load:", enrollment.student.profilePicture);
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg shadow-md">
                        {enrollment.student.name?.charAt(0).toUpperCase() || "?"}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-semibold text-gray-800 truncate">
                        {enrollment.student.name || "Unknown Student"}
                      </h2>
                      <p className="text-sm text-gray-600 truncate" title={enrollment.course.courseTitle}>
                        {enrollment.course.courseTitle}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Progress Section */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium text-gray-700">Progress</p>
                      <span className="text-sm font-semibold text-gray-600">
                        {enrollment.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(enrollment.progress)}`}
                        style={{ width: `${Math.min(enrollment.progress, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {enrollment.progress >= 100 ? "Course Completed! 🎉" : 
                       enrollment.progress >= 80 ? "Almost done!" :
                       enrollment.progress >= 50 ? "Making good progress" :
                       "Just getting started"}
                    </p>
                  </div>

                  {/* Review Section */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Student Review</p>
                    {enrollment.review ? (
                      <div className="bg-gray-50 rounded-lg p-3">
                        {renderStars(enrollment.review.rating)}
                        {enrollment.review.comment && (
                          <p className="text-sm text-gray-600 mt-2 italic">
                            "{enrollment.review.comment.length > 100 
                              ? enrollment.review.comment.substring(0, 100) + "..."
                              : enrollment.review.comment}"
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-sm text-gray-500">No review yet</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Student hasn't left a review
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnrolledStudents;