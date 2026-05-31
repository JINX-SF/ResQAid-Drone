import { useEffect, useState } from "react";
import socket from "@/socket";
import LeafletMap, { LatLng } from "@/components/LeafletMap";

interface DronePos {
  droneId: string;
  name: string;
  lat: number;
  lng: number;
  progress: number;
  heading: number;
  battery: number;
}

interface Target {
  lat: number;
  lng: number;
}

interface Props {
  selectedMission: any;
}

const MissionMap = ({ selectedMission }: Props) => {
  const [dronePos, setDronePos] = useState<DronePos | null>(null);
  const [target, setTarget] = useState<Target | null>(null);
  const [route, setRoute] = useState<LatLng[]>([]);

  useEffect(() => {
    if (selectedMission?.targetArea) {
      setTarget({
        lat: selectedMission.targetArea.lat,
        lng: selectedMission.targetArea.lng,
      });
    }
  }, [selectedMission]);

  useEffect(() => {
    socket.on("dronePosition", (data) => {
      setDronePos(data);

      setRoute((prev) => [
        ...prev,
        {
          lat: data.lat,
          lng: data.lng,
        },
      ]);
    });

    socket.on("missionUpdated", (data) => {
      if (data.targetArea) {
        setTarget(data.targetArea);
      }
    });

    return () => {
      socket.off("dronePosition");
      socket.off("missionUpdated");
    };
  }, []);

  const dronePin: LatLng | null = dronePos
    ? {
        lat: dronePos.lat,
        lng: dronePos.lng,
      }
    : null;

  const targetPin: LatLng | null = target
    ? {
        lat: target.lat,
        lng: target.lng,
      }
    : null;

  return (
    <div className="rounded-xl backdrop-blur-md border border-white/10 bg-black/20 p-4 space-y-3 flex flex-col">
      <h3 className="font-semibold uppercase text-white tracking-wider text-[10px]">
        Mission Map{" "}
        {dronePos && <span className="text-green-400">● LIVE</span>}
      </h3>

      <div className="flex-1 min-h-[140px] rounded-lg overflow-hidden border border-white/10">
        <LeafletMap
          dronePin={dronePin}
          targetPin={targetPin}
          route={route}
          className="h-full w-full"
          interactive
        />
      </div>

      <div className="flex gap-4 text-[9px] text-muted-foreground justify-center">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Drone
        </span>

        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          Target
        </span>

        <span className="flex items-center gap-1">
          <span className="w-3 h-px bg-green-400" />
          Route
        </span>
      </div>
    </div>
  );
};

export default MissionMap;