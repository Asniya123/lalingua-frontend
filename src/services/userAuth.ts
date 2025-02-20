import { AxiosError } from 'axios';
import Cookies from 'js-cookie';
import Student from "../interfaces/user";
import API from "../api/axiosInstance";

const COOKIE_EXPIRY_DAYS = 7; 

// Register user
export const signupUser = async (formData: Student) => {
  try {
    const response = await API.post('/register', formData);
    
    if (response.data) {
      Cookies.set('user', JSON.stringify(response.data), { expires: COOKIE_EXPIRY_DAYS }); 
    }

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.message || 'Signup failed');
    }
    throw new Error('Error during signup request');
  }
};

// Verify OTP
export const verifyOtp = async (email: string, otp: string) => {
  try {
    const response = await API.post('/verify-otp', { email, otp });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.message || 'OTP verification failed');
    }
    throw new Error('Error during OTP verification');
  }
};

// Resend OTP
export const resendOtp = async (email: string) => {
  try {
    const response = await API.post('/resend-otp', { email });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.message || 'Failed to resend OTP');
    }
    throw new Error('Error during OTP resend');
  }
};

// Login user
export const loginUser = async (email: string, password: string) => {
  try {
    const response = await API.post("/login", { email, password });

    // Check if the user is blocked
    if (response.data.blocked) {
      throw new Error("Your account has been blocked by the admin.");
    }

    if (response.data) {
      Cookies.set("user", JSON.stringify(response.data), { expires: COOKIE_EXPIRY_DAYS });
    }

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.message || "Login failed");
    }
    throw new Error("Error during login request");
  }
};

// Forgot Password
export const forgotPassword = async (data: { email: string }) => {
  try {
    const response = await API.post('/forgot-password', data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.message || 'Failed to initiate password reset');
    }
    throw new Error('Error during forgot password request');
  }
};

// Reset Password
export const resetPassword = async (data: { email: string; newPassword: string }) => {
  try {
    const response = await API.post('/reset-password', data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.message || 'Failed to reset password');
    }
    throw new Error('Error during reset password request');
  }
};


export const loginWithGoogle = async (token: string) => {
  try {
    const response = await API.post('/google', { token });

    if (response.data) {
      Cookies.set('user', JSON.stringify(response.data), { expires: COOKIE_EXPIRY_DAYS }); 
    }

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.message || 'Google login failed');
    }
    throw new Error('Error during Google login request');
  }
};

// Get Profile
export const getProfile = async (token: string) => {
  try {
    const response = await API.get(`/getProfile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};


// Update Profile
export const updateProfile = async (token: string, profileData: Partial<Student>) => {
  try {
    const response = await API.put('/editProfile', profileData);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.message || 'Failed to update profile');
    }
    throw new Error('Error updating profile');
  }
};
