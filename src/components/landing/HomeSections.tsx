import { CalculatorSection } from "@/components/landing/sections/CalculatorSection";
import { CapabilitiesSection } from "@/components/landing/sections/CapabilitiesSection";
import { FacturadorSection } from "@/components/landing/sections/FacturadorSection";
import { FaqSection } from "@/components/landing/sections/FaqSection";
import { GuidesSection } from "@/components/landing/sections/GuidesSection";
import { PrivacySection } from "@/components/landing/sections/PrivacySection";
import { SupportSection } from "@/components/landing/sections/SupportSection";

/**
 * Orquestador de las secciones below-the-fold de la landing, en orden de embudo:
 * privacidad → capacidades → facturador → guías → calculadora → FAQ → apoyo.
 * Cada sección maneja su propio reveal con useSectionVisible.
 */
export function HomeSections() {
  return (
    <>
      <PrivacySection />
      <CapabilitiesSection />
      <FacturadorSection />
      <GuidesSection />
      <CalculatorSection />
      <FaqSection />
      <SupportSection />
    </>
  );
}
