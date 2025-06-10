import React, { useEffect, useRef, useState } from "react";
import "../App.css";
// Declare VANTA type to avoid TS errors
declare global {
  interface Window {
    VANTA: any;
  }
}

const Birdies: React.FC = () => {
  const vantaRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);

  useEffect(() => {
    if (!window.VANTA?.BIRDS || !vantaRef.current) return;

    // Prevent multiple Vanta instances

    if (!vantaEffect) {
      const effect = window.VANTA.BIRDS({
        el: vantaRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        backgroundColor: 0,
        backgroundAlpha: 0.0,
        color1: 0x341c1c,
        color2: 0x341c1c,
        birdSize: 0.5,
        wingSpan: 10.0,
        speedLimit: 2.0,
        separation: 100,
        alignment: 1.0,
        cohesion: 1.0,
        quantity: 2.0,
      });
      setVantaEffect(effect);
    }

    return () => {
      vantaEffect?.destroy?.();
    };
  }, [vantaEffect]);
  const videoPath = "/uploads/films/Really short video.mp4";
  const PFPPath = "/uploads/pfp/temp.jpg";
  var V_Genres = "Adventure, Comedy";
  var V_Rating = 9.9;
  return (
    <div ref={vantaRef} className="Vanta" style={{ borderRadius: "20%" }}></div>
  );
};

export default Birdies;
