import { motion } from "motion/react";
import { Camera, Thermometer, Plane, Navigation, Radar } from "lucide-react";

const drones = [
  { icon: Camera, name: "Camera Quadcopter", role: "Surveillance & Mapping", endurance: "25-30 min", useCase: "Fast deployment for inspection and surveillance", color: '#D26E1E' },
  { icon: Thermometer, name: "Thermal Drone", role: "Search & Rescue", endurance: "20-25 min", useCase: "Night operations, fire detection, heat anomaly identification", color: '#D26E1E' },
  { icon: Plane, name: "Fixed-Wing Drone", role: "Long-Range Patrol", endurance: "90+ min", useCase: "Pipeline monitoring and large area coverage", color: '#7aaa8a' },
  { icon: Navigation, name: "VTOL Hybrid", role: "Autonomous Logistics", endurance: "60-90 min", useCase: "Remote delivery combining vertical takeoff with airplane range", color: '#7aaa8a' },
  { icon: Radar, name: "Sensor Drone", role: "Environmental Monitoring", endurance: "30-40 min", useCase: "Gas sensors, LiDAR, and edge AI for industrial monitoring", color: '#D26E1E' },
];

export function DroneFleet() {
  return (
    <section className="relative py-32" style={{ background: '#1a1a1a' }}>
      {/* Section divider top */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #D26E1E, #3D5A45, transparent)' }}></div>

      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl mb-6 text-white tracking-tight font-semibold">
            DRONE <span style={{ color: '#D26E1E' }}>FLEET</span>
          </h2>
          <div className="h-px w-24 mx-auto mb-8" style={{ background: 'linear-gradient(90deg, #D26E1E, #3D5A45)' }}></div>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">Multi-platform support for diverse operational requirements</p>
        </motion.div>

        {/* Row 1: 2 cards centered */}
        <div className="flex justify-center gap-6 mb-6">
          {drones.slice(0, 2).map((drone, index) => (
            <div key={drone.name} className="w-full max-w-sm">
              <DroneCard drone={drone} index={index} />
            </div>
          ))}
        </div>

        {/* Row 2: 3 cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {drones.slice(2).map((drone, index) => (
            <DroneCard key={drone.name} drone={drone} index={index + 2} />
          ))}
        </div>
      </div>

      {/* Section divider bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #3D5A45, #D26E1E, transparent)' }}></div>
    </section>
  );
}

function DroneCard({ drone, index }: { drone: typeof drones[0]; index: number }) {
  const Icon = drone.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group relative p-8 rounded-xl transition-all"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderTopColor: drone.color }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = drone.color; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.borderTopColor = drone.color; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="w-14 h-14 flex items-center justify-center rounded-xl" style={{ background: `${drone.color}18`, border: `1px solid ${drone.color}40` }}>
          <Icon className="w-7 h-7" style={{ color: drone.color }} />
        </div>
        <span className="px-3 py-1 text-xs rounded-full tracking-wider uppercase" style={{ background: `${drone.color}15`, color: drone.color, border: `1px solid ${drone.color}30` }}>
          AI Ready
        </span>
      </div>

      <h3 className="text-xl text-white mb-1 tracking-wide uppercase font-semibold">{drone.name}</h3>
      <p className="text-sm mb-4" style={{ color: drone.color }}>{drone.role}</p>

      <div className="space-y-2 mb-5">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 uppercase tracking-wide w-20">Endurance</span>
          <span className="text-sm text-gray-300 font-medium">{drone.endurance}</span>
        </div>
      </div>

      <p className="text-gray-400 text-sm leading-relaxed">{drone.useCase}</p>
    </motion.div>
  );
}
