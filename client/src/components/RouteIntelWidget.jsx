import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, ShieldCheck, Mountain, Wind, AlertTriangle,
  Activity, Compass, Thermometer, Gauge, Radar, Loader2,
  CloudRain, Car, ArrowRight
} from 'lucide-react';

const ThreatCard = ({ title, icon: Icon, data }) => {
  const colors = {
    DANGER: 'bg-rose-50 border-rose-200 text-rose-700',
    WARNING: 'bg-amber-50 border-amber-200 text-amber-700',
    SAFE: 'bg-emerald-50 border-emerald-200 text-emerald-700'
  };
  const titleColors = {
    DANGER: 'text-rose-600',
    WARNING: 'text-amber-600',
    SAFE: 'text-emerald-600'
  };

  return (
    <div className={`p-4 rounded-xl border flex flex-col justify-between ${colors[data.status]}`}>
      <p className={`text-[10px] font-black uppercase tracking-widest ${titleColors[data.status]} mb-2 flex items-center gap-1.5`}>
        <Icon className="size-3.5" /> {title}
      </p>

      {/* DUAL WEATHER UI */}
      {data.pickup && data.dest ? (
        <div className="flex items-center justify-between bg-white/60 p-2.5 rounded-lg border border-white/50 mt-auto shadow-sm">
          <div className="flex flex-col items-center min-w-[70px]">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest truncate w-16 text-center mb-0.5">{data.pickup.name}</span>
            <span className="text-sm font-black text-slate-800">{data.pickup.temp}°C {data.pickup.icon}</span>
          </div>
          <ArrowRight className="size-3 text-slate-400" />
          <div className="flex flex-col items-center min-w-[70px]">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest truncate w-16 text-center mb-0.5">{data.dest.name}</span>
            <span className="text-sm font-black text-slate-800">{data.dest.temp}°C {data.dest.icon}</span>
          </div>
        </div>
      ) : (
        <p className="text-sm font-bold text-slate-800 leading-snug">{data.text}</p>
      )}
    </div>
  );
};

