import { ReactNode, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../../components/admin/button";
import { useDispatch, useSelector } from "react-redux"; 
import { RootState } from "../../redux/store"; 
import { clearAdminData } from "../../redux/slice/adminSlice"; 
import adminAPI from "../../api/adminInstance";
import Cookies from "js-cookie"; 

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch(); 
  const [dropDown, setDropDown] = useState(false);
  const admin = useSelector((state: RootState) => state.admin);

  const getTitle = () => {
    if (location.pathname.includes("/admin/users")) return "Manage Users";
    if (location.pathname.includes("/admin/categories")) return "Add Category";
    if (location.pathname.includes("/admin/listCategory")) return "List Category";
    if (location.pathname.includes("/admin/category/edit")) return "Edit Category";
    if (location.pathname.includes("/admin/languages")) return "Add Language";
    if (location.pathname.includes("/admin/tutorList")) return "Tutor List";
    if (location.pathname.includes("/admin/tutorManaging")) return "Tutor Managing";
    if (location.pathname.includes("/admin/courseManaging")) return "Course Managing";
    if (location.pathname.includes("/admin/reports")) return "Reports";
    if (location.pathname.includes("/admin/settings")) return "Settings";
    return "Admin Dashboard";
  };

  const handleLogout = async () => {
    try {
      if (admin.accessToken) {
        await adminAPI.post("/logout", {}, {
          headers: {
            Authorization: `Bearer ${admin.accessToken}`,
          },
        });
      }

      // Clear Redux state
      dispatch(clearAdminData());

      // Clear cookies manually (as a fallback, since clearAdminData already does this)
      Cookies.remove("adminId", { path: "/" });
      Cookies.remove("accessToken", { path: "/" });
      Cookies.remove("refreshToken", { path: "/" });

      // Navigate to login page
      navigate("/admin/login");
    } catch (error) {
      console.error("Logout failed:", error);
      // Fallback: Clear state and cookies even if API call fails
      dispatch(clearAdminData());
      Cookies.remove("adminId", { path: "/" });
      Cookies.remove("accessToken", { path: "/" });
      Cookies.remove("refreshToken", { path: "/" });
      navigate("/admin/login");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-orange-500 p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-white text-2xl font-bold">{getTitle()}</div>
          <Button onClick={handleLogout} className="bg-white text-orange-500 hover:bg-orange-100">
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
                onClick={() => navigate("/admin/listLanguage")}
                className="w-full text-left text-orange-500 hover:text-orange-600 font-semibold"
              >
                Language
              </button>
            </li>
            

            <li>
              <button
                onClick={() => navigate("/admin/course")}
                className="w-full text-left text-orange-500 hover:text-orange-600 font-semibold"
              >
                Course Managing
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