import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "@/api";
import AppShell, { Glass } from "../components/AppShell";

// IMPORT YOUR LOCAL FACTORY PHOTO DIRECTLY
import defaultFactoryImg from "@/assets/factory.jpg"; 

import {
  ArrowLeft,
  MapPin,
  Phone,
  User,
  AlertTriangle,
  Calendar,
  Layers,
  FileText,
  Check,
  X,
} from "lucide-react";

export default function RequestDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const res = await API.get(`/emergency-requests/${id}`);
        setRequest(res.data?.data || res.data?.request || res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id]);

  const handleAccept = async () => {
    try {
      await API.put(`/emergency-requests/${id}/accept`);
      alert("Request accepted ✅");
      navigate("/missionspage");
    } catch (err) {
      console.error(err);
      alert("Failed to accept request");
    }
  };

  const handleReject = async () => {
    try {
      await API.put(`/emergency-requests/${id}/reject`);
      alert("Request rejected ❌");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Failed to reject request");
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[50vh] text-white/80 text-sm font-medium">
          Loading request details...
        </div>
      </AppShell>
    );
  }

  if (!request) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Glass className="p-8 text-center max-w-md mx-auto">
            <AlertTriangle className="mx-auto text-red-400 mb-3" size={32} />
            <h3 className="text-lg font-medium text-white/90">Request Not Found</h3>
            <p className="text-xs text-white/50 mt-1">The emergency sequence could not be loaded.</p>
            <button 
              onClick={() => navigate(-1)} 
              className="mt-4 text-xs bg-white/10 px-4 py-2 rounded-lg text-white/90 hover:bg-white/20 transition"
            >
              Go Back
            </button>
          </Glass>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* Top Header Control Area */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition text-white/80"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Emergency Review</h1>
          <p className="text-sm text-white/60 mt-0.5">Review dispatch conditions and authorize rescue operation tasks</p>
        </div>
      </div>

      {/* Main Layout Divided via Glass Block Setup */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1.8fr] gap-6 items-start">
        
        {/* LEFT COLUMN: User Metadata Profiles & Attached Media */}
        <Glass className="overflow-hidden space-y-0">
          <div className="relative bg-black/40 border-b border-white/10">
            <img
              src={request.image || defaultFactoryImg}
              alt="Emergency Scene Attachments"
              className="w-full h-60 object-cover opacity-100"
              onError={(e) => {
                // Instantly defaults to your local asset if the database URL breaks
                e.currentTarget.src = defaultFactoryImg;
              }}
            />
            <div className="absolute top-3 right-3">
              <span className="px-3 py-1 text-xs font-black tracking-wide uppercase rounded-md bg-yellow-500 text-black shadow-lg">
                {request.urgency || "CRITICAL"} URGENCY
              </span>
            </div>
          </div>

          <div className="divide-y divide-white/10 text-sm text-white">
            <div className="flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white">
                <User size={18} />
              </div>
              <div>
                <div className="text-[11px] text-white font-black uppercase tracking-widest opacity-90">Reporter</div>
                <div className="font-semibold text-white/80 mt-0.5">{request.user?.name || "Unknown User"}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white">
                <Phone size={18} />
              </div>
              <div>
                <div className="text-[11px] text-white font-black uppercase tracking-widest opacity-90">Emergency Contact</div>
                <div className="font-mono font-semibold text-white/80 mt-0.5">{request.phone || request.user?.phone || "—"}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white">
                <MapPin size={18} />
              </div>
              <div>
                <div className="text-[11px] text-white font-black uppercase tracking-widest opacity-90">Coordinates / Location</div>
                <div className="font-semibold text-white/80 mt-0.5">
                  {request.location?.name || `Lat: ${request.location?.lat || "—"} • Lon: ${request.location?.lng || "—"}`}
                </div>
                {request.location?.lat && (
                  <div className="text-xs font-mono text-white/60 mt-0.5">
                    {request.location.lat}, {request.location.lng}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Glass>

        {/* RIGHT COLUMN: Descriptive Data & Management Actions */}
        <div className="space-y-6">
          <Glass className="overflow-hidden">
            <div className="bg-black/50 px-6 py-4 border-b border-white/10">
              <h2 className="text-lg font-bold text-white tracking-wide">Request Information</h2>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Emergency Classification Element */}
              <div>
                <label className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-white mb-2 font-black">
                  <Layers size={14} className="text-white" /> Emergency Classification
                </label>
                <div className="rounded-xl bg-black/50 border border-white/20 px-4 py-3.5 text-sm text-white font-bold capitalize shadow-inner">
                  {request.type || "Medical"}
                </div>
              </div>

              {/* Situation Report Description Element */}
              <div>
                <label className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-white mb-2 font-black">
                  <FileText size={14} className="text-white" /> Situation Report Description
                </label>
                <div className="rounded-xl bg-black/50 border border-white/20 px-4 py-3.5 text-sm text-white font-bold leading-relaxed min-h-[90px] shadow-inner">
                  {request.description || "No customized descriptor notes applied."}
                </div>
              </div>

              {/* Logged Inbound Timestamp Element */}
              <div>
                <label className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-white mb-2 font-black">
                  <Calendar size={14} className="text-white" /> Logged Inbound Timestamp
                </label>
                <div className="rounded-xl bg-black/50 border border-white/20 px-4 py-3.5 text-sm text-white font-mono font-bold shadow-inner">
                  {request.createdAt ? new Date(request.createdAt).toLocaleString() : "—"}
                </div>
              </div>
            </div>
          </Glass>

          {/* HIGH CONTRAST SOLID ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleReject}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-4 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-red-950/50 transition-all hover:bg-red-500 active:scale-[0.98]"
            >
              <X size={16} strokeWidth={3} /> Decline Incident
            </button>

            <button
              onClick={handleAccept}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-4 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-emerald-950/50 transition-all hover:bg-emerald-500 active:scale-[0.98]"
            >
              <Check size={16} strokeWidth={3} /> Deploy & Accept Mission
            </button>
          </div>
        </div>

      </div>
    </AppShell>
  );
}