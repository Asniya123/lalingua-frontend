import { useNavigate } from "react-router-dom";
import { Globe, User, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Courses", href: "/courses" },
  { name: "About Us", href: "/about" },
  { name: "Tutors", href: "/tutors" },
  { name: "Contact", href: "/contact" },
];

export function UserHeader() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isGoogleSignIn, setIsGoogleSignIn] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Check if the user is logged in (either through normal login or Google login)
  const checkAuthStatus = () => {
    const userToken = Cookies.get("userToken"); // Check for normal login
    const googleAuth = localStorage.getItem("googleAuth"); // Check Google Sign-In status
    console.log(googleAuth,"google")
    setIsLoggedIn(!!userToken);
    setIsGoogleSignIn(!!googleAuth);

    // Navigate to home page if user is logged in
    if (userToken || googleAuth) {
      navigate("/");
    }
  };

  useEffect(() => {
    checkAuthStatus(); // Initial authentication check

    // Listen for storage changes (for Google Auth updates)
    const handleStorageChange = () => checkAuthStatus();
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Handle Logout
  const handleLogout = () => {
    Cookies.remove("userToken");
    localStorage.removeItem("googleAuth"); 
    setIsLoggedIn(false);
    setIsGoogleSignIn(false);
    setDropdownOpen(false);
    navigate("/login");
  };

  return (
    <header className="bg-[#8b2525]">
      <div className="container mx-auto px-20">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img
              src="/src/assets/Logo.png"
              alt="Lingua Logo"
              className="h-20 w-20"
            />
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <div
                key={item.name}
                onClick={() => navigate(item.href)}
                className="text-sm font-medium text-white hover:text-white cursor-pointer"
              >
                {item.name}
              </div>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-4 relative">
            <button className="flex items-center gap-1">
              <Globe className="h-6 w-6" />
              <span>En</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {!isLoggedIn && !isGoogleSignIn ? (
              <>
                <button
                  className="bg-white text-[#8b2525] border border-white px-4 py-2 rounded-md hover:bg-gray-100"
                  onClick={() => navigate("/login")}
                >
                  Log In
                </button>

                <button
                  className="bg-red-500 px-4 py-2 rounded-md hover:bg-red-600"
                  onClick={() => navigate("/register")}
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
                      <button
                        className="px-4 py-2 text-left hover:bg-gray-100"
                        onClick={() => {
                          navigate("/getProfile");
                          setDropdownOpen(false);
                        }}
                      >
                        Profile
                      </button>
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
