"use client";

import HeroSlider from "../components/HeroSlider";
import AboutUs from "../components/AboutUs";
import DiabetesCare from "../components/DiabetesCare";
import OurTopProducts from "../components/OurTopProducts";
import WhyChooseUs from "../components/WhyChooseUs";
import LifestyleBanner from "@/components/LifestyleBanner";
import Testimonials from "@/components/Testimonials";
import CallToAction from "@/components/CallToAction";
import AnimatedSection from "@/components/AnimatedSection";

// 👇 NEW IMPORT
import FirstOrderOfferPopup from "@/components/FirstOrderOfferPopup";

export default function Home() {
  return (
    <>
      {/* 🎉 First Customer Offer Popup */}
      <FirstOrderOfferPopup storageKey="healthcare_first_offer_popup_v2" />

      {/* Hero FULL WIDTH */}
      <div className="w-full">
        <HeroSlider />

        <AnimatedSection>
          <AboutUs />
        </AnimatedSection>

        <AnimatedSection>
          <DiabetesCare />
        </AnimatedSection>

        <AnimatedSection>
          <OurTopProducts />
        </AnimatedSection>

        <AnimatedSection>
          <WhyChooseUs />
        </AnimatedSection>

        <AnimatedSection>
          <LifestyleBanner />
        </AnimatedSection>

        <AnimatedSection>
          <Testimonials />
        </AnimatedSection>

        {/* <AnimatedSection>
          <CallToAction />
        </AnimatedSection> */}
      </div>
    </>
  );
}
