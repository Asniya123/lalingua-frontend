import { TUTOR_URL } from "../constant/url";
import axios from 'axios'
import Cookies from "js-cookie";
import { useNavigate } from "react-router";

const tutorAPI = axios.create({
    baseURL: TUTOR_URL,
    withCredentials: true,
})

const getToken = () => Cookies.get("accessToken");


const clearCookies = () => {
  Cookies.remove("accessToken", { path: "/" });
  Cookies.remove("refreshToken", { path: "/" });
};


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


tutorAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        
        const res = await tutorAPI.post("/refresh-token");

        
        Cookies.set("accessToken", res.data.accessToken, { path: "/" });

       
        originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
        return tutorAPI(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);

     
        clearCookies();
        // window.location.href = "/tutor/login";
        return Promise.reject(refreshError);
      }
    }

    
    return Promise.reject(error);
  }
);

export default tutorAPI;
