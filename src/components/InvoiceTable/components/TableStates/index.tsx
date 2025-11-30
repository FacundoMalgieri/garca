import { getErrorMessage } from "../../utils/formatters";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Consultando ARCA..." }: LoadingStateProps) {
  return (
    <div className="py-12 text-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4" />
      <p className="text-sm text-muted-foreground mb-2">{message}</p>
      <p className="text-xs text-muted-foreground">Esto puede tomar entre 30-60 segundos</p>
    </div>
  );
}

interface ErrorStateProps {
  error: string | null;
  errorCode: string | null;
}

export function ErrorState({ error, errorCode }: ErrorStateProps) {
  return (
    <div className="rounded-lg bg-destructive/10 border border-destructive/50 p-4">
      <p className="text-sm text-destructive whitespace-pre-wrap">{getErrorMessage(errorCode, error)}</p>
    </div>
  );
}

export function EmptyState() {
  return (
    <div className="py-12 text-center text-muted-foreground">
      <svg className="mx-auto h-12 w-12 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <p className="text-sm">No hay comprobantes cargados aún</p>
      <p className="text-xs mt-1">Ingresá tus credenciales para consultar</p>
    </div>
  );
}

