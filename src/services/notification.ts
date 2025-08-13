// import { AxiosError } from "axios";
// import API from "../api/axiosInstance";
// import tutorAPI from "../api/tutorInstance";
// import { NotificationResponse, INotification } from "../interfaces/notification";

// export const getUserNotifications = async (
//   userId: string
// ): Promise<NotificationResponse<INotification[]>> => {
//   try {
//     const response = await API.get("/notifications", {
//       headers: { "Content-Type": "application/json" },
//       params: { userId, isTutor: false },
//     });
//     return {
//       success: true,
//       message: "User notifications retrieved successfully",
//       data: response.data,
//     };
//   } catch (error) {
//     const axiosError = error as AxiosError<{ message?: string }>;
//     console.error("Error fetching user notifications:", axiosError.response?.data || axiosError.message);
//     return {
//       success: false,
//       message: axiosError.response?.data?.message || "Failed to fetch user notifications",
//     };
//   }
// };

// export const markUserNotificationAsRead = async (
//   notificationId: string
// ): Promise<NotificationResponse<INotification>> => {
//   try {
//     const response = await API.put(`/notifications/${notificationId}/read`, {}, {
//       headers: { "Content-Type": "application/json" },
//     });
//     return {
//       success: true,
//       message: "User notification marked as read successfully",
//       data: response.data,
//     };
//   } catch (error) {
//     const axiosError = error as AxiosError<{ message?: string }>;
//     console.error("Error marking user notification as read:", axiosError.response?.data || axiosError.message);
//     return {
//       success: false,
//       message: axiosError.response?.data?.message || "Failed to mark user notification as read",
//     };
//   }
// };

// export const getTutorNotifications = async (
//   tutorId: string
// ): Promise<NotificationResponse<INotification[]>> => {
//   try {
//     const response = await tutorAPI.get("/notifications", {
//       headers: { "Content-Type": "application/json" },
//       params: { userId: tutorId, isTutor: true },
//     });
//     return {
//       success: true,
//       message: "Tutor notifications retrieved successfully",
//       data: response.data,
//     };
//   } catch (error) {
//     const axiosError = error as AxiosError<{ message?: string }>;
//     console.error("Error fetching tutor notifications:", axiosError.response?.data || axiosError.message);
//     return {
//       success: false,
//       message: axiosError.response?.data?.message || "Failed to fetch tutor notifications",
//     };
//   }
// };

// export const markTutorNotificationAsRead = async (
//   notificationId: string
// ): Promise<NotificationResponse<INotification>> => {
//   try {
//     const response = await tutorAPI.put(`/notifications/${notificationId}/read`, {}, {
//       headers: { "Content-Type": "application/json" },
//     });
//     return {
//       success: true,
//       message: "Tutor notification marked as read successfully",
//       data: response.data,
//     };
//   } catch (error) {
//     const axiosError = error as AxiosError<{ message?: string }>;
//     console.error("Error marking tutor notification as read:", axiosError.response?.data || axiosError.message);
//     return {
//       success: false,
//       message: axiosError.response?.data?.message || "Failed to mark tutor notification as read",
//     };
//   }
// };