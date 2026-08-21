// src/components/game/HeroDioramaCanvas.tsx
import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  baseAlpha: number;
  vx: number;
  vy: number;
  pulseSpeed: number;
  pulsePhase: number;
  color: string;
}

interface HeroDioramaCanvasProps {
  className?: string;
  particleCount?: number;
  ambientColor?: string;
}

export function HeroDioramaCanvas({
  className = '',
  particleCount = 10,
  ambientColor = '#34d399',
}: HeroDioramaCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let isRunning = true;
    let width = 0;
    let height = 0;

    // Handle high DPI retina screens and container sizing
    const updateSize = () => {
      if (!canvas) return;
      const rect = canvas.parentElement?.getBoundingClientRect() || canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    updateSize();

    // Color palette: soft emerald, gold stardust, and celestial cyan
    const colors = [
      ambientColor,
      '#fbbf24', // Warm gold
      '#34d399', // Emerald
      '#6ee7b7', // Mint
      '#fef08a', // Pale gold
    ];

    // Initialize particles focused around the cliff and middle landscape
    const particles: Particle[] = Array.from({ length: particleCount }, () => {
      const baseAlpha = 0.2 + Math.random() * 0.45;
      return {
        x: width * 0.3 + Math.random() * (width * 0.68),
        y: height * 0.2 + Math.random() * (height * 0.75),
        radius: 1.2 + Math.random() * 1.8,
        alpha: baseAlpha,
        baseAlpha,
        vx: (Math.random() - 0.5) * 0.25 + 0.1, // Gentle drift rightward
        vy: -0.2 - Math.random() * 0.35,        // Floating upwards
        pulseSpeed: 0.02 + Math.random() * 0.03,
        pulsePhase: Math.random() * Math.PI * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    });

    let lastTime = performance.now();

    const render = (currentTime: number) => {
      if (!isRunning) return;

      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      ctx.clearRect(0, 0, width, height);

      // Render subtle drifting particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx * dt * 60;
        p.y += p.vy * dt * 60;
        p.pulsePhase += p.pulseSpeed;

        // Subtle alpha pulsation
        p.alpha = p.baseAlpha * (0.65 + 0.35 * Math.sin(p.pulsePhase));

        // Wrap around boundaries gently
        if (p.y < -10) {
          p.y = height + 10;
          p.x = width * 0.3 + Math.random() * (width * 0.68);
        }
        if (p.x > width + 10) {
          p.x = width * 0.25;
        } else if (p.x < width * 0.2) {
          p.x = width + 5;
        }

        // Draw soft glowing particle circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    // Pause drawing when tab is in background to save battery
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isRunning = false;
        cancelAnimationFrame(animationFrameId);
      } else {
        isRunning = true;
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(render);
      }
    };

    window.addEventListener('resize', updateSize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updateSize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [particleCount, ambientColor]);

  return (
    <canvas
      ref={canvasRef}
      className={`hero-diorama-canvas ${className}`.trim()}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 2,
      }}
      aria-hidden="true"
    />
  );
}

export default HeroDioramaCanvas;
