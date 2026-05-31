import { motion } from "motion/react";

const stats = [
  { value: "6", label: "Mission Types", color: '#D26E1E' },
  { value: "5", label: "Drone Classes", color: '#7aaa8a' },
  { value: "24/7", label: "Autonomous Ops", color: '#D26E1E' },
  { value: "AI", label: "Full Integration", color: '#7aaa8a' },
];

export function PlatformOverview() {
  return (
    <section className="relative py-32" style={{ background: "#1c1c1c" }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl mb-6 text-white tracking-tight font-semibold">
            WHAT IS <span style={{ color: '#7aaa8a' }}>RESQAID</span>?
          </h2>
          <div className="h-px w-24 mx-auto mb-12" style={{ background: "linear-gradient(90deg, #D26E1E, #3D5A45)" }}></div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="max-w-5xl mx-auto">
          <div className="border p-12 rounded-2xl mb-16" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.09)' }}>
            <p className="text-xl text-gray-200 leading-relaxed mb-6">
              ResQAid is <span style={{ color: '#7aaa8a' }}>not a drone app</span> and <span style={{ color: '#7aaa8a' }}>not a camera system</span> — it is a{' '}
              <span className="text-white font-semibold">centralized AI-assisted operational platform</span> that manages drone fleets, dispatches missions, processes real-time analysis, and delivers operational intelligence from one unified interface.
            </p>
            <p className="text-lg text-gray-400 leading-relaxed">
              Built for Algeria's remote industrial environments — from oil fields and gas refineries to isolated desert stations.
            </p>
          </div>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center p-8 rounded-xl border" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="text-5xl font-bold mb-2" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* 3 feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {[
            { title: "Mission Control", desc: "Real-time drone command and dispatch", accent: '#D26E1E' },
            { title: "AI Analysis", desc: "Automated threat detection and classification", accent: '#7aaa8a' },
            { title: "Fleet Management", desc: "Complete operational oversight of all assets", accent: '#D26E1E' },
          ].map(f => (
            <div key={f.title} className="p-6 rounded-xl border transition-colors" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)', borderLeftColor: f.accent, borderLeftWidth: '2px' }}>
              <h3 className="text-lg text-white mb-2 font-semibold tracking-wide">{f.title}</h3>
              <p className="text-gray-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
