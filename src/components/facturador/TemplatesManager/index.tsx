"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { Plantilla } from "@/types/facturador";

interface TemplatesManagerProps {
  isOpen: boolean;
  onClose: () => void;
  templates: Plantilla[];
  onRename: (id: string, nombre: string) => void;
  onDelete: (id: string) => void;
}

export function TemplatesManager({ isOpen, onClose, templates, onRename, onDelete }: TemplatesManagerProps) {
  const [mounted, setMounted] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Plantilla | null>(null);

  useEffect(() => setMounted(true), []);
  if (!isOpen || !mounted) return null;

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={handleBackdrop}>
      <div className="absolute inset-0 bg-black/60" />
      <div role="dialog" aria-modal="true" aria-label="Gestionar plantillas" className="relative z-10 w-full max-w-lg rounded-xl bg-white dark:bg-zinc-900 border border-border shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Gestionar plantillas</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer" aria-label="Cerrar">✕</button>
        </div>

        {templates.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tenés plantillas guardadas todavía.</p>
        ) : (
          <ul className="space-y-2 max-h-[60vh] overflow-y-auto">
            {templates.map((t) => (
              <li key={t.id} className="flex items-center gap-2 rounded-lg border border-border p-2">
                <input
                  defaultValue={t.nombre}
                  onBlur={(e) => { const v = e.target.value.trim(); if (v && v !== t.nombre) onRename(t.id, v); }}
                  className="flex-1 rounded-md border border-border bg-background px-2 py-1 text-sm"
                  aria-label={`Nombre de ${t.nombre}`}
                />
                <button onClick={() => setPendingDelete(t)} className="rounded-md border border-border px-2 py-1 text-xs text-destructive hover:bg-destructive/10 cursor-pointer" aria-label={`Eliminar ${t.nombre}`}>Eliminar</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => { if (pendingDelete) onDelete(pendingDelete.id); setPendingDelete(null); }}
        title="Eliminar plantilla"
        description={`¿Seguro que querés eliminar "${pendingDelete?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>,
    document.body
  );
}
