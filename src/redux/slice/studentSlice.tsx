import { createAsyncThunk, createSlice, isRejectedWithValue } from "@reduxjs/toolkit";
import * as service from '../../services/userAuth.js';
import Cookies from "js-cookie";
import Student, { Login } from '../../interfaces/user.js';
import ImageUpload from "../../utils/Cloudinary.js";
import API from "../../api/axiosInstance.js";

const userString = Cookies.get('user');
const student: Student | null = userString ? JSON.parse(userString) : null;

const initialState = {
  student: student,
  loading: false,
  error: null as string | null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
  updateSuccess: false,
  selectedLanguageId: null as string | null,
};

export const register = createAsyncThunk<Student, Student, { rejectValue: string }>(
  'auth/register',
  async (studentData, thunkAPI) => {
    try {
      return await service.signupUser(studentData);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return thunkAPI.rejectWithValue(error.message);
      } else {
        return thunkAPI.rejectWithValue('An unknown error occurred');
      }
    }
  }
);

export const login = createAsyncThunk<Student, Login, { rejectValue: string }>(
  'auth/login',
  async (loginData, thunkAPI) => {
    try {
      return await service.loginUser(loginData.email, loginData.password);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return thunkAPI.rejectWithValue(error.message);
      } else {
        return thunkAPI.rejectWithValue('An unknown error occurred');
      }
    }
  }
);

export const googleLogin = createAsyncThunk<Student, string, { rejectValue: string }>(
  'auth/googleLogin',
  async (token, thunkAPI) => {
    try {
      return await service.loginWithGoogle(token);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return thunkAPI.rejectWithValue(error.message);
      }
      return thunkAPI.rejectWithValue('An unknown error occurred');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  Cookies.remove('user');
});

export const fetchStudentProfile = createAsyncThunk(
  "student/fetchProfile",
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await API.get("/getProfile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("An unknown error occurred");
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
      return rejectWithValue(error.response?.data?.message || 'An unknown error occurred');
    }
  }
);


export const uploadProfilePicture = createAsyncThunk<Student, { token: string; file: File }, { rejectValue: string}>(
  'student/uploadProfilePicture',
  async({token, file}, {rejectWithValue}) => {
    try{
      const uploadedImageUrl = await ImageUpload(file)

      const response = await API.put('/uploadPicture',
        {profilePicture: uploadedImageUrl},
        {
          headers: {Authorization: `Bearer ${token}`},
        }
      )
      return response.data.student
    }catch(error: any){
      return rejectWithValue(error.response?.data?.message || 'An unkonwn error occured')
    }
  }
)


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state, action) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = action.payload as string;
    },
    setStudent:(state,action)=>{
      state.student=action.payload
    },
    clearError: (state) => {
      state.error = null;
    },
    clearStudent: (state) => {
      state.student = null;
    },
    setLanguage: (state, action) => { 
      state.selectedLanguageId = action.payload;
      Cookies.set('selectedLanguageId', action.payload); 
    },
    clearLanguage: (state) => { 
      state.selectedLanguageId = null;
      Cookies.remove('selectedLanguageId');
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
        state.student = action.payload;
        Cookies.set('user', JSON.stringify(action.payload));
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
        state.student = null;
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.student = action.payload;
        Cookies.set('user', JSON.stringify(action.payload));
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
        state.student = null;
      })
      .addCase(googleLogin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.student = action.payload;
        Cookies.set('user', JSON.stringify(action.payload));
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
        Cookies.remove('selectedLanguageId');
      })
      .addCase(fetchStudentProfile.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchStudentProfile.fulfilled, (state, action) => {
        console.log(action)
        state.loading = false;
        state.student = action.payload;
      })
      .addCase(fetchStudentProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateStudentProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStudentProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.student = action.payload;
        state.updateSuccess = true
      })
      .addCase(updateStudentProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(uploadProfilePicture.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(uploadProfilePicture.fulfilled, (state, action) => {
        state.loading = false
        state.student = action.payload
        state.updateSuccess = true
      })
      .addCase(uploadProfilePicture.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
});

export const { reset, clearError,setStudent,clearStudent,setLanguage, clearLanguage} = authSlice.actions;
export default authSlice.reducer;
