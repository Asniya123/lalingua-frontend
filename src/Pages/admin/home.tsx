import { useNavigate } from "react-router-dom";
import { useState } from "react";
import AdminLayout from "../../components/layouts/adminHeader";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [dropDown, setDropDown] = useState(false);

  const handleLogout = () => {
    // Clear admin data and navigate to login
    localStorage.clear();
    navigate("/admin/login");
  };

  return (
    <AdminLayout>
      {/* Main Content */}
      <main className="w-3/4 p-6">
        <h1 className="text-2xl font-bold mb-4">Welcome to the Admin Dashboard</h1>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-700">Total Users</h2>
            <p className="text-2xl font-bold text-orange-500">1,245</p>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-700">Active Sessions</h2>
            <p className="text-2xl font-bold text-orange-500">58</p>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-700">Reports</h2>
            <p className="text-2xl font-bold text-orange-500">32</p>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-700">Revenue</h2>
            <p className="text-2xl font-bold text-orange-500">$12,340</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-6">
          <h2 className="text-lg font-bold mb-2">Recent Activities</h2>
          <div className="bg-white shadow rounded-lg p-4">
            <ul className="space-y-3">
              <li className="text-gray-700">User JohnDoe created a new post.</li>
              <li className="text-gray-700">Admin approved 15 pending requests.</li>
              <li className="text-gray-700">System generated a monthly report.</li>
            </ul>
          </div>
        </div>
      </main>
    </AdminLayout>
  );
}
