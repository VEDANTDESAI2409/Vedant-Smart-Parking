import React, { useEffect, useRef } from 'react';
import { CarFront, ParkingSquare } from 'lucide-react';

/**
 * Animated Parking Slider Component
 * Shows a car driving and parking in a slot as user scrolls
 */
export const AnimatedParkingSlider = () => {
  const containerRef = useRef(null);
  const carRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const car = carRef.current;
    if (!container || !car) return;

    const handleScroll = () => {
      const rect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Calculate when element enters and leaves viewport
      const startTrigger = viewportHeight * 0.7;
      const endTrigger = -viewportHeight * 0.1;
      
      // Calculate scroll progress (0 to 1)
      const scrollProgress = Math.max(0, Math.min(1, 
        (startTrigger - rect.top) / (startTrigger - endTrigger)
      ));

      if (scrollProgress > 0 && scrollProgress <= 1) {
        // Car starts from off screen left (-100%) to parking slot (75%)
        const carPosition = scrollProgress * 175 - 100; // -100 to 75
        car.style.setProperty('--car-x', `${carPosition}%`);
        
        // Fade in effect when entering
        const fade = Math.max(0, scrollProgress * 1.2);
        car.style.opacity = Math.min(1, fade);
        
        // Slight rotation as car "lands" into parking
        if (scrollProgress > 0.6) {
          const rotation = (scrollProgress - 0.6) * 5;
          car.style.setProperty('--car-rotate', `${rotation}deg`);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      ref={containerRef}
      className="parking-slider-bg relative h-[500px] w-full overflow-hidden rounded-[32px] bg-gradient-to-b from-[linear-gradient(135deg,_rgba(255,255,255,0.95)_0%,_rgba(240,248,245,0.92)_100%)] to-[#f0f8f5] shadow-[0_20px_60px_rgba(17,31,26,0.12)]"
    >
      {/* Parking lot background grid */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.08]"
        viewBox="0 0 1200 500"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id="parking-grid" x="80" y="100" width="80" height="100" patternUnits="userSpaceOnUse">
            <rect width="70" height="90" fill="none" stroke="rgba(40,90,72,0.5)" strokeWidth="2" />
          </pattern>
        </defs>
        <rect width="1200" height="500" fill="url(#parking-grid)" />
      </svg>

      {/* Road/lane marking */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[rgba(64,138,113,0.06)] via-transparent to-transparent" />

      {/* Left boundary */}
      <div className="absolute bottom-0 left-0 top-0 w-12 bg-gradient-to-r from-[rgba(64,138,113,0.1)] to-transparent" />

      {/* Target parking slot - right side */}
      <div className="absolute bottom-16 right-20 flex h-24 w-32 flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-[rgba(64,138,113,0.4)] bg-[rgba(176,228,204,0.08)]">
        <ParkingSquare className="h-12 w-12 text-[rgba(64,138,113,0.4)]" />
        <span className="mt-2 text-xs font-semibold uppercase tracking-wider text-[rgba(64,138,113,0.5)]">
          Reserved
        </span>
      </div>

      {/* Animated Car - scrolls from left to parking slot */}
      <div
        ref={carRef}
        className="parking-animated-car absolute bottom-[70px] left-0 transition-opacity duration-300"
        style={{
          transform: `translateX(calc(var(--car-x, -100%) * 12px)) rotateZ(var(--car-rotate, 0deg))`,
        }}
      >
        {/* Car body */}
        <div className="flex h-16 w-28 items-center justify-center rounded-[18px] bg-gradient-to-b from-[#2d5a48] to-[#1a3a2c] shadow-[0_12px_32px_rgba(40,90,72,0.28)]">
          <CarFront className="h-8 w-8 text-white" />
        </div>

        {/* Wheels */}
        <div className="absolute bottom-0 left-3 h-3 w-3 rounded-full bg-[#1a1a1a]" />
        <div className="absolute bottom-0 right-3 h-3 w-3 rounded-full bg-[#1a1a1a]" />

        {/* Car shadow - moves with car */}
        <div className="absolute -bottom-2 left-1 right-1 h-2 rounded-full bg-[rgba(17,31,26,0.15)] blur-sm" />
      </div>

      {/* Parking lot markers/lines */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Horizontal lane markers */}
        <div className="absolute inset-x-0 bottom-1/2 h-px bg-gradient-to-r from-transparent via-[rgba(64,138,113,0.15)] to-transparent" />
        <div className="absolute inset-x-0 bottom-1/3 h-px bg-gradient-to-r from-transparent via-[rgba(64,138,113,0.08)] to-transparent" />
      </div>

      {/* Info badge - top left */}
      <div className="absolute left-6 top-6 rounded-2xl border border-[rgba(64,138,113,0.2)] bg-white px-4 py-3 backdrop-blur-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Scroll down
        </p>
        <p className="mt-1 text-sm font-semibold text-[var(--color-secondary)]">
          Watch the magic ✨
        </p>
      </div>

      {/* Status badge - right side */}
      <div className="absolute right-6 top-6 rounded-2xl border border-[rgba(176,228,204,0.3)] bg-white px-4 py-3 backdrop-blur-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
          Car parking
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-700">
          Live animation
        </p>
      </div>
    </div>
  );
};

export default AnimatedParkingSlider;
