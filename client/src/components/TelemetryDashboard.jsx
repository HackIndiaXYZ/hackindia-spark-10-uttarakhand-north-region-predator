import React from 'react';
import { Activity, Shield, Map, Cpu } from 'lucide-react';

export default function TelemetryDashboard() {
  const stats = [
    { icon: <Cpu className="text-orange-500 size-6" />, label: "AI Route Optimization", value: "Active" },
    { icon: <Shield className="text-blue-500 size-6" />, label: "SDRF Integration", value: "Online" },
    { icon: <Map className="text-emerald-500 size-6" />, label: "Active Pools", value: "1,248" },
    { icon: <Activity className="text-rose-500 size-6" />, label: "Network Latency", value: "12ms" },
  ];

  return (
    <div className="relative z-30 mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10 pt-16 pb-8 pointer-events-none">
      <div className="bg-white/10 backdrop-blur-3xl border border-white/20 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] rounded-[2.5rem] p-8 md:p-12 pointer-events-auto transition-transform hover:scale-[1.02] duration-500">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            
            <div className="md:w-1/3 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold uppercase tracking-widest mb-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    System Status
                </div>
                <h3 className="font-display text-3xl font-black tracking-tight text-white mb-2">Live AI Telemetry</h3>
                <p className="text-slate-300 font-medium">Monitoring fleet diagnostics and topographical route safety in real-time.</p>
            </div>

            <div className="md:w-2/3 grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
            {stats.map((stat, idx) => (
                <div key={idx} className="flex flex-col items-center justify-center text-center space-y-3">
                <div className="p-4 bg-white/10 rounded-2xl shadow-sm border border-white/20">
                    {stat.icon}
                </div>
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                    <p className="text-xl font-black text-white font-display">{stat.value}</p>
                </div>
                </div>
            ))}
            </div>

        </div>
      </div>
    </div>
  );
}
