import React, { useEffect, useRef } from 'react';
import './MagneticGallery.css';

export default function MagneticGallery() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Load StringTune library dynamically
    const script = document.createElement('script');
    script.src = "https://unpkg.com/@fiddle-digital/string-tune@1.2.1/dist/index.js";
    script.async = true;
    script.onload = () => {
      if (window.StringTune) {
        const stringTune = window.StringTune.StringTune.getInstance();
        window.StringTuneContext = stringTune;
        stringTune.use(window.StringTune.StringLazy);
        stringTune.use(window.StringTune.StringMagnetic);
        stringTune.use(window.StringTune.StringSplit);
        stringTune.use(window.StringTune.StringProgress);
        stringTune.use(window.StringTune.StringLerp);
        
        // Start after a slight delay to ensure DOM is ready
        setTimeout(() => {
          stringTune.start(0);
        }, 200);
      }
    };
    document.body.appendChild(script);

    return () => {
      if(script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  // Use the 8 images from public folder
  const images = Array.from({ length: 8 }, (_, i) => `/${i + 1}.jpg`);

  return (
    <div className="relative z-10 mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-10">
      
      <div className="text-center mb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h2 className="font-display text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
          Uttarakhand's Beauty
        </h2>
        <p className="mt-4 text-lg font-medium text-slate-500 max-w-2xl mx-auto">
          Hover over the gallery to experience the magnetic scatter effect.
        </p>
      </div>

      <div className="magnetic-gallery-wrapper">
        <div className="-w">
          {images.map((src, idx) => (
            <figure 
              key={idx} 
              className={`mag-figure img-${idx + 1}`} 
              string="magnetic" 
              string-radius="800" 
              string-strength="0.1"
            >
              <img src={src} string="lazy" string-lazy={src} alt={`Gallery ${idx + 1}`} />
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
