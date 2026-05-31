/**
 * Index.tsx — New Landing Page
 *
 * This replaces resqaid/src/pages/Index.tsx.
 * It renders the new landing-page components from src/app/components/.
 *
 * The new Navbar has a "Request Demo" CTA. If you want that button to
 * navigate to /register or /login, edit Navbar.tsx accordingly (see comment below).
 */

import { Navbar } from "@/app/components/Navbar";
import { Hero } from "@/app/components/Hero";
import { PlatformOverview } from "@/app/components/PlatformOverview";
import { CoreFeatures } from "@/app/components/CoreFeatures";
import { AIIntegration } from "@/app/components/AIIntegration";
import { MissionTypes } from "@/app/components/MissionTypes";
import { DroneFleet } from "@/app/components/DroneFleet";
import { TechArchitecture } from "@/app/components/TechArchitecture";
import { Footer } from "@/app/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen text-white" style={{ background: "#141414" }}>
      <Navbar />
      <Hero />
      <div id="platform">
        <PlatformOverview />
      </div>
      <div id="features">
        <CoreFeatures />
      </div>
      <AIIntegration />
      <div id="missions">
        <MissionTypes />
      </div>
      <div id="fleet">
        <DroneFleet />
      </div>
      <TechArchitecture />
      <Footer />
    </div>
  );
};

export default Index;
