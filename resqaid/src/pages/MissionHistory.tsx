import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import API from "@/api";

import AppShell, {
  Glass,
} from "@/components/AppShell";

export default function MissionHistory() {

  const { id } = useParams();

  const [mission, setMission] =
    useState<any>(null);

  const [history, setHistory] =
    useState<any[]>([]);

  useEffect(() => {

    const fetchHistory = async () => {

      try {

        // HISTORY
        const historyRes =
          await API.get(
            `/missions/${id}/history`
          );

        // CURRENT MISSION
        const missionRes =
          await API.get(
            `/missions/${id}`
          );

        setHistory(
          historyRes.data?.data || []
        );

        setMission(
          missionRes.data?.data ||
          missionRes.data
        );

      } catch (err) {

        console.error(err);

      }
    };

    if (id) {
      fetchHistory();
    }

  }, [id]);

  return (
    <AppShell>

      <Glass className="p-6 text-white">

        <h1 className="text-3xl font-bold text-green-400 mb-6">
          Mission History
        </h1>

        {/* CURRENT MISSION */}
        {mission && (

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 mb-6">

            <h2 className="text-2xl font-bold">
              {mission.title}
            </h2>

            <p>
              Type: {mission.type}
            </p>

            <p>
              Status: {mission.status}
            </p>

            <p>
              Urgency: {mission.urgency}
            </p>

          </div>
        )}

        {/* NO HISTORY */}
        {history.length === 0 ? (

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">

            <h2 className="text-xl font-bold text-green-400">
              No edits yet
            </h2>

            <p className="text-white/60">
              This mission only has
              its original information.
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

                  {item.action || "updated"}

                  {" "}by{" "}

                  {item.editorName || "Unknown"}

                </h2>

                <p className="text-sm text-white/50 mb-4">

                  {new Date(
                    item.createdAt
                  ).toLocaleString()}

                </p>

                {item.changes?.length > 0 ? (

                  item.changes.map(
                    (
                      change: any,
                      index: number
                    ) => (

                      <div
                        key={index}

                        className="rounded-xl bg-black/30 p-3 mb-2"
                      >

                        <p className="font-semibold text-green-300">
                          {change.field}
                        </p>

                        <p className="text-white/70">

                          {JSON.stringify(
                            change.oldValue
                          )}

                          {" → "}

                          {JSON.stringify(
                            change.newValue
                          )}

                        </p>

                      </div>
                    )
                  )

                ) : (

                  <p className="text-white/60">
                    No field changes recorded.
                  </p>

                )}

              </div>
            ))}

          </div>
        )}

      </Glass>

    </AppShell>
  );
}