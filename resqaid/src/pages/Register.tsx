import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import rescueBg from "@/assets/rescue-bg.jpg";
import droneHud from "@/assets/drone-hud.png";
import API from "@/api";
const steps = [1, 2, 3];

const Register = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeGps, setAgreeGps] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (password !== confirmPassword) {
    return alert("Passwords do not match");
  }

  if (!agreeGps) {
    return alert("You must agree to GPS policy");
  }

  try {
    const res = await API.post("/auth/register", {
      name: fullName,
      email,
      password,
    });

    alert(res.data.message);

    navigate("/verify");

  } catch (err: any) {
    alert(err.response?.data?.message || "Register failed");
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
          <h1 className="mb-6 text-center text-3xl font-bold leading-tight text-foreground">
            create your
            <br />
            ResQAid account
          </h1>

          {/* Social buttons */}
          <div className="mb-4 flex gap-3">
            <button 
            onClick={() =>
    (window.location.href = "http://localhost:5000/api/auth/google")
  }
 
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
              <img src="https://www.google.com/favicon.ico" alt="Google" className="h-4 w-4" />
              sign up with google
            </button>
            <button 
             onClick={() =>
    (window.location.href = "http://localhost:5000/api/auth/facebook")
  }
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-full border border-border bg-input px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-full border border-border bg-input px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            <div className="relative">
              <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-full border border-border bg-input px-5 py-3 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-full border border-border bg-input px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />

            <label className="flex cursor-pointer items-start gap-2 text-sm font-semibold text-foreground">
              <input type="checkbox" checked={agreeGps} onChange={(e) => setAgreeGps(e.target.checked)} className="mt-1 h-4 w-4 rounded border-border accent-primary" />
              I agree to share my GPS location during active emergency missions.
            </label>

            <button type="submit" className="w-full rounded-full bg-primary py-3.5 text-lg font-bold text-primary-foreground transition-colors hover:bg-accent">
              Sign Up
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            already have an account?{" "}
            <Link to="/login" className="font-semibold text-foreground underline underline-offset-2 hover:text-primary">Log In</Link>
          </p>
        </div>

        {/* Right - Image + Step indicator */}
        <div className="relative hidden md:block md:w-1/2">
          <div className="flex items-center justify-center gap-2 my-3">
            <p className="rounded-full bg-[#325c44] w-[42px] h-[42px] flex text-[#e4ddd3] items-center justify-center text-2xl font-semibold">1</p>
            <div className="h-[2px] w-[90px] bg-[#325c44]"></div>
            <p className="rounded-full bg-transparent text-[#325c44] w-[42px] h-[42px] flex border-[3px] border-[#325c44] items-center justify-center text-2xl font-semibold">2</p>
            <div className="h-[2px] w-[90px] bg-[#325c44]"></div>
            <p className="rounded-full bg-transparent text-[#325c44] w-[42px] h-[42px] flex border-[3px] border-[#325c44] items-center justify-center text-2xl font-semibold">3</p>
          </div>
          <div className="border-3 border-black  w-[95%] h-[85%] overflow-hidden rounded-md">
  <img src={droneHud} alt="Drone SAR operational view" className="w-full h-full object-cover border-3 border-black" />
</div>
        </div>
      </div>
    </div>
  );
};

export default Register;
