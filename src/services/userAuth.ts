import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import Student, { ICourse, IEnrolledCourse, ILesson} from "../interfaces/user.js";
import API from "../api/axiosInstance.js";
import { Icategory, ILanguage } from "../interfaces/admin.js";
import { Wallet } from "../interfaces/wallet.js";


const COOKIE_EXPIRY_DAYS = 7;

// Register user
export const signupUser = async (formData: Student) => {
  try {
    const response = await API.post("/register", formData);

    if (response.data) {
      Cookies.set("user", JSON.stringify(response.data), {
        expires: COOKIE_EXPIRY_DAYS,
      });
    }

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.message || "Signup failed");
    }
    throw new Error("Error during signup request");
  }
};

// Verify OTP
export const verifyOtp = async (email: string, otp: string) => {
  try {
    const response = await API.post("/verify-otp", { email, otp });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.message || "OTP verification failed");
    }
    throw new Error("Error during OTP verification");
  }
};

// Resend OTP
export const resendOtp = async (email: string) => {
  try {
    const response = await API.post("/resend-otp", { email });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.message || "Failed to resend OTP");
    }
    throw new Error("Error during OTP resend");
  }
};

// Login user
export const loginUser = async (email: string, password: string) => {
  console.log("entered login user");
  try {
    console.log("email", email);
    console.log("passwor", password);

    const response = await API.post("/login", { email, password });
    if (response.data.blocked) {
      throw new Error("Your account has been blocked by the admin.");
    }

    if (response.data) {
      Cookies.set("userToken", JSON.stringify(response.data), {
        expires: COOKIE_EXPIRY_DAYS,
      });
    }

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.message || "Login failed");
    }
    throw new Error("Error during login request");
  }
};

// Forgot Password
export const forgotPassword = async (data: { email: string }) => {
  try {
    const response = await API.post("/forgot-password", data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(
        error.response.data.message || "Failed to initiate password reset"
      );
    }
    throw new Error("Error during forgot password request");
  }
};

// Reset Password
export const resetPassword = async (data: {
  email: string;
  otp: string;
  newPassword: string;
}) => {
  try {
    const response = await API.post("/reset-password", data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(
        error.response.data.message || "Failed to reset password"
      );
    }
    throw new Error("Error during reset password request");
  }
};

//Change Password

export const changePassword = async (data: { currentPassword: string; newPassword: string }, token: string) => {
  try {
    const response = await API.post("/changePassword", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(
        error.response.data.message || "Failed to change password"
      );
    }
    throw new Error("Error during change password request");
  }
};


//LoginWithGoogle

export const loginWithGoogle = async (token: string) => {
  try {
    const response = await API.post("/google", { token });

    if (response.data) {
      Cookies.set("user", JSON.stringify(response.data), {
        expires: COOKIE_EXPIRY_DAYS,
      });
    }

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.message || "Google login failed");
    }
    throw new Error("Error during Google login request");
  }
};

