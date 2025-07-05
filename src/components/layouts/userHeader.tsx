import { NavLink, useNavigate } from "react-router-dom";
import { Globe, User, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useDispatch, useSelector } from "react-redux";
import { clearStudent } from "../../redux/slice/studentSlice";
import { RootState } from "../../redux/store";
import UserNotificationComponent from "../../components/student/chat/Notification";

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

  const checkAuthStatus = () => {
    const userToken = Cookies.get("userToken");
    const googleAuth = localStorage.getItem("googleAuth");
    const hasReduxUser = !!user;
    
    // User is logged in if they have either a token OR a Redux user object
    const isUserLoggedIn = !!userToken || hasReduxUser;
    const isGoogleUser = !!googleAuth;
    
    console.log("Auth Status Check:", { 
      userToken, 
      googleAuth, 
      hasReduxUser, 
      isUserLoggedIn, 
      isGoogleUser 
    });
    
    setIsLoggedIn(isUserLoggedIn);
    setIsGoogleSignIn(isGoogleUser);
  };

  useEffect(() => {
    checkAuthStatus();
    const handleStorageChange = () => checkAuthStatus();
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [user]);

  const handleLogout = () => {
    console.log("Logout clicked");
    try {
      Cookies.remove("userToken");
      dispatch(clearStudent());
      localStorage.removeItem("googleAuth");
      setIsLoggedIn(false);
      setIsGoogleSignIn(false);
      setDropdownOpen(false);
      navigate("/login");
      console.log("Logout navigation attempted");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Login button clicked");
    
    try {
      navigate("/login");
      console.log("Navigate to /login called successfully");
    } catch (error) {
      console.error("Navigation error:", error);
      window.location.href = "/login";
    }
  };

  const handleSignUpClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Sign up button clicked");
    
    try {
      navigate("/register");
      console.log("Navigate to /register called successfully");
    } catch (error) {
      console.error("Navigation error:", error);
      window.location.href = "/register";
    }
  };

  return (
    <header className="bg-[#8b2525]">
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
            {/* Language Selector */}
            <button className="flex items-center gap-1 text-white">
              <Globe className="h-6 w-6" />
              <span>En</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            
            {/* Notification Component - Only show when logged in */}
            {(isLoggedIn || isGoogleSignIn) && <UserNotificationComponent />}
            
            {/* Auth Section */}
            {!isLoggedIn && !isGoogleSignIn ? (
              <>
                <button
                  className="bg-white text-[#8b2525] border border-white px-4 py-2 rounded-md hover:bg-gray-100 cursor-pointer"
                  onClick={handleLoginClick}
                  type="button"
                >
                  Log In
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 cursor-pointer"
                  onClick={handleSignUpClick}
                  type="button"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <div className="relative">
                <button
                  className="flex items-center gap-2 px-3 py-2 bg-gray-200 rounded-full hover:bg-gray-300"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
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