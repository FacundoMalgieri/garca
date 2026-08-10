"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { useInvoiceContext } from "@/contexts/InvoiceContext";
import { useModalA11y } from "@/hooks/useModalA11y";
import { clearStorageGroups, STORAGE_GROUPS, type StorageGroupId } from "@/lib/storage/groups";

interface ClearDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCleared: (ids: StorageGroupId[]) => void;
}

/**
 * Borrado selectivo. Reemplaza al ConfirmDialog de todo-o-nada: las plantillas
 * del facturador y los clientes recordados no están en ARCA, así que no se
 * pueden perder por default.
 */
export function ClearDataModal({ isOpen, onClose, onCleared }: ClearDataModalProps) {
  const { clearInvoices } = useInvoiceContext();
  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState<StorageGroupId[]>(["comprobantes"]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Se resetea a la selección default en cada apertura: un modal destructivo
  // no debe recordar que "facturador" quedó tildado de la vez anterior.
  useEffect(() => {
    if (isOpen) setSelected(["comprobantes"]);
  }, [isOpen]);

  const dialogRef = useModalA11y<HTMLDivElement>(isOpen && mounted, onClose);

  const toggle = (id: StorageGroupId) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleConfirm = () => {
    if (selected.length === 0) return;
    // Comprobantes va por clearInvoices: además de las keys tiene que resetear
    // el estado en memoria del contexto.
    if (selected.includes("comprobantes")) {
      clearInvoices();
    }
    const resto = selected.filter((id) => id !== "comprobantes");
    if (resto.length > 0) {
      clearStorageGroups(resto);
    }
    onCleared(selected);
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="clear-data-title"
        tabIndex={-1}
        className="w-full max-w-lg rounded-lg border border-border bg-background p-6 shadow-lg"
      >
        <h2 id="clear-data-title" className="mb-2 text-lg font-semibold">
          ¿Qué querés borrar?
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Todo esto vive sólo en este navegador. Elegí qué eliminar; lo que no tildes se queda.
        </p>

        <div className="space-y-3">
          {STORAGE_GROUPS.map((group) => (
            <label
              key={group.id}
              className="flex cursor-pointer gap-3 rounded-lg border border-border p-3 hover:bg-muted/50"
            >
              <input
                type="checkbox"
                checked={selected.includes(group.id)}
                onChange={() => toggle(group.id)}
                aria-label={group.label}
                className="mt-1 shrink-0 cursor-pointer"
              />
              <span>
                <span className="block text-sm font-medium">{group.label}</span>
                <span className="block text-xs text-muted-foreground">{group.description}</span>
              </span>
            </label>
          ))}
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-md border border-border px-3 py-2 text-sm cursor-pointer hover:bg-muted"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={selected.length === 0}
            className="flex-1 rounded-md bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground cursor-pointer hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Borrar lo seleccionado
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
