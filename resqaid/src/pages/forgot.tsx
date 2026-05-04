import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import rescueBg from "@/assets/rescue-bg.jpg";
import droneHud from "@/assets/drone-hud.png";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";



const Forgot = () => {

  
 
const [email, setEmail] = useState("");


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
          <h1 className="mb-2 text-xl font-semibold text-foreground mt-5  m-auto">Forgot Password</h1>

          <p className="mb-5 text-lg text-muted-foreground ml-3 mt-1">
            no worries! enter your email address and we will send you a link to reset password
          </p>

            

           

          <form  className="space-y-5">
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

            

            
          </form>
          <button type="submit" className="w-full rounded-full bg-primary mt-8 py-3.5 text-lg font-bold text-primary-foreground transition-colors hover:bg-accent">
              Send reset link
            </button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link to="/login" className="font-semibold text-foreground underline underline-offset-2 hover:text-primary">
              back to login
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


export default Forgot;
