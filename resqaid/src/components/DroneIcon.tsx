import droneSrc from "@/assets/drone.png";

type DroneIconProps = {
  className?: string;
  rotate?: boolean;
};

export default function DroneIcon({ className = "", rotate = false }: DroneIconProps) {
  return (
    <img
      src={droneSrc}
      alt=""
      aria-hidden="true"
      className={`object-contain ${rotate ? "-rotate-45" : ""} ${className}`}
      style={{ filter: "brightness(0) invert(1)" }}
    />
  );
}