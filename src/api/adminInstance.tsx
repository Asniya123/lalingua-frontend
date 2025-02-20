import axios from "axios";
import { ADMIN_URL } from "../constant/url";
import Cookies from "js-cookie";


const adminAPI = axios.create({
  baseURL: ADMIN_URL,
  withCredentials: true, 
});


const getToken = () => Cookies.get("accessToken");


const clearCookies = () => {
  Cookies.remove("accessToken");
  Cookies.remove("refreshToken");
};


adminAPI.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


adminAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await adminAPI.post("/refresh-token");

        
        Cookies.set("accessToken", res.data.accessToken);

       
        originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
        return adminAPI(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);

     
        clearCookies();
        window.location.href = "/admin/login";
        return Promise.reject(refreshError);
      }
    }

    
    return Promise.reject(error);
  }
);

export default adminAPI;
