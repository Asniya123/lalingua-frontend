import { useState } from "react";
import AdminLayout from "../layouts/adminHeader";

const AddCourse = () => {
  const [courseImage, setCourseImage] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setCourseImage(imageURL);
    }
  };

  return (
    <AdminLayout>
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#d2a9a9] p-6">
      {/* <button className="bg-teal-600 text-white px-6 py-2 rounded-md mb-6">
        Add New Course
      </button> */}

      <div className="bg-[#deb4b4] p-8 rounded-lg shadow-md w-full max-w-3xl">
        <h2 className="text-2xl font-bold mb-4">Add New Course</h2>

        <div className="grid grid-cols-2 gap-4">
          {/* Left Side: Form Fields */}
          <div>
            <label className="block font-semibold">Course Title</label>
            <input type="text" className="w-full p-2 border rounded-md mb-3" />

            <label className="block font-semibold">Course Category</label>
            <input type="text" className="w-full p-2 border rounded-md mb-3" />

            <label className="block font-semibold">Regular Price</label>
            <input type="text" className="w-full p-2 border rounded-md mb-3" />

            <label className="block font-semibold">Offer Percentage</label>
            <input type="text" className="w-full p-2 border rounded-md mb-3" />

            <label className="block font-semibold">Features</label>
            <textarea className="w-full p-2 border rounded-md mb-3 h-20"></textarea>
          </div>

          {/* Right Side: Image Upload */}
          <div className="flex flex-col items-center">
            <span className="block font-semibold mb-2">Course Image</span>
            <div className="w-40 h-40 border-2 border-gray-300 flex items-center justify-center mb-3 bg-white">
              {courseImage ? (
                <img src={courseImage} alt="Course" className="w-full h-full object-cover rounded-md" />
              ) : (
                <span className="text-gray-500">No Image</span>
              )}
            </div>

            <label className="bg-green-600 text-white px-4 py-2 rounded-md cursor-pointer">
              Add Image
              <input type="file" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>
        </div>

        <button className="bg-teal-600 text-white px-6 py-2 rounded-md mt-6 w-full">
          Add Course Lessons
        </button>
      </div>
    </div>
    </AdminLayout>
  );
};

export default AddCourse;
