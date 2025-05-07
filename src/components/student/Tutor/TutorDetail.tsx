import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchTutorById, getLanguages } from '../../../services/userAuth';
import { fetch_room } from '../../../services/chatService'; // Import fetch_room
import type { ILanguage } from '../../../interfaces/admin';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store'; // Import Redux store types

interface Tutor {
  _id?: string;
  is_blocked: boolean | null;
  name?: string;
  profilePicture?: string;
  qualification?: string;
  language?: string;
  country?: string;
  experience?: string;
  specialization?: string;
  dateOfBirth?: string;
  bio?: string;
}

const TutorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const user = useSelector((state: RootState) => state.auth.student); // Get current user from Redux

  useEffect(() => {
    getLanguagesData();
    fetchTutor();
  }, [id]);

  const getLanguagesData = async () => {
    try {
      const response = await getLanguages();
      if (response.success && Array.isArray(response.data)) {
        setLanguages(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch languages:', err);
    }
  };

  const fetchTutor = async () => {
    if (!id) {
      setError('Tutor ID is missing');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await fetchTutorById(id);
      if (response.success && response.data) {
        setTutor(response.data);
      } else {
        setError('Tutor not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tutor details');
      toast.error(err.message || 'Failed to fetch tutor details');
    } finally {
      setLoading(false);
    }
  };

  // const handleChatClick = async () => {
  //   if (!user?._id || !id) {
  //     toast.error('User or Tutor ID is missing');
  //     return;
  //   }

  //   try {
      
  //     const response = await fetch_room(id, user._id);
  //     if (response.success && response.room?._id) {
       
  //       navigate(`/chat/${response.room._id}`);
  //     } else {
  //       toast.error('Failed to initialize chat');
  //     }
  //   } catch (err: any) {
  //     toast.error(err.message || 'Failed to start chat');
  //   }
  // };

  // const handleBookingClick = () => {
  //   console.log('Booking button clicked');
  //   navigate(`/booking/${id}`);
  // };

  const selectedLanguageName = tutor?.language
    ? languages.find((lang) => lang._id === tutor.language)?.name || tutor.language
    : 'Not specified';

  if (loading) return <div className="min-h-screen bg-[#f8e8e8] flex items-center justify-center text-gray-600">Loading...</div>;
  if (error) return <div className="min-h-screen bg-[#f8e8e8] flex items-center justify-center text-red-500">{error}</div>;
  if (!tutor) return <div className="min-h-screen bg-[#f8e8e8] flex items-center justify-center text-gray-600">No tutor data available</div>;

  return (
    <div className="min-h-screen bg-[#f8e8e8] p-6">
      <div className="max-w-6xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Tutor Details</h1>
        <h2 className="text-lg text-gray-600 mb-8">Meet {tutor.name || 'Unnamed Tutor'}</h2>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3 flex flex-col items-center">
            <div className="w-48 h-48 rounded-full overflow-hidden border-2 border-white shadow-lg mb-4">
              {tutor.profilePicture ? (
                <img
                  src={tutor.profilePicture}
                  alt={tutor.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 font-bold text-3xl">{tutor.name?.charAt(0) || 'T'}</span>
                </div>
              )}
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-4">{tutor.name || 'Unnamed Tutor'}</h3>
            <div className="flex flex-col gap-3 w-full max-w-xs">
              {/* <button 
                onClick={handleChatClick}
                className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors shadow-md"
              >
                Chat
              </button> */}
              {/* <button 
                onClick={handleBookingClick}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
              >
                Booking Session
              </button> */}
            </div>
          </div>

          <div className="w-full md:w-2/3 p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Additional Details</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <span className="text-green-600 font-semibold w-32">Qualification:</span>
                <span className="text-gray-700">{tutor.qualification || 'Not specified'}</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-600 font-semibold w-32">Language:</span>
                <span className="text-gray-700">{selectedLanguageName}</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-600 font-semibold w-32">Country:</span>
                <span className="text-gray-700">{tutor.country || 'Not specified'}</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-600 font-semibold w-32">Experience:</span>
                <span className="text-gray-700">{tutor.experience || 'Not specified'}</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-600 font-semibold w-32">Specialization:</span>
                <span className="text-gray-700">{tutor.specialization || 'Not specified'}</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-600 font-semibold w-32">Date of Birth:</span>
                <span className="text-gray-700">{tutor.dateOfBirth ? new Date(tutor.dateOfBirth).toLocaleDateString() : 'Not specified'}</span>
              </div>
              <div className="flex items-start">
                <span className="text-green-600 font-semibold w-32">Bio:</span>
                <p className="text-gray-700">{tutor.bio || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorDetail;