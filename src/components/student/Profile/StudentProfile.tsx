import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../../../redux/store.js';
import { fetchStudentProfile, uploadProfilePicture } from '../../../redux/slice/studentSlice.js';
import { RootState } from '../../../redux/store.js';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { changePassword } from '../../../services/userAuth.js';

interface Student {
  name?: string;
  email?: string;
  mobile?: string;
  profilePicture?: string;
}

const StudentProfile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const profile = useSelector((state: RootState) => state.auth.student) as Student | null;
  const loading = useSelector((state: RootState) => state.auth.loading);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Added confirm password state
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get('userToken') || '';
    if (token && !profile) {
      dispatch(fetchStudentProfile(token));
    }
  }, [dispatch, profile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      const previewURL = URL.createObjectURL(file);
      setPreview(previewURL);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload.');
      return;
    }

    try {
      const token = Cookies.get('userToken') || '';
      if (!token) {
        throw new Error('No token found. Please log in again.');
      }

      console.log('Token being sent:', token);
      await dispatch(uploadProfilePicture({ token, file: selectedFile })).unwrap();

      toast.success('Profile picture updated successfully!');
      setPreview(null);
      setSelectedFile(null);
      dispatch(fetchStudentProfile(token));
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      toast.error(error.message || 'Failed to upload profile picture.');
      if (error.message === 'Invalid token') {
        navigate('/login');
      }
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match.');
      return;
    }

    try {
      const token = Cookies.get('userToken') || '';
      if (!token) {
        throw new Error('No token found. Please log in again.');
      }
      const response = await changePassword({currentPassword, newPassword},token)
      if (response) {
        toast.success('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setIsModalOpen(false);
      }
      console.log('Changing password with:', { currentPassword, newPassword, token });

    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error.message || 'Failed to change password.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl flex flex-col md:flex-row bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Sidebar: Profile Picture */}
        <div className="w-full md:w-1/3 bg-gray-900 p-6 flex flex-col items-center justify-center border-r border-gray-700">
          <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-cyan-500 shadow-lg">
            {preview || (profile && profile.profilePicture) ? (
              <img
                src={preview || profile!.profilePicture}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                <span className="text-cyan-400 font-bold text-lg">No Pic</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition duration-300 flex items-center justify-center">
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-cyan-400 opacity-0 hover:opacity-100 transition duration-300 text-sm font-semibold"
              >
                Change
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
          {selectedFile && (
            <button
              onClick={handleUpload}
              className="mt-4 bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-700 transition duration-300 text-sm font-semibold"
              disabled={loading}
            >
              {loading ? 'Uploading...' : 'Upload Now'}
            </button>
          )}
          <h2 className="mt-4 text-xl font-bold text-cyan-300">{profile?.name || 'Student'}</h2>
        </div>

        {/* Main Content: Profile Details */}
        <div className="w-full md:w-2/3 p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold text-white">Profile Details</h1>
            <div className="w-16 h-1 bg-cyan-500 mx-auto mt-2 rounded-full"></div>
          </div>
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <span className="text-cyan-400 font-semibold w-24">Name:</span>
              <input
                type="text"
                value={profile?.name || ''}
                readOnly
                className="flex-1 bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-cyan-400 font-semibold w-24">Email:</span>
              <input
                type="email"
                value={profile?.email || ''}
                readOnly
                className="flex-1 bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-cyan-400 font-semibold w-24">Phone:</span>
              <input
                type="tel"
                value={profile?.mobile || ''}
                readOnly
                className="flex-1 bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>
          <div className="mt-8 text-center space-x-4">
            <button
              onClick={() => navigate('/editProfile')}
              className="bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition duration-300 font-semibold"
            >
              Edit Profile
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition duration-300 font-semibold"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Modal for Change Password */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Change Password</h2>
            <div className="space-y-4">
              <div>
                <label className="text-cyan-400 font-semibold">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 mt-1"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="text-cyan-400 font-semibold">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 mt-1"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="text-cyan-400 font-semibold">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 mt-1"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword(''); // Reset confirm password on cancel
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                className="bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-700 transition duration-300"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;