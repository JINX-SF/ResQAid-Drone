import { useState } from "react";
import rescueBg from "@/assets/rescue-bg.jpg";

const CameraFeed = () => {

  return (
    <div className="relative  rounded-xl overflow-hidden flex-1 min-h-[300px]">
      <img
        src={rescueBg}
        alt="Drone camera feed"
        className={`w-full h-full object-cover absolute inset-0 `}
      />
      
      <div className="absolute bottom-3 left-3 text-xs text-white">
        LIVE • REC ● 14:32:45
      </div>
    </div>
  );
};

export default CameraFeed;
