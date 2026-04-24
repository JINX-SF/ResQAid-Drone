import { Users, Flame, Thermometer, Activity } from "lucide-react";

const detections = [
  { icon: Users, label: "human detection", value: "2", color: "text-green-300" },
  { icon: Flame, label: "heat signature", value: "3", color: "text-orange-400" },
  { icon: Thermometer, label: "max temperature", value: "250C", color: "text-red-600" },
  { icon: Activity, label: "movement", value: "Low", color: "text-muted-foreground" },
];

const Detection = () => (
  <div className="glass rounded-xl  backdrop-blur-md border border-white/10 bg-black/20 p-4 space-y-3">
    <h3 className="font-semibold text-sm text-white">Detection</h3>
    <div className="space-y-2">
      {detections.map(({ icon: Icon, label, value, color }) => (
        <div key={label} className=" rounded-lg px-3 bg-black/40 backdrop-blur-md border border-white/10 p-4  py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon size={14} className={color} />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
          <span className="text-sm text-white font-bold">{value}</span>
        </div>
      ))}
    </div>
    <button className="w-full text-center text-xs text-muted-foreground hover:text-white transition-colors py-1 glass-subtle rounded-md">
      view details
    </button>
  </div>
);

export default Detection;
