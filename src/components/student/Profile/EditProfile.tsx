import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { updateStudentProfile } from "../../../redux/slice/studentSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";



const EditProfile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const profile = useSelector((state: RootState) => state.auth.student);
  const token = Cookies.get("userToken")||"";

  const [editProfile, setEditProfile] = useState({
    name: "",
    email: "",
    mobile: "",
  });

  useEffect(() => {
    if (profile) {
      setEditProfile({
        name: profile.name || "",
        email: profile.email || "",
        mobile: profile.mobile || "",
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditProfile({ ...editProfile, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async () => {
    try {
      await dispatch(updateStudentProfile({ token, profileData: editProfile }));
      toast.success("Profile updated successfully");
      navigate("/getProfile");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6">
      
      <div className="w-full max-w-lg bg-gray-800 rounded-xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-white">Edit Profile</h1>
          <div className="w-16 h-1 bg-cyan-500 mx-auto mt-2 rounded-full"></div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <div>
            <label className="block text-cyan-400 font-semibold mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={editProfile.name}
              onChange={handleInputChange}
              className="w-full bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-200"
            />
          </div>
          <div>
            <label className="block text-cyan-400 font-semibold mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={editProfile.email}
              onChange={handleInputChange}
              className="w-full bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-200"
            />
          </div>
          <div>
            <label className="block text-cyan-400 font-semibold mb-2">Phone</label>
            <input
              type="tel"
              name="mobile"
              value={editProfile.mobile}
              onChange={handleInputChange}
              className="w-full bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-200"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handleUpdateProfile}
              className="bg-cyan-600 text-white px-6 py-2 rounded-md hover:bg-cyan-700 transition duration-300 font-semibold"
            >
              Save
            </button>
            <button
              onClick={() => navigate("/getProfile")}
              className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition duration-300 font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;