import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../redux/store.js';
import { fetchTutorProfile, uploadProfilePicture, updateTutorProfile } from '../../../redux/slice/tutorSlice.js';
import Cookies from 'js-cookie'; 
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { changePassword, listCourses } from '../../../services/tutorAuth.js';
import { listLanguage} from '../../../services/adminAuth.js';
import type { ILanguage } from "../../../interfaces/admin";
import type { ICourse } from "../../../interfaces/tutor";

interface Tutor {
  is_blocked: boolean | null;
  name?: string;
  email?: string;
  mobile?: string;
  profilePicture?: string;
  qualification?: string;
  language?: string;
  country?: string;
  experience?: string;
  specialization?: string;
  dateOfBirth?: string;
  bio?: string;
}

const TutorProfile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const profile = useSelector((state: RootState) => state.tutor.tutor) as Tutor | null;
  const loading = useSelector((state: RootState) => state.tutor.loading);
  const error = useSelector((state: RootState) => state.tutor.error);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [editedProfile, setEditedProfile] = useState<Partial<Tutor>>({
    qualification: '',
    language: '',
    country: '',
    experience: '',
    specialization: '',
    dateOfBirth: '',
    bio: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get('tutorToken');
    if (token) {
      dispatch(fetchTutorProfile(token)).catch((err) => {
        console.error('Fetch profile error:', err);
        toast.error(err.message || 'Failed to fetch profile');
        Cookies.remove('tutorToken', { path: '/' });
        Cookies.remove('tutor', { path: '/' });
        navigate('/tutor/login');
      });
      getLanguagesData();
      fetchTutorCourses();
    } else {
      console.warn('No token found on mount, redirecting to login');
      navigate('/tutor/login');
    }
  }, [dispatch, navigate]);

  useEffect(() => {
    if (profile && profile.is_blocked) {
      const blockedMessage = 'Your account has been blocked by the admin. Please contact support.';
      toast.error(blockedMessage);
      Cookies.remove('tutorToken', { path: '/' });
      Cookies.remove('tutor', { path: '/' });
      navigate('/tutor/login');
    } else if (profile) {
      setEditedProfile({
        qualification: profile.qualification || '',
        language: profile.language || '',
        country: profile.country || '',
        experience: profile.experience || '',
        specialization: profile.specialization || '',
        dateOfBirth: profile.dateOfBirth || '',
        bio: profile.bio || ''
      });
    }
  }, [profile, navigate]);

  const getLanguagesData = async () => {
    try {
      const languageResponse = await listLanguage();
      if (
        languageResponse.success &&
        languageResponse.data &&
        Array.isArray(languageResponse.data.languages)
      ) {
        setLanguages(languageResponse.data.languages);
      } else {
        console.warn("No languages found or invalid response format:", languageResponse);
        toast.error("No languages available");
      }
    } catch (err) {
      console.error("Failed to fetch languages:", err);
    }
  };

  const fetchTutorCourses = async () => {
    try {
      const result = await listCourses(1, 10); // Fetch first page, up to 10 courses
      if (result.courses && Array.isArray(result.courses)) {
        setCourses(result.courses);
      } else {
        console.warn("No courses found or invalid response format:", result);
        toast.error("No courses available");
      }
    } catch (err) {
      console.error("Failed to fetch courses:", err);
      toast.error("Failed to fetch courses");
    }
  };

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
      const token = Cookies.get('tutorToken') || '';
      if (!token) {
        throw new Error('No token found. Please log in again.');
      }

      await dispatch(uploadProfilePicture({ token, file: selectedFile })).unwrap();
      toast.success('Profile picture updated successfully!');
      setPreview(null);
      setSelectedFile(null);
      dispatch(fetchTutorProfile(token));
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      toast.error(error.message || 'Failed to upload profile picture.');
      if (error.message === 'Your account has been blocked by the admin. Please contact support.') {
        Cookies.remove('tutorToken', { path: '/' });
        Cookies.remove('tutor', { path: '/' });
        navigate('/tutor/login');
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
      const token = Cookies.get('tutorToken') || '';
      if (!token) {
        throw new Error('No token found. Please log in again.');
      }

      await changePassword({ currentPassword, newPassword }, token);
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error.message || 'Failed to change password.');
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing && profile) {
      setEditedProfile({
        qualification: profile.qualification || '',
        language: profile.language || '',
        country: profile.country || '',
        experience: profile.experience || '',
        specialization: profile.specialization || '',
        dateOfBirth: profile.dateOfBirth || '',
        bio: profile.bio || ''
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const token = Cookies.get('tutorToken') || '';
      if (!token) {
        throw new Error('No token found. Please log in again.');
      }

      const updatedProfileData = {
        name: profile?.name || '',
        email: profile?.email || '',
        mobile: profile?.mobile || '',
        ...editedProfile
      };

      await dispatch(updateTutorProfile({ token, profileData: updatedProfileData })).unwrap();
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      dispatch(fetchTutorProfile(token));
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile.');
      if (error.message === 'Your account has been blocked by the admin. Please contact support.') {
        Cookies.remove('tutorToken', { path: '/' });
        Cookies.remove('tutor', { path: '/' });
        navigate('/tutor/login');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex flex-col">
      <div className="flex-1 flex p-6">
        <div className="flex-1">
          <div className="max-w-4xl mx-auto bg-gray-800 p-8 shadow-lg rounded-lg border-2 border-gray-700">
            {error && <p className="text-red-400 text-center mb-4">{error}</p>}

            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/3 bg-gray-900 p-6 rounded-lg border border-cyan-600 shadow-md flex flex-col items-center justify-center">
                <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg">
                  {preview || (profile && profile.profilePicture) ? (
                    <img
                      src={preview || profile!.profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                      <span className="text-blue-400 font-bold text-lg">No Pic</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition duration-300 flex items-center justify-center">
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer text-blue-400 opacity-0 hover:opacity-100 transition duration-300 text-sm font-semibold"
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
                    className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition duration-300 text-sm font-semibold"
                    disabled={loading}
                  >
                    {loading ? 'Uploading...' : 'Upload Now'}
                  </button>
                )}
                <h2 className="mt-4 text-xl font-bold text-cyan-300">{profile?.name || 'Tutor'}</h2>
              </div>

              <div className="w-full md:w-2/3 p-6">
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Basic Information</h3>
                  <div className="flex items-center space-x-4">
                    <span className="text-green-400 font-semibold w-32">Name:</span>
                    <input
                      type="text"
                      value={profile?.name || ''}
                      readOnly
                      className="flex-1 bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-green-400 font-semibold w-32">Email:</span>
                    <input
                      type="email"
                      value={profile?.email || ''}
                      readOnly
                      className="flex-1 bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-green-400 font-semibold w-32">Phone:</span>
                    <input
                      type="tel"
                      value={profile?.mobile || ''}
                      readOnly
                      className="flex-1 bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-6 mt-8">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-white mb-4">Additional Information</h3>
                    <button
                      onClick={handleEditToggle}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition duration-300"
                    >
                      {isEditing ? 'Cancel' : 'Edit'}
                    </button>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-green-400 font-semibold w-32">Qualification:</span>
                    {isEditing ? (
                      <input
                        type="text"
                        name="qualification"
                        value={editedProfile.qualification || ''}
                        onChange={handleInputChange}
                        className="flex-1 bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <input
                        type="text"
                        value={profile?.qualification || 'Not specified'}
                        readOnly
                        className="flex-1 bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-green-400 font-semibold w-32">Language:</span>
                    {isEditing ? (
                      <select
                        name="language"
                        value={editedProfile.language || ''}
                        onChange={handleInputChange}
                        className="flex-1 bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a language</option>
                        {languages.map((lang) => (
                          <option key={lang._id} value={lang._id}>
                            {lang.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={
                          profile?.language
                            ? languages.find((lang) => lang._id === profile.language)?.name || profile.language
                            : 'Not specified'
                        }
                        readOnly
                        className="flex-1 bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-green-400 font-semibold w-32">Country:</span>
                    {isEditing ? (
                      <input
                        type="text"
                        name="country"
                        value={editedProfile.country || ''}
                        onChange={handleInputChange}
                        className="flex-1 bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <input
                        type="text"
                        value={profile?.country || 'Not specified'}
                        readOnly
                        className="flex-1 bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-green-400 font-semibold w-32">Experience:</span>
                    {isEditing ? (
                      <input
                        type="text"
                        name="experience"
                        value={editedProfile.experience || ''}
                        onChange={handleInputChange}
                        className="flex-1 bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <input
                        type="text"
                        value={profile?.experience || 'Not specified'}
                        readOnly
                        className="flex-1 bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-green-400 font-semibold w-32">Specialization:</span>
                    {isEditing ? (
                      <input
                        type="text"
                        name="specialization"
                        value={editedProfile.specialization || ''}
                        onChange={handleInputChange}
                        className="flex-1 bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <input
                        type="text"
                        value={profile?.specialization || 'Not specified'}
                        readOnly
                        className="flex-1 bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-green-400 font-semibold w-32">Date of Birth:</span>
                    {isEditing ? (
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={editedProfile.dateOfBirth || ''}
                        onChange={handleInputChange}
                        className="flex-1 bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <input
                        type="text"
                        value={profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Not specified'}
                        readOnly
                        className="flex-1 bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                  <div className="flex items-start space-x-4">
                    <span className="text-green-400 font-semibold w-32">Bio:</span>
                    {isEditing ? (
                      <textarea
                        name="bio"
                        value={editedProfile.bio || ''}
                        onChange={handleInputChange}
                        className="flex-1 bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                      />
                    ) : (
                      <textarea
                        value={profile?.bio || 'Not specified'}
                        readOnly
                        className="flex-1 bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                      />
                    )}
                  </div>
                  {isEditing && (
                    <div className="flex justify-end">
                      <button
                        onClick={handleSave}
                        className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition duration-300 font-semibold"
                        disabled={loading}
                      >
                        {loading ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Courses Section */}
                <div className="space-y-6 mt-8">
                  <h3 className="text-xl font-semibold text-white mb-4">Your Courses</h3>
                  {courses.length === 0 ? (
                    <div className="text-center py-6 bg-gray-700 rounded-lg">
                      <p className="text-gray-400">No courses added yet.</p>
                      <button
                        onClick={() => navigate('/tutor/addCourse')}
                        className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition duration-300 font-semibold"
                      >
                        Add a Course
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {courses.map((course) => (
                        <div
                          key={course._id}
                          className="bg-gray-900 p-4 rounded-lg border border-gray-600 flex items-center space-x-4"
                        >
                          {course.imageUrl ? (
                            <img
                              src={course.imageUrl}
                              alt={course.courseTitle}
                              className="w-20 h-20 object-cover rounded-md"
                            />
                          ) : (
                            <div className="w-20 h-20 bg-gray-600 flex items-center justify-center rounded-md">
                              <span className="text-gray-400 text-sm">No Image</span>
                            </div>
                          )}
                          <div>
                            <h4 className="text-white font-semibold">{course.courseTitle}</h4>
                            <button
                              onClick={() => navigate(`/tutor/editCourse/${course._id}`)}
                              className="mt-2 text-blue-400 hover:text-blue-500 text-sm"
                            >
                              View/Edit Course
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-8 text-center space-x-4">
                  <button
                    onClick={() => navigate('/tutor/editProfile')}
                    className="bg-yellow-600 text-white px-6 py-3 rounded-md hover:bg-yellow-700 transition duration-300 font-semibold"
                  >
                    Edit Basic Info
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
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Change Password</h2>
            <div className="space-y-4">
              <div>
                <label className="text-green-400 font-semibold">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="text-green-400 font-semibold">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="text-green-400 font-semibold">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
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
                  setConfirmPassword('');
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
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

export default TutorProfile;