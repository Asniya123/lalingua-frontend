import { AxiosError } from "axios";
import adminAPI from "../api/adminInstance";
import Admin, { GetTutorResponse, GetUsersResponse, IEnrollmentStats, IEnrollmentStatsResponse, ILanguage, Wallet } from "../interfaces/admin";
import { ICourse } from "../interfaces/user";
import { IEnrolledStudent, IEnrolledStudentsResponse } from "../interfaces/tutor";

export async function adminLogin(email: string, password: string): Promise<{
    adminId: string | null;
    accessToken: string | null;
    refreshToken: string | null;
  }> {
    try {
        console.log("Sending request with:", { email, password });
        const response = await adminAPI.post("/login", { email, password });
        console.log("Login successful:", response.data);
        return {
            adminId: response.data.adminId || null,
            accessToken: response.data.accessToken || null,
            refreshToken: response.data.refreshToken || null,
          };
        } catch (error: any) {
          console.error("Login error:", error.response?.data || error.message);
          throw new Error(error.response?.data?.message || "Login failed. Please try again.");
        }
};

// Updated service function
export const getUsers = async (page: number, limit: number, search: string): Promise<GetUsersResponse> => {
  try {
    const response = await adminAPI.get(`/getUsers`, {
      params: { page, limit, search },
    });
    console.log("API Response:", response.data);

    if (!response.data.success || !Array.isArray(response.data.data.users)) {
      throw new Error("Invalid response structure: Expected an array of users");
    }

    return {
      users: response.data.data.users,
      total: response.data.data.pagination.totalItems,
      totalStudents: response.data.data.totalStudents || 0, 
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};





export const blockUnblock = async (userId: string, isBlocked: boolean) => {
  try {
    const response = await adminAPI.patch(`/block-unblock/${userId}`, { isBlocked });
    return response.data;
  } catch (error) {
    console.error("Error updating user status:", error);
    throw error;
  }
};

export const getTutor = async (
  page: number = 1,
  limit: number = 5,
  status: string = 'approved',
  search: string = ""
): Promise<GetTutorResponse> => {
  try {
    const response = await adminAPI.get(`/getTutor`, {
      params: { page, limit, status, search },
    });
    
    if (!response.data.success || !Array.isArray(response.data.data.tutors)) {
      throw new Error("Invalid response structure: Expected an array of tutors");
    }

    return {
      tutors: response.data.data.tutors,
      total: response.data.data.pagination.totalItems,
      totalApprovedTutors: response.data.data.totalApprovedTutors || 0
    };
  } catch (error) {
    console.error("Error fetching tutors:", error);
    throw error;
  }
};



export const managingTutor = async (tutorId: string, isBlocked: boolean) => {
  try {
    const response = await adminAPI.patch(`/tutor-manage/${tutorId}`, { isBlocked });
    return response.data;
  } catch (error) {
    console.error("Error updating user status:", error);
    throw error;
  }
};


export const getTutorsApproveOrReject = async (search: string = "") => {
  try {
    const response = await adminAPI.get(`/getTutorManage`, {
      params: { search },
    });
    
    console.log("API Response:", response.data);

    if (!response.data || !response.data.success) {
      throw new Error("API request failed");
    }
    

    if (!Array.isArray(response.data.tutors)) {
      throw new Error("Invalid response structure: Expected tutors array");
    }
    
    return response.data.tutors;
  }catch (error: unknown) {
  if (error && typeof error === "object" && "response" in error) {
    const err = error as { response: { data?: { message?: string } } };
    const message = err.response.data?.message || "Server error occurred";
    throw new Error(message);
  } else if (error && typeof error === "object" && "request" in error) {
    throw new Error("No response from server. Please check your connection.");
  } else if (error instanceof Error) {
    throw new Error(error.message || "An unexpected error occurred");
  } else {
    throw new Error("An unexpected error occurred");
  }
}
}



export const updateTutorStatus = async (tutorId: string, status: 'approved' | 'rejected', reason?: string) => {
  try {
    const response = await adminAPI.post(`/manageTutor/${tutorId}`, {  
      status,
      ...(status === "rejected" ? { reason } : {})  
    });
    
    
    console.log("Updating tutor status:", { tutorId, status, reason });

    return response.data; 
  } catch (error) {
    console.error('Error updating tutor status:', error);
    throw error;
  }
};


//Category

export async function addCategory(
  name: string,
  description: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await adminAPI.post('/categories', { name, description });

    console.log('Category added successfully:', response.data);
    return { success: true, message: 'Category added successfully' };
  } catch (error: any) {
    console.error('Error adding category:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to add category');
  }
}


export async function listCategories(
  page: number = 1,
  limit: number = 5,
  search: string = ""
): Promise<{ success: boolean; data?: { categories: any[]; total: number }; message?: string }> {
  try {
    const response = await adminAPI.get("/listCategory", {
      params: { page, limit, search },
    });

    console.log("Categories fetched successfully:", response.data);
    return {
      success: true,
      data: {
        categories: response.data.data.categories,
        total: response.data.data.pagination.totalItems,
      },
    };
  } catch (error: any) {
    console.error("Error fetching categories:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch categories",
    };
  }
}



export async function editCategory(
  categoryId: string,
  name: string,
  description: string,
  
): Promise<{ success: boolean; message: string }>{
  try {
    const response = await adminAPI.put(
      `/editCategory/${categoryId}`,
      { name, description },
     
    );
    
    console.log('Category updated successfully:', response.data)
    return { success: true, message: "Category updated successfully"}
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error updating category:", error.message);
      throw new Error(error.message || "Failed to update category");
    } else {
      console.error("Unknown error:", error);
      throw new Error("An unexpected error occurred.");
    }
  }
  
}

