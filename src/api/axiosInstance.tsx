import { USER_URL } from "../constant/url";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

const API = axios.create({
  baseURL: USER_URL,
  withCredentials: true, 
});

const getToken = () => Cookies.get("userToken");

const clearCookies = () => {
  Cookies.remove("userToken", { path: "/" });
  Cookies.remove("refreshToken", { path: "/" });
};

API.interceptors.request.use(
  (config) => {
    const token = getToken();
    console.log(token,"token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


const refreshAccessToken = async () => {
  try {
    const response = await API.post("/refresh-token", {}, { withCredentials: true });
    Cookies.set("userToken", response.data.accessToken, { path: "/" });
    return response.data.accessToken;
  } catch (error) {
    console.error("Refresh token request failed:", error);
    clearCookies();
    window.location.href = "/"; 
    return null;
  }
};

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return API(originalRequest);
      }
    }

    if (error.response?.status === 403) {
      console.warn("User is blocked. Logging out...");
      toast.error('user is blocked')
      clearCookies();
      window.location.href = "/login"; 
      return Promise.reject(new Error("User is blocked"));
    }

    return Promise.reject(error);
  }
);

export default API;
