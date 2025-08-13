import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { clearAdminData } from "../../redux/slice/adminSlice";
import adminAPI from "../../api/adminInstance";
import Cookies from "js-cookie";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarProvider,
  SidebarInset,
} from "../UI/SideBar";
import { Home, Users, Book, FileText, Settings } from "lucide-react";
import Logo from "../../assets/Logo.png"; // Import logo if in src/assets

interface AdminLayoutProps {
  children: ReactNode;
}

interface SidebarItem {
  title: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const admin = useSelector((state: RootState) => state.admin);

  const sidebarItems: SidebarItem[] = [
    { title: "Dashboard", path: "/admin/dashboard", icon: Home, isActive: location.pathname === "/admin/dashboard" },
    { title: "Manage Users", path: "/admin/userList", icon: Users, isActive: location.pathname === "/admin/userList" },
    { title: "Tutor List", path: "/admin/tutorList", icon: Users, isActive: location.pathname === "/admin/tutorList" },
    { title: "Tutor Managing", path: "/admin/tutorManging", icon: Users, isActive: location.pathname === "/admin/tutorManging" },
    {
      title: "Category",
      path: "/admin/listCategory",
      icon: Book,
      isActive: location.pathname === "/admin/listCategory" || location.pathname.includes("/admin/category/edit") || location.pathname.includes("/admin/categories"),
    },
    {
      title: "Language",
      path: "/admin/listLanguage",
      icon: Book,
      isActive: location.pathname === "/admin/listLanguage" || location.pathname.includes("/admin/languages"),
    },
    {
      title: "Course Managing",
      path: "/admin/course",
      icon: Book,
      isActive: location.pathname === "/admin/course" || location.pathname.includes("/admin/courseManaging"),
    },
    { title: "Reports", path: "/admin/reports", icon: FileText, isActive: location.pathname === "/admin/reports" },
    { title: "Settings", path: "/admin/settings", icon: Settings, isActive: location.pathname === "/admin/settings" },
  ];

  const getTitle = () => {
    if (location.pathname.includes("/admin/users")) return "Manage Users";
    if (location.pathname.includes("/admin/categories")) return "Add Category";
    if (location.pathname.includes("/admin/listCategory")) return "List Category";
    if (location.pathname.includes("/admin/category/edit")) return "Edit Category";
    if (location.pathname.includes("/admin/languages")) return "Add Language";
    if (location.pathname.includes("/admin/tutorList")) return "Tutor List";
    if (location.pathname.includes("/admin/tutorManging")) return "Tutor Managing";
    if (location.pathname.includes("/admin/courseManaging")) return "Course Managing";
    if (location.pathname.includes("/admin/reports")) return "Reports";
    if (location.pathname.includes("/admin/settings")) return "Settings";
    return "Admin Dashboard";
  };

  const handleLogout = async () => {
    try {
      if (admin.accessToken) {
        await adminAPI.post("/logout", {}, { headers: { Authorization: `Bearer ${admin.accessToken}` } });
      }
      dispatch(clearAdminData());
      Cookies.remove("adminId", { path: "/" });
      Cookies.remove("accessToken", { path: "/" });
      Cookies.remove("refreshToken", { path: "/" });
      navigate("/admin/login");
    } catch (error) {
      console.error("Logout failed:", error);
      dispatch(clearAdminData());
      Cookies.remove("adminId", { path: "/" });
      Cookies.remove("accessToken", { path: "/" });
      Cookies.remove("refreshToken", { path: "/" });
      navigate("/admin/login");
    }
  };

  return (
    <SidebarProvider>
      <Sidebar variant="inset" className="w-64 bg-white shadow-lg">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <div className="flex items-center gap-2 p-2">
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <img
                      src={Logo}
                      alt="Lingua Logo"
                      className="h-12 w-16 object-contain"
                    />
                  </div>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Platform Management</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {sidebarItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={item.isActive}
                      onClick={() => navigate(item.path)}
                      className="flex items-center gap-2 text-orange-500 hover:text-orange-600 font-semibold"
                    >
                      <div>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                onClick={handleLogout}
                className="flex items-center gap-2 text-orange-500 hover:text-orange-600 font-semibold"
              >
                <span>Log out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <nav className="bg-orange-500 p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <div className="text-white text-2xl font-bold flex items-center gap-2">
              {location.pathname === "/admin/dashboard" && <Home className="size-6" />}
              {location.pathname.includes("/admin/users") && <Users className="size-6" />}
              {location.pathname.includes("/admin/tutorList") && <Users className="size-6" />}
              {location.pathname.includes("/admin/tutorManging") && <Users className="size-6" />}
              {location.pathname.includes("/admin/listCategory") && <Book className="size-6" />}
              {location.pathname.includes("/admin/category/edit") && <Book className="size-6" />}
              {location.pathname.includes("/admin/languages") && <Book className="size-6" />}
              {location.pathname.includes("/admin/courseManaging") && <Book className="size-6" />}
              {location.pathname.includes("/admin/reports") && <FileText className="size-6" />}
              {location.pathname.includes("/admin/settings") && <Settings className="size-6" />}
              {getTitle()}
            </div>
          </div>
        </nav>
        <main className="flex-1 p-0">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminLayout;