import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api"
import {
  ArrowLeft,
  MapPin,
  Phone,
  User,
  AlertTriangle,
} from "lucide-react";

export default function RequestDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // FETCH REAL REQUEST
  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const res = await API.get(`/emergency-requests/${id}`);

        console.log("REQUEST DETAILS:", res.data);

        setRequest(
          res.data?.data ||
          res.data?.request ||
          res.data
        );
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id]);

  // ACCEPT
  const handleAccept = async () => {
    try {
   await API.put(`/emergency-requests/${id}/accept`);

      alert("Request accepted ✅");

      navigate("/missionspage");
    } catch (err) {
      console.log(err);
      alert("Failed");
    }
  };

  // REJECT
  const handleReject = async () => {
    try {
     await API.put(`/emergency-requests/${id}/reject`);

      alert("Request rejected ❌");

      navigate("/dashboard");
    } catch (err) {
      console.log(err);
      alert("Failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-black">
        Loading...
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 bg-black">
        Request not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060816] text-white p-8">

      {/* TOP */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition"
        >
          <ArrowLeft />
        </button>

        <h1 className="text-4xl font-bold">
          Emergency Review
        </h1>
      </div>

      {/* MAIN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LEFT */}
        <div className="rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl">

          <img
            src={
              request.image ||
              "https://images.unsplash.com/photo-1506744038136-46273834b3fb"
            }
            alt=""
            className="w-full h-80 object-cover"
          />

          <div className="p-6 space-y-6">

            <div className="flex items-center gap-4">
              <User className="text-green-400" />
              <span className="text-lg">
                {request.user?.name || "Unknown user"}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <Phone className="text-green-400" />
              <span>
               {request.phone || request.user?.phone || "No phone"}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <MapPin className="text-green-400" />

              <span>
                {request.location?.name || "Unknown location"}
<br />
{request.location?.lat}, {request.location?.lng}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <AlertTriangle className="text-red-400" />

              <span className="text-red-400 font-semibold">
                {request.urgency}
              </span>
            </div>

          </div>
        </div>

        {/* RIGHT */}
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8">

          <h2 className="text-2xl font-bold mb-8">
            Request Information
          </h2>

          <div className="space-y-6">

            <div>
              <p className="text-white/50 mb-2">
                Emergency Type
              </p>

              <div className="rounded-2xl bg-black/30 p-4">
                {request.type}
              </div>
            </div>

            <div>
              <p className="text-white/50 mb-2">
                Description
              </p>

              <div className="rounded-2xl bg-black/30 p-4 leading-relaxed">
                {request.description}
              </div>
            </div>

            <div>
              <p className="text-white/50 mb-2">
                Created At
              </p>

              <div className="rounded-2xl bg-black/30 p-4">
                {new Date(
                  request.createdAt
                ).toLocaleString()}
              </div>
            </div>

          </div>

          {/* ACTIONS */}
          <div className="flex gap-4 mt-10">

            <button
              onClick={handleReject}
              className="flex-1 rounded-2xl bg-red-500 py-4 font-bold hover:bg-red-600 transition"
            >
              Reject
            </button>

            <button
              onClick={handleAccept}
              className="flex-1 rounded-2xl bg-green-500 py-4 font-bold hover:bg-green-600 transition"
            >
              Accept Mission
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}