const MissionMap = () => (
    <div className="rounded-xl  backdrop-blur-md border border-white/10 bg-black/20 p-4 space-y-3 flex flex-col">
      <h3 className="font-semibold text-sm uppercase text-white tracking-wider text-[10px]">Mission Map</h3>
      <div className="flex-1 rounded-lg bg-secondary/50 min-h-[140px] relative overflow-hidden">
        {/* Stylized map */}
        <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(circle at 60% 40%, hsl(152 60% 30%), transparent 60%), radial-gradient(circle at 30% 70%, hsl(200 30% 15%), transparent 50%)" }} />
        
        {/* Drone marker */}
        <div className="absolute top-[30%] right-[35%] flex flex-col items-center">
          <div className="w-3 h-3 bg-primary rounded-full shadow-lg shadow-primary/50 status-pulse" />
          <span className="text-[9px] text-primary mt-0.5 font-medium">DR-08</span>
        </div>
  
        {/* SOS marker */}
        <div className="absolute top-[45%] right-[25%] flex flex-col items-center">
          <div className="w-3 h-3 bg-sos rounded-full shadow-lg shadow-sos/50 status-pulse" />
          <span className="text-[9px] text-red-600 mt-0.5 font-medium">Last SOS</span>
          <span className="text-[8px] text-muted-foreground">14:35</span>
        </div>
  
        {/* Base camp */}
        <div className="absolute bottom-[20%] left-[25%] flex flex-col items-center">
          <div className="w-3 h-3 border-2 border-foreground/50 rounded-full" />
          <span className="text-[9px] text-foreground/60 mt-0.5">LZ-1</span>
          <span className="text-[8px] text-muted-foreground">Base Camp</span>
        </div>
      </div>
      
      <div className="flex gap-4 text-[9px] text-muted-foreground justify-center">
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-600" />Drone</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-foreground/50" />Team</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-600" />SOS</span>
        <span className="flex items-center gap-1"><span className="w-3 h-px bg-muted-foreground" />Route</span>
      </div>
    </div>
  );
  
  export default MissionMap;
  