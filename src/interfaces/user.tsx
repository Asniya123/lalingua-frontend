export default interface Student {
    _id?: string;
    name?: string;
    email?: string;
    mobile?: string;
    password?: string;
    confirmPassword?: string;
    is_verified?: boolean;
    language?: string;
    profileImage?: string | File | null
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
