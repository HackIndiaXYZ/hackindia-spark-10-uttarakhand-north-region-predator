import React from 'react';
import './ScrollTextReveal.css';

export default function ScrollTextReveal() {
  const rootImages = Array.from({ length: 8 }, (_, i) => `/${i + 1}.jpg`);
  const folderImages = Array.from({ length: 6 }, (_, i) => `/images/${i + 1}.jpg`);
  const allImages = [...rootImages, ...folderImages];

  return (
    <div className="relative z-10 w-full overflow-hidden mt-0 bg-slate-50/50">
      <div className="-w-reveal max-w-[1400px] mx-auto px-5" string="progress" string-enter-vp="top" string-exit-vp="bottom">
        
        <div className="reveal-gallery">
          {allImages.map((src, i) => (
            <img key={i} src={src} alt={`Reveal Gallery ${i+1}`} className="reveal-img" />
          ))}
        </div>

        <span className="sentence-1 font-display" string="split|progress" string-split="line|word|char[random(-10,10)]">
          Safety,<br/>Built Into<br/>Every<br/>Ride.
        </span>
        
        <span className="sentence-2 font-display" string="split|progress" string-split="line|word|char[random(-10,10)]">
          Intelligence,<br/>Powering<br/>Every Route.
        </span>
        
        <span className="sentence-3 font-display" string="split|progress" string-split="line|word|char[random(-10,10)]">
          Rahi,<br/>Moving Uttarakhand<br/>Forward.
        </span>
        
      </div>
    </div>
  );
}
