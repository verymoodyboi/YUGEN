// LandingPage.tsx
import React from "react";
import { useState } from "react";
import HeroSection from "../features/landing-page/components/heroSection";
import FooterSection from "../features/landing-page/components/footer";

const LandingPage: React.FC = () => {
  const [openContact, setOpenContact] = useState(false);
  const mainRef = React.useRef<HTMLDivElement>(null);
  return (
    <main
      ref={mainRef}
      className="flex flex-col bg-emerald-50 w-full h-screen overflow-y-auto overflow-x-hidden"
    >
      {/* Hero Section - will be full viewport height */}
      <div className="w-full flex-shrink-0">
        <HeroSection />
      </div>

      {/* Footer Section - will appear below hero when scrolling */}
      <div className="w-full flex-shrink-0">
        <FooterSection
          scrollToTop={() => {
            mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </div>
    </main>
  );
};

export default LandingPage;
