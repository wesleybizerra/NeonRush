import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Pause, Play } from 'lucide-react';
import { useGameAudio } from '../hooks/useGameAudio';

export const PhaseGame = () => {
  const { phaseId } = useParams();
  const navigate = useNavigate();
  const [isPaused, setIsPaused] = useState(false);
  const [cameraMode, setCameraMode] = useState<'follow' | 'overview'>('follow');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const carRef = useRef({ x: 400, y: 500, angle: 0, speed: 0, nitro: 100, drift: 0 });
  const keys = useRef<Record<string, boolean>>({});
  const trackRef = useRef<{ x: number, y: number }[]>([]);
  const particles = useRef<{ x: number, y: number, life: number }[]>([]);
  const { play, pause } = useGameAudio('https://res.cloudinary.com/dwno3zfg6/video/upload/v1773387335/Toque_de_Fase_Final_dd5yqg.mp3');

  useEffect(() => {
    play(); // Start audio on mount
    return () => pause(); // Stop audio on unmount
  }, []);

  useEffect(() => {
    // Generate dynamic track
    const points = [{ x: 400, y: 600 }];
    let x = 400;
    let y = 600;
    for (let i = 0; i < 15; i++) {
      x += Math.random() * 400 - 200;
      y -= Math.random() * 300 + 100;
      points.push({ x, y });
    }
    trackRef.current = points;
  }, [phaseId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => keys.current[e.key.toLowerCase()] = true;
    const handleKeyUp = (e: KeyboardEvent) => keys.current[e.key.toLowerCase()] = false;
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (isPaused) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const car = carRef.current;

      // Improved Physics (Drift)
      if (keys.current['w']) car.speed = Math.min(car.speed + 0.3, 12);
      if (keys.current['s']) car.speed = Math.max(car.speed - 0.3, -5);

      const turnSpeed = car.speed * 0.02;
      if (keys.current['a']) { car.angle -= turnSpeed; car.drift = -2; }
      else if (keys.current['d']) { car.angle += turnSpeed; car.drift = 2; }
      else car.drift = 0;

      if (keys.current['g'] && car.nitro > 0) { car.speed += 0.5; car.nitro -= 0.5; }

      car.x += Math.sin(car.angle) * car.speed + car.drift;
      car.y -= Math.cos(car.angle) * car.speed;
      car.speed *= 0.98;

      // Collision
      let onTrack = false;
      for (let i = 0; i < trackRef.current.length - 1; i++) {
        const p1 = trackRef.current[i];
        const p2 = trackRef.current[i + 1];
        const dist = Math.abs((p2.y - p1.y) * car.x - (p2.x - p1.x) * car.y + p2.x * p1.y - p2.y * p1.x) /
          Math.sqrt(Math.pow(p2.y - p1.y, 2) + Math.pow(p2.x - p1.x, 2));
        if (dist < 40) onTrack = true;
      }
      if (!onTrack) car.speed *= 0.9;

      // Particles
      if (Math.abs(car.drift) > 0 && car.speed > 5) {
        particles.current.push({ x: car.x, y: car.y, life: 20 });
      }
      particles.current.forEach(p => p.life--);
      particles.current = particles.current.filter(p => p.life > 0);

      // Render
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      if (cameraMode === 'follow') ctx.translate(canvas.width / 2 - car.x, canvas.height / 2 - car.y);
      else { ctx.scale(0.4, 0.4); ctx.translate(400, 400); }

      // Draw track
      ctx.beginPath();
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 70;
      ctx.lineCap = 'round';
      ctx.moveTo(trackRef.current[0].x, trackRef.current[0].y);
      trackRef.current.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.stroke();

      // Particles
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      particles.current.forEach(p => ctx.fillRect(p.x, p.y, 4, 4));

      // Draw car
      ctx.save();
      ctx.translate(car.x, car.y);
      ctx.rotate(car.angle);
      ctx.fillStyle = onTrack ? '#3b82f6' : '#ef4444';
      ctx.fillRect(-15, -25, 30, 50);
      ctx.restore();
      ctx.restore();

      // HUD
      ctx.fillStyle = 'white';
      ctx.font = '20px monospace';
      ctx.fillText(`SPEED: ${Math.floor(car.speed * 10)} km/h`, 20, 40);
      ctx.fillStyle = 'cyan';
      ctx.fillRect(20, 50, car.nitro * 2, 10);

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, phaseId, cameraMode]);

  return (
    <div className="relative w-full h-screen bg-black">
      <canvas ref={canvasRef} className="w-full h-full" width={800} height={600} />

      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button onClick={() => setCameraMode(cameraMode === 'follow' ? 'overview' : 'follow')} className="p-2 bg-white/20 rounded-full text-white">
          {cameraMode === 'follow' ? 'Overview' : 'Follow'}
        </button>
        <button onClick={() => setIsPaused(!isPaused)} className="p-2 bg-white/20 rounded-full text-white">
          {isPaused ? <Play /> : <Pause />}
        </button>
      </div>

      {isPaused && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-4 z-20 text-white">
          <h2 className="text-4xl font-black">PAUSADO</h2>
          <button onClick={() => navigate('/phases')} className="px-6 py-2 bg-white/10 rounded-full">Voltar para Fases</button>
          <button onClick={() => navigate('/garage')} className="px-6 py-2 bg-white/10 rounded-full">Voltar para Garagem</button>
          <button onClick={() => navigate('/')} className="px-6 py-2 bg-emerald-500 text-black rounded-full font-black">INICIO</button>
        </div>
      )}
    </div>
  );
};
