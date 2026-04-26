import { useState } from "react";
import droneSrc from "@/assets/Drn.webp";

export default function DroneIcon({ className = "", rotate = false }) {
  const [hover, setHover] = useState(false);

  return (
    <img
      src={droneSrc}
      alt=""
      aria-hidden="true"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`object-contain ${rotate ? "-rotate-45" : ""} ${className}`}
      style={{
        filter: hover ? "brightness(0) invert(1)" : "brightness(0)"
      }}
    />
  );
}