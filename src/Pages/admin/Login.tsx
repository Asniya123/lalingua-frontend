import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/admin/button";
import { Input } from "../../components/admin/inputButton";
import { setAdminData } from "../../redux/slice/adminSlice";
import adminAPI from "../../api/adminInstance";
import Cookies from "js-cookie";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Both email and password are required.");
      return;
    }

    setLoading(true);

    try {
      const response = await adminAPI.post("/login", { email, password }, {
        headers: {
          "Content-Type": "application/json",
        },
      });
console.log(response.data);

      if (response.data) {
  
        
        const { adminId, accessToken, refreshToken } = response.data;
        Cookies.set("accessToken", accessToken);
        Cookies.set("refreshToken", refreshToken);

        dispatch(setAdminData({ adminId, accessToken, refreshToken }));

        navigate("/admin/dashboard");
      }
    } catch (error: any) {
      console.error("Login failed:", error.response?.data || error.message);
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
      <div className="container relative min-h-screen flex items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        {/* Left Image Section */}
        <div className="relative hidden h-full flex-col bg-orange-600 p-10 text-white lg:flex dark:border-r">
          <div className="absolute inset-0 bg-orange-600/80" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <img
              src="/src/assets/Logo.png"
              alt="Porto Logo"
              className="h-12 w-auto" // Increased size for better visibility
            />
          </div>
          <div className="relative z-20 mt-auto">
            <img
              src="https://i.pinimg.com/736x/8a/5b/25/8a5b2579d267e9f4193f47b8251b3005.jpg"
              alt="Login illustration"
              width={500}
              height={500}
              className="dark:brightness-90 object-cover rounded-lg shadow-lg"
            />
          </div>
        </div>

        {/* Right Form Section */}
        <div className="lg:p-10 flex items-center justify-center">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] bg-white p-6 rounded-xl shadow-2xl">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-3xl font-bold tracking-tight text-orange-600">Admin Login</h1>
              <p className="text-gray-500 text-sm">Securely access your admin dashboard</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-6">
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition duration-300 font-semibold shadow-md"
              >
                {loading ? "Logging in..." : "Log In"}
              </Button>
            </form>
            {/* <div className="text-center text-sm text-gray-500">
              <a href="/forgot-password" className="text-orange-600 hover:underline">
                Forgot Password?
              </a>
            </div>
            <p className="text-center text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <span
                className="text-orange-600 cursor-pointer hover:underline"
                onClick={() => navigate('/admin/register')}
              >
                Sign up
              </span>
            </p> */}
          </div>
        </div>
      </div>
    </div>
  );
}