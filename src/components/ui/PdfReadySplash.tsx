"use client";

interface PdfReadySplashProps {
  onShare: () => void;
  onDownload: () => void;
  onDismiss: () => void;
}

/**
 * Post-generation modal that lets the user choose between saving the PDF
 * to disk (download) or opening the native share sheet. Rendered whenever
 * the Web Share API with files is available, since desktop share sheets
 * do not include a "save to downloads" action.
 */
export function PdfReadySplash({ onShare, onDownload, onDismiss }: PdfReadySplashProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="w-full max-w-sm px-6 text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <svg
              className="h-10 w-10 text-emerald-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">PDF generado</h2>
          <p className="text-sm text-muted-foreground">Elegí qué querés hacer con el archivo</p>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={onDownload}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors cursor-pointer"
          >
            <DownloadIcon />
            Guardar PDF
          </button>
          <button
            type="button"
            onClick={onShare}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-primary/60 text-primary dark:text-white font-medium hover:bg-primary/10 transition-colors cursor-pointer"
          >
            <ShareIcon />
            Compartir PDF
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="w-full py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 12V4m0 8l-4-4m4 4l4-4"
      />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
      />
    </svg>
  );
}
