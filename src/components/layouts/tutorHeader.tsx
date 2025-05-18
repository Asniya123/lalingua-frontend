import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearState } from '../../redux/slice/tutorSlice';
import { RootState } from '../../redux/store';
import Tutor from '../../interfaces/tutor';
import {
  FaTimes,
  FaChalkboardTeacher,
  FaUser,
  FaBook,
  FaComments,
  FaSignOutAlt,
} from 'react-icons/fa';

interface TutorSidebarProps {
  onNavClick?: (path: string) => void;
}

const TutorSidebar: React.FC<TutorSidebarProps> = ({ onNavClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
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

  const navItems = [
    { path: '/tutor/home', label: 'Dashboard', icon: <FaChalkboardTeacher /> },
    { path: '/tutor/getprofile', label: 'Profile', icon: <FaUser /> },
    { path: '/tutor/listCourse', label: 'Courses', icon: <FaBook /> },
    { path: '/tutor/chatPage', label: 'Chat', icon: <FaComments /> },
  ];

  return (
    <>
      <div
        className={`w-64 text-black shadow-xl p-6 rounded-r-lg transition-transform duration-300 ease-in-out z-50 ${
          isMobileOpen
            ? 'fixed inset-y-0 left-0 transform translate-x-0'
            : 'hidden md:block md:translate-x-0'
        }`}
        style={{ backgroundColor: '#8C2C2C' }}
      >
        <button
          onClick={() => setIsMobileOpen(false)}
          className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-gray-700 md:hidden"
        >
          <FaTimes size={20} />
        </button>

        <div className="mb-8 flex items-center space-x-4 text-white">
          {tutor?.profilePicture && (
            <img
              src={tutor.profilePicture}
              alt="Tutor Profile"
              className="w-12 h-12 rounded-full"
            />
          )}
          <span className="text-lg font-semibold">{tutor?.name || 'Tutor Name'}</span>
        </div>

        <nav className="flex flex-col gap-3">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition text-black`}
              style={{
                backgroundColor:
                  location.pathname === item.path ? '#AA0404' : '#E8D7D7',
                color: location.pathname === item.path ? 'white' : 'black',
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 rounded-lg transition text-black"
            style={{ backgroundColor: '#E8D7D7' }}
          >
            <FaSignOutAlt />
            Logout
          </button>
        </nav>
      </div>

      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-40"
        />
      )}
    </>
  );
};

export default TutorSidebar;
