import { GitHubSponsorsIcon, PayPalIcon } from "./icons"

export function SupportBanner() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">
            ¿Te sirvió? Apoyá el proyecto
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            GARCA es gratis y open source. Si te ahorra tiempo, considerá apoyar el desarrollo.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <a
            href="https://github.com/sponsors/FacundoMalgieri"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-[#ea4aaa] px-3.5 py-2 text-sm font-medium text-white hover:bg-[#ea4aaa]/90 transition-all hover:scale-[1.02]"
          >
            <GitHubSponsorsIcon className="h-4 w-4" />
            Sponsor
          </a>
          <a
            href="https://paypal.me/facundomalgieri"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-[#003087] px-3.5 py-2 text-sm font-medium text-white hover:bg-[#003087]/90 transition-all hover:scale-[1.02]"
          >
            <PayPalIcon className="h-4 w-4" />
            PayPal
          </a>
          <a
            href="https://buymeacoffee.com/facundo.malgieri"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-[#FFDD00] px-3.5 py-2 text-sm font-medium text-black hover:bg-[#FFDD00]/90 transition-all hover:scale-[1.02]"
          >
            <img src="/icons/bmc-logo.svg" alt="" className="h-4 w-4" />
            Coffee
          </a>
        </div>
      </div>
    </div>
  )
}
