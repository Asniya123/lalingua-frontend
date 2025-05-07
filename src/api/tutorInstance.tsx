import { TUTOR_URL } from "../constant/url";
import axios from 'axios'
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import store from "../redux/store";
import { clearState } from "../redux/slice/tutorSlice";

const tutorAPI = axios.create({
    baseURL: TUTOR_URL,
    withCredentials: true,
})

const getToken = () => {
  return Cookies.get("tutorToken")

};


const clearCookies = () => {
  Cookies.remove("tutorToken", { path: "/" });
  Cookies.remove("refreshToken", { path: "/" });
};


tutorAPI.interceptors.request.use(
  (config) => {
    const token= getToken();
   
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
        const refreshToken=Cookies.get('refreshToken')
        const res = await tutorAPI.post("/refresh-token",   { headers: { Authorization: `Bearer ${refreshToken}` },});

        
        Cookies.set("tutorToken", res.data.accessToken, { path: "/" });

       
        originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
        return tutorAPI(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);

     
        clearCookies();
        store.dispatch(clearState())
        // window.location.href = "/tutor/login";
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 403) {
          console.warn("tutor is blocked. Logging out...");
          toast.error('tutor is blocked')
          clearCookies();
        store.dispatch(clearState())
          window.location.href = "/tutor/login"; 
          return Promise.reject(new Error("tutor is blocked"));
        }
    
    return Promise.reject(error);
  }
);

export default tutorAPI;
