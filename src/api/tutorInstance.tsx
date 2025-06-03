// src/api/tutorAPI.ts

import { TUTOR_URL } from "../constant/url";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { clearState } from "../redux/slice/tutorSlice";

// Create Axios instance
const tutorAPI = axios.create({
  baseURL: TUTOR_URL,
  withCredentials: true,
});

// Temporary store reference (to be injected later)
let _store: any;

// Function to inject store
export const injectStore = (store: any) => {
  _store = store;
};

// Function to get token from cookies
const getToken = () => {
  return Cookies.get("tutorToken");
};

// Function to clear cookies
const clearCookies = () => {
  Cookies.remove("tutorToken", { path: "/" });
  Cookies.remove("refreshToken", { path: "/" });
};

// Axios request interceptor
tutorAPI.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Axios response interceptor
tutorAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = Cookies.get("refreshToken");
        const res = await tutorAPI.post(
          "/refresh-token",
          {},
          { headers: { Authorization: `Bearer ${refreshToken}` } }
        );

        Cookies.set("tutorToken", res.data.accessToken, { path: "/" });
        originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
        return tutorAPI(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        clearCookies();
        if (_store) _store.dispatch(clearState());
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 403) {
      toast.error("Tutor is blocked");
      clearCookies();
      if (_store) _store.dispatch(clearState());
      window.location.href = "/tutor/login";
      return Promise.reject(new Error("Tutor is blocked"));
    }

    return Promise.reject(error);
  }
);

export default tutorAPI;
