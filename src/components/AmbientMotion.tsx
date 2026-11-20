import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export function AmbientMotion() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef({ x: -999, y: -999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let frame = 0;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      const count = Math.min(52, Math.max(24, Math.floor(width / 28)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.32,
        vy: (Math.random() - 0.5) * 0.32,
      }));
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      const pointer = pointerRef.current;

      for (const particle of particles) {
        if (!reducedMotion) {
          const dx = particle.x - pointer.x;
          const dy = particle.y - pointer.y;
          const distance = Math.hypot(dx, dy);
          if (distance < 150 && distance > 1) {
            particle.x += (dx / distance) * 0.8;
            particle.y += (dy / distance) * 0.8;
          }
          particle.x += particle.vx;
          particle.y += particle.vy;
          if (particle.x < 0 || particle.x > width) particle.vx *= -1;
          if (particle.y < 0 || particle.y > height) particle.vy *= -1;
        }

        context.fillStyle = 'rgba(99, 102, 241, 0.42)';
        context.beginPath();
        context.arc(particle.x, particle.y, 1.7, 0, Math.PI * 2);
        context.fill();

        const pointerDistance = Math.hypot(particle.x - pointer.x, particle.y - pointer.y);
        if (finePointer && pointerDistance < 220) {
          context.strokeStyle = `rgba(6, 182, 212, ${0.38 * (1 - pointerDistance / 220)})`;
          context.beginPath();
          context.moveTo(particle.x, particle.y);
          context.lineTo(pointer.x, pointer.y);
          context.stroke();
        }
      }

      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const distance = Math.hypot(
            particles[i].x - particles[j].x,
            particles[i].y - particles[j].y
          );
          if (distance < 150) {
            context.strokeStyle = `rgba(99, 102, 241, ${0.14 * (1 - distance / 150)})`;
            context.beginPath();
            context.moveTo(particles[i].x, particles[i].y);
            context.lineTo(particles[j].x, particles[j].y);
            context.stroke();
          }
        }
      }
      frame = window.requestAnimationFrame(draw);
    };

    const onPointerMove = (event: PointerEvent) => {
      pointerRef.current = { x: event.clientX, y: event.clientY };
      document.documentElement.style.setProperty('--pointer-x', `${event.clientX}px`);
      document.documentElement.style.setProperty('--pointer-y', `${event.clientY}px`);

      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
      }
      const target = event.target as HTMLElement;
      const interactive = target.closest('a, button, textarea, input, [role="button"]');
      ringRef.current?.classList.toggle('ambient-cursor-hover', Boolean(interactive));
      ringRef.current?.classList.toggle(
        'ambient-cursor-text',
        Boolean(target.closest('textarea, input'))
      );

      const card = target.closest<HTMLElement>('.prototype-dataset-card');
      if (card) {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--card-x', `${event.clientX - rect.left}px`);
        card.style.setProperty('--card-y', `${event.clientY - rect.top}px`);
      }
    };

    const onPointerDown = () => ringRef.current?.classList.add('ambient-cursor-down');
    const onPointerUp = () => ringRef.current?.classList.remove('ambient-cursor-down');
    const onPointerLeave = () => {
      ringRef.current?.classList.remove('ambient-cursor-visible');
      dotRef.current?.classList.remove('ambient-cursor-visible');
    };
    const onPointerEnter = () => {
      ringRef.current?.classList.add('ambient-cursor-visible');
      dotRef.current?.classList.add('ambient-cursor-visible');
    };

    resize();
    if (!reducedMotion) frame = window.requestAnimationFrame(draw);
    else draw();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    document.addEventListener('mouseleave', onPointerLeave);
    document.addEventListener('mouseenter', onPointerEnter);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('mouseleave', onPointerLeave);
      document.removeEventListener('mouseenter', onPointerEnter);
    };
  }, []);

  return (
    <>
      <div className="ambient-orb ambient-orb-one" />
      <div className="ambient-orb ambient-orb-two" />
      <div className="ambient-orb ambient-orb-three" />
      <canvas ref={canvasRef} className="ambient-network" aria-hidden="true" />
      <div className="ambient-spotlight" aria-hidden="true" />
      <div ref={ringRef} className="ambient-cursor-ring" aria-hidden="true" />
      <div ref={dotRef} className="ambient-cursor-dot" aria-hidden="true" />
    </>
  );
}
