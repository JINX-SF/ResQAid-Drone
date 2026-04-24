import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import rescueBg from "@/assets/rescue-bg.jpg";
import droneHud from "@/assets/drone-hud.png";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import API from "@/api";


const Login = () => {

  
    const navigate = useNavigate();
useEffect(() => {
    
  const token = localStorage.getItem("token");
 if (token && window.location.pathname !== "/login") {
  navigate("/controle");
}
}, [navigate]);

  const params = new URLSearchParams(window.location.search);
const verified = params.get("verified");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  /*const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };*/

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const res = await API.post("/auth/login", {
      email,
      password,
    });

    const { token, user } = res.data;

    localStorage.setItem("token", token);

    // 🚨 IMPORTANT RULE
    if (!user.isVerified) {
      alert("Please verify your email first");
      return;
    }

    // Check if profile complete
    if (!user.phone || !user.birthday) {
      navigate("/infos");
    } else {
      navigate("/controle");
    }

  } catch (err: any) {
    alert(err.response?.data?.message || "Login failed");
  }
};



  return (
   
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{
        backgroundImage: `url(${rescueBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex w-full max-w-[900px] overflow-hidden rounded-2xl bg-card/90 shadow-2xl backdrop-blur-sm">
        {/* Left - Form */}
        <div className="flex w-full flex-col justify-center px-8 py-10 md:w-1/2 md:px-12">
          <h1 className="mb-1 text-3xl font-bold text-foreground">ResQAid</h1>
          <p className="mb-8 text-lg text-muted-foreground">
            Create your profile to start saving lives!
          </p>

          {/* Social buttons */}
          <div className="mb-4 flex gap-3">
            {/*<button className="flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
              <img src="https://www.google.com/favicon.ico" alt="Google" className="h-4 w-4" />
              sign up with google
            </button>*/}

            <button
  onClick={() => window.location.href = "http://localhost:5000/api/auth/google"}
  className="flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
>
  <img
    src="https://www.google.com/favicon.ico"
    alt="Google"
    className="h-4 w-4"
  />
  sign up with google
</button>
           {/* <button className="flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
              <svg className="h-4 w-4 fill-[#1877F2]" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              sign up with facebook
            </button>

            <button
  onClick={() => window.location.href = "http://localhost:5000/api/auth/google"}
  className="flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
></button>*/}

          <button
  onClick={() => window.location.href = "http://localhost:5000/api/auth/facebook"}
  className="flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
>
  <svg className="h-4 w-4 fill-[#1877F2]" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
  sign up with facebook
</button>
          </div>

          {/* Divider */}
          <div className="mb-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-sm text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

           {verified && (
  <p className="mb-4 text-green-600 font-semibold text-center">
    ✅ Email verified successfully! You can now log in.
  </p>
)}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-foreground">Email</label>
              <input
                type="email"
                placeholder="xxxxxx@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-full border border-border bg-input px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-foreground">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-full border border-border bg-input px-5 py-3 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="text-center">
              <Link to="/forgot-password" className="text-sm text-foreground underline underline-offset-2 hover:text-primary">
                forget password
              </Link>
            </div>

            <button type="submit" className="w-full rounded-full bg-primary py-3.5 text-lg font-bold text-primary-foreground transition-colors hover:bg-accent">
              Log in
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            don't have an account?{" "}
            <Link to="/register" className="font-semibold text-foreground underline underline-offset-2 hover:text-primary">
              Sign Up
            </Link>
          </p>
        </div>

        {/* Right - Drone HUD Image */}
        <div className="hidden md:flex md:w-1/2 justify-center items-center mt-5">
  <div className="w-[95%] h-[92%] rounded-md border-2 overflow-hidden">
    <img
      src={droneHud}
      alt="Drone SAR operational view"
      className="w-full h-full object-cover"
    />
  </div>
</div>
      </div>
    </div>
  );
};


export default Login;
