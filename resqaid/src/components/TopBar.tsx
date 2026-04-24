import { Battery, Gauge, Mountain, Signal, Plane, Bell, User } from "lucide-react";

const stats = [
  { icon: Plane, label: "Drone", value: "DR-08" },
  { icon: Battery, label: "Battery", value: "80%" },
  { icon: Gauge, label: "Speed", value: "8.7m/s" },
  { icon: Mountain, label: "Altitude", value: "250m" },
  { icon: Signal, label: "Signal", value: "Strong" },
];

const TopBar = () => (
  <header className="flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-950">
          <span>Mission control</span>
          <span className="text-primary">›</span>
          <span className="text-white font-semibold text-lg">Mountain Rescue #24</span>
        </div>
        <p className="text-xs text-gray-950 mt-0.5">14:32 • 21 May 2025 • Dense Forest, Oran • SAR Operation</p>
      </div>
      <div className="flex items-center gap-3">
        <button className="glass rounded-full p-2 hover:bg-green-600/10 transition-colors">
          <Bell size={18} className="text-gray-300" />
        </button>
        <div className="w-9 h-9 rounded-full bg-green-600/20 border border-primary/40 flex items-center justify-center">
          <User size={18} className="text-green-600" />
        </div>
      </div>
    </div>
    <div className="flex gap-2">
      {stats.map(({ icon: Icon, label, value }) => (
        <div key={label} className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg px-4 py-2 flex items-center gap-2.5 text-sm">
          <Icon size={16} className="text-gray-500" />
          <div>
            <span className="text-gray-400 text-xs">{label}</span>
            <p className="text-white font-medium text-sm leading-tight">{value}</p>
          </div>
        </div>
      ))}
    </div>
  </header>
);

export default TopBar;
