import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

interface AdminState {
  adminId: string | null;
  accessToken: string | null;
  refreshToken: string | null;
}

const initialState: AdminState = {
  adminId: null,
  accessToken: null,
  refreshToken: null,
};

// Load initial state from cookies if available (optional for persistence)
const storedAdminId = Cookies.get("adminId");
const storedAccessToken = Cookies.get("accessToken");
const storedRefreshToken = Cookies.get("refreshToken");

if (storedAdminId && storedAccessToken && storedRefreshToken) {
  initialState.adminId = storedAdminId;
  initialState.accessToken = storedAccessToken;
  initialState.refreshToken = storedRefreshToken;
}

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setAdminData(
      state,
      action: PayloadAction<{ adminId: string; accessToken: string; refreshToken: string }>
    ) {
      state.adminId = action.payload.adminId;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;

      // Persist to cookies for persistence
      Cookies.set("adminId", action.payload.adminId);
      Cookies.set("accessToken", action.payload.accessToken);
      Cookies.set("refreshToken", action.payload.refreshToken);
    },
    clearAdminData(state) {
      state.adminId = null;
      state.accessToken = null;
      state.refreshToken = null;

      // Clear cookies on logout
      Cookies.remove("adminId");
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
    },
  },
});

export const { setAdminData, clearAdminData } = adminSlice.actions;
export default adminSlice.reducer;