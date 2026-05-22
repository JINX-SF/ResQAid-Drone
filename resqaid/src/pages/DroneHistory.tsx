import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "@/api";
import AppShell, { Glass } from "../components/AppShell";

export default function DroneHistory() {
  const { id } = useParams();
  const [drone, setDrone] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const historyRes = await API.get(`/drones/${id}/history`);
        const droneRes = await API.get(`/drones/${id}`);

        setHistory(historyRes.data?.data || []);
        setDrone(droneRes.data?.data || droneRes.data);
      } catch (err) {
        console.error(err);
      }
    };

    if (id) fetchHistory();
  }, [id]);

  return (
    <AppShell>
      <Glass className="p-6 text-white">
        <h1 className="text-3xl font-bold text-green-400 mb-6">
          Drone History
        </h1>

        {drone && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 mb-6">
            <h2 className="text-2xl font-bold">{drone.name}</h2>
            <p>Battery: {drone.battery}%</p>
            <p>Status: {drone.status}</p>
            <p>
              Location: {drone.location?.lat}, {drone.location?.lng}
            </p>
          </div>
        )}

        {history.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-xl font-bold text-green-400">
              No edits yet
            </h2>
            <p className="text-white/60">
              This drone only has its original information.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item._id}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <h2 className="text-xl font-bold text-yellow-400">
                  {item.action || "updated"} by {item.editorName || "Unknown"}
                </h2>

                <p className="text-sm text-white/50 mb-4">
                  {new Date(item.createdAt).toLocaleString()}
                </p>

                {item.changes?.length > 0 ? (
                  item.changes.map((change: any, index: number) => (
                    <div
                      key={index}
                      className="rounded-xl bg-black/30 p-3 mb-2"
                    >
                      <p className="font-semibold text-green-300">
                        {change.field}
                      </p>

                      <p className="text-white/70">
                        {JSON.stringify(change.oldValue)} →{" "}
                        {JSON.stringify(change.newValue)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-white/60">No field changes recorded.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </Glass>
    </AppShell>
  );
}