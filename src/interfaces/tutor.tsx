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
  }


export  interface ILesson {
    _id?: string;
    title: string;
    description: string;
    videoUrl?: string;
    courseId: string;
    introVideoUrl?: string
  }