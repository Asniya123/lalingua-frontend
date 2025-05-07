import axios, { Axios, AxiosError } from "axios";
import Tutor, { ICourse, ILesson } from "../interfaces/tutor.js";
import tutorAPI from "../api/tutorInstance.js";
import Cookies from "js-cookie";
import API from "../api/axiosInstance.js";


interface CourseListResponse {
  courses: ICourse[];
  total: number;
}

const COOKIE_EXPIRY_DAYS = 7; 

export const signupTutor = async (formData: Tutor) => {
  try {
    const response = await tutorAPI.post('/register', formData);
    console.log(response, 'erfwjrhduiq');
    if (response.data) {
          Cookies.set('tutor', JSON.stringify(response.data), { expires: COOKIE_EXPIRY_DAYS }); 
        }
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.message || 'Signup failed');
    } else if (error instanceof AxiosError && error.request) {
      throw new Error('No response from server');
    } else {
      throw new Error('Error setting up request');
    }
  }
};

export const verifyOtp = async (email: string, otp: string) => {
  try {
    const response = await tutorAPI.post('/verify-otp', { email, otp });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.message || 'OTP verification failed');
    }
    throw new Error('Error during OTP verification');
  }
};


export const resendOtp = async (email: string) => {
  try {
    const response = await tutorAPI.post('/resend-otp', { email });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.message || 'Failed to resend OTP');
    }
    throw new Error('Error during OTP resend');
  }
};


export const loginTutor = async (email: string, password: string) => {
  try {
    const response = await tutorAPI.post("/login", { email, password });
    if (response.data) {   
      Cookies.set("tutorToken", response.data.accessToken);
      Cookies.set("refreshToken",response.data.refreshToken)
      return response.data;
    }
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response) {
      console.error("Error during login:", error.response.data || error.message);
      throw new Error(error.response.data?.message || "Login failed. Please try again.");
    } else if (error instanceof Error) {
      console.error("Error during login:", error.message);
      throw new Error(error.message);
    } else {
      console.error("Unknown error during login");
      throw new Error("Unknown error occurred during login.");
    }
  }
};



export const loginWithGoogle = async (token: string) => {
  try {
    const response = await tutorAPI.post('/google', { token });
    
    if (response.data) {
      Cookies.set('tutor', JSON.stringify(response.data), { expires: COOKIE_EXPIRY_DAYS });
    }
  
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Google login failed');
    }
    throw new Error('Error during Google login request');
  }
}


// Forgot password
export const forgotPassword = async (data: { email: string }) => {
  try {
    const response = await tutorAPI.post('/forgot-password', data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.message || 'Failed to initiate password reset');
    }
    throw new Error('Error during forgot password request');
  }
};

// Reset password
export const resetPassword = async (data: { email: string; otp: string; newPassword: string }) => {
  try {
    const response = await tutorAPI.post('/reset-password', data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.message || 'Failed to reset password');
    }
    throw new Error('Error during reset password request');
  }
};


//Change Password

export const changePassword = async (data: { currentPassword: string; newPassword: string}, token: string) => {
  try{
    const response = await API.post('/changePassword', data, {
      headers: {
        Authorization: `Baerer ${token}`,
      },
    })
    return response.data
  }catch(error){
    if(error instanceof AxiosError && error.response){
      throw new Error(
        error.response.data.message || 'Failed to change password'
      )
    }
    throw new Error('Error during change password')
  }
}


export async function addCourse(
  courseData: {
    courseTitle: string;
    imageUrl: string;
    category: string;
    language: string;
    description: string;
    regularPrice: number;
    tutorId?: string; 
  }
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await tutorAPI.post("/addCourse", courseData);
    console.log("Course added successfully:", response.data);
    return { success: true, message: response.data.message || "Course added successfully" };
  } catch (error) {
    const axiosError = error as AxiosError<{ error?: string }>;
    console.error("Error adding course:", axiosError.response?.data || axiosError.message);
    throw new Error(axiosError.response?.data?.error || "Failed to add course");
  }
}

export async function listCourses(currentPage: number, limit: number): Promise<{ success: boolean; message: string; courses: ICourse[]; total: number }> {
  try {
    const response = await tutorAPI.get('/listCourse', {
      params: { page: currentPage, limit },
      
    });
    return { 
      success: true, 
      message: 'Courses retrieved successfully', 
      courses: response.data.courses,
      total: response.data.total 
    };
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    console.error('Error listing courses:', axiosError.response?.data || axiosError.message);
    throw new Error(axiosError.response?.data?.message || 'Failed to list courses');
  }
}


export async function editCourse(
  courseId: string,
  courseData: Partial<ICourse>
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await tutorAPI.put(`/editCourse/${courseId}`, courseData);
    return { success: true, message: response.data.message || "Course updated successfully" };
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    console.error("Error editing course:", axiosError.response?.data || axiosError.message);
    throw new Error(axiosError.response?.data?.message || "Failed to update course");
  }
}


