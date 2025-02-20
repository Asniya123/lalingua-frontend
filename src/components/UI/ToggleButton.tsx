interface ToggleButtonProps {
  isExisting: boolean;
  setIsExisting: React.Dispatch<React.SetStateAction<boolean>>;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ isExisting, setIsExisting }) => {
  return (
    <div className="flex justify-between mb-6">
      <button
        onClick={() => setIsExisting(true)}
        className={`w-1/2 py-2 rounded-l-lg text-center ${
          isExisting ? "bg-pink-500 text-white" : "bg-gray-200 text-gray-600"
        }`}
      >
        Existing
      </button>
      <button
        onClick={() => setIsExisting(false)}
        className={`w-1/2 py-2 rounded-r-lg text-center ${
          !isExisting ? "bg-pink-500 text-white" : "bg-gray-200 text-gray-600"
        }`}
      >
        New
      </button>
    </div>
  );
};

export default ToggleButton;
