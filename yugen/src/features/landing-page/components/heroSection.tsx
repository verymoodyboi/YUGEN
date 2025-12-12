import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../../YugenAssits/YugenLogoFINAL.svg";
const HeroSection: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY, currentTarget } = e;
    const { offsetWidth, offsetHeight } = currentTarget;

    const x = (clientX / offsetWidth - 0.5) * 20;
    const y = (clientY / offsetHeight - 0.5) * 20;

    setPosition({ x, y });
  };

  const floatingIcons = [
    {
      id: 1,
      top: "9%",
      left: "5%",
      scale: 1.4,
      rotate: -20,
      directionX: 1,
      directionY: 1,
    },
    {
      id: 2,
      top: "10%",
      left: "90%",
      scale: 1.1,
      rotate: 15,
      directionX: -1,
      directionY: 1,
    },
    {
      id: 3,
      top: "70%",
      left: "8%",
      scale: 1.6,
      rotate: 10,
      directionX: 1,
      directionY: -1,
    },
    {
      id: 4,
      top: "70%",
      left: "85%",
      scale: 1.3,
      rotate: -15,
      directionX: -1,
      directionY: -1,
    },
    {
      id: 5,
      top: "5%",
      left: "70%",
      scale: 1.3,
      rotate: -15,
      directionX: 1,
      directionY: 1,
    },
    {
      id: 6,
      top: "5%",
      left: "20%",
      scale: 1.3,
      rotate: 15,
      directionX: -1,
      directionY: 1,
    },
    {
      id: 7,
      top: "30%",
      left: "80%",
      scale: 1.3,
      rotate: -25,
      directionX: 1,
      directionY: -1,
    },
    {
      id: 8,
      top: "40%",
      left: "15%",
      scale: 1.3,
      rotate: -15,
      directionX: -1,
      directionY: -1,
    },
  ];

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative w-full h-screen bg-emerald-50 flex flex-col items-center justify-center"
    >
      {/* Floating Parallax Icons */}
      {floatingIcons.map((icon) => (
        <div
          key={icon.id}
          className="absolute transition-transform duration-150 ease-out pointer-events-none"
          style={{
            top: icon.top,
            left: icon.left,
            transform: `
              translate(${position.x * 0.3 * icon.directionX}px, 
                        ${position.y * 0.3 * icon.directionY}px)
              scale(${icon.scale})
              rotate(${icon.rotate}deg)
            `,
          }}
        >
          <img
            src="https://iqvsgbsnpqvbddmdixoz.supabase.co/storage/v1/object/public/assets/Yugen%20Logo%20Vector%20FINAL.svg"
            alt="floating icon"
            className="w-[8vw] h-[16vh] object-contain opacity-50"
          />
        </div>
      ))}

      {/* Main Logo */}
      <div
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
        className="transition-transform duration-150 ease-out"
      >
        <img
          alt="Yugen Logo"
          className="w-50 h-auto"
          src="https://iqvsgbsnpqvbddmdixoz.supabase.co/storage/v1/object/public/assets/Kickflip!.gif"
        />
      </div>

      {/* Title */}
      <div className="mt-10 text-center">
        <p className="text-3xl font-freckle text-emerald-950 tracking-tight">
          Don’t consume, but{" "}
          <span className="text-3xl title text-emerald-700">CURATE.</span> Don’t
          generate, but{" "}
          <span className="text-3xl title text-emerald-700">CREATE.</span>
        </p>
      </div>

      {/* Subtitle */}
      <p className="mt-3 text-emerald-950/70 text-lg italic text-center">
        Discover unique stories told by filmmakers around the world, and share
        your stories with the world.
      </p>

      {/* CTA Button */}
      <div className="mt-6 flex space-x-4">
        <button
          onClick={() => navigate("/login")}
          className="px-20 py-3 border-2 border-emerald-950 rounded-xl 
                     bg-emerald-950 text-emerald-50 hover:bg-emerald-900 
                     hover:scale-105 transition font-semibold"
        >
          Start Exploring
        </button>
      </div>

      {/* Background Grain */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.07] bg-[url('/grain.png')] bg-repeat"></div>
    </section>
  );
};

export default HeroSection;
