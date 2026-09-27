import React, { useEffect, useRef } from "react";

export function TextParticleAnimation({
  lines = [
    { text: "Move with the", color: "#0f172a" },
    { text: "Mountains.", color: "#f97316" },
    { text: "Safely.", color: "#f59e0b" },
  ],
  fontSize = 100,
  fontFamily = "Montserrat, sans-serif",
  fontWeight = 900,
  resolution = 4,
  pixelSize = 3,
  hoverRadius = 80,
  repelForce = 15,
  clickRadius = 300,
  clickForce = 80,
  springForce = 0.08,
  friction = 0.85,
  padding = 100,
  height,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let particles = [];
    let animationFrameId = 0;
    const mouse = { x: -1000, y: -1000 };

    const fontStr = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.font = fontStr;
    
    // Calculate canvas size based on all lines
    let maxTextWidth = 0;
    lines.forEach((line) => {
      const metrics = ctx.measureText(line.text);
      if (metrics.width > maxTextWidth) maxTextWidth = metrics.width;
    });

    const lineHeight = fontSize * 1.2;
    const textHeight = lineHeight * lines.length;

    canvas.width = maxTextWidth + padding * 2;
    canvas.height = typeof height === "number" ? height : textHeight + padding * 2;

    // Draw lines
    ctx.font = fontStr;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const startY = canvas.height / 2 - (textHeight / 2) + (lineHeight / 2);

    lines.forEach((line, index) => {
      ctx.fillStyle = line.color;
      ctx.fillText(line.text, canvas.width / 2, startY + index * lineHeight);
    });

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    class Particle {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.originX = x;
        this.originY = y;
        this.vx = 0;
        this.vy = 0;
        this.color = color;
      }

      update() {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < hoverRadius) {
          const angle = Math.atan2(dy, dx);
          const force = (hoverRadius - distance) / hoverRadius;
          this.vx -= Math.cos(angle) * force * repelForce;
          this.vy -= Math.sin(angle) * force * repelForce;
        }

        this.vx += (this.originX - this.x) * springForce;
        this.vy += (this.originY - this.y) * springForce;

        this.vx *= friction;
        this.vy *= friction;

        this.x += this.vx;
        this.y += this.vy;
      }

      draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, pixelSize, pixelSize);
      }
    }

    function initParticles(data) {
      particles = [];
      const d = data.data;

      for (let y = 0; y < canvas.height; y += resolution) {
        for (let x = 0; x < canvas.width; x += resolution) {
          const index = (y * canvas.width + x) * 4;
          const alpha = d[index + 3];
          if (alpha > 10) {
            const r = d[index];
            const g = d[index + 1];
            const b = d[index + 2];
            particles.push(new Particle(x, y, `rgb(${r}, ${g}, ${b})`));
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let needsUpdate = false;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.update();
        p.draw();
        
        // If particle is moving or not at origin, keep animating
        if (
            Math.abs(p.vx) > 0.05 || 
            Math.abs(p.vy) > 0.05 || 
            Math.abs(p.x - p.originX) > 0.5 || 
            Math.abs(p.y - p.originY) > 0.5
        ) {
            needsUpdate = true;
        }
      }

      // If particles need updating or mouse is active (not -1000)
      if (needsUpdate || mouse.x !== -1000) {
        animationFrameId = window.requestAnimationFrame(animate);
      } else {
        animationFrameId = null; // Auto-pause to save CPU/GPU!
      }
    }

    const getMousePos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    };

    const handleMouseMove = (e) => {
      const pos = getMousePos(e);
      mouse.x = pos.x;
      mouse.y = pos.y;
      
      // Wake up animation if paused
      if (!animationFrameId) {
          animate();
      }
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
      // Wake up one last time so particles can return to origin
      if (!animationFrameId) {
          animate();
      }
    };

    const handleMouseDown = (e) => {
      const pos = getMousePos(e);
      for (const p of particles) {
        const dx = pos.x - p.x;
        const dy = pos.y - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < clickRadius) {
          const angle = Math.atan2(dy, dx);
          const force = (clickRadius - distance) / clickRadius;
          p.vx -= Math.cos(angle) * force * clickForce;
          p.vy -= Math.sin(angle) * force * clickForce;
        }
      }
    };

    initParticles(imageData);
    animate();

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("mousedown", handleMouseDown);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("mousedown", handleMouseDown);
    };
  }, [
    lines,
    fontSize,
    fontFamily,
    fontWeight,
    resolution,
    pixelSize,
    hoverRadius,
    repelForce,
    clickRadius,
    clickForce,
    springForce,
    friction,
    padding,
    height,
  ]);

  return (
    <div className="flex w-full items-center justify-center overflow-visible drop-shadow-sm">
      <canvas
        ref={canvasRef}
        className="block max-w-full select-none cursor-pointer"
        style={{ height: typeof height === "number" ? `${height}px` : "auto" }}
      />
    </div>
  );
}

export default TextParticleAnimation;
