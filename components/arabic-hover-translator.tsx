"use client";

import { useEffect, useRef, useState } from "react";
import { Languages } from "lucide-react";

type TooltipState = {
  source: string;
  translation: string;
  x: number;
  y: number;
};

const wordTranslations: Record<string, string> = {
  account: "حساب",
  accounts: "الحسابات",
  active: "نشط",
  activity: "النشاط",
  administrator: "مسؤول",
  add: "إضافة",
  address: "العنوان",
  all: "الكل",
  amount: "المبلغ",
  approved: "معتمدة",
  archive: "أرشفة",
  arrived: "وصلت",
  audit: "المراجعة",
  available: "متاح",
  availability: "التوفر",
  back: "رجوع",
  balance: "المتبقي",
  bank: "البنك",
  booked: "محجوزة",
  branch: "الفرع",
  cancel: "إلغاء",
  card: "بطاقة",
  cash: "نقدي",
  close: "إغلاق",
  code: "الرمز",
  collected: "تم تحصيله",
  commercial: "تجاري",
  company: "الشركة",
  contact: "جهة الاتصال",
  container: "حاوية",
  containers: "الحاويات",
  country: "الدولة",
  crates: "الصناديق",
  create: "إنشاء",
  currency: "العملة",
  customer: "العميل",
  customers: "العملاء",
  dashboard: "لوحة التحكم",
  date: "التاريخ",
  default: "افتراضي",
  delete: "حذف",
  description: "الوصف",
  destination: "الوجهة",
  details: "التفاصيل",
  document: "مستند",
  documents: "المستندات",
  download: "تنزيل",
  draft: "مسودة",
  drafts: "المسودات",
  due: "مستحق",
  duplicate: "نسخ",
  edit: "تعديل",
  editor: "محرر",
  email: "البريد الإلكتروني",
  excel: "إكسل",
  export: "تصدير",
  final: "نهائي",
  filter: "تصفية",
  finish: "التشطيب",
  freight: "الشحن",
  goods: "البضائع",
  gross: "الإجمالي",
  import: "استيراد",
  imported: "تم استيرادها",
  invoice: "فاتورة",
  invoices: "الفواتير",
  items: "البنود",
  ledger: "السجل",
  linked: "مرتبط",
  loading: "التحميل",
  log: "السجل",
  manage: "إدارة",
  member: "عضو",
  method: "الطريقة",
  month: "الشهر",
  name: "الاسم",
  net: "الصافي",
  new: "جديد",
  next: "التالي",
  notes: "ملاحظات",
  number: "الرقم",
  origin: "المنشأ",
  outstanding: "مستحق",
  owner: "المالك",
  paid: "مدفوع",
  payment: "دفعة",
  payments: "المدفوعات",
  performance: "الأداء",
  phone: "الهاتف",
  port: "الميناء",
  preferences: "التفضيلات",
  preview: "معاينة",
  price: "السعر",
  print: "طباعة",
  product: "منتج",
  products: "المنتجات",
  production: "الإنتاج",
  proforma: "فاتورة مبدئية",
  quantity: "الكمية",
  received: "مستلم",
  record: "تسجيل",
  reference: "المرجع",
  registration: "التسجيل",
  reports: "التقارير",
  roles: "الصلاحيات",
  route: "المسار",
  save: "حفظ",
  search: "بحث",
  sent: "مرسلة",
  settings: "الإعدادات",
  shipment: "شحنة",
  shipments: "الشحنات",
  size: "المقاس",
  status: "الحالة",
  stock: "المخزون",
  stone: "الحجر",
  swift: "سويفت",
  tax: "الضريبة",
  terms: "الشروط",
  today: "اليوم",
  total: "الإجمالي",
  transaction: "معاملة",
  transactions: "المعاملات",
  transfer: "تحويل",
  transit: "في الطريق",
  type: "النوع",
  unit: "الوحدة",
  unavailable: "غير متاح",
  updated: "محدّث",
  upload: "رفع",
  user: "مستخدم",
  users: "المستخدمون",
  vat: "ضريبة القيمة المضافة",
  vessel: "السفينة",
  viewer: "مشاهد",
  weight: "الوزن",
  workspace: "مساحة العمل",
  year: "السنة",
};

const phraseTranslations: Record<string, string> = {
  "add customer": "إضافة عميل",
  "add member": "إضافة عضو",
  "add product": "إضافة منتج",
  "add shipment details": "إضافة بيانات الشحنة",
  "all statuses": "كل الحالات",
  "any date": "أي تاريخ",
  "create invoice": "إنشاء فاتورة",
  "create shipment": "إنشاء شحنة",
  "default port": "الميناء الافتراضي",
  "export csv": "تصدير ملف CSV",
  "import excel": "استيراد من إكسل",
  "new proforma": "فاتورة مبدئية جديدة",
  "record payment": "تسجيل دفعة",
  "dark interface": "الوضع الداكن",
  "save changes": "حفظ التغييرات",
  "save draft": "حفظ كمسودة",
  "save record": "حفظ السجل",
  "save & finish": "حفظ وإنهاء",
  "search invoices, customers, shipments…": "ابحث في الفواتير والعملاء والشحنات",
  "total amount": "المبلغ الإجمالي",
  "total invoices": "إجمالي الفواتير",
  "upload document": "رفع مستند",
  "view all": "عرض الكل",
};

