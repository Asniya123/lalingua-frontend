import axios, { Axios, AxiosError } from "axios";
import Tutor from "../interfaces/tutor";
import tutorAPI from "../api/tutorInstance";
import Cookies from "js-cookie";
import API from "../api/axiosInstance";

const COOKIE_EXPIRY_DAYS = 7; 

export const signupTutor = async (formData: Tutor) => {
  try {
    const response = await tutorAPI.post('/register', formData);
    console.log(response, 'erfwjrhduiq');
    if (response.data) {
          Cookies.set('tutor', JSON.stringify(response.data), { expires: COOKIE_EXPIRY_DAYS }); 
        }
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.message || 'Signup failed');
    } else if (error instanceof AxiosError && error.request) {
      throw new Error('No response from server');
    } else {
      throw new Error('Error setting up request');
    }
  }
};

export const verifyOtp = async (email: string, otp: string) => {
  try {
    const response = await tutorAPI.post('/verify-otp', { email, otp });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.message || 'OTP verification failed');
    }
    throw new Error('Error during OTP verification');
  }
};


export const resendOtp = async (email: string) => {
  try {
    const response = await tutorAPI.post('/resend-otp', { email });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.message || 'Failed to resend OTP');
    }
    throw new Error('Error during OTP resend');
  }
};


export const loginTutor = async (email: string, password: string) => {
  try {
    const response = await tutorAPI.post("/login", { email, password });

    console.log(response)
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("Error during login:", error.response?.data || error.message);
    } else if (error instanceof Error) {
      console.error("Error during login:", error.message);
    } else {
      console.error("Unknown error during login");
    }
    return undefined;
  }
};


export const loginWithGoogle = async (token: string) => {
  try {
    const response = await tutorAPI.post('/google', { token });
    
    if (response.data) {
      Cookies.set('tutor', JSON.stringify(response.data), { expires: COOKIE_EXPIRY_DAYS });
    }
  
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Google login failed');
    }
    throw new Error('Error during Google login request');
  }
}

// Forgot password
// export const forgotPassword = async (email: string) => {
//   try {
//     const response = await tutorAPI.post("/forgot-password", { email });
//     return response.data;
//   } catch (error) {
//     handleAxiosError(error, "Failed to initiate password reset.");
//   }
// };

// Reset password
// export const resetPassword = async (email: string, newPassword: string) => {
//   try {
//     const response = await tutorAPI.post("/reset-password", { email, newPassword });
//     return response.data;
//   } catch (error) {
//     handleAxiosError(error, "Failed to reset password.");
//   }
// };

// Logout tutor
// export const logoutTutor = async () => {
//   try {
//     // Notify the server about logout (optional)
//     await tutorAPI.post("/logout");
//     // Clear cookies
//     document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
//     document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
//   } catch (error) {
//     handleAxiosError(error, "Logout failed.");
//   }
// };
