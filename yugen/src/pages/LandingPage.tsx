// LandingPage.tsx
import React from "react";
import { useState } from "react";
import HeroSection from "../features/landing-page/components/heroSection";
import FooterSection from "../features/landing-page/components/footer";

const LandingPage: React.FC = () => {
  const [openContact, setOpenContact] = useState(false);

  return (
    <main className="flex flex-col bg-emerald-50 w-full h-screen overflow-y-auto overflow-x-hidden">
      {/* Hero Section - will be full viewport height */}

      {/* Footer Section - will appear below hero when scrolling */}
      <div className="w-full flex-shrink-0">
        <FooterSection />
      </div>
    </main>
  );
};

export default LandingPage;
