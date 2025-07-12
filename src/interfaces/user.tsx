import { Icategory } from "./admin";
import Tutor from "./tutor";


export default interface Student {
    id: any;
    success: any;
    _id?: string;
    name: string;
    email?: string;
    mobile?: string;
    password?: string;
    confirmPassword?: string;
    is_verified?: boolean;
    language?: string;
    profilePicture?: string | File | null
    createdAt?: string;
  }



export interface Login {
    email: string;
    password: string;
}

export interface ForgotPassword {
  email: string;
}

export interface ResetPassword {
  email: string;
  otp?: string;
  newPassword: string;
  confirmPassword: string;
}


export interface ILessonPreview {
  _id: string;
  title: string;
  description: string;
  introVideoUrl?: string;
  videoUrl?: string;
  syllabus?: { title: string; description?: string };
}

export interface ICourse {
  _id: string; 
  courseTitle: string;
  imageUrl: string;
  description: string;
  regularPrice: number;
  category: string | { _id: string; name?: string }; 
  buyCount?: number;
  learningObjectives: string[];
  language?: string | { _id: string; name?: string }; 
  isBlock?: boolean;
  lessons?: ILessonPreview[];
  enrolledStudents?: string[];
  tutor?: Tutor | undefined;
  averageRating?: string; 
  ratingCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}



export interface ILesson {
  _id?: string;
  title: string;
  description: string;
  introVideoUrl: string;
  videoUrl: string;
  syllabus?: { title: string; description?: string };
}
export interface OrderRequest {
  paymentMethod:  "onlinePayment";
  retryTotal?: number;
  amount?: number;
  paymentStatus?: "success" | "failed";
}

export interface RazorpayOrderResponse {
  success: boolean;
  order?: {
    id: string;
    amount: number;
    currency: string;
  };
  error?: string;
}

export interface OrderResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface IEnrolledCourse extends ICourse {
  pricePaid: number;
  enrolledDate?: string;
  status: "Active" | "Cancelled" | "Expired" | "completed";
  isCompleted?: boolean;
  totalLessons: number;
  completedLessons: number;
  review?: IReview;
}


export interface IReview{
  _id?: string;
  userId?: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

