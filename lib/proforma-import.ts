export type SpreadsheetCell = string | number | boolean | Date | null;

export type ProformaImportDefaults = {
  commercialRegistration: string;
  taxCard: string;
  sellerName: string;
  sellerAddress: string;
  sellerPhone: string;
  sellerEmail: string;
  downPaymentPercent: number;
  bankAccountNumber: string;
  bankIban: string;
  bankCompanyName: string;
  bankName: string;
  bankBranch: string;
  bankSwift: string;
};

export type ParsedProformaItem = {
  description: string;
  finish: string;
  size: string;
  quantity: number;
  unit: "m²" | "m³" | "pcs" | "ton" | "kg" | "crate";
  unitPriceMinor: number;
  hsCode: string;
  crates: number;
  marks: string;
};

export type ParsedProforma = {
  sourceName: string;
  sheetName: string;
  warnings: string[];
  workbookTotalMinor: number | null;
  customer: {
    company: string;
    address: string;
    vat: string;
    country: string;
    city: string;
    port: string;
  };
  invoice: {
    number: string;
    date: string;
    currency: "USD" | "EUR" | "GBP" | "EGP";
    status: string;
    items: ParsedProformaItem[];
    containers: number;
    containerType: string;
    freightPerContainerMinor: number;
    downPaymentPercent: number;
    paidMinor: number;
    portLoading: string;
    portDischarge: string;
    notes: string;
    commercialRegistration: string;
    taxCard: string;
    sellerName: string;
    sellerAddress: string;
    sellerPhone: string;
    sellerEmail: string;
    shipToAddress: string;
    originCountry: string;
    hsCode: string;
    grossWeightKg: number;
    netWeightKg: number;
    totalCrates: number;
    incoterm: string;
    paymentTerms: string;
    bankAccountNumber: string;
    bankIban: string;
    bankCompanyName: string;
    bankName: string;
    bankBranch: string;
    bankSwift: string;
  };
};

const text = (value: SpreadsheetCell | undefined) =>
  value instanceof Date
    ? value.toISOString()
    : value === null || value === undefined
      ? ""
      : String(value).trim();

