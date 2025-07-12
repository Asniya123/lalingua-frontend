import { ILessonPreview } from "./user";



export default interface Tutor{
    _id?: string;
    name?: string;
    email?: string;
    mobile?: string;
    password?: string;
    confirmPassword?: string;
    documents?: string;
    qualification?: string;
    experience?: string;
    specialization?: string;
    dateOfBirth?: string;
    is_verified?: boolean;
    profilePicture?: string;
    status?: 'pending' | 'approved' | 'rejected' |  'blocked'
    createdAt: string;
}


export interface Login {
    email: string;
    password: string;
}


export interface ICourse {
  _id: string;
  courseTitle: string;
  imageUrl: string;
  category: string | { _id: string; name: string };
  language?: string | { _id: string; name: string };
  tutorId: string | { _id: string; name: string };
  description: string;
  regularPrice: number;
  buyCount?: number;
  isBlock?: boolean;
  lessons?: ILessonPreview[];
  createdAt?: Date;
  updatedAt?: Date;
  tutor?: { _id: string; name: string };
  reviews?: IReview[];
  studentsEnrolled?: number;
  totalRevenue?: number;
  averageRating?: number;
  totalReviews?: number;
  status?: "active" | "blocked" | "published";
  totalStudents?: number;
}

export  interface ILesson {
    _id?: string;
    title: string;
    description: string;
    videoUrl?: string;
    courseId: string;
    introVideoUrl?: string;
    syllabus?: { title: string; description?: string };
  }




export interface Transaction {
  enrolledId: string;
  date: Date;
  amount: number;
  transactionType: "credit" | "debit";
  reason?: string;
}

export interface Wallet {
  balance: number;
  transactions: Transaction[];
}



export interface IEnrolledStudentsResponse {
  success: boolean;
  message: string;
  students: IEnrolledStudent[];
}




export interface IEnrolledStudent {
  id: string;
  name: string;
  courseId: string;
  enrolledDate: string;
  progress: number;
  review?: IReview
  totalRevenue?: number;
  showReview?: boolean;
}

export interface IDashboardReview extends IReview {
  studentName?: string;
}

export interface IReview{
  _id?: string;
  userId?: string;
  rating: number;
  comment?: string;
  createdAt?: string;
}