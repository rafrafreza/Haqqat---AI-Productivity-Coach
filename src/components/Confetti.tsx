import { useEffect, useRef, useCallback } from "react";
import type { XPResult } from "@/hooks/useXP";

// Listen for level-up events
type LevelUpListener = () => void;
const levelUpListeners: LevelUpListener[] = [];

export function onLevelUp(cb: LevelUpListener) {
  levelUpListeners.push(cb);
  return () => {
    const idx = levelUpListeners.indexOf(cb);
    if (idx > -1) levelUpListeners.splice(idx, 1);
  };
}

export function triggerConfetti() {
  levelUpListeners.forEach(l => l());
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  shape: 'rect' | 'circle' | 'star';
}

const COLORS = [
  'hsl(265, 89%, 60%)',  // primary-ish
  'hsl(45, 93%, 58%)',   // gold
  'hsl(340, 82%, 60%)',  // pink
  'hsl(190, 90%, 50%)',  // cyan
  'hsl(120, 70%, 50%)',  // green
  'hsl(30, 95%, 55%)',   // orange
  'hsl(280, 80%, 65%)',  // purple
];

export default function ConfettiLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);

  const burst = useCallback(() => {
    const particles: Particle[] = [];
    const w = window.innerWidth;
    const h = window.innerHeight;

    for (let i = 0; i < 150; i++) {
      const angle = (Math.random() * Math.PI * 2);
      const speed = 4 + Math.random() * 10;
      particles.push({
        x: w / 2 + (Math.random() - 0.5) * 200,
        y: h / 2 + (Math.random() - 0.5) * 100,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 5,
        size: 4 + Math.random() * 8,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
        opacity: 1,
        shape: (['rect', 'circle', 'star'] as const)[Math.floor(Math.random() * 3)],
      });
    }
    particlesRef.current = particles;

    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      let alive = false;

      particlesRef.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2; // gravity
        p.vx *= 0.99;
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.008;

        if (p.opacity <= 0) return;
        alive = true;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // star
          ctx.beginPath();
          for (let j = 0; j < 5; j++) {
            const a = (j * 4 * Math.PI) / 5 - Math.PI / 2;
            const r = j % 2 === 0 ? p.size / 2 : p.size / 4;
            ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
          }
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      });

      if (alive) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, w, h);
      }
    };

    cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const unsub = onLevelUp(burst);
    return () => {
      unsub();
      cancelAnimationFrame(animRef.current);
    };
  }, [burst]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[200] pointer-events-none"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}
