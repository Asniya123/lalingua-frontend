import { USER_URL } from "../constant/url";
import axios from "axios";
import Cookies from "js-cookie"; 


const API = axios.create({
  baseURL: USER_URL,
  withCredentials: true,
});


const getToken = () => Cookies.get("accessToken");


const clearCookies = () => {
  Cookies.remove("accessToken", { path: "/" });
  Cookies.remove("refreshToken", { path: "/" });
};


API.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        
        const res = await API.post("/refresh-token");

        
        Cookies.set("accessToken", res.data.accessToken, { path: "/" });

       
        originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
        return API(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);

     
        clearCookies();
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }


    if (error.response?.status === 403) {
      console.warn("User is blocked. Logging out...");
      clearCookies();
      window.location.href = "/";
      return Promise.reject(new Error("User is blocked"));
    }

    
    return Promise.reject(error);
  }
);

export default API;
