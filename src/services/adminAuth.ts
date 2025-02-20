import { AxiosError } from "axios";
import adminAPI from "../api/adminInstance";
import Admin from "../interfaces/admin";

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

export const getUsers = async () => {
  try {
    const response = await adminAPI.get(`/getUsers`);
    console.log("API Response:", response.data); 
    if (!Array.isArray(response.data)) {
      throw new Error("Invalid response structure: Expected an array");
    }
    return response.data;
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

export const getTutor = async () => {
  try {
    const response = await adminAPI.get(`/getTutor`);
    console.log("API Response:", response.data); 
    if (!Array.isArray(response.data)) {
      throw new Error("Invalid response structure: Expected an array");
    }
    return response.data;
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


export const getTutorsApproveOrReject = async () => {
  try {
    const response = await adminAPI.get(`/getTutorManage`);
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




export async function listCategories(): Promise<{ success: boolean; data?: any[]; message?: string }> {
  try {
    const response = await adminAPI.get("/listCategory"); 

    console.log("Categories fetched successfully:", response.data);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("Error fetching categories:", error.response?.data || error.message);
    return { success: false, message: error.response?.data?.message || "Failed to fetch categories" };
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
    const response = await fetch(`/api/categories/${categoryId}`);
    return await response.json();
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

