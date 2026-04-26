import { MapPin, Phone, Mail,LogOut , Home,CheckCircle,ChevronRight, AlertTriangle, User, Shield, Heart, Clock, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import rescueBg from "@/assets/rescue-bg.jpg";

import { useEffect, useState } from "react";
import API from "@/api"
import { Link } from "react-router-dom";



const Profile = () => {

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await API.get("/auth/me");
      setUser(res.data.user);
    } catch (err) {
      console.error(err);
    }
  };

  fetchUser();
}, []);
  if (!user) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed" style={{ backgroundImage: `url(${rescueBg})` }}>
      <div className="min-h-screen bg-black/40">
        <nav className="absolute mb-12 left-0 right-0 top-0 z-20 flex items-center mb-11 justify-between px-6 py-4 md:px-12 ">
        <h2 className="text-2xl font-bold text-primary-foreground drop-shadow-lg">ResQAid</h2>
        
        <div className="hidden items-center gap-8 md:flex">
          
            <Link to="/" className="gap-2  flex justify-center items-center hover:border-b py-1 px-2 rounded-md text-white"><Home  className="w-3.5 h-3.5 " />  Home <ChevronRight className="w-3.5 h-3.5 "/></Link>
        
            </div>
      </nav>
      <div className="max-w-5xl mx-auto px-6 py-8 pt-28">
        {/* Profile Header */}
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-secondary border-2 border-border flex items-center justify-center shrink-0">
            <User className="w-10 h-10 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl text-white font-bold">{user?.name}</h1>
            <p className="text-sm text-muted-foreground">Emergency assistance user · Oran, Algeria</p>
          </div>
          <Button variant="outline" size="sm" className="gap-2 bg-red-800/70 hover:bg-red-700/70 text-white">
            <LogOut  className="w-3.5 h-3.5" />
            Sign out
          </Button>
          <Button variant="outline" size="sm" className="gap-2 bg-green-800/70 text-white">
            <Pencil className="w-3.5 h-3.5" />
            Edit Profile
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Personal Information */}
          <Card className="lg:col-span-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4 space-y-3">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base text-white font-semibold">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  ["Full Name", user.name],
                  ["Birthday", user.birthday|| "—"],
                  ["Gender", user.gender|| "—"],
                  ["Phone", user.phone|| "—"],
                   ["Phone2", user.phone2|| "—"],
                  ["Email",  user.email|| "—"],
                  ["Location", user.location|| "—"],
                ].map(([label, value]) => (
                  <div key={label} className="space-y-1">
                    <p className="text-muted-foreground text-xs uppercase tracking-wide">{label}</p>
                    <p className="font-medium text-white">{value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card className="border-none bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4 space-y-3 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-white text-base font-semibold">
                <div className="w-8 h-8 rounded-lg bg-destructive/10 text-black flex items-center justify-center">
                  <Phone className="w-4 h-4 text-destructive" />
                </div>
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-black">
              <p className="font-semibold text-white">{user.emergencyContact?.name|| "—"}</p>
              <div className="flex items-center gap-2 text-sm text-white">
                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                <span >{user.emergencyContact?.fhone|| "—"}</span>
              </div>
            </CardContent>
          </Card>

          {/* Safety Settings */}
          <Card className="border-none bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4 space-y-3 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex text-white items-center gap-2 text-base font-semibold">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                Safety Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground">Share GPS location during emergencies</span>
                <Switch />
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground">Receive rescue alerts</span>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card className=" bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4 space-y-3 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex text-white items-center gap-2 text-base font-semibold">
                <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-destructive" />
                </div>
                Medical Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">Blood Type :</p>
                  <p className="font-bold text-white text-lg">{user.medicalInfo?.bloodType|| "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">{user.medicalInfo?.allergies|| "—"}</p>
                  <p className="font-bold text-white text-lg">None</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Requests */}
          <Card className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4 space-y-3 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex text-white items-center gap-2 text-base font-semibold">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-green-800" />
                </div>
                Recent Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { type: "Flood", date: "Jan 20, 2025" },
                { type: "Earthquake", date: "Jan 05, 2025" },
              ].map((req) => (
                <div key={req.type} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    <span className="text-sm text-muted-foreground font-medium">{req.type}</span>
                  </div>
                  <span className="text-xs text-white">{req.date}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Emergency Button */}
        <div className="mt-8 flex justify-center">
          <Button variant="destructive" size="lg" className="gap-2 px-8">
            <AlertTriangle className="w-5 h-5" />
            Request emergency drone assistance
          </Button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Profile;
