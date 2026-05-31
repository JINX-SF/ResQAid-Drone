import { motion } from "motion/react";
import { ArrowRight, Radar, MapPin, Thermometer } from "lucide-react";
import { Link } from "react-router-dom";

export function Hero() {
  return (
    <section className="relative flex items-center justify-center overflow-hidden" style={{ minHeight: '130vh', background: '#0a0906' }}>

      {/* Background Image — Sonatrach-style aerial industrial desert facility */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=90&w=1920"
          alt="Industrial zone aerial view"
          className="w-full h-full object-cover"
          style={{ opacity: 0.72, objectPosition: 'center 40%' }}
        />
        {/* Dark top for nav */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(5,4,2,0.88) 0%, rgba(5,4,2,0.28) 22%, rgba(5,4,2,0.05) 48%, rgba(5,4,2,0.6) 78%, rgba(10,9,6,1) 100%)' }}></div>
        {/* Left vignette */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(5,4,2,0.5) 0%, transparent 55%)' }}></div>
        {/* Golden orange horizon glow */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 100% 28% at 50% 56%, rgba(210,110,20,0.22) 0%, rgba(200,90,10,0.08) 50%, transparent 72%)' }}></div>
        {/* Warm bottom bleed */}
        <div className="absolute bottom-0 left-0 right-0 h-64" style={{ background: 'linear-gradient(to top, rgba(10,9,6,1) 0%, transparent 100%)' }}></div>
      </div>

      {/* Very subtle grid */}
      <div className="absolute inset-0 z-0" style={{ opacity: 0.035 }}>
        <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(#D26E1E 1px, transparent 1px), linear-gradient(90deg, #D26E1E 1px, transparent 1px)', backgroundSize: '70px 70px' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-44 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border" style={{ borderColor: 'rgba(210,110,30,0.4)', background: 'rgba(210,110,30,0.1)' }}>
            <span className="w-2 h-2 rounded-full animate-pulse inline-block" style={{ background: '#D26E1E' }}></span>
            <span className="text-sm tracking-widest uppercase" style={{ color: '#E8883A' }}>AI-Powered Autonomous Operations</span>
          </div>

          <h1 className="text-4xl md:text-6xl mb-6 tracking-tight font-bold leading-tight">
            <span className="text-white block">Autonomous Drone Operations</span>
            <span className="block mt-1" style={{ color: '#7aaa8a' }}>for Industrial Zones</span>
          </h1>

          <p className="text-base md:text-lg text-gray-300 mb-14 max-w-2xl mx-auto leading-relaxed">
            Centralized mission control for emergency response, industrial inspection, security patrol, and remote logistics.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
            <Link to="/login" className="px-8 py-4 text-white flex items-center gap-2 group transition-opacity hover:opacity-90" style={{ background: '#D26E1E' }}>
  <span className="tracking-widest uppercase text-sm font-semibold">Request Demo</span>
  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
</Link>
            <a href="#platform" className="px-8 py-4 border text-white transition-colors hover:bg-white/5" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
  <span className="tracking-widest uppercase text-sm">Explore Platform</span>
</a>
          </div>
        </motion.div>

        {/* Telemetry Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          <TelemetryCard icon={<Radar className="w-5 h-5" />} label="LIVE TRACKING" value="8 Drones Active" accent="orange" delay={0.2} />
          <TelemetryCard icon={<Thermometer className="w-5 h-5" />} label="AI ANOMALY DETECTION" value="Thermal Scanning" accent="green" delay={0.4} />
          <TelemetryCard icon={<MapPin className="w-5 h-5" />} label="MISSION STATUS" value="31.42°N, 2.89°E" accent="orange" delay={0.6} />
        </div>
      </div>

      {/* Scan Line */}
      <motion.div className="absolute inset-0 z-0 pointer-events-none" initial={{ y: '-100%' }} animate={{ y: '100%' }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }}>
        <div className="w-full h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(210,110,30,0.25), transparent)' }}></div>
      </motion.div>
    </section>
  );
}

function TelemetryCard({ icon, label, value, accent, delay }: {
  icon: React.ReactNode; label: string; value: string; accent: 'green' | 'orange'; delay: number
}) {
  const color = accent === 'orange' ? '#D26E1E' : '#7aaa8a';
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay }}
      className="backdrop-blur-md p-6 rounded-lg transition-colors hover:bg-black/50"
      style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.1)', borderLeftColor: color, borderLeftWidth: '2px' }}
    >
      <div className="flex items-center gap-3 mb-2" style={{ color }}>
        {icon}
        <span className="text-xs tracking-widest uppercase">{label}</span>
      </div>
      <div className="text-white text-lg font-medium">{value}</div>
    </motion.div>
  );
}
