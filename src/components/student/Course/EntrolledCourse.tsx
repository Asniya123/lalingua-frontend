import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { Card, CardContent, CardHeader } from "../../UI/card";
import { Button } from "../../UI/Button";
import { ICourse } from "../../../interfaces/user";
import { getEnrolledCourses, cancelEnrollment } from "../../../services/userAuth";
import { toast } from "react-toastify";
import { format, differenceInDays } from "date-fns";

interface Student {
  _id: string;
}

interface Tutor {
  _id: string;
  name?: string;
  profilePicture?: string;
}


export interface IEnrolledCourse extends ICourse {
  pricePaid: number;
  enrolledDate?: string; 
  status: "Active" | "Cancelled" | "Expired";
}

const EnrolledCourses: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.student) as Student | null;
  const [enrolledCourses, setEnrolledCourses] = useState<IEnrolledCourse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !user._id) {
      console.log("No user found, redirecting to login");
      navigate("/login");
      return;
    }
    fetchEnrolledCourses();
  }, [user, navigate]);

  const fetchEnrolledCourses = async () => {
    if (!user || !user._id) return;
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching enrolled courses for user:", user._id);
      const response = await getEnrolledCourses(user._id);
      console.log("Full response from getEnrolledCourses:", JSON.stringify(response, null, 2));
      if (response.success && Array.isArray(response.courses)) {
        console.log("Courses received:", response.courses);
        response.courses.forEach((course, index) => {
          console.log(`Course ${index + 1} tutor:`, course.tutor);
          console.log(`Course ${index + 1} tutorId:`, course.tutor);
        });
        setEnrolledCourses(response.courses);
        if (response.courses.length === 0) {
          console.log("No enrolled courses found for this user");
        }
      } else {
        setError("No enrolled courses found or invalid response");
        console.warn("Invalid response structure:", response);
      }
    } catch (err) {
      setError("Failed to load enrolled courses");
      console.error("Fetch error:", err);
      toast.error("Failed to load enrolled courses");
    } finally {
      setLoading(false);
      console.log("Loading state set to false");
    }
  };

  const handleCancelEnrollment = async (courseId: string, courseTitle: string) => {
    if (!user || !user._id) {
      toast.error("Please log in to cancel enrollment");
      navigate("/login");
      return;
    }
    if (!courseId) {
      toast.error("Invalid course ID");
      return;
    }

    const confirmCancel = window.confirm(
      `Are you sure you want to cancel your enrollment in "${courseTitle}"? The amount will be refunded to your wallet.`
    );
    if (!confirmCancel) return;

    try {
      const response = await cancelEnrollment(user._id, courseId);
      if (response.success) {
        toast.success(response.message);
        setEnrolledCourses((prev) => prev.filter((course) => course._id !== courseId));
      } else {
        toast.error(response.message || "Failed to cancel enrollment");
      }
    } catch (err: any) {
      console.error("Cancel enrollment error:", err);
      console.error("Full error response:", JSON.stringify(err.response, null, 2));
      const errorMessage = err.response?.data?.message || "Failed to cancel enrollment";
      const friendlyMessage =
        errorMessage.includes("Refund period has expired")
          ? "Sorry, the refund period for this course has expired (7 days)."
          : errorMessage.includes("Enrollment not found")
            ? "This course is not enrolled."
            : errorMessage.includes("Student not found")
              ? "User not found. Please log in again."
              : errorMessage.includes("Cast to embedded failed")
                ? "An error occurred while processing the refund. Please try again later."
                : errorMessage;
      toast.error(friendlyMessage);
    }
  };

  const handleChatWithTutor = (tutorId: string, tutorName: string) => {
    navigate(`/chat?tutorId=${encodeURIComponent(tutorId)}`);
    console.log(`Initiating chat with tutor: ${tutorName} (${tutorId})`);
  };

  const isCancelEligible = (enrolledDate: string | undefined): boolean => {
    if (!enrolledDate) return false;
    const enrolledAt = new Date(enrolledDate);
    if (isNaN(enrolledAt.getTime())) return false;
    const daysSinceEnrollment = differenceInDays(new Date(), enrolledAt);
    return daysSinceEnrollment <= 7;
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
            <Button onClick={() => navigate("/courses")}>Back to Courses</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E8D7D7] py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-primary mb-8">Your Enrolled Courses</h1>
        {enrolledCourses.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-4">You haven’t enrolled in any courses yet.</p>
              <Button onClick={() => navigate("/courses")}>Explore Courses</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <Card key={course._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <h2 className="text-xl font-semibold text-primary">{course.courseTitle}</h2>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    {course.imageUrl ? (
                      <img
                        src={course.imageUrl}
                        alt={course.courseTitle}
                        className="w-full h-40 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-full h-40 bg-muted flex items-center justify-center rounded-md">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-3 mb-3">
                    {course.tutor && course.tutor.name && course.tutor._id ? (
                      <>
                        {course.tutor.profilePicture ? (
                          <img
                            src={course.tutor.profilePicture}
                            alt={course.tutor.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-gray-600 text-sm">{course.tutor.name.charAt(0)}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-700">
                            {course.tutor.name}
                          </span>
                          <Button
                            onClick={() => handleChatWithTutor(course.tutor?._id ?? '', course.tutor?.name ?? 'Unknown Tutor')}
                            className="text-xs px-2 py-1 bg-blue-500 hover:bg-blue-600"
                          >
                            Chat
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-600 text-sm">?</span>
                        </div>
                        <span className="text-sm font-medium text-gray-700">Unknown Tutor</span>
                      </div>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {course.description || "No description available"}
                  </p>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <strong>Price Paid:</strong> ₹
                      {typeof course.pricePaid === "number" ? course.pricePaid.toFixed(2) : "N/A"}
                    </p>
                    <p>
                      <strong>Enrolled Date:</strong>{" "}
                      {course.enrolledDate ? format(new Date(course.enrolledDate), "PPP 'at' p") : "Unknown"}
                    </p>
                    <p><strong>Status:</strong> {course.status}</p>
                    {!isCancelEligible(course.enrolledDate) && (
                      <p className="text-red-500 text-xs">
                        Refund period expired (7 days)
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => navigate(`/lessons/${course._id}`)}
                      className="flex-1 bg-primary hover:bg-primary-dark"
                    >
                      View Course
                    </Button>
                    <Button
                      onClick={() => handleCancelEnrollment(course._id, course.courseTitle)}
                      className="flex-1 bg-red-500 hover:bg-red-600"
                      // disabled={course.status !== "Active" || !isCancelEligible(course.enrolledDate)}
                      // title={
                      //   !isCancelEligible(course.enrolledDate)
                      //     ? "Refund period has expired (7 days)"
                      //     : course.status !== "Active"
                      //       ? "Cancellation not available for this status"
                      //       : ""
                      // }
                    >
                      Cancel Enrollment
                    </Button>
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

export default EnrolledCourses;