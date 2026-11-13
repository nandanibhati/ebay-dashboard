const Anthropic = require("@anthropic-ai/sdk");

// Reads a supplier invoice (PDF or photo) with Claude and returns its
// details as structured data, for pre-filling a Supplier Ledger entry.
// Nothing is saved here — the admin reviews the filled form first.

const MODEL = "claude-opus-5-5";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// Structured output: Claude's reply must match this schema exactly.
const INVOICE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "vendor_name",
    "matched_vendor",
    "invoice_number",
    "invoice_date",
    "currency",
    "subtotal",
    "vat",
    "total",
    "items",
    "notes",
  ],
  properties: {
    vendor_name: { type: "string", description: "Seller / supplier name as printed on the invoice" },
    matched_vendor: {
      type: "string",
      description: "The exact name from the known vendor list that is this supplier, or empty string if none matches",
    },
    invoice_number: { type: "string" },
    invoice_date: { type: "string", description: "YYYY-MM-DD, or empty string if not shown" },
    currency: { type: "string", description: "ISO code, e.g. GBP" },
    subtotal: { type: "number", description: "Amount before VAT; 0 if not shown" },
    vat: { type: "number", description: "VAT amount; 0 if none or not shown" },
    total: { type: "number", description: "Final amount payable" },
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["description", "quantity", "unit_price", "line_total", "imeis"],
        properties: {
          description: { type: "string" },
          quantity: { type: "number" },
          unit_price: { type: "number" },
          line_total: { type: "number" },
          imeis: {
            type: "array",
            items: { type: "string" },
            description: "IMEI or serial numbers printed for this line; empty if none",
          },
        },
      },
    },
    notes: {
      type: "string",
      description: "Anything unclear or worth checking (e.g. blurry figures, totals that don't add up); empty if all clear",
    },
  },
};

const SYSTEM = `You read supplier invoices for a UK business that buys and resells phones and electronics.
Extract the invoice's details exactly as printed. The business is the buyer; the vendor is the company that issued the invoice.
- Amounts are plain numbers without currency symbols or thousands separators.
- "total" is the final amount payable, including VAT.
- Dates are YYYY-MM-DD; UK invoices write dates day-first.
- Only list IMEI/serial numbers that are actually printed on the invoice. Never invent or complete them.
- If a value isn't on the invoice, use an empty string or 0, and say so in "notes".
- For "matched_vendor", pick the known vendor that is clearly the same company (ignoring "Ltd", spacing or case), or an empty string if none is.`;

class InvoiceReaderError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

let defaultClient = null;
function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new InvoiceReaderError(
      "AI invoice reading isn't set up yet: add ANTHROPIC_API_KEY to the server's environment.",
      503
    );
  }
  defaultClient = defaultClient || new Anthropic.default({ maxRetries: 2, timeout: 120 * 1000 });
  return defaultClient;
}

function fileBlock(buffer, mimetype) {
  const data = buffer.toString("base64");
  if (mimetype === "application/pdf") {
    return { type: "document", source: { type: "base64", media_type: "application/pdf", data } };
  }
  if (IMAGE_TYPES.includes(mimetype)) {
    return { type: "image", source: { type: "base64", media_type: mimetype, data } };
  }
  throw new InvoiceReaderError("Upload a PDF or a photo (JPG, PNG, WEBP) of the invoice.", 400);
}

const round2 = (n) => Number(Math.round(`${Number(n) || 0}e2`) + "e-2");

// `client` is injectable for tests.
async function readInvoice({ buffer, mimetype, vendorNames = [], client = getClient() }) {
  let response;
  try {
    response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      // If Claude's safety checks decline (unlikely for an invoice), retry
      // on Anthropic's recommended fallback model instead of failing.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SYSTEM,
      output_config: { format: { type: "json_schema", schema: INVOICE_SCHEMA } },
      messages: [
        {
          role: "user",
          content: [
            fileBlock(buffer, mimetype),
            {
              type: "text",
              text: `Known vendors: ${vendorNames.length ? vendorNames.map((v) => JSON.stringify(v)).join(", ") : "(none yet)"}\n\nExtract this invoice.`,
            },
          ],
        },
      ],
    });
  } catch (error) {
    if (error instanceof InvoiceReaderError) throw error;
    if (error instanceof Anthropic.AuthenticationError) {
      throw new InvoiceReaderError("The ANTHROPIC_API_KEY on the server is invalid.", 503);
    }
    if (error instanceof Anthropic.RateLimitError) {
      throw new InvoiceReaderError("The AI is busy right now — try again in a minute.", 429);
    }
    if (error instanceof Anthropic.BadRequestError) {
      throw new InvoiceReaderError(`The AI couldn't read this file: ${error.message}`, 400);
    }
    if (error instanceof Anthropic.APIError) {
      throw new InvoiceReaderError(`AI service error (${error.status}). Try again.`, 502);
    }
    throw new InvoiceReaderError("Couldn't reach the AI service. Try again.", 502);
  }

  if (response.stop_reason === "refusal") {
    throw new InvoiceReaderError("The AI declined to read this file. Please enter it manually.", 422);
  }
  if (response.stop_reason === "max_tokens") {
    throw new InvoiceReaderError("This invoice is too long to read in one go. Please enter it manually.", 422);
  }

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new InvoiceReaderError("The AI's answer couldn't be understood. Try again.", 502);
  }

  // Keep matched_vendor only if it's really one of ours.
  const matched = vendorNames.find((v) => v === data.matched_vendor) || "";
  const items = (data.items || []).map((item) => ({
    description: String(item.description || ""),
    quantity: Number(item.quantity) || 0,
    unit_price: round2(item.unit_price),
    line_total: round2(item.line_total),
    imeis: (item.imeis || []).map((s) => String(s).replace(/\s+/g, "")).filter(Boolean),
  }));

  return {
    vendor_name: String(data.vendor_name || ""),
    matched_vendor: matched,
    invoice_number: String(data.invoice_number || ""),
    invoice_date: /^\d{4}-\d{2}-\d{2}$/.test(data.invoice_date || "") ? data.invoice_date : "",
    currency: String(data.currency || ""),
    subtotal: round2(data.subtotal),
    vat: round2(data.vat),
    total: round2(data.total),
    items,
    notes: String(data.notes || ""),
  };
}

module.exports = { readInvoice, InvoiceReaderError, INVOICE_SCHEMA, MODEL };
