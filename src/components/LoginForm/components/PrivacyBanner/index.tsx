export function PrivacyBanner() {
  return (
    <div className="rounded-lg bg-success/10 p-3 border border-success/50">
      <div className="flex items-start gap-3">
        <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-success text-success-foreground text-xs font-bold">
          <CheckIcon />
        </div>
        <div className="flex-1 text-sm text-left">
          <p className="font-medium text-success mb-1">Privacidad Garantizada</p>
          <p className="text-muted-foreground text-xs">
            Los datos se almacenan únicamente en localStorage de tu navegador.
            No se envían a servidores externos.
          </p>
        </div>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

