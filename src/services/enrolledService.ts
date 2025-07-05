// import { AxiosError } from "axios";
// import tutorAPI from "../api/tutorInstance";
// import API from "../api/axiosInstance";
// import { ICourse, IReview, ITutorStats } from "../interfaces/enrolled";

// export async function listCourses(page: number=1, limit: number=5, search: string=""): Promise<{ success: boolean; message: string; courses: ICourse[]; total: number }> {
//   try {
//     const response = await tutorAPI.get('/listCourse', {
//       params: { page, limit, search},
      
//     });
//     return { 
//       success: true, 
//       message: 'Courses retrieved successfully', 
//       courses: response.data.courses,
//       total: response.data.total 
//     };
//   } catch (error) {
//     const axiosError = error as AxiosError<{ message?: string }>;
//     console.error('Error listing courses:', axiosError.response?.data || axiosError.message);
//     throw new Error(axiosError.response?.data?.message || 'Failed to list courses');
//   }
// }


// export const getCourseById = async (courseId: string) => {
//   try {
//     const response = await API.get(`/courseDetail/${courseId}`);
//     console.log("API Response for single course:", response.data);
//     return response.data as {
//       success: boolean;
//       course: ICourse;
//     };
//   } catch (error) {
//     console.error("Error fetching course by ID:", error);
//     throw error;
//   }
// };

// export async function listReviews(courseId: string): Promise<{ success: boolean; message: string; reviews: IReview[] }> {
//   try {
//     const response = await API.get(`/listReviews/${courseId}`, {
//       headers: { "Content-Type": "application/json" },
//     });
//     return {
//       success: true,
//       message: "Reviews retrieved successfully",
//       reviews: response.data.data || [], 
//     };
//   } catch (error) {
//     const axiosError = error as AxiosError<{ message?: string }>;
//     console.error("Error listing reviews:", axiosError.response?.data || axiosError.message);
//     throw new Error(axiosError.response?.data?.message || "Failed to list reviews");
//   }
// }



// export const getTutorStats = async (): Promise<ITutorStats> => {
//   try {
//     const response = await tutorAPI.get('/tutor/stats');
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching tutor stats:', error);
//     throw error;
//   }
// };