const compact = (value: string) => value.replace(/\s+/g, " ").trim();
const upper = (value: SpreadsheetCell | undefined) => text(value).toUpperCase();
const numeric = (value: SpreadsheetCell | undefined) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = Number(text(value).replace(/[$€£,\s]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const findCell = (rows: SpreadsheetCell[][], label: RegExp) => {
  for (let row = 0; row < rows.length; row += 1) {
    for (let column = 0; column < rows[row].length; column += 1) {
      if (label.test(upper(rows[row][column]))) return { row, column };
    }
  }
  return null;
};

const valueAfter = (rows: SpreadsheetCell[][], label: RegExp) => {
  const position = findCell(rows, label);
  if (!position) return "";
  for (let column = position.column + 1; column < rows[position.row].length; column += 1) {
    const value = text(rows[position.row][column]);
    if (value) return value;
  }
  return "";
};

const rowContaining = (rows: SpreadsheetCell[][], label: RegExp) => {
  const position = findCell(rows, label);
  return position ? rows[position.row] : undefined;
};

const parseDate = (value: SpreadsheetCell | undefined) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  const raw = text(value);
  const parts = raw.match(/(\d{1,4})\s*[\\/.-]\s*(\d{1,2})\s*[\\/.-]\s*(\d{1,4})/);
  if (!parts) return "";
  let day = Number(parts[1]);
  const month = Number(parts[2]);
  let year = Number(parts[3]);
  if (parts[1].length === 4) {
    year = Number(parts[1]);
    day = Number(parts[3]);
  }
  if (year < 100) year += 2000;
  if (!day || !month || !year) return "";
  return `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
};

const parseHsCode = (value: SpreadsheetCell | undefined) => {
  if (value instanceof Date) {
    return `${String(value.getUTCFullYear()).slice(-2)}-${String(value.getUTCMonth() + 1).padStart(2, "0")}-${String(value.getUTCDate()).padStart(2, "0")}`;
  }
  const raw = text(value);
  const isoDate = raw.match(/^(\d{4})-(\d{2})-(\d{2})T/);
  if (isoDate) return `${isoDate[1].slice(-2)}-${isoDate[2]}-${isoDate[3]}`;
  return raw;
};

const parseProduct = (rawDescription: string) => {
  const normalized = compact(rawDescription.replace(/\s*\+\s*/g, " + "));
  const sizeMatch = normalized.match(/(\d+(?:\.\d+)?)\s*[*x×]\s*(\d+(?:\.\d+)?)\s*[*x×]\s*(\d+(?:\.\d+)?)\s*(?:mm)?/i);
  const size = sizeMatch
    ? `${sizeMatch[1]} × ${sizeMatch[2]} × ${sizeMatch[3]} mm`
    : "";
  const withoutSize = compact(sizeMatch ? normalized.slice(0, sizeMatch.index) : normalized);
  const finishes = [
    "Acid + Tumbled",
    "Honed + Tumbled",
    "Bush Hammered",
    "Sandblasted",
    "Polished",
    "Brushed",
    "Tumbled",
    "Honed",
    "Acid",
  ];
  const finish = finishes.find((candidate) =>
    withoutSize.toLowerCase().includes(candidate.toLowerCase()),
  ) ?? "";
  const finishIndex = finish
    ? withoutSize.toLowerCase().indexOf(finish.toLowerCase())
    : -1;
  const description = compact(
    finishIndex >= 0 ? withoutSize.slice(0, finishIndex) : withoutSize,
  );
  return {
    description: description || rawDescription,
    finish,
    size,
  };
};

const labelledValue = (rows: SpreadsheetCell[][], label: RegExp) => {
  const position = findCell(rows, label);
  if (!position) return "";
  const cell = text(rows[position.row][position.column]);
  const inline = cell.split(":").slice(1).join(":").trim();
  return inline || valueAfter(rows, label);
};

const inferCountry = (address: string) => {
  const countries = [
    "United Kingdom",
    "United States",
    "France",
    "Germany",
    "Sweden",
    "Italy",
    "Spain",
    "Netherlands",
    "Belgium",
    "Canada",
    "Australia",
    "Egypt",
  ];
  return countries.find((country) => address.toLowerCase().includes(country.toLowerCase())) ?? "";
};

export function parseProformaSheet(
  rows: SpreadsheetCell[][],
  sourceName: string,
  sheetName: string,
  defaults: ProformaImportDefaults,
): ParsedProforma {
  const warnings: string[] = [];
  const invoiceNumberPosition = findCell(rows, /INVOICE\s*NO/);
  const invoiceNumber = invoiceNumberPosition
    ? valueAfter(rows, /INVOICE\s*NO/).replace(/^PI-/i, "")
    : "";
  const invoiceDatePosition = findCell(rows, /INVOICE\s*DATE/);
  const invoiceDate = invoiceDatePosition
    ? parseDate(rows[invoiceDatePosition.row][invoiceDatePosition.column + 1])
    : "";
  if (!invoiceNumber) warnings.push("Invoice number is missing");
  if (!invoiceDate) warnings.push("Invoice date is missing or unreadable");

  const commercialRow = rowContaining(rows, /COMMERCIAL/);
  const commercialText = compact((commercialRow ?? []).map(text).filter(Boolean).join(" "));
  const commercialNumber = commercialText.match(/\b(\d{3,})\b/)?.[1] ?? "";
  const commercialSuffix = commercialText.match(/COMMERCIAL[^\d]*(\d+)\b/i)?.[1] ?? "";
  const commercialRegistration = commercialNumber
    ? `${commercialNumber}${commercialSuffix && commercialSuffix !== commercialNumber ? ` / ${commercialSuffix}` : ""}`
    : defaults.commercialRegistration;

  const taxCard = valueAfter(rows, /TAX\s*CARD/) || defaults.taxCard;
  const sellerCell = rows.flat().map(text).find((value) => /RAGHEB|\bTEL\s*:/i.test(value)) ?? "";
  const sellerEmail = sellerCell.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/)?.[0] ?? defaults.sellerEmail;
  const phoneLine = sellerCell.split(/\r?\n/).find((line) => /\+?\d[\d\s-]{7,}/.test(line)) ?? "";
  const sellerAddress = sellerCell.match(/ADD\s*:\s*([\s\S]*?)(?:\s+TEL\s*:|\r?\n)/i)?.[1]?.trim() ?? defaults.sellerAddress;
  const parsedSellerName = sellerCell.split(/\r?\n/)[0]?.trim() ?? "";
  const sellerName = /FOR\s+MARBLE|GRANITE/i.test(parsedSellerName)
    ? parsedSellerName
    : defaults.sellerName;

  const shipToCell = rows.flat().map(text).find((value) => /VAT[-:\s]/i.test(value)) ?? "";
  const shipToAddress = compact(shipToCell.replace(/^ADD\s*:\s*/i, "").replace(/\s+VAT[-:\s].*$/i, ""));
  const vat = shipToCell.match(/VAT[-:\s]*([A-Z]{2}[A-Z0-9]+)/i)?.[1] ?? "";
  const customerCompany = compact(
    shipToAddress.match(/^(.+?)\s+\d+[A-Za-z]?\s+/)?.[1] ??
      valueAfter(rows, /SHIP\s*TO/) ??
      "",
  );
  if (!customerCompany) warnings.push("Customer name is missing");

  const portLoading = compact(valueAfter(rows, /PORT\s*OF\s*LOADING/))
    .replace(/\begyption\b/gi, "Egyptian") || "Any Egyptian Port";
  const portDischarge = compact(valueAfter(rows, /PORT\s*OF\s*DESTINATION/))
    .replace(/Londone?/gi, "London")
    .replace(/Gatweay/gi, "Gateway");
  const originCountry = compact(valueAfter(rows, /ORIGIN\s*OF\s*GOODS/));
  const hsPosition = findCell(rows, /H\.S\s*CODE|HS\s*CODE/);
  const hsCode = hsPosition
    ? parseHsCode(rows[hsPosition.row][hsPosition.column + 1])
    : "";

  const containerRow = rowContaining(rows, /CONTAINERS/) ?? [];
  const containerText = containerRow.map(text).filter(Boolean).join(" ");
  const containerMatch = containerText.match(/(\d+)\s*[*x×]\s*(\d+)\s*['′]?\s*(GP|HC)?/i);
  const containers = Number(containerMatch?.[1] ?? 0);
  const containerType = containerMatch
    ? `${containerMatch[2]}′ ${containerMatch[3]?.toUpperCase() || "GP"}`
    : "20′ GP";

  const weightRow = rowContaining(rows, /\bG\.W\b|GROSS\s*WEIGHT/) ?? [];
  const weightText = weightRow.map(text).filter(Boolean).join(" ");
  const grossWeightKg = Number(weightText.match(/G\.W\s*([\d,.]+)/i)?.[1]?.replaceAll(",", "") ?? 0);
  const netWeightKg = Number(weightText.match(/N\.W\s*([\d,.]+)/i)?.[1]?.replaceAll(",", "") ?? 0);
  const cratesCell = weightRow.find((value) => /TOTAL\s*CRATES/i.test(text(value)));
  const totalCrates = cratesCell
    ? Number(text(cratesCell).match(/(\d[\d,]*)\s*$/)?.[1]?.replaceAll(",", "") ?? 0)
    : numeric(weightRow.at(-1));

  const itemsHeader = findCell(rows, /^DESCRIPTION$/);
  const items: ParsedProformaItem[] = [];
  if (itemsHeader) {
    for (let row = itemsHeader.row + 1; row < rows.length; row += 1) {
      const descriptionText = text(rows[row][itemsHeader.column]);
      if (/TOTAL\s*AMOUNT/i.test(descriptionText)) break;
      const quantity = numeric(rows[row][itemsHeader.column + 1]);
      const unitPrice = numeric(rows[row][itemsHeader.column + 2]);
      if (!descriptionText || quantity <= 0) continue;
      const product = parseProduct(descriptionText);
      items.push({
        ...product,
        quantity,
        unit: "m²",
        unitPriceMinor: Math.round(unitPrice * 100),
        hsCode,
        crates: 0,
        marks: text(rows[row][Math.max(0, itemsHeader.column - 1)]) || "N\\M",
      });
    }
  }
  if (items.length === 1) items[0].crates = totalCrates;
  if (!items.length) warnings.push("No invoice line items were found");

  const currencyMatch = rows.flat().map(text).join(" ").match(/TOTAL\s*AMOUNT\s*(?:FOB|CFR|CIF)?\s*\((USD|EUR|GBP|EGP)\)/i);
  const currency = (currencyMatch?.[1]?.toUpperCase() || "USD") as ParsedProforma["invoice"]["currency"];
  const freightRow = rowContaining(rows, /^OCEAN\s*FREIGHT/) ?? [];
  const freightPerContainerMinor = Math.round(
    (freightRow.map(numeric).find((value) => value > 0) ?? 0) * 100,
  );
  const totalRowPosition = findCell(rows, /^TOTAL\s*AMOUNT$/);
  const workbookTotalMinor = totalRowPosition
    ? Math.round(
        Math.max(...rows[totalRowPosition.row].map(numeric), 0) * 100,
      )
    : null;
  const calculatedTotalMinor =
    items.reduce(
      (sum, item) => sum + Math.round(item.quantity * item.unitPriceMinor),
      0,
    ) + containers * freightPerContainerMinor;
  if (
    workbookTotalMinor !== null &&
    Math.abs(workbookTotalMinor - calculatedTotalMinor) > 1
  ) {
    warnings.push(
      `Calculated total does not match the workbook (${(calculatedTotalMinor / 100).toFixed(2)} vs ${(workbookTotalMinor / 100).toFixed(2)} ${currency})`,
    );
  }

  const paymentTerms =
    rows.flat().map(text).find((value) => /DOWN\s*PAYMENT/i.test(value)) ?? "";
  const downPaymentPercent = Number(paymentTerms.match(/(\d+(?:\.\d+)?)\s*%/)?.[1] ?? defaults.downPaymentPercent);

  return {
    sourceName,
    sheetName,
    warnings,
    workbookTotalMinor,
    customer: {
      company: customerCompany,
      address: shipToAddress,
      vat,
      country: inferCountry(shipToAddress),
      city: /ROCHFORD/i.test(shipToAddress) ? "Rochford, Essex" : "",
      port: portDischarge,
    },
    invoice: {
      number: invoiceNumber,
      date: invoiceDate,
      currency,
      status: "Draft",
      items,
      containers,
      containerType,
      freightPerContainerMinor,
      downPaymentPercent,
      paidMinor: 0,
      portLoading,
      portDischarge,
      notes: "Goods remain property of seller until full payment.",
      commercialRegistration,
      taxCard,
      sellerName,
      sellerAddress,
      sellerPhone: compact(phoneLine) || defaults.sellerPhone,
      sellerEmail,
      shipToAddress,
      originCountry,
      hsCode,
      grossWeightKg,
      netWeightKg,
      totalCrates,
      incoterm: "FOB",
      paymentTerms,
      bankAccountNumber: labelledValue(rows, /^ACCOUNT\s*NO/ ) || defaults.bankAccountNumber,
      bankIban: labelledValue(rows, /^IBAN\s*NUMBER/) || defaults.bankIban,
      bankCompanyName: labelledValue(rows, /^COMPANY\s*NAME/) || defaults.bankCompanyName,
      bankName: labelledValue(rows, /^BANK\s*:/) || defaults.bankName,
      bankBranch: labelledValue(rows, /^BRANCH\s*:/) || defaults.bankBranch,
      bankSwift: labelledValue(rows, /^SWIFT\s*CODE/) || defaults.bankSwift,
    },
  };
}
