import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as service from "../../services/userAuth";
import Cookies from "js-cookie";
import Student, { Login } from "../../interfaces/user";
import ImageUpload from "../../utils/Cloudinary";
import API from "../../api/axiosInstance";

interface VideoCallPayload {
  _id: string;
  tutorId: string;
  callType: string;
  tutorName: string;
  tutorImage: string;
  roomId: string;
}

interface VideoCallData {
  userID: string;
  type: string;
  callType: string;
  roomId: string;
  userName: string;
  userImage: string;
  studentName: string | null;
  studentImage: string | null;
}

interface AuthState {
  student: Student | null;
  loading: boolean;
  error: string | null;
  isError: boolean;
  isSuccess: boolean;
  isLoading: boolean;
  message: string;
  updateSuccess: boolean;
  selectedLanguageId: string | null;
  showIncomingVideoCall: VideoCallPayload | null;
  videoCall: VideoCallData | null;
  showVideoCallUser: boolean;
  roomIdUser: string | null;
}

const userString = Cookies.get("user");
console.log("studentSlice: userString from cookies:", userString);
const student: Student | null = userString ? JSON.parse(userString) : null;

const initialState: AuthState = {
  student,
  loading: false,
  error: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
  updateSuccess: false,
  selectedLanguageId: null,
  showIncomingVideoCall: null,
  videoCall: null,
  showVideoCallUser: false,
  roomIdUser: null,
};

export const register = createAsyncThunk<Student, Student, { rejectValue: string }>(
  "auth/register",
  async (studentData, thunkAPI) => {
    try {
      return await service.signupUser(studentData);
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(error instanceof Error ? error.message : "An unknown error occurred");
    }
  }
);

export const login = createAsyncThunk<Student, Login, { rejectValue: string }>(
  "auth/login",
  async (loginData, thunkAPI) => {
    try {
      const response = await service.loginUser(loginData.email, loginData.password);
      Cookies.set("userToken", response.login.accessToken);
      Cookies.set("user", JSON.stringify(response.login.student));
      return response.login.student;
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(error instanceof Error ? error.message : "An unknown error occurred");
    }
  }
);

