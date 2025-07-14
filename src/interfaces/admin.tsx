import Tutor, { ICourse } from "./tutor";
import Student from "./user";

export default interface Admin {
  _id?: string;
  name?: string;
  email?: string;
  password?: string;
  adminId: string | null;
  accessToken: string | null;
  refreshToken: string | null;
}

export interface Icategory {
  _id:string,
  name: string,
  description: string,
  imageUrl: string
}

export interface ILanguage{
  _id: string,
  name: string,
  imageUrl: string
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



export interface DashboardStats {
  totalStudents: number;
  totalTutors: number;
  totalCourses: number;
  totalRevenue: number;
}


export interface CombinedUser {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  profilePicture?: string;
  avatar?: string;
  role: 'Student' | 'Tutor';
  status: string;
  joinDate: string;
  createdAt?: string;
  isVerified?: boolean;
}


export interface GetUsersResponse {
  users: Student[];
  total: number;
  totalStudents: number;
}

export interface GetTutorResponse {
  tutors: Tutor[]
  total: number
  totalApprovedTutors: number
}

export interface GetCourseResponse{
  courses: ICourse[]
  total: number
  totalCourses: number
}


export interface IEnrollmentStats {
  daily: { day: string; count: number }[];
  monthly: { month: string; count: number }[];
  yearly: { year: number; count: number }[];
}

export interface IEnrollmentStatsResponse {
  success: boolean;
  message: string;
  data: IEnrollmentStats;
}

export interface ChartSection {
  labels: string[];
  counts: number[];
}

export interface ChartData {
  daily: ChartSection;
  monthly: ChartSection;
  yearly: ChartSection;
}