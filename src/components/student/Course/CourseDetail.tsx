
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import { Button } from "../../UI/Button";
import { Badge } from "../../UI/Badge";
import { Card, CardHeader, CardContent } from "../../UI/card";
import { getCourseById, createRazorpayOrder, enrollCourse, wallet_payment } from "../../../services/userAuth";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { ICourse } from "../../../interfaces/user";

interface Student {
  _id: string;
}

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
  const user = useSelector((state: RootState) => state.auth.student) as Student | null;

  useEffect(() => {
    if (!id) return;
    fetchCourseDetails();
    checkEnrollmentStatus();
    if (user?._id) {
      fetchWalletBalance();
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
                        src={course.tutor.profilePicture}
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