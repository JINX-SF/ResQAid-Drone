import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import rescueBg from "@/assets/rescue-bg.jpg";
import droneHud from "@/assets/drone-hud.png";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import API from "@/api";


const Reset = () => {

  const [newpassword, setNewPassword] = useState("");
  const [confirmpassword, setConfirmPassword] = useState("");
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  /*const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };*/



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
          <h1 className="mb-1 text-xl font-semibold text-foreground/90 m-auto mt-2   mt-4">Reset Password</h1>

          
         
          
           

          <form  className="space-y-5 mt-10">
            
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-foreground">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••••"
                  value={newpassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
              <label className="mb-1.5 mt-2 block text-sm font-semibold text-foreground">Confirm Password</label>
              <div className="relative">
                <input
                  type={showPassword1 ? "text" : "password"}
                  placeholder="••••••••••••••"
                  value={confirmpassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-full border border-border bg-input px-5 py-3 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword1(!showPassword1)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword1 ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            

            <button type="submit" className="w-full rounded-full mt-8 bg-primary py-3.5 text-lg font-bold text-primary-foreground transition-colors hover:bg-accent">
              Reset password
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link to="/login" className="font-semibold text-foreground underline underline-offset-2 hover:text-primary">
              Go to login
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


export default Reset;
