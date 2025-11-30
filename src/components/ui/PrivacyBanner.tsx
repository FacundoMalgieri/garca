import { ShieldCheckIcon } from "./icons";

interface PrivacyBannerProps {
  variant?: "default" | "dark";
}

export function PrivacyBanner({ variant = "default" }: PrivacyBannerProps) {
  const isDark = variant === "dark";

  return (
    <div className="max-w-3xl mx-auto">
      {/* Section header */}
      <div className="text-center mb-8">
        <span
          className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4 ${
            isDark ? "bg-white/20 text-white" : "bg-green-500/10 text-green-600 dark:text-green-400"
          }`}
        >
          Seguridad
        </span>
        <h2 className={`text-2xl md:text-3xl font-bold ${isDark ? "text-white" : "text-foreground"}`}>
          Privacidad Garantizada
        </h2>
      </div>

      <div
        className={`relative rounded-2xl p-6 md:p-8 overflow-hidden ${
          isDark
            ? "bg-white/10 border border-white/20"
            : "bg-green-500/5 border-2 border-green-500/20 dark:bg-green-500/10"
        }`}
      >
        <div className="relative flex flex-col md:flex-row items-start gap-5">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
              isDark ? "bg-white text-primary" : "bg-green-500 text-white"
            }`}
          >
            <ShieldCheckIcon />
          </div>
          <div className="flex-1 space-y-3">
            <p className={`text-base leading-relaxed ${isDark ? "text-white" : "text-foreground"}`}>
              GARCA funciona <strong>completamente en tu navegador</strong>. No almacenamos tus credenciales ni enviamos
              tus datos a ningún servidor externo.
            </p>
            <p className={`text-sm leading-relaxed ${isDark ? "text-white/70" : "text-muted-foreground"}`}>
              Todo permanece en tu dispositivo. El código es{" "}
              <a
                href="https://github.com/FacundoMalgieri/garca"
                target="_blank"
                rel="noopener noreferrer"
                className={`font-semibold hover:underline ${
                  isDark ? "text-white" : "text-green-600 dark:text-green-400"
                }`}
              >
                open source
              </a>{" "}
              y podés revisarlo en GitHub.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