export default function RouteIntelWidget({ pickup, destination, role = 'CUSTOMER' }) {
  const [intel, setIntel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState(role);
  const [idle, setIdle] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!pickup || !destination) {
        setIdle(true);
        setIntel(null);
        return;
      }
      setIdle(false);
      fetchRouteTelemetry();
    }, 800);

    const fetchRouteTelemetry = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:5000/api/ai/route-intel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pickup, destination, role: viewMode })
        });
        const data = await res.json();
        if (data.success && !data.idle) setIntel(data.intel);
      } catch (err) { }
      setLoading(false);
    };

    return () => clearTimeout(timer);
  }, [pickup, destination, viewMode]);

  if (idle) {
    return (
      <div className="mb-10 rounded-[24px] border border-white/60 bg-white/70 backdrop-blur-2xl p-8 flex flex-col items-center justify-center gap-4 text-slate-400 shadow-xl shadow-slate-200/50 h-[280px]">
        <Radar className="size-12 animate-[spin_3s_linear_infinite] text-primary/30" />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Awaiting route input for AI telemetry analysis</p>
      </div>
    );
  }

  if (loading || !intel) {
    return (
      <div className="mb-10 rounded-[24px] border border-white/60 bg-white/70 backdrop-blur-2xl p-8 flex flex-col items-center justify-center gap-4 text-primary shadow-xl shadow-slate-200/50 h-[280px]">
        <Loader2 className="size-10 animate-spin text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Calculating Mountain Telemetry...</p>
      </div>
    );
  }

  const isSafe = intel.safetyScore >= 78;

  return (
    <div className="mb-10 rounded-[24px] border border-white/80 bg-white/80 backdrop-blur-2xl p-6 shadow-2xl shadow-slate-200/60 relative overflow-hidden group transition-all">
      {/* Soft Glow */}
      <div className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-[100px] pointer-events-none transition-all duration-700 ${isSafe ? 'bg-emerald-400/10 group-hover:bg-emerald-400/20' : 'bg-amber-400/10 group-hover:bg-amber-400/20'
        }`} />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-4 mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`flex size-10 items-center justify-center rounded-xl border shadow-sm ${isSafe ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-amber-50 border-amber-200 text-amber-600'
            }`}>
            {isSafe ? <ShieldCheck className="size-5" /> : <ShieldAlert className="size-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 text-base tracking-tight">Rahi Terrain Engine</h3>
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200">AI Real-time</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-wider font-bold">{intel.corridor}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200 self-start sm:self-auto shadow-inner">
          <button
            type="button"
            onClick={() => setViewMode('CUSTOMER')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'CUSTOMER' ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            Tourist Intel
          </button>
          <button
            type="button"
            onClick={() => setViewMode('DRIVER')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'DRIVER' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            Driver Cockpit
          </button>
        </div>
      </div>

      {/* Core Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 relative z-10">
        <div className="bg-slate-50/80 border border-slate-100 p-3.5 rounded-xl shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1">
            <Activity className="size-3 text-primary" /> Route Safety
          </p>
          <p className={`text-2xl font-black ${isSafe ? 'text-emerald-500' : 'text-amber-500'}`}>
            {intel.safetyScore}<span className="text-xs font-bold text-slate-400">/100</span>
          </p>
        </div>
        <div className="bg-slate-50/80 border border-slate-100 p-3.5 rounded-xl shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1">
            <Mountain className="size-3 text-emerald-500" /> Elevation Shift
          </p>
          <p className="text-2xl font-black text-slate-800">{intel.elevationProfile}</p>
        </div>
        <div className="bg-slate-50/80 border border-slate-100 p-3.5 rounded-xl shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1">
            <Compass className="size-3 text-amber-500" /> Hairpins
          </p>
          <p className="text-2xl font-black text-slate-800">{intel.curvesCount}</p>
        </div>
        <div className="bg-slate-50/80 border border-slate-100 p-3.5 rounded-xl shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1">
            <Gauge className="size-3 text-sky-500" /> Safe Speed
          </p>
          <p className="text-2xl font-black text-slate-800">{intel.speedLimit}</p>
        </div>
      </div>

      {/* Real-Time Threat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5 relative z-10">
        <ThreatCard title="Landslide Alerts" icon={Mountain} data={intel.landslide} />
        <ThreatCard title="Traffic & Blocks" icon={Car} data={intel.traffic} />
        <ThreatCard title="Dual Climate Radar" icon={CloudRain} data={intel.weather} />
      </div>

      {/* Perspective Specific Section */}
      <div className="relative z-10">
        {viewMode === 'CUSTOMER' ? (
          <div className="grid sm:grid-cols-2 gap-4 bg-slate-50/80 border border-slate-200 p-4 rounded-2xl">
            <div>
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Thermometer className="size-4 text-emerald-500" /> Passenger Comfort Advisory
              </p>
              <ul className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
                <li>• Motion Sickness Risk: <strong className="text-slate-800">{intel.customerInsights.motionSicknessRisk}</strong></li>
                <li>• Recommended Start: <strong className="text-slate-800">{intel.customerInsights.recommendedDeparture}</strong></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Wind className="size-4 text-sky-500" /> Tips
              </p>
              <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                Carry emergency water and layered clothing. Weather shifts rapidly at high altitudes.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4 bg-primary/5 border border-primary/20 p-4 rounded-2xl">
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Gauge className="size-4 text-primary" /> Mechanical Stress & Fuel Intel
              </p>
              <ul className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
                <li>• Powertrain Strain: <strong className="text-slate-800">{intel.driverInsights.powertrainLoad}</strong></li>
                <li>• Hill Fuel Penalty: <strong className="text-slate-800">{intel.driverInsights.fuelBurnSurchargeEst}</strong></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle className="size-4 text-amber-500" /> Advisory
              </p>
              <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-primary/10 shadow-sm">
                Ensure brake pads are checked before long descents.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}