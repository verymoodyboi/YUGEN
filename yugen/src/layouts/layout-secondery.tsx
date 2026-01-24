import { Outlet } from "react-router-dom";
import React, { useState } from "react";

const floatingIcons = [
  { id: 1, top: "9%", left: "5%", scale: 1.4, rotate: -20, dx: 1, dy: 1 },
  { id: 2, top: "10%", left: "90%", scale: 1.1, rotate: 15, dx: -1, dy: 1 },
  { id: 3, top: "70%", left: "8%", scale: 1.6, rotate: 10, dx: 1, dy: -1 },
  { id: 4, top: "70%", left: "85%", scale: 1.3, rotate: -15, dx: -1, dy: -1 },
  { id: 5, top: "5%", left: "70%", scale: 1.3, rotate: -15, dx: 1, dy: 1 },
  { id: 6, top: "5%", left: "20%", scale: 1.3, rotate: 15, dx: -1, dy: 1 },
  { id: 7, top: "30%", left: "80%", scale: 1.3, rotate: -25, dx: 1, dy: -1 },
  { id: 8, top: "40%", left: "15%", scale: 1.3, rotate: -15, dx: -1, dy: -1 },
];

const AppLayout2: React.FC = () => {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY, currentTarget } = e;
    const { offsetWidth, offsetHeight } = currentTarget;

    setPos({
      x: (clientX / offsetWidth - 0.5) * 20,
      y: (clientY / offsetHeight - 0.5) * 20,
    });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative min-h-screen overflow-hidden"
    >
      {/* Floating icons background */}
      {floatingIcons.map((icon) => (
        <div
          key={icon.id}
          className={`
            absolute pointer-events-none z-0
            transition-transform duration-150 ease-out
            opacity-10 lg:opacity-30
            ${icon.id === 5 || icon.id === 6 ? "hidden lg:block" : ""}
          `}
          style={{
            top: icon.top,
            left: icon.left,
            transform: `
              translate(${pos.x * 0.3 * icon.dx}px,
                        ${pos.y * 0.3 * icon.dy}px)
              scale(${icon.scale})
              rotate(${icon.rotate}deg)
            `,
          }}
        >
          <img
            src="https://assets.try-yugen.com/yugen_logo_dark.svg"
            alt=""
            className="min-w-[100px] min-h-[100px] object-contain"
          />
        </div>
      ))}

      {/* Page content */}
      <div className="relative z-10">
        <Outlet />
      </div>

      {/* Grain */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.07] bg-[url('/grain.png')] bg-repeat" />
    </div>
  );
};

export default AppLayout2;
