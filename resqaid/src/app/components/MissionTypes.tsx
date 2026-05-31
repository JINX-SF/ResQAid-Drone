import { motion } from "motion/react";
import { Heart, Flame, Building2, Eye, Package2 } from "lucide-react";

const missions = [
  { icon: Heart, title: "Search & Rescue", description: "Locate missing persons and injured workers in remote zones using thermal imaging and AI human detection.", image: "https://images.unsplash.com/photo-1753781466620-d2bc4d703b2e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800", capability: "Thermal Detection", accent: '#D26E1E' },
  { icon: Flame, title: "Oil & Gas Monitoring", description: "Detect gas leaks, overheating equipment, and fire anomalies along pipelines and at energy facilities.", image: "https://images.unsplash.com/photo-1649829725145-d93731589a6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800", capability: "AI Anomaly Detection", accent: '#D26E1E' },
  { icon: Building2, title: "Industrial Inspection", description: "AI-driven inspection of towers, tanks, solar farms, and infrastructure — identifying damage before it escalates.", image: "https://images.unsplash.com/photo-1733683253670-932e9da832d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800", capability: "Computer Vision", accent: '#7aaa8a' },
  { icon: Eye, title: "Security Surveillance", description: "Continuous AI surveillance of restricted zones, industrial perimeters, and remote camps.", image: "https://images.unsplash.com/photo-1753781467329-416d05e7e477?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800", capability: "24/7 Monitoring", accent: '#7aaa8a' },
  { icon: Package2, title: "Remote Logistics", description: "Autonomous delivery of medicine, sensors, and critical equipment between isolated sites.", image: "https://images.unsplash.com/photo-1753781466384-cf5eee0a505d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800", capability: "Autonomous Delivery", accent: '#D26E1E' },
];

const topRow = missions.slice(0, 2);
const bottomRow = missions.slice(2, 5);

export function MissionTypes() {
  return (
    <section className="relative py-32" style={{ background: '#1a1a1a' }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #D26E1E, #3D5A45, transparent)' }}></div>

      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl mb-6 text-white tracking-tight font-semibold">
            MISSION <span style={{ color: '#D26E1E' }}>TYPES</span>
          </h2>
          <div className="h-px w-24 mx-auto mb-6" style={{ background: 'linear-gradient(90deg, #D26E1E, #3D5A45)' }}></div>
          <p className="text-gray-400 max-w-xl mx-auto">Every critical operation in the industrial landscape, covered by one unified platform.</p>
        </motion.div>

        {/* Top row: 2 cards centered */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 max-w-4xl mx-auto">
          {topRow.map((mission, index) => (
            <MissionCard key={mission.title} mission={mission} index={index} />
          ))}
        </div>

        {/* Bottom row: 3 cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {bottomRow.map((mission, index) => (
            <MissionCard key={mission.title} mission={mission} index={index + 2} />
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #3D5A45, #D26E1E, transparent)' }}></div>
    </section>
  );
}

function MissionCard({ mission, index }: { mission: typeof missions[0]; index: number }) {
  const Icon = mission.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group relative overflow-hidden rounded-xl transition-all"
      style={{ border: `1px solid rgba(255,255,255,0.1)` }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = mission.accent; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}
    >
      <div className="relative h-52 overflow-hidden">
        <img src={mission.image} alt={mission.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #1a1a1a 0%, rgba(0,0,0,0.5) 55%, transparent 100%)' }}></div>

        <div className="absolute top-4 right-4 px-3 py-1.5 backdrop-blur-md rounded-full" style={{ background: `${mission.accent}22`, border: `1px solid ${mission.accent}55` }}>
          <span className="text-xs tracking-wider uppercase" style={{ color: mission.accent }}>{mission.capability}</span>
        </div>

        <div className="absolute bottom-4 left-4 w-10 h-10 flex items-center justify-center rounded-lg backdrop-blur-md" style={{ background: `${mission.accent}25`, border: `1px solid ${mission.accent}45` }}>
          <Icon className="w-5 h-5" style={{ color: mission.accent }} />
        </div>
      </div>

      <div className="p-6" style={{ background: '#1a1a1a' }}>
        <div className="w-8 h-0.5 mb-3" style={{ background: mission.accent }}></div>
        <h3 className="text-sm text-white mb-3 tracking-widest uppercase font-semibold">{mission.title}</h3>
        <p className="text-gray-400 leading-relaxed text-sm">{mission.description}</p>
      </div>
    </motion.div>
  );
}
