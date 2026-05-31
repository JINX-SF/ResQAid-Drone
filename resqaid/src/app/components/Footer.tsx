import { Github, Linkedin, Mail } from "lucide-react";
import { Link } from "react-router-dom";
export function Footer() {
  return (
    <footer className="relative py-16" style={{ background: '#111111', borderTop: '1px solid transparent', backgroundClip: 'padding-box' }}>
      {/* Top gradient border */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #D26E1E, #3D5A45, transparent)' }}></div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            {/* Logo in two-color system */}
            <h3 className="text-3xl mb-1 tracking-tight font-bold">
              <span className="text-white">RESQ</span>
              <span style={{ color: '#D26E1E' }}>AID</span>
            </h3>
            {/* Thin accent line under logo */}
            <div className="w-16 h-0.5 mb-5" style={{ background: 'linear-gradient(90deg, #D26E1E, #3D5A45)' }}></div>
            <p className="text-gray-400 leading-relaxed max-w-md text-sm">
              AI-powered autonomous drone operations platform for emergency response, industrial monitoring, and remote logistics in industrial zones.
            </p>
          </div>

          <div>
            <h4 className="text-white text-xs tracking-widest uppercase mb-5 font-semibold" style={{ color: '#D26E1E' }}>Platform</h4>
            <ul className="space-y-3">
              <li><Link to="/controle" className="text-gray-400 text-sm transition-colors hover:text-white">Mission Control</Link></li>
<li><Link to="/dronespage" className="text-gray-400 text-sm transition-colors hover:text-white">Fleet Management</Link></li>
<li><Link to="/requests/:id/intelligence" className="text-gray-400 text-sm transition-colors hover:text-white">AI Analysis</Link></li>
<li><Link to="/missionsPage" className="text-gray-400 text-sm transition-colors hover:text-white">Documentation</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs tracking-widest uppercase mb-5 font-semibold" style={{ color: '#7aaa8a' }}>Company</h4>
            <ul className="space-y-3">
             <li><Link to="/infos" className="text-gray-400 text-sm transition-colors hover:text-white">About</Link></li>
<li><a href="mailto:contact@resqaid.com" className="text-gray-400 text-sm transition-colors hover:text-white">Contact</a></li>
<li><Link to="/register" className="text-gray-400 text-sm transition-colors hover:text-white">Careers</Link></li>
<li><Link to="/login" className="text-gray-400 text-sm transition-colors hover:text-white">Privacy</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-gray-500 text-sm">© 2026 ResQAid. All rights reserved.</p>
          <div className="flex items-center gap-3">
            {[Github, Linkedin, Mail].map((Icon, i) => (
              <a key={i} href="#" className="w-9 h-9 flex items-center justify-center rounded-lg transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#D26E1E'; (e.currentTarget as HTMLElement).style.background = 'rgba(210,110,30,0.1)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
              >
                <Icon className="w-4 h-4 text-gray-400" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
