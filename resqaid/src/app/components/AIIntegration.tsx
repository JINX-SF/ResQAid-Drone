import { motion } from "motion/react";
import { Cpu, Route, Eye, Wrench, Bot, TrendingUp } from "lucide-react";

const aiFeatures = [
  { icon: Bot, title: "Mission Planning", description: "Operator describes an incident → AI classifies urgency, recommends drone type, and generates a complete mission brief automatically.", accent: '#D26E1E' },
  { icon: Route, title: "Route Optimization", description: "AI selects the nearest available drone, optimizes flight path, avoids restricted zones, and minimizes battery consumption.", accent: '#7aaa8a' },
  { icon: Eye, title: "Anomaly Detection", description: "Real-time video and thermal analysis — AI flags smoke, heat signatures, structural damage, or unauthorized movement instantly.", accent: '#D26E1E' },
  { icon: Cpu, title: "Thermal Analysis", description: "Advanced thermal imaging processing to detect gas leaks, overheating equipment, and fire anomalies along pipelines.", accent: '#7aaa8a' },
  { icon: TrendingUp, title: "Emergency Classification", description: "Intelligent incident categorization and severity assessment for rapid response prioritization.", accent: '#D26E1E' },
  { icon: Wrench, title: "Predictive Maintenance", description: "Continuous telemetry monitoring — AI predicts battery failure, motor degradation, or instability before missions.", accent: '#7aaa8a' },
];

export function AIIntegration() {
  return (
    <section className="relative py-32 overflow-hidden" style={{ background: '#222222' }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #3D5A45, #D26E1E, transparent)' }}></div>

      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(210,110,30,0.04) 0%, transparent 70%)' }}></div>

      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl mb-6 text-white tracking-tight font-semibold">
            AI <span style={{ color: '#D26E1E' }}>INTEGRATION</span>
          </h2>
          <div className="h-px w-24 mx-auto mb-6" style={{ background: 'linear-gradient(90deg, #D26E1E, #3D5A45)' }}></div>
          <p className="text-gray-400 max-w-xl mx-auto">Advanced artificial intelligence powers every aspect of ResQAid's operational platform.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {aiFeatures.map((feature, index) => <AIFeatureCard key={feature.title} feature={feature} index={index} />)}
        </div>

        {/* Bottom banner */}
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }}>
          <div className="relative p-10 rounded-2xl text-center overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(210,110,30,0.25)' }}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #D26E1E, transparent)' }}></div>
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 0%, rgba(210,110,30,0.07) 0%, transparent 70%)' }}></div>
            <h3 className="text-2xl text-white mb-3 font-semibold tracking-wide">AUTONOMOUS DECISION SUPPORT</h3>
            <p className="text-gray-300 max-w-3xl mx-auto leading-relaxed">
              ResQAid's AI engine processes mission data, environmental conditions, and fleet status in real-time to provide intelligent operational recommendations and autonomous coordination.
            </p>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #D26E1E, #3D5A45, transparent)' }}></div>
    </section>
  );
}

function AIFeatureCard({ feature, index }: { feature: typeof aiFeatures[0]; index: number }) {
  const Icon = feature.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group relative p-8 rounded-xl transition-all"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderLeftColor: feature.accent, borderLeftWidth: '2px' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.borderColor = feature.accent; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.borderLeftColor = feature.accent; }}
    >
      <div className="w-14 h-14 mb-6 flex items-center justify-center rounded-xl" style={{ background: `${feature.accent}15`, border: `1px solid ${feature.accent}35` }}>
        <Icon className="w-7 h-7" style={{ color: feature.accent }} />
      </div>
      <h3 className="text-lg text-white mb-3 tracking-wide uppercase font-semibold">{feature.title}</h3>
      <p className="text-gray-400 leading-relaxed text-sm">{feature.description}</p>
    </motion.div>
  );
}
