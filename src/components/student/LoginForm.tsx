import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, forgotPassword, resetPassword, verifyOtp } from '../../services/userAuth';
import Cookies from 'js-cookie';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { login, setStudent } from '../../redux/slice/studentSlice';
import { Toaster, toast } from 'react-hot-toast';
import { AppDispatch } from '../../redux/store';

interface LoginUser {
  email?: string;
  password?: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
const dispatch = useDispatch<AppDispatch>();


  const [formData, setFormData] = useState<LoginUser>({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [isForgotPassword, setIsForgotPassword] = useState<boolean>(false);
  const [isResetPassword, setIsResetPassword] = useState<boolean>(false);
  const [otp, setOtp] = useState<string[]>(Array(6).fill('')); 
  const [timer, setTimer] = useState<number>(30); 
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState<string>('');
  const [isOtpVerified, setIsOtpVerified] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);

  const { email, password } = formData;

  if (!email || !password) {
    setError("Both fields are required.");
    toast.error("Both fields are required.");
    return;
  }

  try {
    await dispatch(login({ email, password })).unwrap();
    toast.success("Logged in successfully!");
    navigate("/"); 
  } catch (err: any) {
    const errorMessage = err || "Login failed. Please try again.";
    setError(errorMessage);
    toast.error(errorMessage);
  }
};

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        localStorage.setItem('googleAuth', JSON.stringify(res.data));
        toast.success('Google login successful!');
        navigate('/');
      } catch (error) {
        setError('Google login failed');
        toast.error('Google login failed');
      }
    },
    onError: () => setError('Google login failed'),
  });

  const handleForgotPassword = async () => {
    const { email } = formData;
    if (!email) {
      setError('Email is required to reset password.');
      return;
    }

    try {
      await forgotPassword({ email });
      toast.success('OTP sent to your email!');
      setError(null);
      setIsForgotPassword(false);
      setIsResetPassword(true);
      setTimer(30); 
      setIsTimerActive(true);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

  // Handle OTP input
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (/^[0-9]$/.test(value) || value === '') {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    if (!otpString || otpString.length !== 6) {
      setError('Please enter a 6-digit OTP.');
      return;
    }

    try {
      await verifyOtp(formData.email as string, otpString);
      toast.success('OTP verified successfully!');
      setError(null);
      setIsOtpVerified(true);
      setIsTimerActive(false);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword !== formData.password) {
      setError('Passwords do not match.');
      return;
    }
  
    const otpString = otp.join('');
    if (!otpString || otpString.length !== 6) {
      setError('Valid 6-digit OTP is required.');
      return;
    }
  
    const payload = {
      email: formData.email as string,
      otp: otpString,
      newPassword: formData.password as string,
    };
    console.log('Sending reset password request with payload:', payload);
  
    try {
      await resetPassword(payload);
      toast.success('Password reset successfully!');
      setError(null);
      setIsResetPassword(false);
      navigate('/login');
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Toaster />
      <div className="w-full max-w-4xl flex shadow-lg rounded-lg overflow-hidden">
        <div
          className="hidden md:block md:w-1/2 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://i.pinimg.com/736x/71/c3/d4/71c3d4abb266a37f61147b4731e16ca6.jpg')",
          }}
        />
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-white">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            {isForgotPassword
              ? 'Forgot Password'
              : isResetPassword
              ? 'Reset Password'
              : 'Login to Your Account'}
          </h2>
          <p className="text-gray-600 text-center mb-6">
            {isForgotPassword
              ? 'Enter your email to receive an OTP'
              : isResetPassword
              ? 'Enter OTP and new password to reset'
              : 'Enter your email and password to continue'}
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
                    <label className="block text-gray-700">Enter OTP</label>
                    <div className="flex justify-between gap-2">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          value={digit}
                          onChange={(e) => handleOtpChange(e, index)}
                          onKeyDown={(e) => handleOtpKeyDown(e, index)}
                          maxLength={1}
                          className="w-12 h-12 text-center border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ))}
                    </div>
                  </div>
                  {isTimerActive && (
                    <p className="text-center text-gray-600 mb-4">
                      Time remaining: {timer} seconds
                    </p>
                  )}
                  {!isTimerActive && timer === 0 && (
                    <p className="text-center text-red-500 mb-4">OTP expired. Request a new one.</p>
                  )}
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
                    disabled={!isTimerActive}
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
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
              <button
                onClick={() => handleGoogleLogin()}
                className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition mt-4"
              >
                Sign in with Google
              </button>
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