const normalize = (value: string) =>
  value.replace(/\s+/g, " ").trim().toLowerCase();

const translationForPhrase = (value: string) => {
  const normalized = normalize(value);
  if (!normalized || normalized.length > 80) return null;
  const exact = phraseTranslations[normalized];
  if (exact) return exact;
  const words = normalized.match(/[a-z]+(?:['-][a-z]+)*/g) ?? [];
  if (words.length < 2 || words.length > 5) return null;
  const translated = words.map((word) => wordTranslations[word]);
  if (translated.some((word) => !word)) return null;
  return translated.join(" ");
};

const wordAtPoint = (x: number, y: number) => {
  const documentWithCaret = document as Document & {
    caretPositionFromPoint?: (
      xPosition: number,
      yPosition: number,
    ) => { offsetNode: Node; offset: number } | null;
    caretRangeFromPoint?: (xPosition: number, yPosition: number) => Range | null;
  };
  const caret = documentWithCaret.caretPositionFromPoint?.(x, y);
  const range = caret ? null : documentWithCaret.caretRangeFromPoint?.(x, y);
  const node = caret?.offsetNode ?? range?.startContainer;
  let offset = caret?.offset ?? range?.startOffset ?? 0;
  if (!node || node.nodeType !== Node.TEXT_NODE) return null;
  const value = node.textContent ?? "";
  if (!value) return null;
  if (offset >= value.length) offset = value.length - 1;
  if (!/[A-Za-z]/.test(value[offset] ?? "") && offset > 0) offset -= 1;
  if (!/[A-Za-z]/.test(value[offset] ?? "")) return null;
  let start = offset;
  let end = offset + 1;
  while (start > 0 && /[A-Za-z'-]/.test(value[start - 1])) start -= 1;
  while (end < value.length && /[A-Za-z'-]/.test(value[end])) end += 1;
  return value.slice(start, end);
};

export default function ArabicHoverTranslator() {
  const [enabled, setEnabled] = useState(true);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const activeSource = useRef("");
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      activeSource.current = "";
      return;
    }
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!finePointer.matches) return;

    const clearPending = () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = null;
    };
    const hide = () => {
      clearPending();
      activeSource.current = "";
      setTooltip(null);
    };
    const handlePointerMove = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target || target.closest("[data-arabic-helper-ui]")) {
        hide();
        return;
      }

      const word = wordAtPoint(event.clientX, event.clientY);
      let source = word ?? "";
      let translation = word ? wordTranslations[normalize(word)] : undefined;
      if (!translation) {
        const readable = target.closest<HTMLElement>(
          "button, a, label, th, h1, h2, h3, [aria-label], [title], input, select",
        );
        source =
          readable?.getAttribute("aria-label") ??
          readable?.getAttribute("title") ??
          (readable instanceof HTMLInputElement
            ? readable.placeholder
            : readable?.innerText ?? "");
        translation = translationForPhrase(source) ?? undefined;
      }
      if (!translation) {
        hide();
        return;
      }

      const x = Math.min(event.clientX + 16, window.innerWidth - 230);
      const y = Math.min(event.clientY + 20, window.innerHeight - 78);
      if (activeSource.current === source) {
        setTooltip((current) =>
          current ? { ...current, x: Math.max(8, x), y: Math.max(8, y) } : current,
        );
        return;
      }

      clearPending();
      activeSource.current = source;
      timer.current = window.setTimeout(() => {
        setTooltip({
          source: source.trim(),
          translation,
          x: Math.max(8, x),
          y: Math.max(8, y),
        });
      }, 240);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("blur", hide);
    return () => {
      clearPending();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("blur", hide);
    };
  }, [enabled]);

  const toggle = () => {
    setEnabled((current) => !current);
    setTooltip(null);
    activeSource.current = "";
  };

  return (
    <div className="arabic-hover-helper" data-arabic-helper-ui>
      <button
        className={enabled ? "arabic-helper-toggle active" : "arabic-helper-toggle"}
        type="button"
        onClick={toggle}
        aria-pressed={enabled}
        aria-label={enabled ? "Disable Arabic hover translation" : "Enable Arabic hover translation"}
        title={enabled ? "Arabic hover translation is on" : "Arabic hover translation is off"}
      >
        <Languages />
        <span>عربي</span>
      </button>
      {enabled && tooltip && (
        <div
          className="arabic-translation-tooltip"
          style={{ left: tooltip.x, top: tooltip.y }}
          role="tooltip"
        >
          <small>{tooltip.source}</small>
          <strong dir="rtl" lang="ar">{tooltip.translation}</strong>
        </div>
      )}
    </div>
  );
}
