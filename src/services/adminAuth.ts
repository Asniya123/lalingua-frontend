import { AxiosError } from "axios";
import adminAPI from "../api/adminInstance";
import Admin, { ILanguage, Wallet } from "../interfaces/admin";
import { ICourse } from "../interfaces/user";

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

export const getUsers = async (
  page: number = 1,
  limit: number = 5,
  search: string = ""
): Promise<{ users: any[]; total: number }> => {
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
): Promise<{ tutors: any[]; total: number }> => {
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
    const response = await adminAPI.get(`/getTutorManage`, {params: {search},
    });
    console.log("API Response:", response.data); 
    if (!Array.isArray(response.data.tutors)) { 
      throw new Error("Invalid response structure: Expected an array");
    }
    return response.data.tutors;  
  } catch (error) {
    console.error("Error fetching tutors:", error);
    throw error;
  }
};


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
    return {
      success: true,
      message: 'Courses retrieved successfully',
      courses: response.data.data.courses || [],
      total: response.data.data.pagination.totalItem || 0
    };
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    console.error("Error listing courses:", axiosError.response?.data || axiosError.message);
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
