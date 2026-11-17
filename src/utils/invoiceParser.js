// Free, rule-based invoice reader: takes the text of an invoice (from a
// PDF's text layer or from OCR of a photo) and finds the vendor, invoice
// number, date, totals and IMEIs. No AI, no server, no cost. It won't be
// perfect on unusual layouts — whatever it can't find is left empty for
// the admin to fill in, and listed in `notes`.

const MONTHS = {
  jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3, apr: 4, april: 4,
  may: 5, jun: 6, june: 6, jul: 7, july: 7, aug: 8, august: 8, sep: 9, sept: 9,
  september: 9, oct: 10, october: 10, nov: 11, november: 11, dec: 12, december: 12,
};

const pad = (n) => String(n).padStart(2, "0");

function validDate(y, m, d) {
  if (y < 100) y += 2000;
  if (y < 2000 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCMonth() !== m - 1) return null; // e.g. 31 Feb
  return `${y}-${pad(m)}-${pad(d)}`;
}

// All dates in a piece of text, in order. UK invoices are day-first.
export function findDates(text) {
  const out = [];
  const patterns = [
    // 2026-11-12
    [/\b(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})\b/g, (m) => validDate(+m[1], +m[2], +m[3])],
    // 12/11/2026, 12-11-26, 12.11.2026
    [/\b(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})\b/g, (m) => validDate(+m[3], +m[2], +m[1])],
    // 12 Nov 2026, 12th November, 2026
    [/\b(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]{3,9})\.?,?\s+(\d{2,4})\b/g, (m) => {
      const mon = MONTHS[m[2].toLowerCase()];
      return mon ? validDate(+m[3], mon, +m[1]) : null;
    }],
    // Nov 12, 2026
    [/\b([A-Za-z]{3,9})\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})\b/g, (m) => {
      const mon = MONTHS[m[1].toLowerCase()];
      return mon ? validDate(+m[3], mon, +m[2]) : null;
    }],
  ];
  for (const [re, toIso] of patterns) {
    for (const m of text.matchAll(re)) {
      const iso = toIso(m);
      if (iso) out.push({ iso, index: m.index });
    }
  }
  return out.sort((a, b) => a.index - b.index).map((d) => d.iso);
}

// Money amounts on a line, e.g. "£1,240.50", "1240.50", "1 240,50" is not
// supported (UK format only). Prefers amounts with pence.
export function findAmounts(line) {
  const out = [];
  for (const m of line.matchAll(/(?:£|GBP|€|EUR|\$|USD)?\s?(-?\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?|-?\d+\.\d{2}|-?\d+)(?![\d.,]*%)/g)) {
    const raw = m[1];
    const value = Number(raw.replace(/,/g, ""));
    if (!Number.isFinite(value)) continue;
    const hasCurrency = /£|GBP|€|EUR|\$|USD/.test(m[0]);
    const hasPence = /\.\d{2}$/.test(raw);
    // Plain integers without £ are usually quantities, IDs or years.
    if (!hasCurrency && !hasPence) continue;
    out.push(value);
  }
  return out;
}

