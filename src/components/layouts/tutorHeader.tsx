import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearState } from '../../redux/slice/tutorSlice';
import { RootState } from '../../redux/store';
import Tutor from '../../interfaces/tutor';
import { FaTimes } from 'react-icons/fa';

interface TutorSidebarProps {
  onNavClick?: (path: string) => void; 
}

const TutorSidebar: React.FC<TutorSidebarProps> = ({ onNavClick }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const tutor = useSelector((state: RootState) => state.tutor.tutor) as Tutor | null; 
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    dispatch(clearState());
    navigate('/tutor/login');
  };

  const handleNavClick = (path: string) => {
    if (onNavClick) {
      onNavClick(path);
    }
    navigate(path);
    setIsMobileOpen(false); 
  };

  return (
    <div
      className={`w-64 bg-gray-800 shadow-lg p-4 rounded-lg transition-transform duration-300 ease-in-out ${
        isMobileOpen ? 'fixed inset-y-0 left-0 z-50 transform translate-x-0' : 'hidden md:block md:transform md:translate-x-0'
      }`}
    >
      
      <button
        onClick={() => setIsMobileOpen(false)}
        className="absolute top-4 right-4 text-white p-2 rounded-lg hover:bg-gray-700 md:hidden"
      >
        <FaTimes size={24} />
      </button>

      <div className="mb-6">
        <div className="flex items-center">
          {tutor?.profilePicture && (
            <img
              src={tutor.profilePicture}
              alt="Tutor Profile"
              className="rounded-full w-12 h-12 mr-3"
            />
          )}
          <span className="text-white font-medium">{tutor?.name || 'Tutor Name'}</span>
        </div>
      </div>

      <nav className="space-y-4">
        <button
          onClick={() => handleNavClick('/tutor/home')}
          className="w-full text-left px-4 py-3 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition"
        >
          Dashboard
        </button>
        <button
          onClick={() => handleNavClick('/tutor/getprofile')}
          className="w-full text-left px-4 py-3 bg-green-600 rounded-lg text-white hover:bg-green-700 transition"
        >
          Profile
        </button>
        <button
          onClick={() => handleNavClick('/tutor/listCourse')}
          className="w-full text-left px-4 py-3 bg-yellow-600 rounded-lg text-white hover:bg-yellow-700 transition"
        >
          Courses
        </button>
      
        <button
          onClick={() => handleNavClick('/tutor/chatPage')}
          className="w-full text-left px-4 py-3 bg-yellow-600 rounded-lg text-white hover:bg-yellow-700 transition"
        >
          Chat
        </button>
        
        
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-3 bg-gray-600 rounded-lg text-white hover:bg-gray-700 transition"
        >
          Logout
        </button>
      </nav>

      {/* Overlay for mobile (to close sidebar when clicking outside) */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden"
        />
      )}
    </div>
  );
};

export default TutorSidebar;