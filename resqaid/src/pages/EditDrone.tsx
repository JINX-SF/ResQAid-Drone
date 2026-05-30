import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "@/api"; // adjust if needed

export default function EditDrone() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    type: "",
    status: "",
    battery: 0,
    lat: 0,
    lng: 0,
  });

  // 🔥 FETCH DRONE
  useEffect(() => {
    const fetchDrone = async () => {
      try {
        const res = await API.get(`/drones/${id}`);
        const d = res.data.data;
        console.log("DRONE DATA", d);

        setForm({
          name: d.name,
          type: d.type,
          status: d.status,
          battery: d.battery,
          lat: Number.isFinite(d.location?.lat)
  ? d.location.lat
  : 0,

lng: Number.isFinite(d.location?.lng)
  ? d.location.lng
  : 0,
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchDrone();
  }, [id]);

  // 🔥 UPDATE DRONE
  const handleUpdate = async () => {
    try {
      await API.put(`/drones/${id}`, {
        name: form.name,
        type: form.type,
        status: form.status,
        battery: form.battery,
        location: {
          lat: form.lat,
          lng: form.lng,
        },
      });

      alert("Updated ✅");
      navigate("/dronespage");

    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  return (
    <div className="p-6">
      <h2>Edit Drone</h2>

      <input
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        placeholder="Name"
      />

      <select
  value={form.type}
  onChange={(e) => setForm({ ...form, type: e.target.value })}
   >
  <option value="camera_quadcopter">Camera Quadcopter — Surveillance & Mapping</option>
  <option value="thermal_drone">Thermal Drone — Search & Rescue</option>
  <option value="fixed_wing">Fixed-Wing Drone — Long-Range Patrol</option>
  <option value="vtol_hybrid">VTOL Hybrid — Autonomous Logistics</option>
  <option value="sensor_drone">Sensor Drone — Environmental Monitoring</option>
</select>

      <input
        value={form.status}
        onChange={(e) => setForm({ ...form, status: e.target.value })}
        placeholder="Status"
      />

      <input
        type="number"
        value={form.battery}
        onChange={(e) => setForm({ ...form, battery: Number(e.target.value) })}
        placeholder="Battery"
      />

      <input
        type="number"
        value={form.lat}
        onChange={(e) => setForm({ ...form, lat: Number(e.target.value) })}
        placeholder="Latitude"
      />

      <input
        type="number"
        value={form.lng}
        onChange={(e) => setForm({ ...form, lng: Number(e.target.value) })}
        placeholder="Longitude"
      />

      <button onClick={handleUpdate}>Update</button>
    </div>
  );
}