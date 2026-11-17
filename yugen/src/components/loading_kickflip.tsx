import React from "react";

const Loading: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-transparent">
      <img
        src="https://assets.try-yugen.com/Kickflip!.gif"
        alt="loading"
        className="w-48 h-48 object-contain"
      />

      <p className="mt-4 text-emerald-950 text-lg animate-pulse">
        getting there...
      </p>
    </div>
  );
};

export default Loading;
