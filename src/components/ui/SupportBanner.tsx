import { GitHubSponsorsIcon, PayPalIcon } from "./icons"

export function SupportBanner() {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-5 sm:p-6">
      <div className="flex flex-col items-center sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <div className="mb-2">
            <span className="inline-flex items-center rounded-md bg-blue-100 dark:bg-blue-950/60 px-2 py-0.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
              Open source
            </span>
          </div>
          <p className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
            Apoyá el desarrollo de GARCA
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
            Proyecto sin fines de lucro. Cualquier aporte ayuda a mantener el servicio gratuito y
            sumar nuevas features.
          </p>
        </div>

        <div className="flex flex-row sm:flex-col md:flex-row items-stretch justify-center gap-1.5 md:gap-2 shrink-0 w-auto sm:w-44 md:w-auto">
          <a
            href="https://github.com/sponsors/FacundoMalgieri"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg bg-[#bf3999] px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white hover:bg-[#a82f86] transition-all hover:scale-[1.03] whitespace-nowrap w-auto sm:w-full md:w-auto"
          >
            <GitHubSponsorsIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Sponsor
          </a>
          <a
            href="https://paypal.me/facundomalgieri"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg bg-[#003087] px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white hover:bg-[#002668] transition-all hover:scale-[1.03] whitespace-nowrap w-auto sm:w-full md:w-auto"
          >
            <PayPalIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            PayPal
          </a>
          <a
            href="https://buymeacoffee.com/facundo.malgieri"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg bg-[#FFDD00] px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-slate-900 hover:bg-[#FFD600] transition-all hover:scale-[1.03] whitespace-nowrap w-auto sm:w-full md:w-auto"
          >
            <img src="/icons/bmc-logo.svg" alt="" className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Coffee
          </a>
        </div>
      </div>
    </div>
  )
}
