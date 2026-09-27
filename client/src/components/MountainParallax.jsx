import React from 'react';
import './MountainParallax.css';

const CloudSvg = ({ className }) => (
  <svg viewBox="0 0 512 512" fill="currentColor" className={className}>
    <path d="M414.5,149.3c-14.2-38.3-51.1-64.6-94.5-64.6c-34.9,0-66,17.2-84.3,43.6C223,115.1,202.9,106.7,181.3,106.7 c-40,0-74.8,26.5-83.3,63.1C43.1,175.7,0,222.1,0,277.3C0,342,52.5,394.7,117.3,394.7h288c58.9,0,106.7-47.8,106.7-106.7 C512,234.9,469.7,190.2,414.5,149.3z" />
  </svg>
);

export default function MountainParallax() {
  return (
    <div className="relative z-10 mx-auto w-full mt-0">
      <div className="-w-mountain bg-orange-50" string="progress" string-enter-vp="top" string-exit-vp="bottom">
        
        {/* Sticky wrapper to hold the scene in place while we scroll */}
        <div className="sticky top-0 left-0 w-full h-screen overflow-hidden pointer-events-none">
            
            {/* Ambient Sky Gradient to help blend */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-100/30 to-orange-100/50 pointer-events-none z-0"></div>

            {/* Layer 1: Mountain Base */}
            <div className="mountain-layer mount-base">
            <img src="/mountain.jpg" alt="Mountains" className="w-full h-[120%] object-cover object-bottom" />
            </div>

            {/* Layer 3: Clouds Left (Vector) */}
            <div className="mountain-layer cloud-layer cloud-left flex items-end justify-start pb-[5vh] pl-[2vw]">
                <CloudSvg className="text-white drop-shadow-2xl w-[60vw] h-auto translate-y-[20%] opacity-90" />
                <CloudSvg className="text-orange-50 drop-shadow-2xl w-[50vw] h-auto -translate-x-[40%] translate-y-[10%] opacity-95" />
            </div>

            {/* Layer 4: Clouds Right (Vector) */}
            <div className="mountain-layer cloud-layer cloud-right flex items-end justify-end pb-[10vh] pr-[2vw]">
                <CloudSvg className="text-white drop-shadow-2xl w-[70vw] h-auto translate-y-[25%] opacity-90" />
                <CloudSvg className="text-orange-50 drop-shadow-2xl w-[60vw] h-auto translate-x-[30%] translate-y-[5%] opacity-95" />
            </div>

            {/* Layer 2: Parallax Text - MOVED TO FRONT */}
            <div className="mountain-text flex items-center justify-center">
                <h2 className="font-display font-black text-[clamp(4rem,10vw,12rem)] text-slate-900 tracking-tighter leading-none text-center drop-shadow-[0_10px_20px_rgba(255,255,255,0.6)]">
                    MOVE WITH<br/>THE MOUNTAINS
                </h2>
            </div>
            
        </div>

      </div>
    </div>
  );
}