export const getCategoryById = async (categoryId: string) => {
  try {
    const response = await adminAPI(`/categories/${categoryId}`);
    return response.data; 
  } catch (error) {
    console.error("Error fetching category:", error);
    return { success: false, message: "Failed to fetch category" };
  }
};




export async function deleteCategory(categoryId: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await adminAPI.delete(`/delete/${categoryId}`); 

    console.log("Category deleted successfully:", response.data);
    return { success: true, message: response.data.message || "Category deleted successfully" };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error deleting category:", error.message);
      return { success: false, message: error.message || "Failed to delete category" };
    } else {
      console.error("Unknown error:", error);
      return { success: false, message: "An unexpected error occurred." };
    }
  }
}



// Language

export async function addLanguage(
  name: string,
  imageUrl: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await adminAPI.post('/addLanguage', { name, imageUrl });

    console.log('Language added successfully:', response.data);
    return { success: true, message: 'Language added successfully' };
  } catch (error: any) {
    console.error('Error adding Language:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to add Language');
  }
}



export async function listLanguage(page: number = 1, limit: number = 5, search: string = ""): Promise<{
  success: boolean;
  data?: { languages: ILanguage[]; pagination: { totalItems: number } };
  total: number;
  message?: string;
}> {
  try {
    const response = await adminAPI.get("/listLanguage", { params: { page, limit, search } });
    console.log("Raw API Response:", response);
    return {
      success: true,
      data: response.data.data,
      total: response.data.total, 
    };
  } catch (error: any) {
    console.error("Error fetching language:", error);
    return {
      success: false,
      total: 0,
      message: error.response?.data?.message || "Failed to fetch language",
    };
  }
}


