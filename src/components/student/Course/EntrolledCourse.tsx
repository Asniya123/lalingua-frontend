import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { Card, CardContent, CardHeader } from "../../UI/card";
import { Button } from "../../UI/Button";
import { IEnrolledCourse, IReview } from "../../../interfaces/user";
import { getEnrolledCourses, cancelEnrollment, submitCourseReview, updateCourseReview, deleteCourseReview } from "../../../services/userAuth";
import { toast } from "react-toastify";
import { format, differenceInDays } from "date-fns";

interface Student {
  _id: string;
}

const EnrolledCourses: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state: RootState) => state.auth.student) as Student | null;
  const [enrolledCourses, setEnrolledCourses] = useState<IEnrolledCourse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState<string | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState<string | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState<string | null>(null);
  const [showReviewsModal, setShowReviewsModal] = useState<string | null>(null);
  const [courseReviews, setCourseReviews] = useState<IReview[]>([]);
  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>("");
  const [isEditingReview, setIsEditingReview] = useState<boolean>(false);
  const [currentReviewId, setCurrentReviewId] = useState<string | null>(null);
  const [cancelCourse, setCancelCourse] = useState<{ courseId: string; courseTitle: string } | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    console.log("useEffect triggered with location.state:", location.state);
    if (!user || !user._id) {
      console.warn("No user found, redirecting to login");
      navigate("/login");
      return;
    }
    fetchEnrolledCourses();
  }, [user, navigate, location.state?.timestamp]);

  const fetchEnrolledCourses = async () => {
    if (!user || !user._id) return;
    setLoading(true);
    try {
      console.log(`Fetching enrolled courses for user: ${user._id}`);
      const response = await getEnrolledCourses(user._id);
      if (response.success && Array.isArray(response.courses)) {
        console.log(`Fetched ${response.courses.length} enrolled courses:`, response.courses);
        response.courses.forEach(course => {
          console.log(`Course ${course.courseTitle}: completedLessons=${course.completedLessons}, totalLessons=${course.totalLessons}, isCompleted=${course.isCompleted}, status=${course.status}`);
        });
        setEnrolledCourses(response.courses);
        if (response.courses.length === 0) {
          toast.info("No enrolled courses found");
        }
      } else {
        setError("No enrolled courses found or invalid response");
        console.warn("Invalid response structure:", response);
        toast.error("Invalid server response");
      }
    } catch (err) {
      setError("Failed to load enrolled courses");
      console.error("Fetch error:", err);
      toast.error("Failed to load enrolled courses");
    } finally {
      setLoading(false);
      console.log("Finished fetching courses, loading set to false");
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

    const course = enrolledCourses.find((c) => c._id === courseId);
    if (!course) {
      toast.error("Course not found in your enrollments");
      return;
    }
    if (course.status === "Cancelled") {
      toast.error("This course is already cancelled");
      return;
    }
    
    const fullyCompleted = isFullyCompleted(course);
    if (fullyCompleted) {
      toast.error("Cannot cancel: Course is fully completed");
      return;
    }
    if (!isCancelEligible(course.enrolledDate)) {
      toast.error("Refund period has expired (7 days)");
      return;
    }

    setCancelCourse({ courseId, courseTitle });
  };

  const confirmCancelEnrollment = async () => {
    if (!cancelCourse || !user || !user._id) return;
    setCancelling(cancelCourse.courseId);
    try {
      console.log(`Attempting to cancel enrollment: userId=${user._id}, courseId=${cancelCourse.courseId}`);
      const response = await cancelEnrollment(user._id, cancelCourse.courseId);
      if (response.success) {
        toast.success(response.message);
        setEnrolledCourses((prev) => prev.filter((course) => course._id !== cancelCourse.courseId));
      } else {
        toast.error(response.message || "Failed to cancel enrollment");
      }
    } catch (err: any) {
      console.error("Cancel enrollment error:", err);
      const errorMessage = err.response?.data?.message || "Failed to cancel enrollment";
      const friendlyMessage =
        errorMessage.includes("Refund period has expired")
          ? "Sorry, the refund period for this course has expired (7 days)."
          : errorMessage.includes("Enrollment not found") || errorMessage.includes("Invalid enrollment ID")
            ? "This course is not enrolled or the enrollment is invalid."
            : errorMessage.includes("Student not found")
              ? "User not found. Please log in again."
              : errorMessage.includes("Failed to refund wallet")
                ? "Unable to process refund. Please try again later."
                : errorMessage.includes("Course is completed")
                  ? "Cannot cancel a completed course."
                  : errorMessage;
      toast.error(friendlyMessage);
    } finally {
      setCancelling(null);
      setCancelCourse(null);
    }
  };

  const handleChatWithTutor = (tutorId: string, tutorName: string) => {
    if (!tutorId) {
      toast.error("Invalid tutor ID");
      console.error("Invalid tutorId:", tutorId);
      return;
    }
    console.log(`Initiating chat with tutor: ${tutorName} (${tutorId})`);
    navigate(`/chat?tutorId=${encodeURIComponent(tutorId)}`);
  };

  const isCancelEligible = (enrolledAt: string | Date | undefined): boolean => {
    if (!enrolledAt) {
      console.warn("enrolledAt is undefined or null");
      return false;
    }
    try {
      const enrolledDate = new Date(enrolledAt);
      if (isNaN(enrolledDate.getTime())) {
        console.warn("Invalid enrolledAt format:", enrolledAt);
        return false;
      }
      const daysSinceEnrollment = differenceInDays(new Date(), enrolledDate);
      console.log(`Days since enrollment for refund check: ${daysSinceEnrollment}`);
      return daysSinceEnrollment <= 7;
    } catch (error) {
      console.error("Error parsing enrolledAt in isCancelEligible:", error);
      return false;
    }
  };

  const isFullyCompleted = (course: IEnrolledCourse): boolean => {
    if (course.totalLessons === 0 && course.completedLessons > 0) {
      console.warn(`Inconsistent data for course ${course._id}: completedLessons=${course.completedLessons}, totalLessons=${course.totalLessons}`);
      return true; 
    }
    const fullyCompleted = course.totalLessons > 0 ? course.completedLessons === course.totalLessons : false;
    console.log(`isFullyCompleted check for course ${course._id}:`, {
      completedLessons: course.completedLessons,
      totalLessons: course.totalLessons,
      fullyCompleted,
    });
    return fullyCompleted;
  };

  const isCancelButtonDisabled = (course: IEnrolledCourse): boolean => {
    const fullyCompleted = isFullyCompleted(course);
    const disabled = (
      course.status === "Cancelled" || // Disable if already cancelled
      fullyCompleted || // Disable if fully completed
      !isCancelEligible(course.enrolledDate) || // Disable if not eligible for cancellation
      cancelling === course._id // Disable if currently cancelling
    );
    
    console.log(`Cancel button disabled check for course ${course._id}:`, {
      status: course.status,
      fullyCompleted,
      cancelEligible: isCancelEligible(course.enrolledDate),
      isCancelling: cancelling === course._id,
      disabled,
    });
    
    return disabled;
  };

  const getCancelButtonTooltip = (course: IEnrolledCourse): string => {
    if (course.status === "Cancelled") {
      return "Course is already cancelled";
    }
    if (isFullyCompleted(course)) {
      return "Cannot cancel: All lessons completed";
    }
    if (!isCancelEligible(course.enrolledDate)) {
      return "Refund period has expired (7 days)";
    }
    if (cancelling === course._id) {
      return "Cancelling...";
    }
    return "Cancel enrollment";
  };

  const handleReviewAndRating = (courseId: string) => {
    const course = enrolledCourses.find((c) => c._id === courseId);
    if (course?.review) {
      setIsEditingReview(true);
      setCurrentReviewId(course.review._id || null);
      setRating(course.review.rating);
      setReviewText(course.review.comment || "");
      setShowReviewModal(courseId);
    } else {
      setIsEditingReview(false);
      setCurrentReviewId(null);
      setShowCompletionModal(courseId);
    }
  };

  const handleCompletionConfirm = (courseId: string, completed: boolean) => {
    setShowCompletionModal(null);
    if (completed) {
      setShowReviewModal(courseId);
      setRating(0);
      setReviewText("");
    } else {
      toast.info("Please complete all lessons before submitting a review");
    }
  };

  const handleSubmitReview = async (courseId: string, courseTitle: string) => {
    if (!user || !user._id) {
      toast.error("Please log in to submit a review");
      navigate("/login");
      return;
    }
    if (rating < 1 || rating > 5) {
      toast.error("Please select a rating between 1 and 5");
      return;
    }
    if (reviewText.trim().length < 10) {
      toast.error("Please write a review with at least 10 characters");
      return;
    }
    try {
      let response;
      if (isEditingReview && currentReviewId) {
        response = await updateCourseReview(currentReviewId, rating, reviewText);
      } else {
        response = await submitCourseReview(user._id, courseId, rating, reviewText);
      }
      if (response.success) {
        toast.success(`Review ${isEditingReview ? "updated" : "submitted"} for ${courseTitle}`);
        setEnrolledCourses((prev) =>
          prev.map((course) =>
            course._id === courseId
              ? {
                  ...course,
                  review: {
                    _id: response.data?._id || currentReviewId || "",
                    courseId,
                    userId: user._id,
                    rating,
                    comment: reviewText,
                    createdAt: course.review?.createdAt || new Date().toISOString(),
                    updatedAt: isEditingReview ? new Date().toISOString() : undefined,
                  },
                }
              : course
          )
        );
        setShowReviewModal(null);
        setRating(0);
        setReviewText("");
        setIsEditingReview(false);
        setCurrentReviewId(null);
      } else {
        toast.error(response.message || `Failed to ${isEditingReview ? "update" : "submit"} review`);
      }
    } catch (err: any) {
      console.error("Submit/Update review error:", err);
      toast.error(`Failed to ${isEditingReview ? "update" : "submit"} review`);
    }
  };

  const handleDeleteReview = async (courseId: string, courseTitle: string) => {
    const course = enrolledCourses.find((c) => c._id === courseId);
    if (!course || !course.review?._id) {
      toast.error("Review not found");
      return;
    }
    setShowDeleteConfirmModal(courseId);
  };

  const confirmDeleteReview = async () => {
    if (!showDeleteConfirmModal) return;
    const course = enrolledCourses.find((c) => c._id === showDeleteConfirmModal);
    if (!course || !course.review?._id) {
      toast.error("Review not found");
      setShowDeleteConfirmModal(null);
      return;
    }
    try {
      const response = await deleteCourseReview(course.review._id);
      if (response.success) {
        toast.success(`Review deleted for ${course.courseTitle}`);
        setEnrolledCourses((prev) =>
          prev.map((c) =>
            c._id === showDeleteConfirmModal ? { ...c, review: undefined } : c
          )
        );
      } else {
        toast.error(response.message || "Failed to delete review");
      }
    } catch (err: any) {
      console.error("Delete review error:", err);
      toast.error("Failed to delete review");
    } finally {
      setShowDeleteConfirmModal(null);
    }
  };

  // const handleShowReviews = async (courseId: string) => {
  //   try {
  //     const response = await listReviews(courseId);
  //     if (response.success) {
  //       setCourseReviews(response.reviews);
  //       setShowReviewsModal(courseId);
  //     } else {
  //       toast.error(response.message || "Failed to load reviews");
  //     }
  //   } catch (err: any) {
  //     console.error("Error fetching reviews:", err);
  //     toast.error("Failed to load reviews");
  //   }
  // };

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
              <p className="text-muted-foreground mb-4">You haven't enrolled in any courses yet.</p>
              <Button onClick={() => navigate("/courses")}>Explore Courses</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => {
              const fullyCompleted = isFullyCompleted(course);
              
              return (
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
                            <span className="text-sm font-medium text-gray-700">{course.tutor.name}</span>
                            <Button
                              onClick={() => handleChatWithTutor(course.tutor?._id ?? "", course.tutor?.name ?? "Unknown Tutor")}
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
                      {fullyCompleted && (
                        <p className="text-green-500 font-medium">✅ Course Completed</p>
                      )}
                      {course.status === "Cancelled" && (
                        <p className="text-red-500 font-medium">❌ Course Cancelled</p>
                      )}
                      {course.review && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-gray-700">Your Review:</p>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleReviewAndRating(course._id)}
                                className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                title="Edit Review"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteReview(course._id, course.courseTitle)}
                                className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                title="Delete Review"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={`text-lg ${course.review && course.review.rating >= star ? "text-yellow-400" : "text-gray-300"}`}
                              >
                                ★
                              </span>
                            ))}
                            {course.review && (
                              <span className="text-sm text-gray-600 ml-2">({course.review.rating}/5)</span>
                            )}
                          </div>
                          {course.review && (
                            <p className="text-sm text-gray-600 mt-1 italic">"{course.review.comment}"</p>
                          )}
                        </div>
                      )}
                      {isCancelButtonDisabled(course) && course.status !== "Cancelled" && (
                        <p className="text-red-500 text-xs">
                          {fullyCompleted
                            ? "✅ Course is completed - Cancellation not available"
                            : !isCancelEligible(course.enrolledDate)
                              ? "⏰ Refund period expired (7 days)"
                              : "Cancellation not available"}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col space-y-2">
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
                          disabled={isCancelButtonDisabled(course)}
                          title={getCancelButtonTooltip(course)}
                        >
                          {cancelling === course._id ? "Cancelling..." : "Cancel Enrollment"}
                        </Button>
                      </div>
                      <Button
                        onClick={() => handleReviewAndRating(course._id)}
                        className="w-full bg-green-500 hover:bg-green-600"
                        disabled={!fullyCompleted}
                        title={!fullyCompleted ? "Complete all lessons to review" : ""}
                      >
                        {course.review ? "Edit Review" : "Review & Rate"}
                      </Button>
                      {/* <Button
                        onClick={() => handleShowReviews(course._id)}
                        className="w-full bg-blue-500 hover:bg-blue-600"
                      >
                        Show Reviews
                      </Button> */}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {showCompletionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <h2 className="text-xl font-semibold text-primary">Course Completion Check</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Have you completed all lessons in "{enrolledCourses.find((c) => c._id === showCompletionModal)?.courseTitle}"?
              </p>
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleCompletionConfirm(showCompletionModal, true)}
                  className="flex-1 bg-green-500 hover:bg-green-600"
                >
                  Yes, I've completed all lessons
                </Button>
                <Button
                  onClick={() => handleCompletionConfirm(showCompletionModal, false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600"
                >
                  No, still in progress
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <h2 className="text-xl font-semibold text-primary">
                {isEditingReview ? "Edit Review for" : "Review"} {enrolledCourses.find((c) => c._id === showReviewModal)?.courseTitle}
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating *</label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-3xl transition-colors ${rating >= star ? "text-yellow-400 hover:text-yellow-500" : "text-gray-300 hover:text-gray-400"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    {rating === 1 ? "Poor" : rating === 2 ? "Fair" : rating === 3 ? "Good" : rating === 4 ? "Very Good" : "Excellent"}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Review *</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={4}
                  placeholder="Share your experience with this course... (minimum 10 characters)"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {reviewText.length}/500 characters {reviewText.length < 10 && "(minimum 10 required)"}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleSubmitReview(showReviewModal, enrolledCourses.find((c) => c._id === showReviewModal)?.courseTitle || "")}
                  className="flex-1 bg-primary hover:bg-primary-dark"
                  disabled={rating === 0 || reviewText.trim().length < 10}
                >
                  {isEditingReview ? "Update Review" : "Submit Review"}
                </Button>
                <Button
                  onClick={() => {
                    setShowReviewModal(null);
                    setRating(0);
                    setReviewText("");
                    setIsEditingReview(false);
                    setCurrentReviewId(null);
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showReviewsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <h2 className="text-xl font-semibold text-primary">
                Reviews for {enrolledCourses.find((c) => c._id === showReviewsModal)?.courseTitle}
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              {courseReviews.length === 0 ? (
                <p className="text-gray-700">No reviews available for this course.</p>
              ) : (
                courseReviews.map((review) => (
                  <div key={review._id} className="border-b pb-4 mb-4">
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-lg ${review.rating >= star ? "text-yellow-400" : "text-gray-300"}`}
                        >
                          ★
                        </span>
                      ))}
                      <span className="text-sm text-gray-600 ml-2">({review.rating}/5)</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 italic">"{review.comment}"</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Posted on {review.createdAt ? format(new Date(review.createdAt), "PPP") : "Unknown"}
                    </p>
                  </div>
                ))
              )}
              <Button
                onClick={() => {
                  setShowReviewsModal(null);
                  setCourseReviews([]);
                }}
                className="w-full bg-gray-500 hover:bg-gray-600"
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {cancelCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <h2 className="text-xl font-semibold text-primary">Confirm Cancellation</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Are you sure you want to cancel your enrollment in "{cancelCourse.courseTitle}"?
              </p>
              <div className="flex space-x-2">
                <Button
                  onClick={confirmCancelEnrollment}
                  className="flex-1 bg-red-500 hover:bg-red-600"
                  disabled={cancelling === cancelCourse.courseId}
                >
                  {cancelling === cancelCourse.courseId ? "Cancelling..." : "Confirm"}
                </Button>
                <Button
                  onClick={() => setCancelCourse(null)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600"
                  disabled={cancelling === cancelCourse.courseId}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showDeleteConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <h2 className="text-xl font-semibold text-primary">Delete Review</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Are you sure you want to delete your review for "{enrolledCourses.find((c) => c._id === showDeleteConfirmModal)?.courseTitle}"?
              </p>
              <p className="text-sm text-gray-500">
                This action cannot be undone. You can always write a new review later.
              </p>
              <div className="flex space-x-2">
                <Button
                  onClick={confirmDeleteReview}
                  className="flex-1 bg-red-500 hover:bg-red-600"
                >
                  Delete Review
                </Button>
                <Button
                  onClick={() => setShowDeleteConfirmModal(null)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EnrolledCourses;