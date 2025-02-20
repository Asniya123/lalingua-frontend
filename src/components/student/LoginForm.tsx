import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, forgotPassword, resetPassword, verifyOtp, loginWithGoogle } from '../../services/userAuth';
import Cookies from 'js-cookie';
import { GoogleLogin, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useDispatch } from 'react-redux';

interface LoginUser {
  email?: string;
  password?: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<LoginUser>({
    email: '',
    password: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [isForgotPassword, setIsForgotPassword] = useState<boolean>(false);
  const [isResetPassword, setIsResetPassword] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [isOtpVerified, setIsOtpVerified] = useState<boolean>(false);
  const dispatch= useDispatch();

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

    try {
      const response = await loginUser(email, password);

      if (response.isBlocked) {
        setError('Your account has been blocked by the admin.');
        return;
      }

      Cookies.set('userToken', response.accessToken);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    }
  };


  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`, 
          },
        });

        console.log("Google User Data:", tokenResponse.access_token);
        localStorage.setItem("googleAuth",res.data)
        navigate('/')
      } catch (error) {
        console.error("Google login error:", error);
        setError("Google login failed");
      }
    },
    onError: () => {
      setError("Google login failed");
    },
  });


  const handleError = () => {
    setError('Google login failed');
  };

  const handleForgotPassword = async () => {
    const { email } = formData;
    if (!email) {
      setError('Email is required to reset password.');
      return;
    }

    try {
      await forgotPassword({ email });
      setError(null);
      setIsForgotPassword(false);
      setIsResetPassword(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError('OTP is required.');
      return;
    }

    try {
      await verifyOtp(formData.email as string, otp);
      setError(null);
      setIsOtpVerified(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword !== formData.password) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await resetPassword({
        email: formData.email as string,
        newPassword: formData.password as string
      });
      setError(null);
      setIsResetPassword(false);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-4xl flex shadow-lg rounded-lg overflow-hidden">
        {/* Left Image Section */}
        <div
          className="hidden md:block md:w-1/2 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://i.pinimg.com/736x/71/c3/d4/71c3d4abb266a37f61147b4731e16ca6.jpg')",
          }}
        ></div>

        {/* Right Form Section */}
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-white">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            {isForgotPassword
              ? "Forgot Password"
              : isResetPassword
                ? "Reset Password"
                : "Login to Your Account"}
          </h2>
          <p className="text-gray-600 text-center mb-6">
            {isForgotPassword
              ? "Enter your email to receive an OTP for password reset"
              : isResetPassword
                ? "Enter OTP and new password to reset your password"
                : "Enter your email and password to continue"}
          </p>

          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

          {/* Forgot Password Form */}
          {isForgotPassword && (
            <div>
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
              <button
                type="button"
                onClick={handleForgotPassword}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
              >
                Send OTP
              </button>
            </div>
          )}

          {/* Reset Password Form */}
          {isResetPassword && (
            <div>
              {!isOtpVerified ? (
                <div>
                  <div className="mb-4">
                    <label className="block text-gray-700">OTP</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter OTP"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
                  >
                    Verify OTP
                  </button>
                </div>
              ) : (
                <div>
                  <div className="mb-4">
                    <label className="block text-gray-700">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700">Confirm Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Confirm new password"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
                  >
                    Reset Password
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Login Form */}
          {!isForgotPassword && !isResetPassword && (
            <div>
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
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-blue-500 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            </div>
          )}
          <p className="mt-4 text-center text-gray-600">
            Don't have an account?{' '}
            <span
              className="text-blue-500 cursor-pointer hover:underline"
              onClick={() => navigate('/register')}
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
