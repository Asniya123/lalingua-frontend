import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import Tutor from '../../interfaces/tutor';
import { clearState } from '../../redux/slice/tutorSlice';
import TutorSidebar from '../../components/layouts/tutorHeader'; // Import the sidebar

const TutorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const tutor = useSelector((state: RootState) => state.tutor.tutor) as Tutor | null;

  const handleLogout = () => {
    dispatch(clearState());
    navigate('/tutor/login');
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if ((tutor as Tutor).status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl text-center border border-yellow-500/30">
          <h2 className="text-3xl font-bold text-yellow-400">Account Pending</h2>
          <p className="text-gray-300 mt-3 text-lg">Your account is under review. Please wait for approval.</p>
        </div>
      </div>
    );
  } else if ((tutor as Tutor).status === 'rejected') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl text-center border border-red-500/30">
          <h2 className="text-3xl font-bold text-red-400">Account Rejected</h2>
          <p className="text-gray-300 mt-3 text-lg">Your account has been rejected. Please contact support.</p>
        </div>
      </div>
    );
  } else {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 via-purple-900 to-indigo-900 flex flex-col">
       
        <div className="flex-1 flex p-6">
      

          {/* Dashboard Content */}
          <div className="flex-1">
            <div className="bg-gray-800 p-8 shadow-lg rounded-lg border-2 border-gray-700">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-white">Tutor Dashboard</h2>
                <button
                  onClick={() => navigate('/tutor/add-course')}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                >
                  Add New Course
                </button>
              </div>

              {loading && <p className="text-blue-400 text-center">Loading courses...</p>}
              {error && <p className="text-red-400 text-center">{error}</p>}

              {/* Additional Dashboard Widgets */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-600 p-6 rounded-lg shadow-md border border-green-500">
                  <h3 className="text-xl font-semibold text-white mb-2">Student Progress</h3>
                  <p className="text-gray-200">85% of students completed last week’s lessons.</p>
                  <button
                    onClick={() => navigate('/tutor/student-progress')}
                    className="mt-4 bg-white text-green-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    View Details
                  </button>
                </div>
                <div className="bg-yellow-600 p-6 rounded-lg shadow-md border border-yellow-500">
                  <h3 className="text-xl font-semibold text-white mb-2">Notifications</h3>
                  <p className="text-gray-200">3 new enrollments today!</p>
                  <button
                    onClick={() => navigate('/tutor/notifications')}
                    className="mt-4 bg-white text-yellow-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    View All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default TutorDashboard;