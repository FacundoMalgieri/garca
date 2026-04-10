import type jsPDF from "jspdf";

export interface PdfSaveResult {
  /** The generated File, available for sharing via sharePdfFile() */
  file: File;
  /** Whether the device supports native file sharing */
  canShare: boolean;
}

/**
 * Saves a jsPDF document as a download and returns the File for optional sharing.
 * On devices that support the Web Share API with files (iOS Safari),
 * the caller can use sharePdfFile() from a direct user gesture to
 * open the native share sheet.
 */
export function savePdf(doc: jsPDF, filename: string): PdfSaveResult {
  const blob = doc.output("blob");
  const file = new File([blob], filename, { type: "application/pdf" });
  const canShare = canNativeShareFile(file);

  if (!canShare) {
    doc.save(filename);
  }

  return { file, canShare };
}

/**
 * Opens the native share sheet with a PDF file.
 * MUST be called from a direct user gesture (click/tap).
 */
export async function sharePdfFile(file: File): Promise<void> {
  await navigator.share({ files: [file] });
}

function canNativeShareFile(file: File): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [file] })
  );
}
