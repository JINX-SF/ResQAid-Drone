import { motion } from "motion/react";
import { Radio, Plane, Brain, AlertCircle, Search, Shield, Package, Clock, Settings, Activity } from "lucide-react";

const features = [
  { icon: Radio, title: "Mission Control", description: "Centralized command interface for all drone operations", accent: '#D26E1E' },
  { icon: Plane, title: "Fleet Management", description: "Real-time tracking and coordination of multiple drones", accent: '#7aaa8a' },
  { icon: Brain, title: "AI Analysis", description: "Automated anomaly detection and threat classification", accent: '#D26E1E' },
  { icon: AlertCircle, title: "Emergency Dispatch", description: "Rapid response system for critical situations", accent: '#D26E1E' },
  { icon: Search, title: "Industrial Inspection", description: "Automated infrastructure monitoring and analysis", accent: '#7aaa8a' },
  { icon: Shield, title: "Security Patrol", description: "Continuous perimeter surveillance and threat detection", accent: '#7aaa8a' },
  { icon: Package, title: "Remote Logistics", description: "Autonomous delivery to isolated industrial locations", accent: '#D26E1E' },
  { icon: Clock, title: "Mission History", description: "Complete operational log and analytics dashboard", accent: '#7aaa8a' },
  { icon: Settings, title: "Predictive Maintenance", description: "AI-powered equipment health monitoring", accent: '#D26E1E' },
  { icon: Activity, title: "Real-Time Telemetry", description: "Live drone metrics and environmental data", accent: '#7aaa8a' },
];

export function CoreFeatures() {
  return (
    <section className="relative py-32" style={{ background: '#1f1f1f' }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #3D5A45, #D26E1E, transparent)' }}></div>

      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl mb-6 text-white tracking-tight font-semibold">
            CORE PLATFORM <span style={{ color: '#D26E1E' }}>FEATURES</span>
          </h2>
          <div className="h-px w-24 mx-auto mb-6" style={{ background: 'linear-gradient(90deg, #D26E1E, #3D5A45)' }}></div>
          <p className="text-gray-400 max-w-xl mx-auto">Every operational function, unified under one command interface designed for mission-critical environments.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #D26E1E, #3D5A45, transparent)' }}></div>
    </section>
  );
}

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const Icon = feature.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.05 }}
      className="group relative p-6 rounded-xl transition-all cursor-default"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderTopColor: feature.accent, borderTopWidth: '2px' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
    >
      <div className="w-11 h-11 mb-4 flex items-center justify-center rounded-lg" style={{ background: `${feature.accent}15`, border: `1px solid ${feature.accent}35` }}>
        <Icon className="w-5 h-5" style={{ color: feature.accent }} />
      </div>
      <h3 className="text-sm text-white mb-2 tracking-wide uppercase font-semibold">{feature.title}</h3>
      <p className="text-xs text-gray-400 leading-relaxed">{feature.description}</p>
    </motion.div>
  );
}
