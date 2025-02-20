import { FaGoogle } from 'react-icons/fa';

const SocialButtons: React.FC = () => {
  return (
    <div className="flex justify-center space-x-4 mt-4">
      <button className="bg-transparent border-2 border-gray-600 text-gray-600 rounded-full p-3 flex items-center space-x-2">
        <FaGoogle /> {/* Google icon */}
        <span>Signup with Google</span>
      </button>
    </div>
  );
};

export default SocialButtons;
