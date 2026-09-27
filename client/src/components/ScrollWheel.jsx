import React from 'react';
import './ScrollWheel.css';

export default function ScrollWheel() {
  const words = [
    "zero", "fees", "smart", "sdrf", 
    "alerts", "local", "drivers", "hill", 
    "ready", "safe", "rahi", "pools"
  ];
  const total = words.length;

  return (
    <div className="relative z-10 mx-auto w-full overflow-hidden">
      <div className="-w-wheel" string="progress|lerp[]" string-enter-vp="top" string-exit-vp="bottom">
        <div className="wheel-content font-display" style={{ '--total': total }}>
          {words.map((word, i) => (
            <span key={i} string="split" string-split="char" style={{ '--order': i }}>
              {word}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
