export function PrivacyBanner() {
  return (
    <div className="rounded-lg bg-success/10 p-3 border border-success/50">
      <div className="flex items-start gap-3">
        <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-success text-success-foreground text-xs font-bold">
          <CheckIcon />
        </div>
        <div className="flex-1 text-sm text-left">
          <p className="font-medium text-success mb-1">Cómo cuidamos tus credenciales</p>
          <p className="text-muted-foreground text-xs">
            Tu clave fiscal se cifra con AES-256 antes de salir del navegador, se usa solo para
            conectarse a ARCA y se descarta al terminar. Los comprobantes se guardan únicamente en
            el localStorage de tu navegador.
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

