import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../redux/store';
import { useDispatch, useSelector } from 'react-redux';
import Tutor from '../../interfaces/tutor';
import TutorLayout from '../../components/layouts/tutorHeader'
import { clearState } from '../../redux/slice/tutorSlice';

const TutorHome: React.FC = () => {
  const navigate = useNavigate();
  const dispatch=useDispatch()
  const tutor = useSelector((state: RootState) => state.tutor.tutor)
  console.log(tutor, "++++++++++++++++++++++++++++++++")
  const handleLogout=()=>{
    dispatch(clearState())
    navigate('/tutor/login')
  }
  if ((tutor as Tutor).status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-200">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-semibold text-yellow-500">Account Pending</h2>
          <p className="text-gray-600 mt-2">Your account is under review. Please wait for approval.</p>
        </div>
      </div>
    )
  } else if ( (tutor as Tutor).status === 'rejected') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-200">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-semibold text-red-500">Account Rejected</h2>
          <p className="text-gray-600 mt-2">Your account has been rejected. Please contact support.</p>
        </div>
      </div>
    )
  } else {
    return (
      <TutorLayout>
      <div className="min-h-screen bg-gray-100 flex">
        {/* Sidebar */}
        {/* <div className="w-64 bg-blue-500 text-white p-5">
          <h2 className="text-3xl font-semibold text-center mb-8">Tutor Dashboard</h2>
          <ul>
            <li className="mb-4 text-xl cursor-pointer hover:text-blue-300" onClick={() => navigate('/dashboard')}>Dashboard</li>
            <li className="mb-4 text-xl cursor-pointer hover:text-blue-300" onClick={() => navigate('/students')}>Students</li>
            <li className="mb-4 text-xl cursor-pointer hover:text-blue-300" onClick={() => navigate('/lessons')}>Lessons</li>
            <li className="mb-4 text-xl cursor-pointer hover:text-blue-300" onClick={() => navigate('/resources')}>Resources</li>
            <li className="mt-8 text-xl cursor-pointer hover:text-blue-300" onClick={() => navigate('/settings')}>Settings</li>
          </ul>
        </div> */}

        {/* Main Content */}
        <div className="flex-1 p-10">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">Welcome,{tutor?.name}</h1>
            <button className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600" onClick={handleLogout}>Logout</button>
          </div>

          {/* Upcoming Lessons */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Upcoming Lessons</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-800">Lesson 1: English Basics</h3>
                <p className="text-gray-600">Student: John Doe</p>
                <p className="text-gray-600">Time: 10:00 AM</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-800">Lesson 2: Spanish Vocabulary</h3>
                <p className="text-gray-600">Student: Jane Smith</p>
                <p className="text-gray-600">Time: 2:00 PM</p>
              </div>
            </div>
          </section>

          {/* Student Progress */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Student Progress</h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-800">John Doe</h3>
              <p className="text-gray-600">Progress: 80%</p>
              <div className="mt-2">
                <div className="bg-blue-200 h-2 rounded-full w-4/5"></div>
              </div>
            </div>
          </section>

          {/* Tools and Resources */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Tools and Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-800">Lesson Plan</h3>
                <button className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">
                  View Plan
                </button>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-800">Student Feedback</h3>
                <button className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">
                  View Feedback
                </button>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-800">Language Tools</h3>
                <button className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">
                  Explore Tools
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
      </TutorLayout>
    );
  }
};

export default TutorHome;