function luhnValid(digits) {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

// 15-digit numbers with a valid IMEI check digit. OCR sometimes splits
// them with spaces, so neighbouring digit groups are tried joined too —
// but only groups adding up to exactly 15 digits, so an IMEI followed by
// a price ("354044114377641 40.00") is still found.
export function findImeis(text) {
  const found = new Set();
  for (const m of text.matchAll(/(?<![\d.,])\d[\d ]*\d(?![\d])/g)) {
    const groups = m[0].split(/ +/);
    for (let i = 0; i < groups.length; i++) {
      let digits = "";
      for (let j = i; j < groups.length && digits.length < 15; j++) {
        digits += groups[j];
        if (digits.length === 15 && luhnValid(digits)) {
          found.add(digits);
          i = j;
          break;
        }
      }
    }
  }
  return [...found];
}

const normalizeName = (s) =>
  String(s || "")
    .toLowerCase()
    .replace(/\b(ltd|limited|llp|plc|inc|co|company|uk|the)\b/g, "")
    .replace(/[^a-z0-9]+/g, "");

// Short forms a supplier may print instead of its full name, e.g.
// "Phone Mart" → "PMart" or "PM". Only matched as whole words.
function shortForms(name) {
  const words = String(name || "")
    .toLowerCase()
    .replace(/\b(ltd|limited|llp|plc|inc|co|company|uk|the)\b/g, "")
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  if (words.length < 2) return [];
  const forms = [words.slice(0, -1).map((w) => w[0]).join("") + words[words.length - 1]];
  const initials = words.map((w) => w[0]).join("");
  if (initials.length >= 3) forms.push(initials);
  return forms;
}

function matchIn(text, vendorNames) {
  const hay = normalizeName(text);
  const words = new Set(String(text).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
  // The longest thing matched wins, so "Phone Hub Wholesale" beats
  // "Phone Hub", and "PMart" (Phone Mart) beats a vendor called "Mart".
  let best = "";
  let bestLen = 0;
  for (const v of vendorNames) {
    const full = normalizeName(v);
    if (full.length >= 3 && hay.includes(full) && full.length > bestLen) {
      best = v;
      bestLen = full.length;
    }
    for (const f of shortForms(v)) {
      if (words.has(f) && f.length > bestLen) {
        best = v;
        bestLen = f.length;
      }
    }
  }
  return best;
}

// The seller is named above the customer's address, so look there first;
// otherwise a vendor who is also the buyer ("Bill to: …") would win.
const BUYER_RE = /\b(bill(ed)? to|ship(ped)? to|deliver(y)? to|sold to|customer|invoice to)\b/i;

export function matchVendor(text, vendorNames) {
  const lines = String(text || "").split("\n");
  const buyerAt = lines.findIndex((l) => BUYER_RE.test(l));
  if (buyerAt > 0) {
    const fromHeader = matchIn(lines.slice(0, buyerAt).join("\n"), vendorNames);
    if (fromHeader) return fromHeader;
  }
  return matchIn(text, vendorNames);
}

// First line that looks like a company name (top of the invoice is
// usually the seller), used only as a suggestion when no vendor matches.
function guessVendorName(lines) {
  for (const line of lines.slice(0, 12)) {
    const l = line.trim();
    if (BUYER_RE.test(l)) break;
    if (l.length < 3 || l.length > 60) continue;
    if (/invoice|receipt|bill to|ship to|date|page|tel|phone|email|@|www\.|vat|^\d/i.test(l)) continue;
    // Reference numbers like "INV-004788" aren't names.
    if (/^[A-Z]{0,5}[-/#]?\d[\w\-/]*$/i.test(l)) continue;
    if (/[a-z]/i.test(l)) return l;
  }
  return "";
}

// Spaces/tabs only between label and value — never across a line break,
// or a heading like "TAX INVOICE" swallows the next line's label.
const INVOICE_NO_RE =
  /\b(?:invoice|inv|bill|receipt)[ \t]*(?:no\.?|number|num\.?|#|ref(?:erence)?\.?|id)?[ \t]*[:#.]?[ \t]*([A-Z0-9][A-Z0-9\-/_]{1,24})/gi;

// A line that is nothing but a reference, e.g. "INV-004788" or "SI/10233".
const BARE_REF_RE = /^([A-Z]{1,5}[-/#]?\d{3,}[\w\-/]*)$/i;

function findInvoiceNumber(lines) {
  for (const line of lines) {
    for (const m of line.matchAll(INVOICE_NO_RE)) {
      const value = m[1];
      // Must contain a digit and not be a word like "Date" or "To".
      if (/\d/.test(value) && !/^(date|to|from|total)$/i.test(value)) return value.replace(/[.,;:]+$/, "");
    }
  }
  // Label on its own line ("RECEIPT #") with the number a line or two below.
  for (let i = 0; i < lines.length; i++) {
    if (!/^(invoice|inv|receipt|bill)\.?\s*(no\.?|number|num\.?|#|ref(erence)?)\s*:?$/i.test(lines[i])) continue;
    for (const next of lines.slice(i + 1, i + 4)) {
      const m = next.match(BARE_REF_RE);
      if (m) return m[1];
    }
  }
  // Last resort: an "INV-…" style number anywhere.
  for (const line of lines) {
    const m = line.match(/\b((?:INV|INVOICE|RCPT|REC|SI)[-/#]?\d{3,}[\w\-/]*)\b/i);
    if (m) return m[1];
  }
  return "";
}

// Product lines ending in "unit price, quantity, line total", where
// price × quantity = total, e.g.
//   "Samsung A10 32GB A 354044114377641 40.00 7 280.00"
// followed by lines holding only more IMEIs for that product.
function findItems(lines) {
  const items = [];
  let current = null;
  for (const line of lines) {
    const m = line.match(/^(.*?)\s+£?(\d[\d,]*\.\d{2})\s+(\d{1,4})\s+£?(\d[\d,]*\.\d{2})$/);
    if (m) {
      const unit = Number(m[2].replace(/,/g, ""));
      const qty = Number(m[3]);
      const lineTotal = Number(m[4].replace(/,/g, ""));
      if (qty > 0 && Math.abs(unit * qty - lineTotal) < 0.02) {
        const imeis = findImeis(m[1]);
        let description = m[1];
        imeis.forEach((imei) => (description = description.replace(imei, " ")));
        description = description.replace(/\s+/g, " ").trim();
        if (description && !/^(totals?|sub\s?-?total)\b/i.test(description)) {
          current = { description: description.slice(0, 120), quantity: qty, unit_price: unit, imeis };
          items.push(current);
          continue;
        }
      }
    }
    // Continuation line with only IMEIs belongs to the product above.
    if (current && /^[\d\s]+$/.test(line)) {
      const more = findImeis(line);
      if (more.length) {
        current.imeis.push(...more);
        continue;
      }
    }
    current = null;
  }
  return items;
}

// The amount on the line(s) labelled with one of `labels`, best label first.
function amountByLabel(lines, labels, exclude) {
  for (const label of labels) {
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      if (!label.test(line) || (exclude && exclude.test(line))) continue;
      let amounts = findAmounts(line);
      // Label and amount are sometimes on separate lines (table layouts).
      if (amounts.length === 0 && lines[i + 1]) amounts = findAmounts(lines[i + 1]);
      if (amounts.length) return amounts[amounts.length - 1];
    }
  }
  return 0;
}

export function parseInvoiceText(text, vendorNames = []) {
  const clean = String(text || "").replace(/\r/g, "").replace(/[ \t]+/g, " ");
  const lines = clean.split("\n").map((l) => l.trim()).filter(Boolean);

  const matched_vendor = matchVendor(clean, vendorNames);
  const vendor_name = matched_vendor || guessVendorName(lines);

  const invoice_number = findInvoiceNumber(lines);

  // Prefer a date labelled as the invoice date, else the first date.
  let invoice_date = "";
  const dateLine = lines.find((l) => /\b(invoice date|date of issue|issue date|tax point|inv\.? date)\b/i.test(l));
  if (dateLine) invoice_date = findDates(dateLine)[0] || "";
  if (!invoice_date) {
    const labelIdx = lines.findIndex((l) => /\bdate\b/i.test(l) && !/due date|delivery date|order date/i.test(l));
    if (labelIdx >= 0) invoice_date = findDates(`${lines[labelIdx]} ${lines[labelIdx + 1] || ""}`)[0] || "";
  }
  if (!invoice_date) invoice_date = findDates(clean)[0] || "";

  const total = amountByLabel(
    lines,
    [
      /\b(amount|balance|total)\s+(due|payable|to pay)\b/i,
      /\b(grand|invoice)\s+total\b/i,
      /\btotal\s*\(?\s*(inc|incl|including)\.?\s*vat\b/i,
      /\btotal\s*(gbp|£)/i,
      /\btotal\b/i,
    ],
    /\b(sub\s?-?total|net total|total net|total ex|total excl|total vat|vat total|total qty|total quantity|total items)\b/i
  );
  const subtotal = amountByLabel(lines, [/\b(sub\s?-?total|net total|total net|total (ex|excl)\.?\s*vat|net amount)\b/i]);
  const vat = amountByLabel(lines, [/\bvat\b(?!\s*(no|number|reg|registration|#))/i], /\b(inc|incl|including|ex|excl)\.?\s*vat\b|vat\s*(no|number|reg)/i);

  const currency = /€|\bEUR\b/.test(clean) ? "EUR" : /\$|\bUSD\b/.test(clean) && !/£/.test(clean) ? "USD" : "GBP";
  const imeis = findImeis(clean);

  const missing = [];
  if (!matched_vendor) missing.push(vendor_name ? `vendor (best guess: “${vendor_name}”)` : "vendor");
  if (!invoice_number) missing.push("invoice number");
  if (!invoice_date) missing.push("date");
  if (!total) missing.push("total");
  const notes = [];
  if (missing.length) notes.push(`Couldn't find: ${missing.join(", ")} — please fill in.`);
  if (subtotal && vat && total && Math.abs(subtotal + vat - total) > 0.05) {
    notes.push(`Subtotal + VAT (${(subtotal + vat).toFixed(2)}) doesn't equal the total (${total.toFixed(2)}) — check the total.`);
  }

  return {
    vendor_name,
    matched_vendor,
    invoice_number,
    invoice_date,
    currency,
    subtotal,
    vat,
    total,
    items: findItems(lines),
    imeis,
    notes: notes.join(" "),
  };
}
