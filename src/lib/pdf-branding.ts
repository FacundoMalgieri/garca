import type jsPDF from "jspdf"

let logoImageCache: string | null = null

/**
 * Loads the favicon PNG as a base64 data URL for embedding in PDFs.
 */
async function getLogoBase64(): Promise<string> {
  if (logoImageCache) return logoImageCache

  const response = await fetch("/favicon-192x192.png")
  const blob = await response.blob()

  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      logoImageCache = reader.result as string
      resolve(logoImageCache)
    }
    reader.readAsDataURL(blob)
  })
}

const LOGO_SIZE = 12
const LOGO_MARGIN = 10

/**
 * Draws the GARCA logo PNG in the top-right corner.
 */
function drawHeaderLogo(doc: jsPDF, logoData: string): void {
  const pageWidth = doc.internal.pageSize.width
  const x = pageWidth - LOGO_MARGIN - LOGO_SIZE
  const y = LOGO_MARGIN
  doc.addImage(logoData, "PNG", x, y, LOGO_SIZE, LOGO_SIZE)
}

/**
 * Applies branding to all pages: header logo PNG and footer text.
 */
export async function applyBrandedFooter(doc: jsPDF): Promise<void> {
  const logoData = await getLogoBase64()
  const pageCount = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages()
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)

    drawHeaderLogo(doc, logoData)

    doc.setFontSize(7)
    doc.setTextColor(170)
    doc.text("Creado por https://garca.app", 14, pageHeight - 10)
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - 14, pageHeight - 10, { align: "right" })
  }
}
