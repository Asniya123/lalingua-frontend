


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
}


export interface Login {
    email: string;
    password: string;
}


export interface ICourse {
  isBlock: boolean;
  _id?: string;
  courseTitle?: string;
  description?: string;
  imageUrl?: string;
  regularPrice?: number;
  category: string | { _id: string; name: string; description?: string; __v?: number };
  language: string | { _id: string; name: string };
  status?: "active" | "blocked";
  createdAt?: Date;
  updatedAt?: Date;
  studentsEnrolled: number;
  totalRevenue?: number; 
  averageRating: number;
  totalReviews: number;
  students: IEnrolledStudent[];
  studentsWithReviews?: number;
  reviews: IDashboardReview[];
  tutorRevenue?: number;
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