import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import { Button } from "../../UI/Button";
import { Badge } from "../../UI/Badge";
import { Card, CardHeader, CardContent } from "../../UI/card";
import { getCourseById, createRazorpayOrder, enrollCourse, wallet_payment, getStudentById, listReviews } from "../../../services/userAuth"; 
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import Student, { ICourse, IReview } from "../../../interfaces/user";

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Failed to load Razorpay script"));
    document.body.appendChild(script);
  });
};

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<ICourse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState<boolean>(false);
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'wallet'>('razorpay');
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [students, setStudents] = useState<{ [key: string]: Student }>({}); 
  const user = useSelector((state: RootState) => state.auth.student) as Student | null;

  useEffect(() => {
    if (!id) return;
    fetchCourseDetails();
    checkEnrollmentStatus();
    if (user?._id) {
      fetchWalletBalance();
      fetchReviews();
    }
  }, [id, user]);

  const fetchCourseDetails = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getCourseById(id);
      console.log("Full course response:", JSON.stringify(response, null, 2));
      if (response.success && response.course) {
        console.log("Tutor data:", response.course.tutor);
        setCourse(response.course);
      } else {
        setError("Course not found");
      }
    } catch (err) {
      setError("Failed to load course details");
      console.error("Fetch error:", err);
      toast.error("Failed to load course details");
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollmentStatus = async () => {
    if (!user || !id) return;
    try {
      const response = await enrollCourse(id, { checkOnly: true });
      if (response.success && "isEnrolled" in response) {
        setIsEnrolled(response.isEnrolled as boolean);
      }
    } catch (err) {
      console.error("Error checking enrollment:", err);
    }
  };

  const fetchWalletBalance = async () => {
    if (!user?._id) return;
    try {
      const response = await wallet_payment({ userId: user._id, amount: 0 });
      if (response.success && response.wallet) {
        setWalletBalance(response.wallet.walletBalance);
      }
    } catch (err) {
      console.error("Error fetching wallet balance:", err);
      toast.error("Failed to load wallet balance");
    }
  };

  const fetchReviews = async () => {
    if (!id) return;
    try {
      const response = await listReviews(id);
      console.log("Reviews response:", JSON.stringify(response, null, 2)); // Debug log
      if (response.success) {
        setReviews(response.reviews);

        const userIds = response.reviews.map((review) => review.userId).filter((id): id is string => id !== undefined);
        const uniqueUserIds = [...new Set(userIds)];
        console.log("Unique userIds:", uniqueUserIds); // Debug log
        const studentPromises = uniqueUserIds.map((userId) => fetchStudentDetails(userId));
        const studentData = await Promise.all(studentPromises);
        console.log("Student data:", JSON.stringify(studentData, null, 2)); // Debug log
        const studentsMap = studentData.reduce((acc, student) => {
          if (student.success && student.data) {
            acc[student.data._id || ""] = student.data;
          }
          return acc;
        }, {} as { [key: string]: Student });
        console.log("Students map:", studentsMap); // Debug log
        setStudents(studentsMap);
      } else {
        toast.error(response.message || "Failed to load reviews");
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
      toast.error("Failed to load reviews");
    }
  };

  const fetchStudentDetails = async (userId: string): Promise<{ success: boolean; message: string; data?: Student }> => {
    try {
      const response = await getStudentById(userId); 
      console.log(`Student response for ${userId}:`, JSON.stringify(response, null, 2)); // Debug log
      return response.success ? response : { success: false, message: "Student not found" };
    } catch (err) {
      console.error(`Error fetching student ${userId}:`, err);
      return { success: false, message: "Failed to fetch student" };
    }
  };

  const handlePayment = async () => {
    if (!user || !user._id) {
      toast.error("Please log in to proceed with payment");
      navigate("/login");
      return;
    }

    if (!course) {
      toast.error("Course details not available");
      return;
    }

    setPaymentProcessing(true);

    try {
      if (paymentMethod === 'razorpay') {
        await loadRazorpayScript();

        if (!window.Razorpay) {
          throw new Error("Razorpay script failed to initialize");
        }

        const orderResponse = await createRazorpayOrder(course);
        if (!orderResponse.orderId) {
          throw new Error("Failed to create payment order");
        }

        const options = {
          key: "rzp_test_XnSWcDHvXwMKdf",
          amount: orderResponse.amount,
          currency: orderResponse.currency,
          name: "LaLingua",
          description: `Payment for ${course.courseTitle}`,
          order_id: orderResponse.orderId,
          handler: async (response: RazorpayResponse) => {
            try {
              const enrollmentResponse = await enrollCourse(id!, {
                paymentMethod: 'razorpay',
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
              });
              if (enrollmentResponse.success) {
                setIsEnrolled(true);
                toast.success("Payment successful! You are now enrolled.");
              } else {
                toast.error("Payment succeeded, but enrollment failed. Contact support.");
              }
            } catch (err) {
              console.error("Enrollment error:", err);
              toast.error("Payment succeeded, but enrollment failed. Contact support.");
            } finally {
              setPaymentProcessing(false);
            }
          },
          prefill: {
            name: "Asniya",
            email: "asniya737@gmail.com",
            contact: "8301026583",
          },
          theme: {
            color: "#8B5252",
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", (response: any) => {
          toast.error(`Payment failed: ${response.error.description}`);
          setPaymentProcessing(false);
        });
        rzp.open();
      } else if (paymentMethod === 'wallet') {
        if (walletBalance === null || walletBalance < course.regularPrice) {
          toast.error("Insufficient wallet balance");
          setPaymentProcessing(false);
          return;
        }

        const enrollmentResponse = await enrollCourse(id!, {
          paymentMethod: 'wallet',
        });
        if (enrollmentResponse.success) {
          setIsEnrolled(true);
          setWalletBalance((prev) => (prev !== null ? prev - course.regularPrice : null));
          toast.success("Payment successful using wallet! You are now enrolled.");
        } else {
          toast.error("Wallet payment failed. Contact support.");
        }
        setPaymentProcessing(false);
      }
    } catch (error) {
      console.error("Payment initiation error:", error);
      toast.error("Failed to initiate payment. Please try again.");
      setPaymentProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#E8D7D7]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-[#E8D7D7] flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p className="text-red-500 mb-4">{error || "Course not found"}</p>
            <Button onClick={() => navigate("/courses")}>Back to Courses</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E8D7D7] py-12">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              {course.imageUrl ? (
                <img
                  src={course.imageUrl}
                  alt={course.courseTitle}
                  className="w-full h-64 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-64 bg-muted flex items-center justify-center rounded-lg">
                  No Image Available
                </div>
              )}
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-primary">{course.courseTitle}</h1>
              <p className="text-muted-foreground">{course.description}</p>
              <div className="flex items-center space-x-3 mb-3">
                {course.tutor && course.tutor.name ? (
                  <>
                    {course.tutor.profilePicture ? (
                      <img
                        src={course.tutor.profilePicture as string}
                        alt={course.tutor.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-gray-600 text-sm">{course.tutor.name.charAt(0)}</span>
                      </div>
                    )}
                    <span
                      className="text-sm font-medium text-gray-700 cursor-pointer hover:underline pointer-events-auto z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log("Tutor name clicked", course.tutor);
                        if (course.tutor && course.tutor._id) {
                          navigate(`/tutorDetail/${course.tutor._id}`);
                        } else {
                          toast.error("Tutor details not available");
                        }
                      }}
                    >
                      {course.tutor.name}
                    </span>
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
              <div className="flex items-center space-x-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < 4 ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">(4.0)</span>
              </div>
              <Badge>{course.buyCount?.toLocaleString() || 0} students enrolled</Badge>
              <p className="text-sm text-gray-600">
                Language:{" "}
                {typeof course.language === "string"
                  ? course.language
                  : course.language && typeof course.language === "object" && "name" in course.language
                  ? course.language.name
                  : "Unknown"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-semibold">Course Preview</h2>
              </CardHeader>
              <CardContent>
                {course.lessons && course.lessons.length > 0 ? (
                  <div className="space-y-6">
                    {course.lessons.map((lesson, index) => (
                      <div key={lesson._id} className="border-b pb-4 last:border-b-0">
                        <h3 className="text-lg font-medium text-gray-800 mb-2">
                          {lesson.title}
                        </h3>
                        <p className="text-muted-foreground mb-2">{lesson.description}</p>
                        {lesson.syllabus ? (
                          <div className="mb-2">
                            <p className="text-sm font-medium text-gray-700">Syllabus:</p>
                            <ol className="list-decimal list-inside text-muted-foreground text-sm">
                              <li>
                                <span className="font-medium">Title: {lesson.syllabus.title}</span>
                                {lesson.syllabus.description
                                  ? ` - ${lesson.syllabus.description}`
                                  : " - No description"}
                              </li>
                            </ol>
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-sm mb-2">No syllabus available</p>
                        )}
                        {isEnrolled ? (
                          lesson.videoUrl ? (
                            <div>
                              <p className="text-sm text-muted-foreground mb-2">
                                Lesson Video:
                              </p>
                              <video
                                src={lesson.videoUrl}
                                controls
                                className="w-full max-w-md h-48 object-cover rounded-md"
                                onError={(e) =>
                                  console.error("Main video error for", lesson.videoUrl, e)
                                }
                              >
                                Your browser does not support this video format.
                              </video>
                            </div>
                          ) : (
                            <p className="text-muted-foreground">No main video available</p>
                          )
                        ) : lesson.introVideoUrl ? (
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">
                              Preview Video:
                            </p>
                            <video
                              src={lesson.introVideoUrl}
                              controls
                              className="w-full max-w-md h-48 object-cover rounded-md"
                              onError={(e) =>
                                console.error("Intro video error for", lesson.introVideoUrl, e)
                              }
                            >
                              Your browser does not support this video format.
                            </video>
                          </div>
                        ) : (
                          <p className="text-muted-foreground">No preview video available</p>
                        )}
                      </div>
                    ))}
                    {!isEnrolled && (
                      <p className="text-muted-foreground mt-4">
                        Purchase the course to access full lesson videos.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No lessons available for preview.</p>
                )}
                {reviews.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-4">User Reviews</h3>
                    {reviews.map((review) => {
                      const student = students[review.userId || ""] || { name: "Anonymous", profilePicture: null };
                      console.log("Review:", review, "Student:", student); // Debug log
                      return (
                        <div key={review._id} className="border-b pb-4 mb-4 last:border-b-0">
                          <div className="flex items-center space-x-3 mb-2">
                            {student.profilePicture ? (
                              <img
                                src={student.profilePicture as string}
                                alt={student.name || "User"}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-gray-600 text-sm">{student.name?.charAt(0) || "U"}</span>
                              </div>
                            )}
                            <span className="text-sm font-medium text-gray-700">{student.name || "Anonymous"}</span>
                          </div>
                          <div className="flex items-center space-x-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-5 w-5 ${i < review.rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"}`}
                              />
                            ))}
                            <span className="text-sm text-muted-foreground ml-2">
                              ({review.rating}/5)
                            </span>
                          </div>
                          {review.comment && (
                            <p className="text-sm text-gray-600 italic">"{review.comment}"</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "Unknown date"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="sticky top-4">
            <CardHeader>
              <h2 className="text-2xl font-semibold">Checkout</h2>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-primary text-xl">
                    ₹{course.regularPrice?.toFixed(2) || "0.00"}
                  </span>
                </div>
                {walletBalance !== null && (
                  <div className="text-sm text-muted-foreground">
                    Wallet Balance: ₹{walletBalance.toFixed(2)}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Method:</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="razorpay"
                      checked={paymentMethod === 'razorpay'}
                      onChange={() => setPaymentMethod('razorpay')}
                      className="mr-2"
                    />
                    Razorpay
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="wallet"
                      checked={paymentMethod === 'wallet'}
                      onChange={() => setPaymentMethod('wallet')}
                      className="mr-2"
                    />
                    Wallet
                  </label>
                </div>
              </div>

              <Button
                className={`w-full ${
                  isEnrolled ? "bg-green-600 hover:bg-green-700" : "bg-yellow-400 hover:bg-yellow-500"
                } text-black`}
                onClick={isEnrolled ? () => navigate("/enrolled-Courses") : handlePayment}
                disabled={paymentProcessing}
              >
                {paymentProcessing ? "Processing..." : isEnrolled ? "View Enrolled Courses" : "Pay Now"}
              </Button>

              <div className="text-sm text-muted-foreground text-center space-y-1">
                <p>30-day money-back guarantee</p>
                <p>Lifetime access</p>
                <p>Secure payment processing</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;