export const googleLogin = createAsyncThunk<Student, string, { rejectValue: string }>(
  "auth/googleLogin",
  async (token, thunkAPI) => {
    try {
      return await service.loginWithGoogle(token);
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(error instanceof Error ? error.message : "An unknown error occurred");
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async (_, { dispatch }) => {
  dispatch(resetVideoCallState());
  Cookies.remove("user");
  Cookies.remove("userToken");
  Cookies.remove("selectedLanguageId");
});

export const fetchStudentProfile = createAsyncThunk<Student, string, { rejectValue: string }>(
  "student/fetchProfile",
  async (token, { rejectWithValue }) => {
    try {
      const response = await API.get("/getProfile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : "An unknown error occurred");
    }
  }
);

export const updateStudentProfile = createAsyncThunk<Student, { token: string; profileData: Partial<Student> }, { rejectValue: string }>(
  "student/updateProfile",
  async ({ token, profileData }, { rejectWithValue }) => {
    try {
      const response = await API.put("/editProfile", profileData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.student;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "An unknown error occurred");
    }
  }
);

export const uploadProfilePicture = createAsyncThunk<Student, { token: string; file: File }, { rejectValue: string }>(
  "student/uploadProfilePicture",
  async ({ token, file }, { rejectWithValue }) => {
    try {
      const uploadedImageUrl = await ImageUpload(file);
      const response = await API.put(
        "/uploadPicture",
        { profilePicture: uploadedImageUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.student;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "An unknown error occurred");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = action.payload;
    },
    setStudent: (state, action: PayloadAction<Student | null>) => {
      state.student = action.payload;
      if (action.payload) {
        Cookies.set("user", JSON.stringify(action.payload));
      } else {
        Cookies.remove("user");
      }
    },
    resetAuthState: (state) => {
      state.student = null;
      state.showIncomingVideoCall = null;
      state.videoCall = null;
      state.showVideoCallUser = false;
      state.roomIdUser = null;
      state.selectedLanguageId = null;
      Cookies.remove("user");
      Cookies.remove("userToken");
      Cookies.remove("selectedLanguageId");
    },
    clearError: (state) => {
      state.error = null;
    },
    clearStudent: (state) => {
      state.student = null;
      Cookies.remove("user");
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.selectedLanguageId = action.payload;
      Cookies.set("selectedLanguageId", action.payload);
    },
    clearLanguage: (state) => {
      state.selectedLanguageId = null;
      Cookies.remove("selectedLanguageId");
    },
    setShowIncomingVideoCall: (state, action: PayloadAction<VideoCallPayload | null>) => {
      console.log("setShowIncomingVideoCall dispatched with:", action.payload);
      state.showIncomingVideoCall = action.payload;
      console.log("showIncomingVideoCall state updated to:", state.showIncomingVideoCall);
    },
    setVideoCallUser: (state, action: PayloadAction<VideoCallData | null>) => {
      console.log("setVideoCallUser dispatched with:", action.payload);
      state.videoCall = action.payload;
      console.log("videoCall state updated to:", state.videoCall);
    },
    setShowVideoCallUser: (state, action: PayloadAction<boolean>) => {
      console.log("setShowVideoCallUser dispatched with:", action.payload);
      state.showVideoCallUser = action.payload;
      console.log("showVideoCallUser state updated to:", state.showVideoCallUser);
    },
    setRoomIdUser: (state, action: PayloadAction<string | null>) => {
      console.log("setRoomIdUser dispatched with:", action.payload);
      state.roomIdUser = action.payload;
      console.log("roomIdUser state updated to:", state.roomIdUser);
    },
    endCallUser: (state) => {
      console.log("endCallUser dispatched");
      state.videoCall = null;
      state.showIncomingVideoCall = null;
      state.showVideoCallUser = false;
      state.roomIdUser = null;
      localStorage.removeItem("IncomingVideoCall");
      console.log("endCallUser state updated:", {
        videoCall: state.videoCall,
        showIncomingVideoCall: state.showIncomingVideoCall,
        showVideoCallUser: state.showVideoCallUser,
        roomIdUser: state.roomIdUser,
      });
    },
    resetVideoCallState: (state) => {
      console.log("resetVideoCallState dispatched");
      state.videoCall = null;
      state.showIncomingVideoCall = null;
      state.showVideoCallUser = false;
      state.roomIdUser = null;
      localStorage.removeItem("IncomingVideoCall");
      console.log("resetVideoCallState state updated:", {
        videoCall: state.videoCall,
        showIncomingVideoCall: state.showIncomingVideoCall,
        showVideoCallUser: state.showVideoCallUser,
        roomIdUser: state.roomIdUser,
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.student = action.payload;
        Cookies.set("user", JSON.stringify(action.payload));
        state.message = "Registration successful";
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
        state.student = null;
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.student = action.payload;
        Cookies.set("user", JSON.stringify(action.payload));
        state.message = "Login successful";
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
        state.student = null;
      })
      .addCase(googleLogin.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.student = action.payload;
        Cookies.set("user", JSON.stringify(action.payload));
        state.message = "Google login successful";
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
        state.student = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.student = null;
        state.selectedLanguageId = null;
        state.showIncomingVideoCall = null;
        state.videoCall = null;
        state.showVideoCallUser = false;
        state.roomIdUser = null;
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = false;
        state.message = "Logout successful";
      })
      .addCase(fetchStudentProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.student = action.payload;
        Cookies.set("user", JSON.stringify(action.payload));
      })
      .addCase(fetchStudentProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateStudentProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateStudentProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.student = action.payload;
        state.updateSuccess = true;
        Cookies.set("user", JSON.stringify(action.payload));
      })
      .addCase(updateStudentProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.updateSuccess = false;
      })
      .addCase(uploadProfilePicture.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(uploadProfilePicture.fulfilled, (state, action) => {
        state.loading = false;
        state.student = action.payload;
        state.updateSuccess = true;
        Cookies.set("user", JSON.stringify(action.payload));
      })
      .addCase(uploadProfilePicture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.updateSuccess = false;
      });
  },
});

export const {
  reset,
  clearError,
  setStudent,
  clearStudent,
  setLanguage,
  clearLanguage,
  setShowIncomingVideoCall,
  setVideoCallUser,
  setShowVideoCallUser,
  setRoomIdUser,
  endCallUser,
  resetVideoCallState,
} = authSlice.actions;
export default authSlice.reducer;