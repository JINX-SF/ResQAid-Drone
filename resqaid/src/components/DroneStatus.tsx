import { Battery, Camera } from "lucide-react";

const DroneStatus = () => (
  <div className="glass rounded-xl  backdrop-blur-md border border-white/10  p-4 space-y-3">
    <h3 className="font-semibold text-white text-sm">Drone status</h3>
    <div className="flex items-center gap-3 mb-2">
      <div className="w-12 h-8 rounded bg-secondary flex items-center justify-center text-xs text-muted-foreground">🛩️</div>
      <div>
        <p className="text-sm text-white font-semibold">DR-08</p>
        <p className="text-[10px] text-muted-foreground">DJI Matrice 30T</p>
      </div>
    </div>
    <div className="space-y-1.5 text-sm">
      {[
        ["Status", <span className="text-green-600 text-glow-green flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary status-pulse" />In Air</span>],
        ["Battery", <span className="flex items-center text-white gap-1.5"><Battery size={14} className="text-green-600 text-glow-green" />80%</span>],
        ["Speed", "8.7m/s"],
        ["Altitude", "250m"],
        ["Camera", <span className="text-green-600 text-glow-green flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary status-pulse" />active</span>],
      ].map(([label, value], i) => (
        <div key={i} className="flex  justify-between items-center">
          <span className="text-muted-foreground text-xs">{label}</span>
          <span className="text-xs text-white font-medium">{value}</span>
        </div>
      ))}
    </div>
  </div>
);

export default DroneStatus;
