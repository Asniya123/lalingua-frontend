import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import * as service from "../../services/tutorAuth.js";
import { AxiosError } from "axios";
import ImageUpload from "../../utils/Cloudinary.js";
import tutorAPI from "../../api/tutorInstance.js";
import { OutgoingCallPayload, VideoCallPayload } from "../../interfaces/chat.js";

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

export const logout = createAsyncThunk("tutor/logout", async () => {
  Cookies.remove("tutor");
  Cookies.remove("tutorToken");
});

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
      Cookies.remove("tutor");
      Cookies.remove("tutorToken");
    },
    setVideoCall: (state, action: PayloadAction<VideoCallPayload | null>) => {
      console.log("setVideoCall dispatched with:", action.payload);
      state.videoCall = action.payload;
      console.log("videoCall state updated to:", state.videoCall);
    },
    setShowVideoCall: (state, action: PayloadAction<boolean>) => {
      console.log("setShowVideoCall dispatched with:", action.payload);
      state.showVideoCallTutor = action.payload;
      console.log("showVideoCallTutor state updated to:", state.showVideoCallTutor);
    },
    setOutgoingCall: (state, action: PayloadAction<OutgoingCallPayload | null>) => {
      console.log("setOutgoingCall dispatched with:", action.payload);
      state.outgoingCall = action.payload;
      console.log("outgoingCall state updated to:", state.outgoingCall);
    },
    setShowOutgoingCall: (state, action: PayloadAction<boolean>) => {
      console.log("setShowOutgoingCall dispatched with:", action.payload);
      state.showOutgoingCallTutor = action.payload;
      console.log("showOutgoingCallTutor state updated to:", state.showOutgoingCallTutor);
    },
    setIsCallConnecting: (state, action: PayloadAction<boolean>) => {
      console.log("setIsCallConnecting dispatched with:", action.payload);
      state.isCallConnecting = action.payload;
      console.log("isCallConnecting state updated to:", state.isCallConnecting);
    },
    setRoomId: (state, action: PayloadAction<string | null>) => {
      console.log("setRoomId dispatched with:", action.payload);
      state.roomIdTutor = action.payload;
      console.log("roomIdTutor state updated to:", state.roomIdTutor);
    },
    endCallTutor: (state) => {
      console.log("endCallTutor dispatched");
      state.videoCall = null;
      state.showVideoCallTutor = false;
      state.outgoingCall = null;
      state.showOutgoingCallTutor = false;
      state.roomIdTutor = null;
      state.isCallConnecting = false;
      localStorage.removeItem("IncomingVideoCall");
      console.log("endCallTutor state updated:", {
        videoCall: state.videoCall,
        showVideoCallTutor: state.showVideoCallTutor,
        outgoingCall: state.outgoingCall,
        showOutgoingCallTutor: state.showOutgoingCallTutor,
        roomIdTutor: state.roomIdTutor,
        isCallConnecting: state.isCallConnecting,
      });
    },
    setNotificationTutor: (state, action: PayloadAction<Notification[]>) => {
      console.log("setNotificationTutor dispatched with:", action.payload);
      state.notificationTutor = [...state.notificationTutor, ...action.payload];
      console.log("notificationTutor state updated to:", state.notificationTutor);
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
        state.tutor = action.payload;
        Cookies.set("tutor", JSON.stringify(action.payload));
        state.message = "Registration successful";
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
        state.tutor = null;
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
        state.tutor = action.payload;
        Cookies.set("tutor", JSON.stringify(action.payload));
        state.message = "Login successful";
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
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = false;
        state.message = "Logout successful";
      })
      .addCase(fetchTutorProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTutorProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.tutor = action.payload;
        Cookies.set("tutor", JSON.stringify(action.payload));
      })
      .addCase(fetchTutorProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateTutorProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateTutorProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.tutor = action.payload;
        state.updateSuccess = true;
        Cookies.set("tutor", JSON.stringify(action.payload));
      })
      .addCase(updateTutorProfile.rejected, (state, action) => {
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
        state.tutor = action.payload;
        state.updateSuccess = true;
        Cookies.set("tutor", JSON.stringify(action.payload));
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