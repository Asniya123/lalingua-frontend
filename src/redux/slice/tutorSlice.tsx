import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import Tutor from "../../interfaces/tutor";
import * as service from '../../services/tutorAuth'

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
      if (response.tutor.isBlocked) {
        return thunkAPI.rejectWithValue('Your account has been blocked by the admin.');
      }
      Cookies.set('tutor', JSON.stringify(response.tutor));
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
    clearState:(state)=>{
      state.tutor=null
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
        console.log(action.payload,"+++++")
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
      });
  },
});

export const { reset, clearError,clearState } = tutorSlice.actions;
export default tutorSlice.reducer;
