import React from 'react';
import { Sparkles, Map, ShieldCheck, Zap } from 'lucide-react';

export default function BentoGrid() {
  return (
    <div className="relative z-10 mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-10">
      <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <h2 className="font-display text-4xl md:text-5xl font-black text-slate-800 tracking-tight">
          Engineered for the Himalayas
        </h2>
        <p className="mt-4 text-slate-500 font-medium text-lg max-w-2xl mx-auto">
          We've built a robust technology stack designed to handle the unpredictable terrain and weather of Uttarakhand.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Large Feature Card */}
        <div className="md:col-span-2 group relative overflow-hidden rounded-[2rem] bg-white p-10 shadow-xl border border-orange-100 hover:shadow-orange-500/20 transition-all duration-500">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-700">
             <Map className="w-64 h-64 text-orange-500 rotate-12" />
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-600 font-bold text-sm mb-6">
                <Sparkles className="size-4" /> AI Mapping
            </div>
            <h3 className="text-3xl font-black text-slate-800 mb-4">Topographical Intelligence</h3>
            <p className="text-slate-500 text-lg max-w-md">
              Our AI engines constantly analyze topographical data, weather patterns, and recent SDRF alerts to chart the safest possible route for your journey.
            </p>
          </div>
        </div>

        {/* Small Feature Card 1 */}
        <div className="group relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 to-slate-800 p-8 shadow-xl hover:shadow-2xl transition-all duration-500">
          <div className="relative z-10 h-full flex flex-col justify-between">
            <ShieldCheck className="w-12 h-12 text-emerald-400 mb-6" />
            <div>
                <h3 className="text-xl font-black text-white mb-2">SDRF Linked</h3>
                <p className="text-slate-300">
                  Direct SOS integration with the State Disaster Response Force for unmatched safety.
                </p>
            </div>
          </div>
        </div>

        {/* Small Feature Card 2 */}
        <div className="group relative overflow-hidden rounded-[2rem] bg-orange-500 p-8 shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-500">
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="relative z-10 h-full flex flex-col justify-between">
            <Zap className="w-12 h-12 text-white mb-6 group-hover:rotate-12 transition-transform" />
            <div>
                <h3 className="text-xl font-black text-white mb-2">Smart Pooling</h3>
                <p className="text-orange-100">
                  Rahi-Pools match you with verified travelers sharing your exact destination.
                </p>
            </div>
          </div>
        </div>

        {/* Medium Feature Card */}
        <div className="md:col-span-2 group relative overflow-hidden rounded-[2rem] bg-white p-8 shadow-xl border border-slate-100 transition-all duration-500 hover:border-slate-300">
            <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                    <h3 className="text-2xl font-black text-slate-800 mb-3">Dynamic Pricing Engine</h3>
                    <p className="text-slate-500">
                        Fares adapt in real-time based on road conditions and weather, ensuring fair pay for local drivers and affordable rides for tourists.
                    </p>
                </div>
                <div className="w-full md:w-1/3 h-32 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_24px]"></div>
                    <span className="text-3xl font-black text-emerald-500 relative z-10">Fair.</span>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}
