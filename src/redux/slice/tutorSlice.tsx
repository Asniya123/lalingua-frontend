import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import * as service from "../../services/tutorAuth.js";
import { AxiosError } from "axios";
import ImageUpload from "../../utils/Cloudinary.js";
import tutorAPI from "../../api/tutorInstance.js";
import { OutgoingCallPayload, VideoCallPayload } from "../../interfaces/chat.js";

// Define Tutor interface
interface Tutor {
  _id: string;
  name: string;
  email: string;
  mobile?: string;
  profilePicture?: string;
  documents?: string;
  is_blocked?: boolean;
}




interface Notification {
  content: string;
  read: boolean;
  createdAt: string;
}

interface TutorState {
  tutor: Tutor | null;
  loading: boolean;
  error: string | null;
  isError: boolean;
  isSuccess: boolean;
  isLoading: boolean;
  message: string;
  updateSuccess: boolean;
  videoCall: VideoCallPayload | null;
  showVideoCallTutor: boolean;
  roomIdTutor: string | null;
  notificationTutor: Notification[];
  outgoingCall: OutgoingCallPayload | null;
  showOutgoingCallTutor: boolean;
  isCallConnecting: boolean;
}

const tutorString = Cookies.get("tutor");
const tutor: Tutor | null = tutorString ? JSON.parse(tutorString) : null;

const initialState: TutorState = {
  tutor,
  loading: false,
  error: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
  updateSuccess: false,
  videoCall: null,
  showVideoCallTutor: false,
  roomIdTutor: null,
  notificationTutor: [],
  outgoingCall: null,
  showOutgoingCallTutor: false,
  isCallConnecting: false,
};

// Tutor Registration
export const register = createAsyncThunk<Tutor, Tutor, { rejectValue: string }>(
  "tutor/register",
  async (tutorData, thunkAPI) => {
    try {
      const newTutor = await service.signupTutor(tutorData);
      if (!newTutor._id) {
        return thunkAPI.rejectWithValue("Invalid tutor data: missing ID");
      }
      return newTutor;
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(error instanceof Error ? error.message : "An unknown error occurred");
    }
  }
);

// Tutor Login
export const login = createAsyncThunk<Tutor, { email: string; password: string }, { rejectValue: string }>(
  "tutor/login",
  async (loginData, thunkAPI) => {
    try {
      const response = await service.loginTutor(loginData.email, loginData.password);
      if (response.tutor.is_blocked) {
        return thunkAPI.rejectWithValue("Your account has been blocked by the admin.");
      }
      if (!response.tutor._id) {
        return thunkAPI.rejectWithValue("Invalid tutor data: missing ID");
      }
      Cookies.set("tutor", JSON.stringify(response.tutor));
      return response.tutor;
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(error instanceof Error ? error.message : "Login failed. Please try again.");
    }
  }
);

// Tutor Logout
export const logout = createAsyncThunk("tutor/logout", async () => {
  Cookies.remove("tutor");
  Cookies.remove("tutorToken");
});

