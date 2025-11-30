import { PayPalIcon } from "./icons";

interface SupportSectionProps {
  variant?: "default" | "dark";
}

export function SupportSection({ variant = "default" }: SupportSectionProps) {
  const isDark = variant === "dark";

  return (
    <div className="max-w-3xl mx-auto">
      {/* Section header */}
      <div className="text-center mb-8">
        <span
          className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4 ${
            isDark ? "bg-white/20 text-white" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
          }`}
        >
          Open Source
        </span>
        <h2 className={`text-2xl md:text-3xl font-bold ${isDark ? "text-white" : "text-foreground"}`}>
          Apoyá el proyecto
        </h2>
      </div>

      <div
        className={`rounded-2xl p-6 md:p-8 ${
          isDark ? "bg-white/10 border border-white/20" : "bg-card border-2 border-border"
        }`}
      >
        {/* Header */}
        <div className="mb-6 text-center">
          <p className={isDark ? "text-white/80" : "text-muted-foreground"}>
            GARCA es <strong className={isDark ? "text-white" : "text-foreground"}>gratis y open source</strong>. Si te
            ahorra tiempo, considerá apoyar el desarrollo.
          </p>
        </div>

        {/* Support Options */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* PayPal */}
          <a
            href="https://paypal.me/facundomalgieri"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-3 rounded-xl p-4 font-semibold transition-all hover:scale-[1.02] cursor-pointer ${
              isDark
                ? "bg-white text-[#003087] hover:bg-white/90"
                : "bg-[#003087] text-white hover:bg-[#003087]/90"
            }`}
          >
            <PayPalIcon className="h-6 w-6" />
            Donar con PayPal
          </a>

          {/* Buy Me a Coffee */}
          <a
            href="https://buymeacoffee.com/facundo.malgieri"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 rounded-xl bg-[#FFDD00] text-black p-4 font-semibold transition-all hover:scale-[1.02] hover:bg-[#FFDD00]/90 cursor-pointer"
          >
            <img src="/icons/bmc-logo.svg" alt="BMC" className="h-6 w-6" />
            Buy me a coffee
          </a>
        </div>

        {/* GitHub Star */}
        <div className={`mt-4 rounded-lg p-3 text-center ${isDark ? "bg-white/5" : "bg-muted"}`}>
          <p className={`text-sm ${isDark ? "text-white/70" : "text-muted-foreground"}`}>
            También podés dejar una ⭐ en{" "}
            <a
              href="https://github.com/FacundoMalgieri/garca"
              target="_blank"
              rel="noopener noreferrer"
              className={`font-semibold hover:underline ${isDark ? "text-white" : "text-primary"}`}
            >
              GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
