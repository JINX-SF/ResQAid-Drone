const MissionInfo = () => (
    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4 space-y-3">
      <h3 className="font-semibold text-white text-sm">Mission information</h3>
      <div className="space-y-2 text-sm">
        {[
          ["TYPE", "Mountain Rescue"],
          ["Status", "ONGOING"],
          ["Mission ID", "#24"],
          ["Start Time", "14:32 • 21 May 2025"],
          ["Location", "Dense Forest, Oran (27°N, 109°W)"],
          ["Assigned Drone", "DR-08"],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between items-start gap-4">
            <span className="text-muted-foreground text-xs">{label}</span>
            <span className={`text-xs font-medium text-right ${label === "Status" ? "text-green-600 text-glow-green" : "text-white"}`}>
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
  
  export default MissionInfo;
  