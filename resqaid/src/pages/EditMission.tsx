import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "@/api";

export default function EditMission() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    type: "",
    status: "",
    urgency: "",
    payloadWeight: 0,
    lat: "",
    lng: "",
  });

  // FETCH MISSION
  useEffect(() => {
    const fetchMission = async () => {
      const res = await API.get(`/missions/${id}`);
      const m = res.data;

      setForm({
        title: m.title,
        type: m.type,
        status: m.status,
        urgency: m.urgency,
        payloadWeight: m.payloadWeight,
        lat: m.departureLocation?.lat || "",
        lng: m.departureLocation?.lng || "",
      });
    };

    fetchMission();
  }, [id]);

  // UPDATE
  const handleUpdate = async () => {
    try {
      await API.put(`/missions/${id}`, {
        title: form.title,
        type: form.type,
        status: form.status,
        urgency: form.urgency,
        payloadWeight: Number(form.payloadWeight),

        lat: Number(form.lat),
        lng: Number(form.lng),
      });

      alert("Mission updated ✅");
      navigate("/missionsPage");

    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  return (
    <div className="p-6">
      <h2>Edit Mission</h2>

      <input value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} />
      <input value={form.type} onChange={(e)=>setForm({...form,type:e.target.value})} />
      <input value={form.status} onChange={(e)=>setForm({...form,status:e.target.value})} />
      <input value={form.urgency} onChange={(e)=>setForm({...form,urgency:e.target.value})} />

      <input type="number" value={form.payloadWeight}
        onChange={(e)=>setForm({...form,payloadWeight:Number(e.target.value)})}
      />

      <input value={form.lat}
        onChange={(e)=>setForm({...form,lat:e.target.value})}
      />

      <input value={form.lng}
        onChange={(e)=>setForm({...form,lng:e.target.value})}
      />

      <button onClick={handleUpdate}>Update</button>
    </div>
  );
}