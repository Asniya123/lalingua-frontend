import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginTutor } from '../../services/tutorAuth';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { login } from '../../redux/slice/tutorSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { AppDispatch } from '../../redux/store';

interface LoginTutor {
  email?: string;
  password?: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();

  const [formData, setFormData] = useState<LoginTutor>({
    email: '',
    password: '',
  });

  const [error, setError] = useState<string | null>(null);



  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
  
    const { email, password } = formData;
    
    if (!email || !password) {
      setError('Both fields are required.');
      return;
    }
  
    dispatch(login({ email, password }));
    navigate("/tutor/home")
  };
  


  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        })
        console.log('Google User Data:', res.data)
        navigate('/tutor/home')
      } catch (error) {
        console.error("Google login error:", error);
        setError("Google login failed");
      }
    },
    onError: () => {
      setError("Google login failed");
    },
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-4xl flex shadow-lg rounded-lg overflow-hidden">
        {/* Left Image Section */}
        <div
          className="hidden md:block md:w-1/2 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://i.pinimg.com/736x/80/6c/2a/806c2a03743217d233f899737b81cc6d.jpg')",
          }}
        ></div>

        {/* Right Form Section */}
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-white">
          <h2 className="text-2xl font-bold text-gray-800 text-center">Login to Your Account</h2>
          <p className="text-gray-600 text-center mb-6">Enter your email and password to continue</p>

          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
            >
              Login
            </button>
          </form>
          <div className="mt-4 text-center">

            <button
              onClick={() => handleGoogleLogin()} // Call the function
              className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition mt-4"
            >
              Sign in with Google
            </button>



            {error && <p className="text-red-500">{error}</p>}
          </div>
          <div className="mt-4 text-center">
            <a
              href="/forgot-password" // Replace with the actual forgot password page URL
              className="text-blue-500 hover:underline"
            >
              Forgot Password?
            </a>
          </div>

          <p className="mt-4 text-center text-gray-600">
            Don't have an account?{' '}
            <span
              className="text-blue-500 cursor-pointer hover:underline"
              onClick={() => navigate('/tutor/register')}
            >
              Sign up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
