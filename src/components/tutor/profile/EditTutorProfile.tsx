import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../redux/store';
import { updateTutorProfile } from '../../../redux/slice/tutorSlice';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface Tutor {
  name?: string;
  email?: string;
  mobile?: string;
  profilePicture?: string;
  documents?: string; // Added documents field
}

const EditTutorProfile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const profile = useSelector((state: RootState) => state.tutor.tutor) as Tutor | null;
  const token = Cookies.get('tutorToken') || '';
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [editProfile, setEditProfile] = useState<Tutor>({
    name: '',
    email: '',
    mobile: '',
    documents: '',
  });

  useEffect(() => {
    if (profile) {
      setEditProfile({
        name: profile.name || '',
        email: profile.email || '',
        mobile: profile.mobile || '',
        documents: profile.documents || '',
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditProfile({ ...editProfile, [e.target.name]: e.target.value });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      setEditProfile((prev) => ({ ...prev, documents: file.name }));
    }
  };

  const handleUpdateProfile = async () => {
    try {
      if (!token) {
        throw new Error('No token found. Please log in again.');
      }

      const profileData = new FormData();
      profileData.append('name', editProfile.name || '');
      profileData.append('email', editProfile.email || '');
      profileData.append('mobile', editProfile.mobile || '');
      if (selectedFile) {
        profileData.append('documents', selectedFile);
      } else {
        profileData.append('documents', editProfile.documents || '');
      }

      await dispatch(updateTutorProfile({ token, profileData })).unwrap();
      toast.success('Profile updated successfully');
      setSelectedFile(null);
      navigate('/tutor/getProfile');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      const errorMessage = error.message || 'Failed to update profile';
      toast.error(errorMessage);
      if (errorMessage.includes('Invalid token') || errorMessage.includes('Token expired')) {
        Cookies.remove('tutorToken');
        Cookies.remove('tutor');
        navigate('/tutor/login');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex flex-col">
      <div className="flex-1 flex p-6">
        {/* Profile Form */}
        <div className="flex-1">
          <div className="max-w-lg mx-auto bg-gray-800 p-8 shadow-lg rounded-lg border-2 border-gray-700">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-extrabold text-yellow-400">Edit Tutor Profile</h1>
              <div className="w-16 h-1 bg-green-500 mx-auto mt-2 rounded-full"></div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-cyan-400 font-semibold mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={editProfile.name}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-200"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-cyan-400 font-semibold mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editProfile.email}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-200"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-cyan-400 font-semibold mb-2">Phone</label>
                <input
                  type="tel"
                  name="mobile"
                  value={editProfile.mobile}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-200"
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <label className="block text-cyan-400 font-semibold mb-2">Document</label>
                {editProfile.documents && !selectedFile ? (
                  <div className="flex items-center space-x-4">
                    <a
                      href={editProfile.documents}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-500 underline"
                    >
                      View Current Document
                    </a>
                  </div>
                ) : (
                  <span className="text-gray-400">
                    {selectedFile ? selectedFile.name : 'No document uploaded'}
                  </span>
                )}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="w-full bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-200 mt-2"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-between mt-8">
                <button
                  onClick={handleUpdateProfile}
                  className="bg-cyan-600 text-white px-6 py-2 rounded-md hover:bg-cyan-700 transition duration-300 font-semibold"
                >
                  Save
                </button>
                <button
                  onClick={() => navigate('/tutor/getProfile')}
                  className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition duration-300 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTutorProfile;