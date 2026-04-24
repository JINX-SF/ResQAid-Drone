import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff ,Check , User , CircleUser } from "lucide-react";
import rescueBg from "@/assets/rescue-bg.jpg";
import droneHud from "@/assets/drone-hud.png";
import API from "@/api";

const steps = [1, 2, 3];

const Infos = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeGps, setAgreeGps] = useState(false);

  const [birthday, setBirthday] = useState("");
const [gender, setGender] = useState("");
const [phone, setPhone] = useState("");
const [phone2, setPhone2] = useState("");
const [location, setLocation] = useState("");

const [contactName, setContactName] = useState("");
const [contactPhone, setContactPhone] = useState("");

const [bloodType, setBloodType] = useState("");
const [allergies, setAllergies] = useState("");

const [height, setHeight] = useState("");
const [weight, setWeight] = useState("");

  /*const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/profile");
  };*/

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    await API.patch("/auth/profile", {
      birthday,
      gender,
      phone,
      phone2,
      location,
      emergencyContact: {
        name: contactName,
        phone: contactPhone,
      },
      medicalInfo: {
        bloodType,
        allergies,
      },
    });

    navigate("/profile");

  } catch (err) {
    alert("Failed to save profile");
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
        
        <div className="flex w-full flex-col justify-center px-8 py-3 pb-7 md:w-1/2 md:px-12">
          {/* fill   Here  */}
           <div className="flex flex-col items-center">
              <CircleUser className="w-20 h-20 mb-2" />
              <button className="bg-[#325c44] py-1 px-2 rounded-md text-white ">Upload a photo</button>
          </div>
          <form onSubmit={handleSubmit}>
             <input
  type="date"
  value={birthday}
  onChange={(e) => setBirthday(e.target.value)}
  placeholder="Birth day date"
  className="w-[58%] inline sm:mr-5 sm:w-[45%] rounded-full border px-5 py-3"
/>

<input
  value={gender}
  onChange={(e) => setGender(e.target.value)}
  placeholder="Gender"
  className="w-[39%] rounded-full border px-5 py-3"
/>

<input
  value={phone}
  onChange={(e) => setPhone(e.target.value)}
  placeholder="First Phone Number"
  className="w-full mt-2 rounded-full border px-5 py-3"
/>

<input
  value={phone2}
  onChange={(e) => setPhone2(e.target.value)}
  placeholder="Second Phone Number"
  className="w-full mt-2 rounded-full border px-5 py-3"
/>

<input
  value={location}
  onChange={(e) => setLocation(e.target.value)}
  placeholder="Address"
  className="w-full mt-2 rounded-full border px-5 py-3"
/>
          
           
           {/* second part */}
           <div>
            <label className="mt-5 mb-1 block text-sm font-bold text-foreground">Emergency Contact</label>
             <input
    placeholder="Phone Number"
    value={contactPhone}
    onChange={(e) => setContactPhone(e.target.value)}
    className="w-[48%] mr-3 inline rounded-full border border-border bg-input px-5 py-3 text-sm"
  />

  <input
    placeholder="Contact Name"
    value={contactName}
    onChange={(e) => setContactName(e.target.value)}
    className="w-[48%] rounded-full border border-border bg-input px-5 py-3 text-sm"
  />
            
           </div>
           <div>
            <label className="mt-2 mb-1 block text-sm font-bold text-foreground">Medical Information</label>
            <input
    placeholder="Blood Type"
    value={bloodType}
    onChange={(e) => setBloodType(e.target.value)}
    className="w-[48%] mr-3 inline rounded-full border border-border bg-input px-5 py-3 text-sm"
  />

  <input
    placeholder="Allergies"
    value={allergies}
    onChange={(e) => setAllergies(e.target.value)}
    className="w-[48%] rounded-full border border-border bg-input px-5 py-3 text-sm"
  />
            
           </div>
           <div>
            <label className="mt-2 mb-1 block text-sm font-bold text-foreground">Physical Description </label>
            <input
    placeholder="Height"
    value={height}
    onChange={(e) => setHeight(e.target.value)}
    className="w-[48%] mr-3 inline rounded-full border border-border bg-input px-5 py-3 text-sm"
  />

  <input
    placeholder="Weight"
    value={weight}
    onChange={(e) => setWeight(e.target.value)}
    className="w-[48%] rounded-full border border-border bg-input px-5 py-3 text-sm"
  />
            
           </div>
           <label className="flex cursor-pointer text-red-600 mt-6 items-start gap-2 text-sm font-semibold text-foreground">Your data is private and used only during emergency operations.</label>
           <button type="submit"  className="w-full rounded-full bg-primary py-3.5 text-lg font-bold text-primary-foreground transition-colors hover:bg-accent">
           
              Save Profile
            </button>
    </form>
      </div>

        {/* Right - Image + Step indicator */}
        <div className="relative hidden md:block md:w-1/2">
        <div className="flex items-center justify-center gap-2 my-3">
  {/* Cercle vert avec Check */}
  <div className="w-[42px] h-[42px] rounded-full bg-[#325c44] flex items-center justify-center">
    <Check className="w-6 h-6 text-[#e4ddd3]" strokeWidth={3} />
  </div>

  {/* Trait */}
  <div className="h-[2px] w-[90px] bg-[#325c44]"></div>

  {/* Cercle 2 */}
  <div className="w-[42px] h-[42px] rounded-full bg-[#325c44] flex items-center justify-center">
    <Check className="w-6 h-6 text-[#e4ddd3]" strokeWidth={3} />
  </div>

  {/* Trait */}
  <div className="h-[2px] w-[90px] bg-[#325c44]"></div>

  {/* Cercle 3 */}
  <p className="rounded-full bg-[#325c44] w-[42px] h-[42px] flex text-[#e4ddd3] items-center justify-center text-2xl font-semibold">
    3
  </p>
</div>
          <div className=" border-black  w-[95%] h-[85%] overflow-hidden rounded-md">
  <img src={droneHud} alt="Drone SAR operational view" className="w-full h-full object-cover border-3 border-black" />
</div>
        </div>
      </div>
    </div>
  );
};

export default Infos;
