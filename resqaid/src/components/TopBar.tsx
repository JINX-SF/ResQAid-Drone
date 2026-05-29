import { Bell, User } from "lucide-react";
import { Link } from "react-router-dom";

const TopBar = () => (
  <header className="flex items-center justify-between">
    <div>
      <div className="flex items-center gap-2 text-sm text-gray-950">
        <span>Mission control</span>
        <span className="text-primary">›</span>
        <span className="text-white font-semibold text-lg">Control Center</span>
      </div>
      <p className="text-xs text-gray-950 mt-0.5">ResQAid · SAR Operations</p>
    </div>
    <div className="flex items-center gap-3">
      <button className="glass rounded-full p-2 hover:bg-green-600/10 transition-colors">
        <Bell size={18} className="text-gray-300" />
      </button>
      <div className="w-9 h-9 rounded-full bg-green-600/20 border border-primary/40 flex items-center justify-center">
        <Link to={"/profile"}><User size={18} className="text-green-600" /></Link>
      </div>
    </div>
  </header>
);

export default TopBar;