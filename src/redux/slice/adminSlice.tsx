import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setAdminData(
      state,
      action: PayloadAction<{ adminId: string | null; accessToken: string | null; refreshToken: string | null }>
    ) {
      state.adminId = action.payload.adminId;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    clearAdminData(state) {
      state.adminId = null;
      state.accessToken = null;
      state.refreshToken = null;
    },
  },
});

export const { setAdminData, clearAdminData } = adminSlice.actions;
export default adminSlice.reducer;
