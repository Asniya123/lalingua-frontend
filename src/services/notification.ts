import API from "../api/axiosInstance"
import tutorAPI from "../api/tutorInstance"
import INotification from "../interfaces/notification"


//Notification User
export async function getUserNotification(userId: string): Promise<INotification[] | null>{
  try {
    const response = await API.get(`/notifications/${userId}`)
    return response.data
  } catch (error) {
    throw error
  }
}


export async function markUserNotificationRead(notificationId: string): Promise<INotification | null >{
  try {
    if(!notificationId){
      throw new Error('Notification ID is required')
    }

    const response = await API.patch(`notifications/${notificationId}/read`)
    return response.data
  } catch (error) {
    throw error
  }
}


//Notification Tutor
export async function getTutorNotification(tutorId: string): Promise<INotification[] | null>{
  try {
    const response = await tutorAPI.get(`/notifications/${tutorId}`)
    return response.data
  } catch (error) {
    throw error
  }
}


export async function markTutorNotificationRead(notificationId: string): Promise<INotification | null >{
  try {
    if(!notificationId){
      throw new Error('Notification ID is required')
    }

    const response = await tutorAPI.patch(`notifications/${notificationId}/read`)
    return response.data
  } catch (error) {
    throw error
  }
}