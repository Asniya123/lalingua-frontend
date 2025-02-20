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

      if(response.data){
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
    <div className="min-h-screen bg-orange-50">
      <div className="container relative min-h-screen flex items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
          <div className="absolute inset-0 bg-orange-500" />
          <div className="relative z-20 flex items-center text-lg font-medium">
  <img
    src="\src\assets\Logo.png" 
    alt="Porto Logo"
    className="h-10 w-auto" 
  />
</div>

          <div className="relative z-20 mt-auto">
            <img
              src="https://i.pinimg.com/736x/8a/5b/25/8a5b2579d267e9f4193f47b8251b3005.jpg"
              alt="Login illustration"
              width={500}
              height={500}
              className="dark:brightness-90"
            />
          </div>
        </div>
        <div className="lg:p-10">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-orange-500">Admin Login</h1>
            </div>
            <form onSubmit={handleLogin} className=" space-y-8">
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Logging in..." : "Log In"}
              </Button>
            </form>
            
          </div>
        </div>
      </div>
    </div>
  );
}