export async function getCourse(courseId: string): Promise<ICourse> {
  try {
    const response = await tutorAPI.get(`/course/${courseId}`);
    console.log("response", response)
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    console.error("Error fetching course:", axiosError.response?.data || axiosError.message);
    throw new Error(axiosError.response?.data?.message || "Failed to fetch course");
  }
}


export async function deleteCourse(courseId: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await tutorAPI.delete(`/delete/${courseId}`);
    return { success: true, message: 'Course deleted successfully' };
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    console.error('Error deleting course:', axiosError.response?.data || axiosError.message);
    throw new Error(axiosError.response?.data?.message || 'Failed to delete course');
  }
}



//----Lesson----//

export async function addLesson(
  lessonData: ILesson
): Promise<{ success: boolean; message: string; lesson?: ILesson }> {
  try {
    const { courseId, title, description, videoUrl, introVideoUrl } = lessonData;

   
    if (!courseId || !title || !description || !videoUrl) {
      throw new Error("All lesson fields (courseId, title, description, videoUrl) are required");
    }

    const payload: ILesson = {
      courseId,
      title,
      description,
      videoUrl,
    };

    
    if (introVideoUrl) {
      payload.introVideoUrl = introVideoUrl;
    }

    const response = await tutorAPI.post(
      `/addLesson/${courseId}`,
      payload,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    console.log("Lesson added successfully:", response.data);
    return {
      success: true,
      message: response.data.message || "Lesson added successfully",
      lesson: response.data?.lesson || lessonData,
    };
  } catch (error) {
    const axiosError = error as AxiosError<{ error?: string }>;
    console.error("Error adding lesson:", axiosError.response?.data || axiosError.message);
    throw new Error(axiosError.response?.data?.error || "Failed to add lesson");
  }
}


export async function listLessons(
  courseId: string,
  currentPage: number,
  limit: number
): Promise<{ success: boolean; message: string; lessons: ILesson[]; total: number }> {
  try {
    const response = await tutorAPI.get(`/listLessons/${courseId}`, {
      params: { page: currentPage, limit }, 
      headers: { "Content-Type": "application/json" },
    });
    return {
      success: true,
      message: "Lessons retrieved successfully",
      lessons: response.data.lessons || [],
      total: response.data.total || 0,
    };
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    console.error("Error listing lessons:", axiosError.response?.data || axiosError.message);
    throw new Error(axiosError.response?.data?.message || "Failed to list lessons");
  }
}


export async function getLesson(lessonId: string): Promise<ILesson> {
  try {
    const response = await tutorAPI.get(`/lesson/${lessonId}`);
    console.log("Lesson response:", response.data); 
    return response.data.lesson; 
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    console.error("Error fetching lesson:", axiosError.response?.data || axiosError.message);
    throw new Error(axiosError.response?.data?.message || "Failed to fetch lesson");
  }
}


export async function editLesson(
  lessonId: string,
  lessonData: Partial<ILesson>
): Promise<{ success: boolean; message: string; lesson?: ILesson }> {
  try {
    const { courseId, ...lessonDetails } = lessonData;

    const response = await tutorAPI.put(`/editLesson/${lessonId}`, lessonDetails, {
      headers: { "Content-Type": "application/json" },
    });

    console.log("Lesson edited successfully:", response.data);
    return {
      success: true,
      message: response.data.message || "Lesson updated successfully",
      lesson: response.data?.lesson || lessonData,
    };
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    console.error("Error editing lesson:", axiosError.response?.data || axiosError.message);
    throw new Error(axiosError.response?.data?.message || "Failed to edit lesson");
  }
}

// Delete Lesson
export async function deleteLesson(
  lessonId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await tutorAPI.delete(`/deleteLesson/${lessonId}`, {
      headers: { "Content-Type": "application/json" },
    });

    console.log("Lesson deleted successfully:", response.data);
    return {
      success: true,
      message: response.data.message || "Lesson deleted successfully",
    };
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    console.error("Error deleting lesson:", axiosError.response?.data || axiosError.message);
    throw new Error(axiosError.response?.data?.message || "Failed to delete lesson");
  }
}


//Enrolled Students

interface EnrolledStudent {
  student: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  course: {
    _id: string;
    courseTitle: string;
  };
}

export async function getEnrolledStudents(tutorId: string, token: string): Promise<{
  success: boolean;
  message: string;
  enrolledStudents: EnrolledStudent[];
  total: number;
}> {
  try {
    const response = await tutorAPI.get(`/${tutorId}/enrolled-students`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return {
      success: true,
      message: 'Enrolled students retrieved successfully',
      enrolledStudents: response.data.enrolledStudents || [],
      total: response.data.total || response.data.enrolledStudents?.length || 0,
    };
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    console.error('Error fetching enrolled students:', axiosError.response?.data || axiosError.message);
    const errorMessage = axiosError.response?.data?.message || 'Failed to fetch enrolled students';
    if (axiosError.response?.status === 401 && errorMessage.includes('blocked')) {
      throw new Error('tutor is blocked');
    }
    throw new Error(errorMessage);
  }
}