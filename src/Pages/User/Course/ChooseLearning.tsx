import React from 'react';

const ChooseLearning = () => {
  return (
    <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center p-4">
      {/* Header with character and speech bubble */}
      <div className="flex items-center mb-8">
        <div className="relative">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
            {/* Character placeholder - you can replace with actual image */}
            <span className="text-gray-500">👩</span>
          </div>
          <div className="absolute -top-2 -right-2 w-0 h-0 border-l-[20px] border-l-transparent border-b-[30px] border-b-white border-r-[20px] border-r-transparent"></div>
          <div className="absolute top-0 right-0 bg-white p-2 rounded shadow-md text-red-500 text-sm">
            Why are you learning English?
          </div>
        </div>
      </div>

      {/* Buttons container */}
      <div className="w-full max-w-md space-y-4">
        {/* Button 1 */}
        <button className="w-full bg-green-700 text-white p-4 rounded-lg flex items-center justify-start space-x-3 hover:bg-green-600 transition-colors">
          <span className="text-2xl">🧠</span>
          <span>Spend time productively</span>
        </button>

        {/* Button 2 */}
        <button className="w-full bg-green-700 text-white p-4 rounded-lg flex items-center justify-start space-x-3 hover:bg-green-600 transition-colors">
          <span className="text-2xl">✈️</span>
          <span>Prepare for travel</span>
        </button>

        {/* Button 3 */}
        <button className="w-full bg-green-700 text-white p-4 rounded-lg flex items-center justify-start space-x-3 hover:bg-green-600 transition-colors">
          <span className="text-2xl">📚</span>
          <span>Support my education</span>
        </button>

        {/* Button 4 */}
        <button className="w-full bg-green-700 text-white p-4 rounded-lg flex items-center justify-start space-x-3 hover:bg-green-600 transition-colors">
          <span className="text-2xl">🤡</span>
          <span>Just for fun</span>
        </button>

        {/* Button 5 */}
        <button className="w-full bg-green-700 text-white p-4 rounded-lg flex items-center justify-start space-x-3 hover:bg-green-600 transition-colors">
          <span className="text-2xl">👥</span>
          <span>Connect with peoples</span>
        </button>

        {/* Button 6 */}
        <button className="w-full bg-green-700 text-white p-4 rounded-lg flex items-center justify-start space-x-3 hover:bg-green-600 transition-colors">
          <span className="text-2xl">🚀</span>
          <span>Boost my career</span>
        </button>
      </div>
    </div>
  );
};

export default ChooseLearning;