export async function editLanguage(
  languageId: string,
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await adminAPI.put(`/editLanguage/${languageId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("Language updated successfully:", response.data);
    return { success: true, message: "Language updated successfully" };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error updating language:", error.message);
      throw new Error(error.message || "Failed to update language");
    } else {
      console.error("Unknown error:", error);
      throw new Error("An unexpected error occurred.");
    }
  }
}

export const getLanguageById = async (languageId: string) => {
  try {
    const response = await adminAPI(`/languages/${languageId}`);
    return response.data; 
  } catch (error) {
    console.error("Error fetching language:", error);
    return { success: false, message: "Failed to fetch language" };
  }
};


export async function deleteLanguage(
  languageId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await adminAPI.delete(`/deleteLanguage/${languageId}`);
    console.log("Language deleted successfully:", response.data);
    return { success: true, message: "Language deleted successfully" };
  } catch (error: any) {
    console.error("Error deleting language:", error.response?.data || error.message);
    return { success: false, message: error.response?.data?.message || "Failed to delete language" };
  }
}


//Course

export async function getCourses(
  currentPage: number,
  limit: number,
  search: string = ""
): Promise<{ success: boolean; message: string; courses: ICourse[]; total: number }> {
  try {
    const response = await adminAPI.get('/getCourses', {
      params: { page: currentPage, limit, search },
    });
    console.log('getCourses - API Response:', JSON.stringify(response.data, null, 2));

    // Handle different possible response structures
    const courses = response.data.data?.courses || response.data.courses || [];
    const total = 
      response.data.data?.pagination?.totalItems || 
      response.data.data?.pagination?.totalItem || 
      response.data.total || 
      response.data.pagination?.total || 
      0;

    console.log(`getCourses - Extracted courses: ${courses.length}, total: ${total}`);

    return {
      success: true,
      message: 'Courses retrieved successfully',
      courses: courses,
      total: total,
    };
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    console.error("Error listing courses:", JSON.stringify(axiosError.response?.data || axiosError.message, null, 2));
    throw new Error(axiosError.response?.data?.message || "Failed to list courses");
  }
}

//BlockUnblock course

export async function CourseBlockUnblock(
  courseId: string,
  isBlock: boolean
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await adminAPI.patch(`/courseBlockUnblock/${courseId}`, {
      isBlocked: isBlock,
    });
    return {
      success: true,
      message: response.data.message || (isBlock ? "Course blocked successfully" : "Course unblocked successfully"),
    };
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    console.error("Error updating course status:", axiosError.response?.data || axiosError.message);
    throw new Error(axiosError.response?.data?.message || "Failed to update course status");
  }
}


//Wallet

export async function getAdminWallet(adminId: string): Promise<{
  success: boolean;
  message: string;
  wallet?: Wallet;
}> {
  try {
    const response = await adminAPI.get(`/wallet/${adminId}`, {
    
    headers: {
      "Content-Type": "application/json",
    },
  });
  console.log("Wallet fetched successfully:", response.data);
    return {
      success: true,
      message: response.data.message || "Wallet retrieved successfully",
      wallet: response.data.wallet, // Ensure the API returns { balance, transactions }
    };
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    console.error("Error fetching admin wallet:", axiosError.response?.data || axiosError.message);
    return {
      success: false,
      message: axiosError.response?.data?.message || "Failed to fetch wallet",
    };
  }
}


//Dashboard

export const getDashboardStats = async (): Promise<{
  totalStudents: number;
  totalTutors: number;
  totalCourses: number;
  totalRevenue: number;
}> => {
  try {
    console.log("Fetching dashboard stats...");

    const [usersData, approvedTutorsData, pendingTutorsData, rejectedTutorsData, coursesData, revenueData] = await Promise.all([
      getUsers(1, 1, ""),
      getTutor(1, 1, 'approved', ""),
      getTutor(1, 1, 'pending', ""),
      getTutor(1, 1, 'rejected', ""),
      getCourses(1, 1, ""),
      adminAPI.get('/revenue'),
    ]);

    console.log("getDashboardStats - Courses Data:", JSON.stringify(coursesData, null, 2));
    console.log("getDashboardStats - Revenue Data:", JSON.stringify(revenueData.data, null, 2));

    const totalTutors = 
      (approvedTutorsData.totalApprovedTutors || 0) +
      (pendingTutorsData.totalApprovedTutors || 0) +
      (rejectedTutorsData.totalApprovedTutors || 0);

    const stats = {
      totalStudents: usersData.totalStudents || 0,
      totalTutors: totalTutors,
      totalCourses: coursesData.total || 0, // Ensure total is used directly
      totalRevenue: revenueData.data.totalRevenue || 0,
    };

    console.log("getDashboardStats - Final Stats:", JSON.stringify(stats, null, 2));

    return stats;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};


export async function getCourseEnrolledStudents(courseId: string): Promise<IEnrolledStudentsResponse> {
  try {
    if (!courseId) {
      throw new Error('Course ID is required');
    }
    console.log('Admin service: Fetching enrolled students for course:', courseId);

    const response = await adminAPI.get('/enrolledStudents', {
      params: { courseId },
    });

    console.log('Admin service: Full API response:', JSON.stringify(response.data, null, 2));

    if (!response.data || !Array.isArray(response.data.students)) {
      console.error('Admin service: Invalid or empty students data:', response.data);
      return {
        success: false,
        message: 'No students data received',
        students: [],
      };
    }

    // Fetch course details to get regularPrice
    const courseResponse = await adminAPI.get(`/getCourses`, {
      params: { courseId, page: 1, limit: 1 },
    });
    const course = courseResponse.data.data.courses.find((c: ICourse) => c._id === courseId);
    const regularPrice = course?.regularPrice || 0;
    console.log('Admin service: Course regularPrice:', regularPrice);

    const formattedStudents: IEnrolledStudent[] = response.data.students.map((student: any, index: number) => {
      console.log(`Admin service: Formatting student ${index + 1}:`, JSON.stringify(student, null, 2));
      return {
        id: student.id || student._id?.toString() || `student-${index}`,
        name: student.name || 'Unknown Student',
        courseId: student.courseId?.toString() || courseId,
        enrolledDate: student.enrolledDate || new Date().toISOString(),
        progress: typeof student.progress === 'number' ? student.progress : 0,
        totalRevenue: regularPrice * 0.3, 
        review: student.review
          ? {
              _id: student.review._id || `review-${index}`,
              courseId: student.review.courseId || courseId,
              userId: student.review.userId || student.id,
              rating: Number(student.review.rating) || 0,
              comment: student.review.comment || '',
              createdAt: student.review.createdAt || new Date().toISOString(),
              updatedAt: student.review.updatedAt,
            }
          : undefined,
      };
    });

    console.log(`Admin service: Formatted ${formattedStudents.length} students:`, JSON.stringify(formattedStudents, null, 2));

    return {
      success: true,
      message: `Enrolled students retrieved successfully - ${formattedStudents.length} students found`,
      students: formattedStudents,
    };
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    console.error('Admin service: Detailed error:', {
      message: axiosError.message,
      status: axiosError.response?.status,
      data: axiosError.response?.data,
    });
    return {
      success: false,
      message: axiosError.response?.data?.message || 'Failed to fetch enrolled students',
      students: [],
    };
  }
};


export async function getEnrollmentStats(): Promise<IEnrollmentStatsResponse> {
  try {
    console.log('Enrollment service: Fetching enrollment statistics');
    const response = await adminAPI.get('/stats');
    console.log('Enrollment service: Raw response status:', response.status);
    console.log('Enrollment service: Raw response data:', response.data);

    if (!response.data || typeof response.data !== 'object' || !response.data.success || !response.data.data) {
      console.error('Enrollment service: Invalid or empty stats data:', response.data);
      throw new Error('No enrollment stats data received');
    }

    const { daily, monthly, yearly } = response.data.data;

    const formattedStats: IEnrollmentStats = {
      daily: daily.map((item: { day: string; count: number }, index: number) => ({
        day: item.day,
        count: item.count || 0,
      })),
      monthly: monthly.map((item: { month: string; count: number }, index: number) => ({
        month: item.month,
        count: item.count || 0,
      })),
      yearly: yearly.map((item: { year: number; count: number }, index: number) => ({
        year: item.year,
        count: item.count || 0,
      })),
    };

    console.log('Enrollment service: Formatted enrollment stats:', JSON.stringify(formattedStats, null, 2));

    return {
      success: true,
      message: 'Enrollment stats retrieved successfully',
      data: formattedStats,
    };
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    console.error('Enrollment service: Detailed error:', {
      message: axiosError.message,
      status: axiosError.response?.status,
      data: axiosError.response?.data,
    });
    return {
      success: false,
      message: axiosError.response?.data?.message || 'Failed to fetch enrollment stats',
      data: { daily: [], monthly: [], yearly: [] },
    };
  }
}