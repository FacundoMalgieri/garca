import { useCallback, useEffect, useState } from "react";

import { deleteTemplate, listTemplates, saveTemplate } from "@/lib/facturador/templates";
import type { Plantilla } from "@/types/facturador";

/** Estado reactivo de las plantillas del facturador (persistidas en localStorage). */
export function useTemplates() {
  const [templates, setTemplates] = useState<Plantilla[]>([]);

  useEffect(() => {
    setTemplates(listTemplates());
  }, []);

  const save = useCallback((input: Plantilla | Omit<Plantilla, "id">): Plantilla => {
    const saved = saveTemplate(input);
    setTemplates(listTemplates());
    return saved;
  }, []);

  const remove = useCallback((id: string): void => {
    deleteTemplate(id);
    setTemplates(listTemplates());
  }, []);

  return { templates, save, remove };
}
