import React from 'react';

export default function LiquidGlassCard({ children, className }) {
    return (
        <div className={`group relative rounded-[32px] p-8 transition-all duration-500 hover:-translate-y-2 overflow-hidden
            bg-gradient-to-b from-white/50 via-white/20 to-white/10 
            backdrop-blur-md saturate-[220%] 
            border border-white/85 
            shadow-[0_16px_35px_-6px_rgba(15,23,42,0.25),0_6px_15px_-4px_rgba(15,23,42,0.15),inset_0_2.5px_1.5px_0px_rgba(255,255,255,0.95),0_0_0_1px_rgba(255,255,255,0.85),inset_0_-4px_8px_0px_rgba(0,0,0,0.15),inset_3px_0_4px_0px_rgba(255,255,255,0.5),inset_-3px_0_4px_0px_rgba(255,255,255,0.5)]
            hover:bg-gradient-to-b hover:from-white/65 hover:via-white/35 hover:to-white/15 
            hover:shadow-[0_22px_45px_-6px_rgba(15,23,42,0.3)]
            ${className || ''}`
        }>
            {/* Glossy top glare */}
            <span
                className="absolute top-[1px] left-1 right-1 h-[40%] pointer-events-none rounded-[32px_32px_45%_45%] opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                    background:
                        "linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.2) 60%, rgba(255, 255, 255, 0) 100%)",
                }}
            />
            
            {/* Bottom refraction */}
            <span
                className="absolute bottom-[1.5px] left-1.5 right-1.5 h-[28%] pointer-events-none rounded-[0_0_32px_32px] opacity-40"
                style={{
                    background:
                        "linear-gradient(0deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 100%)",
                }}
            />

            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}
