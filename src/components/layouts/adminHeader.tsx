import { ReactNode, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../../components/admin/button";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropDown, setDropDown] = useState(false);

  const getTitle = () => {
    if (location.pathname.includes("/admin/users")) return "Manage Users";
    if (location.pathname.includes("/admin/categories")) return "Add Category";
    if (location.pathname.includes("/admin/listCategory")) return "List Category";
    if (location.pathname.includes("/admin/category/edit")) return "Edit Category";
    if (location.pathname.includes("/admin/addCourse")) return "Add Course";
    if (location.pathname.includes("/admin/reports")) return "Reports";
    if (location.pathname.includes("/admin/settings")) return "Settings";
    return "Admin Dashboard";
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-orange-500 p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-white text-2xl font-bold">{getTitle()}</div>
          <Button onClick={() => console.log("Logout logic here")} className="bg-white text-orange-500">
            Logout
          </Button>
        </div>
      </nav>

      {/* Sidebar + Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-1/4 bg-white shadow-lg h-screen p-6">
          <ul className="space-y-4">
            <li>
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="w-full text-left text-orange-500 hover:text-orange-600 font-semibold"
              >
                Dashboard
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/admin/userList")}
                className="w-full text-left text-orange-500 hover:text-orange-600 font-semibold"
              >
                Manage Users
              </button>
            </li>

            {/* Dropdown Section */}
            <li className="relative">
              <button
                className="w-full text-left text-orange-500 hover:text-orange-600 font-semibold"
                onClick={() => setDropDown(!dropDown)}
              >
                Manage Tutors ▼
              </button>

              {dropDown && (
                <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-300 shadow-lg rounded-lg z-50">
                  <div className="flex flex-col">
                    <button
                      className="px-4 py-2 text-left hover:bg-gray-100"
                      onClick={() => {
                        navigate("/admin/tutorList");
                        setDropDown(false);
                      }}
                    >
                      Tutor List
                    </button>
                    <button
                      className="px-4 py-2 text-left hover:bg-gray-100"
                      onClick={() => {
                        navigate("/admin/tutorManging");
                        setDropDown(false);
                      }}
                    >
                      Tutor Managing
                    </button>
                  </div>
                </div>
              )}
            </li>

            <li>
              <button
                onClick={() => navigate("/admin/listCategory")}
                className="w-full text-left text-orange-500 hover:text-orange-600 font-semibold"
              >
                Category
              </button>
            </li>
            
            <li>
              <button
                onClick={() => navigate("/admin/addCourse")}
                className="w-full text-left text-orange-500 hover:text-orange-600 font-semibold"
              >
                Course
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/admin/reports")}
                className="w-full text-left text-orange-500 hover:text-orange-600 font-semibold"
              >
                Reports
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/admin/settings")}
                className="w-full text-left text-orange-500 hover:text-orange-600 font-semibold"
              >
                Settings
              </button>
            </li>
          </ul>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