// Get Profile
export const getProfile = async (token: string) => {
  try {
    const response = await API.get(`/getProfile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

// Update Profile
export const updateProfile = async (
  token: string,
  profileData: Partial<Student>
) => {
  try {
    const response = await API.put("/editProfile", profileData);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(
        error.response.data.message || "Failed to update profile"
      );
    }
    throw new Error("Error updating profile");
  }
};

//Course
export const getCourse = async (
  page: number,
  limit: number,
  search: string | undefined,
  category: string | undefined,
  sortBy: string,
  language?: string
): Promise<{
  success: boolean;
  courses: ICourse[];
  category: Icategory[];
  total: number;
  message?: string;
}> => {
  try {
    const response = await API.get(`/courses`, { 
      params: {
        page,
        limit,
        search: search || undefined,
        category: category || undefined,
        sortBy: sortBy || "popular",
        language: language || undefined,
      },
    });
    
    console.log("API Response Data:", response.data);
    return {
      success: true,
      courses: response.data.courses,
      category: response.data.category,
      total: response.data.total,
    };
  } catch (error: any) {
    console.error("Error fetching courses:", error);
    return {
      success: false,
      courses: [],
      category: [],
      total: 0,
      message: error.response?.data?.message || "Failed to fetch courses",
    };
  }
};


export const getCourseById = async (courseId: string) => {
  try {
    const response = await API.get(`/courseDetail/${courseId}`);
    console.log("API Response for single course:", response.data);
    return response.data as {
      success: boolean;
      course: ICourse;
    };
  } catch (error) {
    console.error("Error fetching course by ID:", error);
    throw error;
  }
};

export const getEnrolledCourses = async (userId: string) => {
  try {
    const response = await API.get(`/enrollments/${userId}`);
    return response.data as { success: boolean; courses: IEnrolledCourse[] };
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    throw error;
  }
};


export const cancelEnrollment = async (userId: string, courseId: string) => {
  try {
    const response = await API.delete(`/enrollments/${userId}/${courseId}`);
    return response.data as { success: boolean; refundAmount: number; message: string };
  } catch (error) {
    console.error("Error canceling enrollment:", error);
    throw error;
  }
};

export async function listLessons(courseId: string): Promise<{ success: boolean; message: string; lessons: ILesson[] }> {
  try {
    const response = await API.get(`/listLessons/${courseId}`, {
      headers: { "Content-Type": "application/json" },
    });
    return {
      success: true,
      message: "Lessons retrieved successfully",
      lessons: response.data.lessons || [],
    };
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    console.error("Error listing lessons:", axiosError.response?.data || axiosError.message);
    throw new Error(axiosError.response?.data?.message || "Failed to list lessons");
  }
}

 
//Language

export async function getLanguages(): Promise<{
  success: boolean;
  data?: ILanguage[];
  message?: string;
}> {
  try {
    const response = await API.get("/languages"); 
    console.log("Raw API Response:", response);
    console.log("Languages fetched successfully:", response.data);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error("Error fetching languages:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return { success: false, message: error.response?.data?.message || "Failed to fetch languages" };
  }
}


export const createRazorpayOrder = async (course: ICourse) => {
  try {
    const token = Cookies.get("userToken");
    if (!token) throw new Error("User not authenticated");

    const response = await API.post(
      "/courseOrder",
      {
        amount: course.regularPrice! * 100,
        currency: "INR",
        courseId: course._id,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data as { orderId: string; amount: number; currency: string };
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    throw error;
  }
};

export const enrollCourse = async (
  courseId: string,
  data: {
    checkOnly?: boolean;
    paymentMethod?: "razorpay" | "wallet";
    paymentId?: string;
    orderId?: string;
    signature?: string;
  }
) => {
  try {
    if (data.checkOnly) {
      const response = await API.post("/enrollCourse", { checkOnly: true, courseId });
      return response.data as { success: boolean; isEnrolled: boolean };
    }

    const response = await API.post("/enrollCourse", {
      courseId, 
      paymentMethod: data.paymentMethod,
      paymentId: data.paymentId,
      orderId: data.orderId,
      signature: data.signature,
    });
    return response.data as { success: boolean; message: string };
  } catch (error) {
    console.error("Error enrolling course:", error);
    throw error;
  }
};


//Tutors

export const fetchAllTutors = async () => {
  try {
    const response = await API.get('/tutors');
    return response.data; 
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch tutors');
  }
};


export const fetchTutorById = async (id: string) => {
  const response = await API.get(`/tutors/${id}`);
  return response.data; 
};


//wallet

export const fetch_wallet=async(id:string|undefined)=>{
  try {
      const response = await API.get(`/wallet/${id}`);
      return response.data as{
          success:boolean,
          message: string,
           wallet:Wallet
      }
  } catch (error) {
      throw error
  }
}

export const wallet_payment = async (data: { userId: string|undefined; amount: number }) => {
  try {
    const response = await API.post("/wallet/check-balance", data);
    return response.data as {
      success: boolean;
      message: string;
      wallet: Wallet;
    };
  } catch (error) {
    throw error;
  }
};




