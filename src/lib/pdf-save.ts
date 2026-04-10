import type jsPDF from "jspdf";

/**
 * Saves a jsPDF document as a file. Uses the Web Share API on mobile
 * devices that support file sharing (e.g. iOS Safari) so the user gets
 * the native share sheet with a real PDF file instead of a blob URL.
 * Falls back to a standard download on desktop or unsupported browsers.
 */
export async function savePdf(doc: jsPDF, filename: string): Promise<void> {
  const blob = doc.output("blob");
  const file = new File([blob], filename, { type: "application/pdf" });

  if (canNativeShare(file)) {
    try {
      await navigator.share({ files: [file] });
      return;
    } catch (err: unknown) {
      // AbortError means the user dismissed the share sheet — not an error
      if (err instanceof DOMException && err.name === "AbortError") return;
      // Any other error → fall through to download
    }
  }

  doc.save(filename);
}

function canNativeShare(file: File): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [file] })
  );
}