// Fetch Tutor Profile
export const fetchTutorProfile = createAsyncThunk<Tutor, string, { rejectValue: string }>(
  "tutor/fetchProfile",
  async (token, { rejectWithValue }) => {
    try {
      const response = await tutorAPI.get("/getProfile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const tutor = response.data;
      if (tutor.is_blocked) {
        Cookies.remove("tutorToken");
        Cookies.remove("tutor");
        window.location.href = "/tutor/login";
        return rejectWithValue("Your account has been blocked by the admin. Please contact support.");
      }
      if (!tutor._id) {
        return rejectWithValue("Invalid tutor data: missing ID");
      }
      Cookies.set("tutor", JSON.stringify(tutor));
      return {
        _id: tutor._id,
        name: tutor.name || "",
        email: tutor.email || "",
        mobile: tutor.mobile || "",
        profilePicture: tutor.profilePicture || "",
        documents: tutor.documents || "",
        is_blocked: tutor.is_blocked || false,
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "An unknown error occurred");
    }
  }
);

// Update Tutor Profile
export const updateTutorProfile = createAsyncThunk<Tutor, { token: string; profileData: FormData }, { rejectValue: string }>(
  "tutor/updateProfile",
  async ({ token, profileData }, { rejectWithValue }) => {
    try {
      const response = await tutorAPI.put("/editProfile", profileData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedTutor = response.data.tutor;
      if (updatedTutor.is_blocked) {
        Cookies.remove("tutorToken");
        Cookies.remove("tutor");
        window.location.href = "/tutor/login";
        return rejectWithValue("Your account has been blocked by the admin. Please contact support.");
      }
      if (!updatedTutor._id) {
        return rejectWithValue("Invalid tutor data: missing ID");
      }
      Cookies.set("tutor", JSON.stringify(updatedTutor));
      return updatedTutor;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(err.response?.data?.message || "An unknown error occurred");
    }
  }
);

// Upload Profile Picture
export const uploadProfilePicture = createAsyncThunk<Tutor, { token: string; file: File }, { rejectValue: string }>(
  "tutor/uploadProfilePicture",
  async ({ token, file }, { rejectWithValue }) => {
    try {
      const uploadedImageUrl = await ImageUpload(file);
      const response = await tutorAPI.put(
        "/uploadPicture",
        { profilePicture: uploadedImageUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const tutor = response.data.tutor;
      if (tutor.is_blocked) {
        Cookies.remove("tutorToken");
        Cookies.remove("tutor");
        window.location.href = "/tutor/login";
        return rejectWithValue("Your account has been blocked by the admin. Please contact support.");
      }
      if (!tutor._id) {
        return rejectWithValue("Invalid tutor data: missing ID");
      }
      Cookies.set("tutor", JSON.stringify(tutor));
      return tutor;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(err.response?.data?.message || "An unknown error occurred");
    }
  }
);

const tutorSlice = createSlice({
  name: "tutor",
  initialState,
  reducers: {
    reset: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearState: (state) => {
      state.tutor = null;
      state.videoCall = null;
      state.showVideoCallTutor = false;
      state.roomIdTutor = null;
      state.notificationTutor = [];
      state.outgoingCall = null;
      state.showOutgoingCallTutor = false;
      state.isCallConnecting = false;
    },
    setVideoCall: (state, action: PayloadAction<VideoCallPayload | null>) => {
      state.videoCall = action.payload;
      console.log("state.videoCall tutor", state.videoCall);
    },
    setShowVideoCall: (state, action: PayloadAction<boolean>) => {
      state.showVideoCallTutor = action.payload;
      console.log("showVideoCallTutor slice", state.showVideoCallTutor);
    },
    setOutgoingCall: (state, action: PayloadAction<OutgoingCallPayload | null>) => {
      state.outgoingCall = action.payload;
      console.log("state.outgoingCall tutor", state.outgoingCall);
    },
    setShowOutgoingCall: (state, action: PayloadAction<boolean>) => {
      state.showOutgoingCallTutor = action.payload;
      console.log("showOutgoingCallTutor slice", state.showOutgoingCallTutor);
    },
    setIsCallConnecting: (state, action: PayloadAction<boolean>) => {
      state.isCallConnecting = action.payload;
      console.log("isCallConnecting tutor", state.isCallConnecting);
    },
    setRoomId: (state, action: PayloadAction<string | null>) => {
      state.roomIdTutor = action.payload;
      console.log("roomIdTutor slice", state.roomIdTutor);
    },
    endCallTutor: (state) => {
      state.videoCall = null;
      state.showVideoCallTutor = false;
      state.outgoingCall = null;
      state.showOutgoingCallTutor = false;
      state.roomIdTutor = null;
      state.isCallConnecting = false;
      localStorage.removeItem("IncomingVideoCall");
    },
    setNotificationTutor: (state, action: PayloadAction<Notification[]>) => {
      state.notificationTutor = [...state.notificationTutor, ...action.payload];
      console.log("notificationTutor slice", state.notificationTutor);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.tutor = action.payload;
        Cookies.set("tutor", JSON.stringify(action.payload));
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
        state.tutor = null;
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.tutor = action.payload;
        Cookies.set("tutor", JSON.stringify(action.payload));
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
        state.tutor = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.tutor = null;
        state.videoCall = null;
        state.showVideoCallTutor = false;
        state.roomIdTutor = null;
        state.notificationTutor = [];
        state.outgoingCall = null;
        state.showOutgoingCallTutor = false;
        state.isCallConnecting = false;
      })
      .addCase(fetchTutorProfile.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchTutorProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.tutor = action.payload;
      })
      .addCase(fetchTutorProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateTutorProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTutorProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.tutor = action.payload;
        state.updateSuccess = true;
      })
      .addCase(updateTutorProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(uploadProfilePicture.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadProfilePicture.fulfilled, (state, action) => {
        state.loading = false;
        state.tutor = action.payload;
        state.updateSuccess = true;
      })
      .addCase(uploadProfilePicture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  reset,
  clearError,
  clearState,
  setVideoCall,
  setShowVideoCall,
  setOutgoingCall,
  setShowOutgoingCall,
  setIsCallConnecting,
  setRoomId,
  endCallTutor,
  setNotificationTutor,
} = tutorSlice.actions;

export default tutorSlice.reducer;