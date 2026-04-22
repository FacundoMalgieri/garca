import type { Metadata } from "next";

import { InvoiceProvider } from "@/contexts/InvoiceContext";

export const metadata: Metadata = {
  title: "Panel",
  robots: { index: false, follow: false },
};

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return <InvoiceProvider>{children}</InvoiceProvider>;
}
