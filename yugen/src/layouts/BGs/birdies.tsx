import React, { useEffect, useRef } from "react";

declare global {
  interface Window {
    VANTA: any;
  }
}

const Birdies: React.FC = () => {
  const vantaRef = useRef<HTMLDivElement>(null);
  const effectRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    const initVanta = () => {
      if (!mounted) return;
      if (!window.VANTA?.BIRDS) return;
      if (!vantaRef.current) return;
      if (effectRef.current) return;

      effectRef.current = window.VANTA.BIRDS({
        el: vantaRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        backgroundColor: 0x000000,
        backgroundAlpha: 0,
        color1: 0x1e4f13,
        color2: 0x1e4f13,
        birdSize: 0.5,
        wingSpan: 30,
        speedLimit: 2,
        separation: 100,
        quantity: 3,
        cohesion: 35.0,
      });
    };

    // Try immediately
    initVanta();

    // Retry until VANTA is ready
    const interval = setInterval(initVanta, 200);

    return () => {
      mounted = false;
      clearInterval(interval);
      effectRef.current?.destroy();
      effectRef.current = null;
    };
  }, []);

  return <div ref={vantaRef} className="absolute inset-0 w-full h-full z-0" />;
};

export default Birdies;
