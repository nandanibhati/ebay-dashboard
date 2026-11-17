// Gets the text out of an uploaded invoice, entirely in the browser:
//   - PDFs with a text layer (most supplier invoices): read directly, exact.
//   - Scanned PDFs and photos: OCR with Tesseract.
// Both libraries are loaded only when needed, so they don't slow down
// the rest of the dashboard. Tesseract downloads its English language data
// (a few MB) from a CDN the first time, then the browser caches it.

const MAX_PDF_PAGES = 10;
const MAX_OCR_PAGES = 3;

async function loadPdfJs() {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const workerUrl = (await import("pdfjs-dist/legacy/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  return pdfjs;
}

// Rebuild lines from pdf.js text items by their vertical position.
function itemsToLines(items) {
  const rows = [];
  for (const item of items) {
    if (!item.str || !item.str.trim()) continue;
    const y = item.transform[5];
    const x = item.transform[4];
    let row = rows.find((r) => Math.abs(r.y - y) < 3);
    if (!row) {
      row = { y, parts: [] };
      rows.push(row);
    }
    row.parts.push({ x, str: item.str });
  }
  return rows
    .sort((a, b) => b.y - a.y) // PDF y grows upwards
    .map((r) => r.parts.sort((a, b) => a.x - b.x).map((p) => p.str).join(" ").replace(/\s+/g, " ").trim())
    .join("\n");
}

async function ocr(images, onProgress) {
  const { createWorker } = await import("tesseract.js");
  let page = 0;
  const worker = await createWorker("eng", 1, {
    logger: (m) => {
      if (m.status === "recognizing text") {
        onProgress?.(`Reading text… ${Math.round(((page + m.progress) / images.length) * 100)}%`);
      } else if (/loading|initializ/i.test(m.status)) {
        onProgress?.("Preparing text reader…");
      }
    },
  });
  try {
    const texts = [];
    for (const image of images) {
      const { data } = await worker.recognize(image);
      texts.push(data.text);
      page += 1;
    }
    return texts.join("\n");
  } finally {
    await worker.terminate();
  }
}

export async function extractInvoiceText(file, onProgress) {
  if (file.type === "application/pdf") {
    onProgress?.("Reading PDF…");
    const pdfjs = await loadPdfJs();
    const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    const pageCount = Math.min(doc.numPages, MAX_PDF_PAGES);

    let text = "";
    for (let i = 1; i <= pageCount; i++) {
      const page = await doc.getPage(i);
      text += itemsToLines((await page.getTextContent()).items) + "\n";
    }

    // A scanned PDF has (almost) no text layer — render pages and OCR them.
    if (text.replace(/\s/g, "").length < 40) {
      const canvases = [];
      for (let i = 1; i <= Math.min(doc.numPages, MAX_OCR_PAGES); i++) {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvas, canvasContext: canvas.getContext("2d"), viewport }).promise;
        canvases.push(canvas);
      }
      return { text: await ocr(canvases, onProgress), method: "ocr" };
    }
    return { text, method: "pdf" };
  }

  if (file.type.startsWith("image/")) {
    return { text: await ocr([file], onProgress), method: "ocr" };
  }

  throw new Error("Upload a PDF or a photo (JPG, PNG, WEBP) of the invoice.");
}
