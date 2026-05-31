import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, CircleUser, Camera, X } from "lucide-react";
import rescueBg from "@/assets/rescue-bg.jpg";
import droneHud from "@/assets/drone-hud.png";
import API from "@/api";
import * as faceapi from "face-api.js";

const Infos = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Profile data states
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

  // Face Verification & Upload states
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [isProcessingFace, setIsProcessingFace] = useState(false);

  // Camera Capture Modal States
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Load human face detection models from public/models on mount
  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
        await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
        setIsModelLoading(false);
        console.log("Face detection models loaded successfully.");
      } catch (err) {
        console.error("Error loading face detection models:", err);
      }
    };
    loadModels();
  }, []);

  // Fetch current profile data to prefill fields
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get("/auth/me");
        const user = res.data.user;

        setBirthday(user.birthday ? user.birthday.split("T")[0] : "");
        setGender(user.gender || "");
        setPhone(user.phone || "");
        setLocation(user.location || "");
        setContactName(user.emergencyContact?.name || "");
        setContactPhone(user.emergencyContact?.phone || "");
        setBloodType(user.medicalInfo?.bloodType || "");
        setAllergies(user.medicalInfo?.allergies || "");
        
        if (user.avatarUrl) {
          setAvatarPreview(user.avatarUrl);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, []);

  // Open Live Camera System
  const startCamera = async () => {
    if (isModelLoading) {
      alert("Please wait, loading verification parameters...");
      return;
    }
    try {
      setIsCameraOpen(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 400, height: 400, facingMode: "user" }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access your camera. Please verify camera permissions.");
      setIsCameraOpen(false);
    }
  };

  // Turn off Camera Stream
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null);
    setIsCameraOpen(false);
  };

  // Capture Live Snapshot and run Face ID scan
  const capturePhoto = async () => {
    if (!videoRef.current) return;

    setIsProcessingFace(true);

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg");
      const img = new Image();
      img.src = dataUrl;

      img.onload = async () => {
        const detections = await faceapi.detectAllFaces(img, new faceapi.SsdMobilenetv1Options());
        
        if (detections.length === 0) {
          alert("❌ Face Verification Failed: No human face detected. Look directly at the camera in a lit room.");
          setIsProcessingFace(false);
          return;
        }
        
        if (detections.length > 1) {
          alert("❌ Face Verification Failed: Multiple faces detected. Only one person should be in the frame.");
          setIsProcessingFace(false);
          return;
        }

        canvas.toBlob((blob) => {
          if (blob) {
            const capturedFile = new File([blob], `avatar_captured_${Date.now()}.jpg`, { type: "image/jpeg" });
            setAvatar(capturedFile);
            setAvatarPreview(dataUrl);
            stopCamera();
          }
          setIsProcessingFace(false);
        }, "image/jpeg");
      };
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFace(true);
    const imageUrl = URL.createObjectURL(file);
    const img = new Image();
    img.src = imageUrl;

    img.onload = async () => {
      const detections = await faceapi.detectAllFaces(img, new faceapi.SsdMobilenetv1Options());
      if (detections.length === 0) {
        alert("❌ Verification failed: No human face detected.");
        setIsProcessingFace(false);
        return;
      }
      if (detections.length > 1) {
        alert("❌ Verification failed: Multiple faces detected.");
        setIsProcessingFace(false);
        return;
      }
      setAvatar(file);
      setAvatarPreview(imageUrl);
      setIsProcessingFace(false);
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Strict Requirement Enforcement (Excluding avatar, phone2, and allergies)
    if (!birthday || !gender || !phone || !location || !contactName || !contactPhone || !bloodType || !height || !weight) {
      alert("❌ Please fill out all required profile information fields.");
      return;
    }

    // 2. Strict Human Identity Authentication Requirement
    if (!avatarPreview) {
      alert("❌ Face verification identity scan is required. Please take a photo or upload an image.");
      return;
    }

    // 3. Format validations
    const algerianPhone = /^(05|06|07)\d{8}$/;
    if (!algerianPhone.test(phone)) {
      alert("Phone must be Algerian format: 05/06/07XXXXXXXX");
      return;
    }
    if (!algerianPhone.test(contactPhone)) {
      alert("Emergency contact phone must be Algerian format: 05/06/07XXXXXXXX");
      return;
    }
    if (contactName.trim().split(" ").length < 2) {
      alert("Emergency contact must have a full name (First and Last)");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("birthday", birthday);
      formData.append("gender", gender);
      formData.append("phone", phone);
      formData.append("phone2", phone2);
      formData.append("location", location);
      formData.append("emergencyContact[name]", contactName);
      formData.append("emergencyContact[phone]", contactPhone);
      formData.append("medicalInfo[bloodType]", bloodType);
      formData.append("medicalInfo[allergies]", allergies);
      formData.append("height", height);
      formData.append("weight", weight);
      
      if (avatar) {
        formData.append("avatar", avatar);
      }

      await API.patch("/auth/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Profile updated successfully ✅");
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
        
        {/* Left Form Block Container */}
        <div className="flex w-full flex-col justify-center px-8 py-3 pb-7 md:w-1/2 md:px-12">
           
           {/* Face Verification Avatar Component */}
           <div className="flex flex-col items-center mb-4">
              {avatarPreview ? (
                <img 
                  src={avatarPreview} 
                  alt="Avatar Profile Preview" 
                  className="w-20 h-20 mb-2 rounded-full object-cover border-2 border-[#325c44]"
                />
              ) : (
                <CircleUser className="w-20 h-20 mb-2 text-gray-400" />
              )}
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
              
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={startCamera}
                  className="flex items-center gap-1 bg-[#325c44] py-1 px-2.5 rounded-md text-white text-xs transition-opacity hover:opacity-90"
                >
                  <Camera className="w-3.5 h-3.5" /> Take Photo
                </button>
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gray-600 py-1 px-2.5 rounded-md text-white text-xs transition-opacity hover:opacity-90"
                >
                  Upload File
                </button>
              </div>
          </div>

          {/* Live Camera Interface Overlay Modal */}
          {isCameraOpen && (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 p-4 backdrop-blur-md">
              <div className="relative w-full max-w-[400px] overflow-hidden rounded-2xl bg-zinc-900 p-4 border border-[#325c44]">
                <button 
                  type="button" 
                  onClick={stopCamera} 
                  className="absolute right-3 top-3 text-white hover:text-red-500"
                >
                  <X className="w-6 h-6" />
                </button>
                <h3 className="text-white font-bold mb-3 text-center">Face Verification Scanner</h3>
                
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-black border border-zinc-700">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                  <div className="absolute inset-8 pointer-events-none border-2 border-dashed border-[#325c44]/60 rounded-full animate-pulse" />
                </div>

                <button
                  type="button"
                  onClick={capturePhoto}
                  disabled={isProcessingFace}
                  className="w-full mt-4 rounded-full bg-[#325c44] py-2.5 font-bold text-white transition-colors hover:bg-[#254533] disabled:bg-gray-500"
                >
                  {isProcessingFace ? "Analyzing Biometrics..." : "Capture Profile Face"}
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
             <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                placeholder="Birth day date"
                required
                className="w-[58%] inline sm:mr-5 sm:w-[45%] rounded-full border px-5 py-3 text-base"
              />

              <div className="w-[39%] inline-block relative">
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                  className="w-full rounded-full border border-gray-200 bg-white pl-5 pr-10 py-2.5 text-base text-black focus:outline-none focus:border-[#D26E1E] cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2229%22%20height%3D%2229%22%20viewBox%3D%220%200%2029%2029%22%3E%3Cpath%20fill%3D%22%23000000%22%20d%3D%22M7%2010l7%207%207-7z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[right_12px_center] bg-no-repeat"
                >
                  <option value="" disabled hidden>Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="Phone Number (+213)"
                required
                className="w-full mt-2 rounded-full border px-5 py-2.5 text-base"
              /> 

              {/* Optional Field */}
              <input
                value={phone2}
                onChange={(e) => setPhone2(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="Phone Number2 (+213) (Optional)"
                className="w-full mt-2 rounded-full border px-5 py-2.5 text-base"
              /> 

              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Address"
                required
                className="w-full mt-2 rounded-full border px-5 py-2.5 text-base"
              />
          
               {/* --- EMERGENCY CONTACT SECTION --- */}
               <div className="mt-2">
                <label className="mt-5 mb-1 block text-sm font-bold text-foreground">Emergency Contact</label>
                <input
                  placeholder="Full Name (First Last)"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value.replace(/[^a-zA-Z\s]/g, ""))}
                  required
                  className="w-[48%] mr-3 inline-block rounded-full border border-gray-200 bg-white px-5 py-2.5 text-base text-black placeholder-gray-400 focus:outline-none focus:border-[#D26E1E]"
                />
                <input
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="Phone Number (+213)"
                  required
                  className="w-[48%] inline-block rounded-full border border-gray-200 bg-white px-5 py-2.5 text-base text-black placeholder-gray-400 focus:outline-none focus:border-[#D26E1E]"
                /> 
               </div>

               {/* --- MEDICAL INFORMATION SECTION --- */}
               <div>
                <label className="mt-2 mb-1 block text-sm font-bold text-foreground">Medical Information</label>
                <div className="w-[48%] mr-3 inline-block relative">
                  <select
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    required
                    className="w-full rounded-full border border-gray-200 bg-white pl-5 pr-10 py-2.5 text-base text-black focus:outline-none focus:border-[#D26E1E] cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2229%22%20height%3D%2229%22%20viewBox%3D%220%200%2029%2029%22%3E%3Cpath%20fill%3D%22%23000000%22%20d%3D%22M7%2010l7%207%207-7z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[right_12px_center] bg-no-repeat"
                  >
                    <option value="" disabled hidden>Blood Type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                {/* Optional Field */}
                <input
                  placeholder="Allergies (Optional)"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="w-[48%] rounded-full border border-gray-200 bg-white px-5 py-2.5 text-base text-black placeholder-gray-400 focus:outline-none focus:border-[#D26E1E]"
                />
               </div>

               {/* --- PHYSICAL DESCRIPTION SECTION --- */}
               <div>
                <label className="mt-2 mb-1 block text-base font-bold text-foreground">Physical Description </label>
                <input
                  placeholder="Height"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  required
                  className="w-[48%] mr-3 inline-block rounded-full border border-gray-200 bg-white px-5 py-2.5 text-base text-black placeholder-gray-400 focus:outline-none focus:border-[#D26E1E]"
                />
                <input
                  placeholder="Weight"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                  className="w-[48%] rounded-full border border-gray-200 bg-white px-5 py-2.5 text-base text-black placeholder-gray-400 focus:outline-none focus:border-[#D26E1E]"
                />
               </div>

               <label className="flex cursor-pointer text-red-600 mt-6 items-start gap-2 text-sm font-semibold text-foreground">
                 Your data is private and used only during emergency operations.
               </label>
               <button type="submit" className="w-full rounded-full bg-primary py-3.5 text-lg font-bold text-primary-foreground transition-colors hover:bg-accent">
                  Save Profile
               </button>
          </form>
        </div>

        {/* Right HUD Display Panel */}
        <div className="relative hidden md:block md:w-1/2">
          <div className="flex items-center justify-center gap-2 my-3">
            <div className="w-[42px] h-[42px] rounded-full bg-[#325c44] flex items-center justify-center">
              <Check className="w-6 h-6 text-[#e4ddd3]" strokeWidth={3} />
            </div>
            <div className="h-[2px] w-[90px] bg-[#325c44]"></div>
            <div className="w-[42px] h-[42px] rounded-full bg-[#325c44] flex items-center justify-center">
              <Check className="w-6 h-6 text-[#e4ddd3]" strokeWidth={3} />
            </div>
            <div className="h-[2px] w-[90px] bg-[#325c44]"></div>
            <p className="rounded-full bg-[#325c44] w-[42px] h-[42px] flex text-[#e4ddd3] items-center justify-center text-2xl font-semibold">
              3
            </p>
          </div>
          <div className="w-[95%] h-[85%] overflow-hidden rounded-md">
            <img src={droneHud} alt="Drone SAR operational view" className="w-full h-full object-cover border-3 border-black" />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Infos;