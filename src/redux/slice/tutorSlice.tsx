import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import Tutor from "../../interfaces/tutor.js";
import * as service from '../../services/tutorAuth.js'
import { AxiosError } from "axios";
import ImageUpload from "../../utils/Cloudinary.js";
import tutorAPI from "../../api/tutorInstance.js";

const tutorString = Cookies.get("tutor");
const tutor: Tutor | null = tutorString ? JSON.parse(tutorString) : null;

const initialState = {
  tutor: tutor,
  loading: false,
  error: null as string | null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
  updateSuccess: false
};

// Tutor Registration
export const register = createAsyncThunk<Tutor, Tutor, { rejectValue: string }>(
  'tutor/register',
  async (tutorData, thunkAPI) => {
    try {
      return await service.signupTutor(tutorData);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return thunkAPI.rejectWithValue(error.message);
      } else {
        return thunkAPI.rejectWithValue('An unknown error occurred');
      }
    }
  }
);

// Tutor Login
export const login = createAsyncThunk<Tutor, { email: string; password: string }, { rejectValue: string }>(
  'tutor/login',
  async (loginData, thunkAPI) => {
    try {
      const response = await service.loginTutor(loginData.email, loginData.password);
      if (response.tutor.is_blocked) {
        return thunkAPI.rejectWithValue('Your account has been blocked by the admin.');
      }
      return response.tutor;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return thunkAPI.rejectWithValue(error.message);
      } else {
        return thunkAPI.rejectWithValue('Login failed. Please try again.');
      }
    }
  }
);

// Tutor Logout
export const logout = createAsyncThunk('tutor/logout', async () => {
  Cookies.remove('tutor');
});

export const fetchTutorProfile = createAsyncThunk(
  'tutor/fecthProfile',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await tutorAPI.get('/getProfile', {
        headers: { Authorization: `Bearer ${token}` },
      })

      const tutor = response.data
      if (tutor.is_blocked) {
        Cookies.remove('tutorToken')
        Cookies.remove('tutor')
        window.location.href = '/tutor/login';
        return rejectWithValue('Your account has been blocked by the admin. Please contact support.');
      }
      return tutor;

    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message)
      }
      return rejectWithValue('An unknown error occured')

    }
  }
)

export const updateTutorProfile = createAsyncThunk<Tutor, { token: string; profileData: Partial<Tutor> }, { rejectValue: string }>(
  'tutor/updateProfile',
  async ({ token, profileData }, { rejectWithValue }) => {
    try {
      const response = await tutorAPI.put('/editProfile', profileData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(response.data, "-----------------------------------------");
      const updatedTutor = response.data.tutor;
      if (updatedTutor.is_blocked) {
        Cookies.remove('tutorToken');
        Cookies.remove('tutor');
        window.location.href = '/tutor/login';
        return rejectWithValue('Your account has been blocked by the admin. Please contact support.');
      }
      return updatedTutor;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(err.response?.data?.message || 'An unknown error occurred');
    }
  }
);


export const uploadProfilePicture = createAsyncThunk<Tutor, { token: string; file: File }, { rejectValue: string }>(
  'tutor/uploadProfilePicture',
  async ({ token, file }, { rejectWithValue }) => {
    try {
      const uploadedImageUrl = await ImageUpload(file)
      const response = await tutorAPI.put('/uploadPicture',
        { profilePicture: uploadedImageUrl },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      const tutor = response.data.tutor
      if (tutor.is_blocked) {
        Cookies.remove('tutorToken')
        Cookies.remove('tutor')
        window.location.href = '/tutor/login';
        return rejectWithValue('Your account has been blocked by the admin. Please contact support.');
      }
      return tutor;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(err.response?.data?.message || 'An unknown error occurred');
    }
  }
)

const tutorSlice = createSlice({
  name: "tutor",
  initialState,
  reducers: {
    reset: (state, action) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = action.payload as string;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearState: (state) => {
      state.tutor = null
    }
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
        Cookies.set('tutor', JSON.stringify(action.payload));
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
        console.log(action.payload)
        state.tutor = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
        state.tutor = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.tutor = null;
      })
      .addCase(fetchTutorProfile.pending, (state) => {
        state.error = null
      })
      .addCase(fetchTutorProfile.fulfilled, (state, action) => {
        state.loading = false
        state.tutor = action.payload
      })
      .addCase(fetchTutorProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(updateTutorProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTutorProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.tutor = action.payload;
        state.updateSuccess = true
      })
      .addCase(updateTutorProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(uploadProfilePicture.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(uploadProfilePicture.fulfilled, (state, action) => {
        state.loading = false
        state.tutor = action.payload
        state.updateSuccess = true
      })
      .addCase(uploadProfilePicture.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
});

export const { reset, clearError, clearState } = tutorSlice.actions;
export default tutorSlice.reducer;
