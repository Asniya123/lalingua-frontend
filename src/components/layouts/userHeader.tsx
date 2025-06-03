import { NavLink, useNavigate } from "react-router-dom";
import { Globe, User, ChevronDown, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useDispatch, useSelector } from "react-redux";
import { clearStudent } from "../../redux/slice/studentSlice";
import { Badge } from "@nextui-org/react";
import INotification from "../../interfaces/notification";
import axios from "axios";
import Notifications from "../notification/Notification";
import { RootState } from "../../redux/store";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Courses", href: "/course" },
  { name: "About Us", href: "/about" },
  { name: "Tutors", href: "/tutors" },
  { name: "Contact", href: "/contact" },
];

export function UserHeader() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.student);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isGoogleSignIn, setIsGoogleSignIn] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true); // Ensure router context is available
  }, []);

  const checkAuthStatus = () => {
    const userToken = Cookies.get("userToken");
    const googleAuth = localStorage.getItem("googleAuth");
    setIsLoggedIn(!!userToken);
    setIsGoogleSignIn(!!googleAuth);
  };

  useEffect(() => {
    checkAuthStatus();
    const handleStorageChange = () => checkAuthStatus();
    window.addEventListener("storage", handleStorageChange);

    if (isLoggedIn || isGoogleSignIn) {
      const fetchNotifications = async () => {
        try {
          const response = await axios.get("/api/notifications", {
            headers: { Authorization: `Bearer ${Cookies.get("userToken")}` },
          });
          const fetchedNotifications = response.data.notifications || [];
          setNotifications(fetchedNotifications);
          setUnreadCount(fetchedNotifications.filter((n: INotification) => !n.isRead).length);
        } catch (error) {
          console.error("Error fetching notifications:", error);
        }
      };
      fetchNotifications();
    }

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [isLoggedIn, isGoogleSignIn]);

  const markNotificationRead = async (notificationId: string) => {
    try {
      await axios.patch(
        `/api/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${Cookies.get("userToken")}` } }
      );
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
    } catch (error) {
      console.error("Error marking notification read:", error);
    }
  };

  const handleNotificationClick = () => {
    if (!isReady) return;
    setNotificationDropdownOpen(!notificationDropdownOpen);
    setDropdownOpen(false);
  };

  const handleLogout = () => {
    if (!isReady) return;
    Cookies.remove("userToken");
    dispatch(clearStudent());
    localStorage.removeItem("googleAuth");
    setIsLoggedIn(false);
    setIsGoogleSignIn(false);
    setDropdownOpen(false);
    setNotificationDropdownOpen(false);
    setNotifications([]);
    setUnreadCount(0);
    navigate("/login");
  };

  if (!isReady) {
    return null;
  }

  return (
    <header className="bg-[#8b2525]">
      <Notifications notificationsData={notifications} />
      <div className="container mx-auto px-20">
        <div className="flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2 cursor-pointer">
            <img src="/src/assets/Logo.png" alt="Lingua Logo" className="h-16 w-20" />
          </NavLink>
          <nav className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `text-sm font-medium text-white cursor-pointer ${
                    isActive ? "underline" : "hover:text-gray-200"
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-4 relative">
            <button className="flex items-center gap-1">
              <Globe className="h-6 w-6" />
              <span>En</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            {(isLoggedIn || isGoogleSignIn) && (
              <div className="relative">
                <Badge
                  content={unreadCount > 0 ? unreadCount : null}
                  color="danger"
                  size="sm"
                  isInvisible={unreadCount === 0}
                >
                  <button
                    onClick={handleNotificationClick}
                    className="flex items-center p-2 rounded-full hover:bg-gray-200"
                    aria-label="Notifications"
                  >
                    <Bell className="h-6 w-6 text-white" />
                  </button>
                </Badge>
                {notificationDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-300 shadow-lg rounded-lg z-50">
                    <div className="flex flex-col p-2">
                      {notifications.length === 0 ? (
                        <p className="px-4 py-2 text-gray-500">No new notifications</p>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification._id}
                            className={`px-4 py-2 hover:bg-gray-100 ${
                              notification.isRead ? "bg-gray-50" : "bg-blue-50"
                            }`}
                            onClick={() => {
                              if (!notification.isRead) {
                                markNotificationRead(notification._id!);
                              }
                              if (notification.url) {
                                window.open(notification.url, "_blank");
                              }
                              setNotificationDropdownOpen(false);
                            }}
                          >
                            <p className="text-sm font-medium">{notification.heading}</p>
                            <p className="text-xs text-gray-500">{notification.message}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(notification.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        ))
                      )}
                      <NavLink
                        to="/notifications"
                        className="px-4 py-2 text-center text-blue-600 hover:bg-gray-100"
                        onClick={() => setNotificationDropdownOpen(false)}
                      >
                        View All Notifications
                      </NavLink>
                    </div>
                  </div>
                )}
              </div>
            )}
            {!isLoggedIn && !isGoogleSignIn ? (
              <>
                <button
                  className="bg-white text-[#8b2525] border border-white px-4 py-2 rounded-md hover:bg-gray-100"
                  onClick={() => isReady && navigate("/login")}
                >
                  Log In
                </button>
                <button
                  className="bg-red-500 px-4 py-2 rounded-md hover:bg-red-600"
                  onClick={() => isReady && navigate("/register")}
                >
                  Sign Up
                </button>
              </>
            ) : (
              <div className="relative">
                <button
                  className="flex items-center gap-2 px-3 py-2 bg-gray-200 rounded-full hover:bg-gray-300"
                  onClick={() => {
                    setDropdownOpen(!dropdownOpen);
                    setNotificationDropdownOpen(false);
                  }}
                >
                  <User className="h-5 w-5 text-black" />
                  <ChevronDown className="h-4 w-4 text-black" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 shadow-lg rounded-lg z-50">
                    <div className="flex flex-col">
                      <NavLink
                        to="/getProfile"
                        className={({ isActive }) =>
                          `px-4 py-2 text-left hover:bg-gray-100 ${
                            isActive ? "bg-gray-100" : ""
                          }`
                        }
                        onClick={() => setDropdownOpen(false)}
                      >
                        Profile
                      </NavLink>
                      <NavLink
                        to="/wallet"
                        className={({ isActive }) =>
                          `px-4 py-2 text-left hover:bg-gray-100 ${
                            isActive ? "bg-gray-100" : ""
                          }`
                        }
                        onClick={() => setDropdownOpen(false)}
                      >
                        Wallet
                      </NavLink>
                      <NavLink
                        to="/purchaseHistory"
                        className={({ isActive }) =>
                          `px-4 py-2 text-left hover:bg-gray-100 ${
                            isActive ? "bg-gray-100" : ""
                          }`
                        }
                        onClick={() => setDropdownOpen(false)}
                      >
                        Order
                      </NavLink>
                      <button
                        className="px-4 py-2 text-left hover:bg-gray-100"
                        onClick={handleLogout}
                      >
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}