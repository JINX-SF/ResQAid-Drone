import { motion } from "motion/react";
import { User, Cpu, Map, Radio, BarChart3, Lightbulb } from "lucide-react";

const flow = [
  { icon: User, label: "Operator", color: '#D26E1E' },
  { icon: Cpu, label: "AI Engine", color: '#D26E1E' },
  { icon: Map, label: "Mission Planning", color: '#7aaa8a' },
  { icon: Radio, label: "Drone Fleet", color: '#7aaa8a' },
  { icon: BarChart3, label: "Live Analytics", color: '#D26E1E' },
  { icon: Lightbulb, label: "Decision Support", color: '#D26E1E' },
];

export function TechArchitecture() {
  return (
    <section className="relative py-32" style={{ background: '#1f1f1f' }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #3D5A45, #D26E1E, transparent)' }}></div>

      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl mb-6 text-white tracking-tight font-semibold">
            TECHNOLOGY <span style={{ color: '#7aaa8a' }}>ARCHITECTURE</span>
          </h2>
          <div className="h-px w-24 mx-auto mb-6" style={{ background: 'linear-gradient(90deg, #D26E1E, #3D5A45)' }}></div>
          <p className="text-gray-400 max-w-xl mx-auto">A unified operational flow from human input to autonomous action — every layer AI-informed.</p>
        </motion.div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {flow.map((step, index) => (
            <div key={step.label} className="flex flex-col md:flex-row items-center gap-4">
              <FlowNode step={step} index={index} />
              {index < flow.length - 1 && (
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.15 + 0.2 }} className="hidden md:flex items-center">
                  <div className="relative w-10 h-0.5" style={{ background: `linear-gradient(to right, ${step.color}60, ${flow[index+1].color}40)` }}>
                    <motion.div className="absolute top-1/2 -translate-y-1/2 right-0 w-1.5 h-1.5 rounded-full" style={{ background: flow[index+1].color }} animate={{ x: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
                  </div>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #D26E1E, #3D5A45, transparent)' }}></div>
    </section>
  );
}

function FlowNode({ step, index }: { step: typeof flow[0]; index: number }) {
  const Icon = step.icon;
  return (
    <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.15 }} className="group relative">
      <div className="w-28 h-28 flex flex-col items-center justify-center rounded-2xl transition-all"
        style={{ background: 'rgba(255,255,255,0.05)', border: `2px solid rgba(255,255,255,0.12)`, borderTopColor: step.color }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = step.color; (e.currentTarget as HTMLElement).style.background = `${step.color}12`; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLElement).style.borderTopColor = step.color; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
      >
        <Icon className="w-8 h-8 mb-2" style={{ color: step.color }} />
        <span className="text-white text-xs tracking-wide uppercase text-center px-1">{step.label}</span>
      </div>
    </motion.div>
  );
}
