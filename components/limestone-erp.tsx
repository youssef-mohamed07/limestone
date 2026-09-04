"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import {
  Activity,
  Archive,
  Banknote,
  Bell,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  Container,
  Copy,
  Download,
  FileText,
  Gauge,
  Globe2,
  LayoutDashboard,
  Menu,
  Package,
  Pencil,
  Plus,
  Printer,
  Search,
  Settings,
  Ship,
  Trash2,
  TrendingUp,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { calculateInvoiceTotals } from "../lib/calculations";
type Item = {
  id: string;
  description: string;
  finish: string;
  size: string;
  quantity: number;
  unit: "m²" | "m³" | "pcs" | "ton" | "kg" | "crate";
  unitPriceMinor: number;
  hsCode: string;
  crates: number;
  marks?: string;
};
type Invoice = {
  id: string;
  number: string;
  date: string;
  customer: string;
  customerId: string;
  currency: "USD" | "EUR" | "GBP" | "EGP";
  status: string;
  items: Item[];
  containers: number;
  containerType: string;
  freightPerContainerMinor: number;
  downPaymentPercent: number;
  paidMinor: number;
  portLoading: string;
  portDischarge: string;
  notes: string;
  commercialRegistration?: string;
  taxCard?: string;
  sellerName?: string;
  sellerAddress?: string;
  sellerPhone?: string;
  sellerEmail?: string;
  shipToAddress?: string;
  originCountry?: string;
  hsCode?: string;
  grossWeightKg?: number;
  netWeightKg?: number;
  totalCrates?: number;
  paymentTerms?: string;
  bankAccountNumber?: string;
  bankIban?: string;
  bankCompanyName?: string;
  bankName?: string;
  bankBranch?: string;
  bankSwift?: string;
};
type Customer = {
  id: string;
  company: string;
  contact: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  vat: string;
  port: string;
  status: string;
};
type Product = {
  id: string;
  name: string;
  type: string;
  finish: string;
  size: string;
  unit: string;
  price: number;
  hs: string;
  available: boolean;
};
type CompanySettings = {
  companyName: string;
  tagline: string;
  email: string;
  phone: string;
  taxCard: string;
  commercialRegistration: string;
  address: string;
  currency: string;
  portLoading: string;
  downPaymentPercent: number;
  marbleBackground: boolean;
};
type CatalogData = {
  customers: Customer[];
  products: Product[];
  payments: string[][];
  shipments: string[][];
  documents: string[][];
  settings: CompanySettings;
};
const customers: Customer[] = [
  {
    id: "cus-premier",
    company: "Premier Paving & Tiles",
    contact: "James Wilson",
    email: "accounts@premierpaving.co.uk",
    phone: "+44 1702 555 198",
    country: "United Kingdom",
    city: "Rochford, Essex",
    vat: "GB150541542",
    port: "London Gateway",
    status: "Active",
  },
  {
    id: "cus-stone",
    company: "Stone World London",
    contact: "Emma Clarke",
    email: "emma@stoneworld.co.uk",
    phone: "+44 20 7946 0281",
    country: "United Kingdom",
    city: "London",
    vat: "GB884210399",
    port: "Felixstowe",
    status: "Active",
  },
  {
    id: "cus-nordic",
    company: "Nordic Stone AB",
    contact: "Lars Eriksson",
    email: "lars@nordicstone.se",
    phone: "+46 8 410 245 10",
    country: "Sweden",
    city: "Stockholm",
    vat: "SE556102938701",
    port: "Gothenburg",
    status: "Active",
  },
  {
    id: "cus-maison",
    company: "Maison Pierre SAS",
    contact: "Camille Laurent",
    email: "c.laurent@maisonpierre.fr",
    phone: "+33 1 84 80 20 18",
    country: "France",
    city: "Paris",
    vat: "FR40392187321",
    port: "Le Havre",
    status: "Active",
  },
];
const products: Product[] = [
  {
    id: "p1",
    name: "Sinai Pearl",
    type: "Limestone",
    finish: "Acid + Tumbled",
    size: "50 × 200 × 30 mm",
    unit: "m²",
    price: 23,
    hs: "680292",
    available: true,
  },
  {
    id: "p2",
    name: "Galala",
    type: "Marble",
    finish: "Honed",
    size: "900 × 600 × 20 mm",
    unit: "m²",
    price: 28.5,
    hs: "680291",
    available: true,
  },
  {
    id: "p3",
    name: "Sunny Menia",
    type: "Limestone",
    finish: "Brushed",
    size: "300 × 600 × 30 mm",
    unit: "m²",
    price: 24.75,
    hs: "680292",
    available: true,
  },
  {
    id: "p4",
    name: "Silvia Menia",
    type: "Limestone",
    finish: "Sandblasted",
    size: "600 × 400 × 20 mm",
    unit: "m²",
    price: 26.25,
    hs: "680292",
    available: true,
  },
];
const seedInvoices: Invoice[] = [
  {
    id: "inv-27",
    number: "26-27",
    date: "2026-08-23",
    customer: "Premier Paving & Tiles",
    customerId: "cus-premier",
    currency: "USD",
    status: "Production",
    items: [
      {
        id: "i1",
        description: "Sinai Pearl",
        finish: "Acid + Tumbled",
        size: "50 × 200 × 30 mm",
        quantity: 1624.55,
        unit: "m²",
        unitPriceMinor: 2300,
        hsCode: "680292",
        crates: 72,
      },
    ],
    containers: 4,
    containerType: "20′ GP",
    freightPerContainerMinor: 76000,
    downPaymentPercent: 25,
    paidMinor: 1009868,
    portLoading: "Any Egyptian Port",
    portDischarge: "London Gateway",
    notes: "Goods remain property of seller until full payment.",
  },
  {
    id: "inv-26",
    number: "26-26",
    date: "2026-08-23",
    customer: "Premier Paving & Tiles",
    customerId: "cus-premier",
    currency: "USD",
    status: "Sent",
    items: [
      { id: "i2a", description: "Sinai Pearl", finish: "Acid + Tumbled", size: "900 × 600 × 20 mm", quantity: 529, unit: "m²", unitPriceMinor: 2300, hsCode: "68-02-21", crates: 23, marks: "N\\M" },
      { id: "i2b", description: "Sinai Pearl", finish: "Acid + Tumbled", size: "900 × 600 × 20 mm", quantity: 529, unit: "m²", unitPriceMinor: 2300, hsCode: "68-02-21", crates: 23, marks: "N\\M" },
      { id: "i2c", description: "Sinai Pearl", finish: "Honed + Tumbled", size: "900 × 600 × 20 mm", quantity: 396.9, unit: "m²", unitPriceMinor: 2100, hsCode: "68-02-21", crates: 20, marks: "N\\M" },
      { id: "i2d", description: "Sinai Pearl", finish: "Honed", size: "300 × 600 × 30 mm", quantity: 86.4, unit: "m²", unitPriceMinor: 100, hsCode: "68-02-21", crates: 8, marks: "N\\M" },
      { id: "i2e", description: "Sinai Pearl", finish: "Acid + Tumbled", size: "50 × 200 × 30 mm", quantity: 353.8, unit: "m²", unitPriceMinor: 1300, hsCode: "68-02-21", crates: 40, marks: "N\\M" },
    ],
    containers: 4,
    containerType: "20′ GP",
    freightPerContainerMinor: 76000,
    downPaymentPercent: 25,
    paidMinor: 0,
    portLoading: "Any Egyptian Port",
    portDischarge: "London Gateway",
    notes: "",
    commercialRegistration: "6724 / 9",
    taxCard: "773-932-488",
    sellerName: "Limestone for Marble and Granite",
    sellerAddress: "56 Ragheb Street, Helwan, 4th Floor, Cairo, Egypt",
    sellerPhone: "+20 111 121 0056 - +20 106 610 1017",
    sellerEmail: "mohamed@loldlimestone.net",
    shipToAddress: "Premier Paving & Tiles, 29s Purdeys Way, Rochford, Essex, United Kingdom, SS4 1 ND",
    originCountry: "EGYPT",
    hsCode: "68-02-21",
    grossWeightKg: 27000,
    netWeightKg: 26000,
    totalCrates: 114,
    paymentTerms: "25% DOWN PAYMENT AND THE REST UPON RECEIPT OF DOCUMENTS",
    bankAccountNumber: "100073581782",
    bankIban: "EG070010019200000100073581782",
    bankCompanyName: "Limestone for Marble and Granite",
    bankName: "BANQUE CIB",
    bankBranch: "Helwan",
    bankSwift: "CIBEEGCX192",
  },
  {
    id: "inv-25",
    number: "26-25",
    date: "2026-08-12",
    customer: "Nordic Stone AB",
    customerId: "cus-nordic",
    currency: "EUR",
    status: "Approved",
    items: [
      {
        id: "i3",
        description: "Sunny Menia",
        finish: "Brushed",
        size: "300 × 600 × 30 mm",
        quantity: 680,
        unit: "m²",
        unitPriceMinor: 2475,
        hsCode: "680292",
        crates: 35,
      },
    ],
    containers: 2,
    containerType: "20′ GP",
    freightPerContainerMinor: 91000,
    downPaymentPercent: 30,
    paidMinor: 559500,
    portLoading: "Alexandria",
    portDischarge: "Gothenburg",
    notes: "",
  },
  {
    id: "inv-24",
    number: "26-24",
    date: "2026-08-04",
    customer: "Maison Pierre SAS",
    customerId: "cus-maison",
    currency: "EUR",
    status: "Sent",
    items: [
      {
        id: "i4",
        description: "Silvia Menia",
        finish: "Sandblasted",
        size: "600 × 400 × 20 mm",
        quantity: 1160,
        unit: "m²",
        unitPriceMinor: 2625,
        hsCode: "680292",
        crates: 54,
      },
    ],
    containers: 3,
    containerType: "40′ GP",
    freightPerContainerMinor: 57000,
    downPaymentPercent: 25,
    paidMinor: 0,
    portLoading: "Damietta",
    portDischarge: "Le Havre",
    notes: "",
  },
];
const seedPayments = [
  ["CIB-0827-1042", "Premier Paving & Tiles", "PI-26-27", "27 Aug 2026", "Bank transfer", "$10,098.68"],
  ["CIB-0820-1618", "Stone World London", "PI-26-26", "20 Aug 2026", "Bank transfer", "$19,887.00"],
  ["CIB-0818-0904", "Stone World London", "PI-26-26", "18 Aug 2026", "Bank transfer", "$8,523.00"],
];
const seedShipments = [
  ["SHP-26-018", "Premier Paving & Tiles", "Alexandria to London Gateway", "MAERSK NORFOLK", "12 Sep / 26 Sep", "In Transit"],
  ["SHP-26-017", "Nordic Stone AB", "Alexandria to Gothenburg", "MSC ANNA", "09 Sep / 23 Sep", "Booked"],
  ["SHP-26-016", "Stone World London", "Damietta to Felixstowe", "CMA CGM TITUS", "28 Aug / 12 Sep", "Arrived"],
];
const seedDocuments = [
  ["PI-26-27.pdf", "Proforma Invoice", "PI-26-27", "23 Aug 2026", "Youssef M.", "Final"],
  ["PL-26-26.pdf", "Packing List", "SHP-26-016", "26 Aug 2026", "Omar H.", "Final"],
  ["BL-MAE884290.pdf", "Bill of Lading", "SHP-26-018", "02 Sep 2026", "Omar H.", "Verified"],
  ["COO-26-016.pdf", "Certificate of Origin", "PI-26-26", "27 Aug 2026", "Youssef M.", "Final"],
];
const seedSettings: CompanySettings = {
  companyName: "Limestone for Marble and Granite",
  tagline: "Egyptian Natural Stone Exporter",
  email: "mohamed@loldlimestone.net",
  phone: "+20 111 121 0056",
  taxCard: "773-932-488",
  commercialRegistration: "6724 / 9",
  address: "56 Ragheb Street, Helwan, 4th Floor, Cairo, Egypt",
  currency: "USD",
  portLoading: "Any Egyptian Port",
  downPaymentPercent: 25,
  marbleBackground: true,
};
const seedCatalog: CatalogData = {
  customers,
  products,
  payments: seedPayments,
  shipments: seedShipments,
  documents: seedDocuments,
  settings: seedSettings,
};
const CatalogContext = createContext<CatalogData>(seedCatalog);
const nav = [
  ["Dashboard", LayoutDashboard],
  ["Invoices", FileText],
  ["Customers", Users],
  ["Products", Package],
  ["Payments", WalletCards],
  ["Shipments", Ship],
  ["Documents", ClipboardList],
  ["Reports", TrendingUp],
] as const;
const statusClass = (s: string) => s.toLowerCase().replaceAll(" ", "-");
const currency = (minor: number, code = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: code,
    minimumFractionDigits: 2,
  }).format(minor / 100);
const totalOf = (inv: Invoice) =>
  calculateInvoiceTotals({
    items: inv.items.map((i) => ({
      quantity: i.quantity,
      unitPriceMinor: i.unitPriceMinor,
    })),
    containers: inv.containers,
    freightPerContainerMinor: inv.freightPerContainerMinor,
    downPaymentPercent: inv.downPaymentPercent,
  });
const labelDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${iso}T12:00:00`));
const printInvoice = (previewOnly = false) => {
  if (previewOnly) document.body.classList.add("print-preview-only");
  try {
    window.print();
  } finally {
    document.body.classList.remove("print-preview-only");
  }
};
function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className={`logo-lockup ${light ? "light" : ""}`}>
      <Image
        src="/limestone-logo-original.png"
        alt="LIMESTONE - Egyptian Natural Stone Exporter"
        width={1200}
        height={1200}
        priority
      />
    </div>
  );
}
export default function LimestoneERP() {
  const [active, setActive] = useState("Dashboard");
  const [invoices, setInvoices] = useState(seedInvoices);
  const [query, setQuery] = useState("");
  const [builder, setBuilder] = useState(false);
  const [detail, setDetail] = useState<Invoice | null>(null);
  const [toast, setToast] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [dark, setDark] = useState(false);
  const [catalog, setCatalog] = useState<CatalogData>(seedCatalog);
  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  useEffect(() => {
    let activeRequest = true;
    void fetch("/api/invoices")
      .then(async (response) => {
        if (!response.ok) return null;
        return (await response.json()) as { invoices?: Invoice[] };
      })
      .then((data) => {
        if (!activeRequest || !data?.invoices?.length) return;
        setInvoices((current) => {
          const storedIds = new Set(data.invoices?.map((invoice) => invoice.id));
          return [
            ...(data.invoices ?? []),
            ...current.filter((invoice) => !storedIds.has(invoice.id)),
          ];
        });
      })
      .catch(() => undefined);
    return () => {
      activeRequest = false;
    };
  }, []);

  useEffect(() => {
    let activeRequest = true;
    void fetch("/api/data")
      .then(async (response) => {
        if (!response.ok) return null;
        return (await response.json()) as { data?: Partial<CatalogData> };
      })
      .then((result) => {
        if (!activeRequest || !result?.data) return;
        setCatalog((current) => ({
          customers: Array.isArray(result.data?.customers)
            ? result.data.customers
            : current.customers,
          products: Array.isArray(result.data?.products)
            ? result.data.products
            : current.products,
          payments: Array.isArray(result.data?.payments)
            ? result.data.payments
            : current.payments,
          shipments: Array.isArray(result.data?.shipments)
            ? result.data.shipments
            : current.shipments,
          documents: Array.isArray(result.data?.documents)
            ? result.data.documents
            : current.documents,
          settings: result.data?.settings ?? current.settings,
        }));
      })
      .catch(() => undefined);
    return () => {
      activeRequest = false;
    };
  }, []);

  const saveInvoice = (invoice: Invoice) => {
    setInvoices((old) => [invoice, ...old.filter((i) => i.id !== invoice.id)]);
    setBuilder(false);
    setDetail(invoice);
    notify(`Saving proforma ${invoice.number}…`);
    void fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invoice),
    })
      .then(async (response) => {
        if (response.ok) return;
        const result = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(result?.error ?? "Unable to save invoice");
      })
      .then(() => notify(`Proforma ${invoice.number} saved securely`))
      .catch((error: unknown) =>
        notify(error instanceof Error ? error.message : "Unable to save invoice"),
      );
  };
  const duplicate = (invoice: Invoice) => {
    const next =
      Math.max(...invoices.map((i) => Number(i.number.split("-")[1]))) + 1;
    const copy = {
      ...invoice,
      id: crypto.randomUUID(),
      number: `26-${next}`,
      date: new Date().toISOString().slice(0, 10),
      status: "Draft",
      paidMinor: 0,
      items: invoice.items.map((i) => ({ ...i, id: crypto.randomUUID() })),
    };
    setInvoices((x) => [copy, ...x]);
    notify(`Created draft ${copy.number}`);
  };
  const filtered = invoices.filter((i) =>
    `${i.number} ${i.customer} ${i.status}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <CatalogContext.Provider value={catalog}>
    <main className={dark ? "app-shell dark" : "app-shell"}>
      <aside className={`sidebar ${mobileNav ? "open" : ""}`}>
        <div className="sidebar-brand">
          <Logo light />
          <button className="mobile-close" onClick={() => setMobileNav(false)}>
            <X />
          </button>
        </div>
        <nav aria-label="Main navigation">
          <p className="nav-label">Workspace</p>
          {nav.map(([item, Icon]) => (
            <button
              key={item}
              onClick={() => {
                setActive(item);
                setDetail(null);
                setMobileNav(false);
              }}
              className={active === item ? "nav-item active" : "nav-item"}
            >
              <Icon />
              <span>{item}</span>
              {item === "Invoices" && <em>{invoices.length}</em>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button
            className={active === "Settings" ? "nav-item active" : "nav-item"}
            onClick={() => {
              setActive("Settings");
              setDetail(null);
            }}
          >
            <Settings />
            <span>Settings</span>
          </button>
          <div className="user-card">
            <span>YM</span>
            <div>
              <strong>Youssef Mohamed</strong>
              <small>Administrator</small>
            </div>
            <b>•••</b>
          </div>
        </div>
      </aside>
      <section className="workspace">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileNav(true)}>
            <Menu />
          </button>
          <label className="search">
            <Search />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search invoices, customers, shipments…"
            />
            <kbd>⌘ K</kbd>
          </label>
          <div className="top-actions">
            <button aria-label="Notifications">
              <Bell />
              <i />
            </button>
            <div className="avatar">YM</div>
          </div>
        </header>
        {detail ? (
          <InvoiceDetail
            invoice={detail}
            onBack={() => setDetail(null)}
            onEdit={() => setBuilder(true)}
            onDuplicate={() => duplicate(detail)}
            onPayment={() => {
              const paid = Math.min(
                totalOf(detail).grandTotalMinor,
                detail.paidMinor + totalOf(detail).downPaymentMinor,
              );
              setInvoices((xs) =>
                xs.map((x) =>
                  x.id === detail.id ? { ...x, paidMinor: paid } : x,
                ),
              );
              setDetail({ ...detail, paidMinor: paid });
              notify("Payment recorded successfully");
            }}
          />
        ) : (
          <div className="content">
            <PageHeader active={active} onNew={() => setBuilder(true)} />
            {active === "Dashboard" && (
              <Dashboard
                invoices={invoices}
                onOpen={setDetail}
                onInvoices={() => setActive("Invoices")}
              />
            )}{" "}
            {active === "Invoices" && (
              <InvoicesPage
                invoices={filtered}
                onOpen={setDetail}
                onDuplicate={duplicate}
                onDelete={(id) => {
                  setInvoices((x) => x.filter((i) => i.id !== id));
                  notify("Invoice moved to archive");
                }}
                onNew={() => setBuilder(true)}
              />
            )}{" "}
            {active === "Customers" && <CustomersPage />}
            {active === "Products" && <ProductsPage />}
            {active === "Payments" && <PaymentsPage />}
            {active === "Shipments" && <ShipmentsPage />}
            {active === "Documents" && <DocumentsPage notify={notify} />}{" "}
            {active === "Reports" && <ReportsPage invoices={invoices} />}{" "}
            {active === "Settings" && (
              <SettingsPage dark={dark} setDark={setDark} notify={notify} />
            )}
          </div>
        )}
      </section>
      <nav className="mobile-tabbar" aria-label="Mobile navigation">
        <button
          className={active === "Dashboard" && !detail ? "active" : ""}
          onClick={() => {
            setActive("Dashboard");
            setDetail(null);
          }}
        >
          <LayoutDashboard />
          <span>Home</span>
        </button>
        <button
          className={active === "Invoices" || detail ? "active" : ""}
          onClick={() => {
            setActive("Invoices");
            setDetail(null);
          }}
        >
          <FileText />
          <span>Invoices</span>
        </button>
        <button className="mobile-new" onClick={() => setBuilder(true)}>
          <Plus />
          <span>New</span>
        </button>
        <button
          className={active === "Shipments" ? "active" : ""}
          onClick={() => {
            setActive("Shipments");
            setDetail(null);
          }}
        >
          <Ship />
          <span>Shipments</span>
        </button>
        <button onClick={() => setMobileNav(true)}>
          <Menu />
          <span>More</span>
        </button>
      </nav>
      {builder && (
        <InvoiceBuilder
          invoices={invoices}
          initial={detail ?? undefined}
          onClose={() => setBuilder(false)}
          onSave={saveInvoice}
        />
      )}{" "}
      {toast && (
        <div className="toast">
          <Check />
          {toast}
        </div>
      )}
    </main>
    </CatalogContext.Provider>
  );
}
function PageHeader({ active, onNew }: { active: string; onNew: () => void }) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">Friday, 4 September 2026</p>
        <h1>{active === "Dashboard" ? "Good afternoon, Youssef" : active}</h1>
        <p>
          {active === "Dashboard"
            ? "Here’s how your export business is performing."
            : `Manage your ${active.toLowerCase()} with confidence.`}
        </p>
      </div>
      <div className="heading-actions">
        <button className="secondary">
          <Download /> Export
        </button>
        <button className="primary" onClick={onNew}>
          <Plus /> New proforma
        </button>
      </div>
    </div>
  );
}
function Dashboard({
  invoices,
  onOpen,
  onInvoices,
}: {
  invoices: Invoice[];
  onOpen: (i: Invoice) => void;
  onInvoices: () => void;
}) {
  const sales = invoices.reduce((s, i) => s + totalOf(i).grandTotalMinor, 0),
    paid = invoices.reduce((s, i) => s + i.paidMinor, 0);
  return (
    <>
      <div className="overview-row">
        <section className="hero-card">
          <div>
            <p>NET SALES · THIS MONTH</p>
            <h2>{currency(sales)}</h2>
            <span>
              <b>↗ 12.8%</b> from last month
            </span>
          </div>
          <div className="mini-chart">
            <i style={{ height: "28%" }} />
            <i style={{ height: "44%" }} />
            <i style={{ height: "37%" }} />
            <i style={{ height: "68%" }} />
            <i style={{ height: "59%" }} />
            <i style={{ height: "82%" }} />
            <i style={{ height: "100%" }} />
          </div>
        </section>
        <section className="balance-card">
          <p>OUTSTANDING BALANCE</p>
          <h2>{currency(sales - paid)}</h2>
          <div className="progress">
            <i style={{ width: `${Math.round((paid / sales) * 100)}%` }} />
          </div>
          <div>
            <span>{currency(paid)} collected</span>
            <b>{Math.round((paid / sales) * 100)}%</b>
          </div>
        </section>
      </div>
      <div className="kpi-grid">
        {[
          [FileText, "Total invoices", String(invoices.length), "4 this month"],
          [
            CircleDollarSign,
            "Payments received",
            currency(paid),
            "3 transactions",
          ],
          [Users, "Active customers", "18", "2 new this month"],
          [Container, "Containers shipped", "32", "6 in transit"],
        ].map(([Icon, label, value, detail]) => (
          <article className="kpi" key={String(label)}>
            <div className="kpi-icon">
              <Icon />
            </div>
            <p>{String(label)}</p>
            <h3>{String(value)}</h3>
            <span>{String(detail)}</span>
          </article>
        ))}
      </div>
      <div className="dashboard-grid">
        <section className="panel invoices-panel">
          <div className="panel-head">
            <div>
              <h3>Recent invoices</h3>
              <p>Latest proforma activity</p>
            </div>
            <button onClick={onInvoices}>View all →</button>
          </div>
          <InvoiceTable invoices={invoices.slice(0, 4)} onOpen={onOpen} />
        </section>
        <aside className="panel activity-panel">
          <div className="panel-head">
            <div>
              <h3>Next shipment</h3>
              <p>Booking MSKU-884290</p>
            </div>
            <span className="status in-transit">In transit</span>
          </div>
          <div className="route">
            <div>
              <strong>EGALY</strong>
              <small>Alexandria</small>
              <b>12 SEP</b>
            </div>
            <div className="route-line">
              <Ship />
            </div>
            <div>
              <strong>GBLGP</strong>
              <small>London Gateway</small>
              <b>26 SEP</b>
            </div>
          </div>
          <div className="shipment-meta">
            <div>
              <span>Vessel</span>
              <strong>MAERSK NORFOLK</strong>
            </div>
            <div>
              <span>Containers</span>
              <strong>4 × 20′ GP</strong>
            </div>
          </div>
          <button className="track">Track shipment</button>
          <div className="payment-note">
            <span>$</span>
            <div>
              <strong>Payment received</strong>
              <p>$10,098.68 from Premier Paving</p>
              <small>Today, 10:42 AM</small>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
function InvoiceTable({
  invoices,
  onOpen,
  onDuplicate,
  onDelete,
}: {
  invoices: Invoice[];
  onOpen: (i: Invoice) => void;
  onDuplicate?: (i: Invoice) => void;
  onDelete?: (id: string) => void;
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Invoice #</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Paid</th>
            <th>Balance</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {invoices.map((i) => {
            const t = totalOf(i);
            return (
              <tr key={i.id} onClick={() => onOpen(i)}>
                <td data-label="Invoice">
                  <strong>PI-{i.number}</strong>
                </td>
                <td data-label="Customer">
                  <div className="customer-cell">
                    <span>{i.customer.slice(0, 2).toUpperCase()}</span>
                    {i.customer}
                  </div>
                </td>
                <td data-label="Date">{labelDate(i.date)}</td>
                <td data-label="Amount">
                  <strong>{currency(t.grandTotalMinor, i.currency)}</strong>
                </td>
                <td data-label="Paid">{currency(i.paidMinor, i.currency)}</td>
                <td data-label="Balance">{currency(t.grandTotalMinor - i.paidMinor, i.currency)}</td>
                <td data-label="Status">
                  <span className={`status ${statusClass(i.status)}`}>
                    {i.status}
                  </span>
                </td>
                <td data-label="Actions">
                  <div className="table-actions">
                    {onDuplicate && (
                      <button
                        title="Duplicate"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicate(i);
                        }}
                      >
                        <Copy />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        title="Archive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(i.id);
                        }}
                      >
                        <Archive />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {invoices.length === 0 && (
        <div className="empty">
          <Search />
          <strong>No matching invoices</strong>
          <span>Try a different invoice number or customer.</span>
        </div>
      )}
    </div>
  );
}
function InvoicesPage({
  invoices,
  onOpen,
  onDuplicate,
  onDelete,
  onNew,
}: {
  invoices: Invoice[];
  onOpen: (i: Invoice) => void;
  onDuplicate: (i: Invoice) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}) {
  return (
    <section className="panel list-page">
      <div className="list-toolbar">
        <div className="tabs">
          <button className="selected">
            All <b>{invoices.length}</b>
          </button>
          <button>Drafts</button>
          <button>Outstanding</button>
          <button>Paid</button>
        </div>
        <div>
          <button className="filter">
            <CalendarDays /> Date
          </button>
          <button className="filter">
            <ChevronDown /> Status
          </button>
          <button className="primary" onClick={onNew}>
            <Plus /> Create invoice
          </button>
        </div>
      </div>
      <InvoiceTable
        invoices={invoices}
        onOpen={onOpen}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
      />
    </section>
  );
}
function InvoiceBuilder({
  invoices,
  initial,
  onClose,
  onSave,
}: {
  invoices: Invoice[];
  initial?: Invoice;
  onClose: () => void;
  onSave: (i: Invoice) => void;
}) {
  const { customers, products, settings } = useContext(CatalogContext);
  const next =
    Math.max(...invoices.map((i) => Number(i.number.split("-")[1]))) + 1;
  const [form, setForm] = useState<Invoice>(initial ?? {
    id: crypto.randomUUID(),
    number: `26-${next}`,
    date: new Date().toISOString().slice(0, 10),
    customer: customers[0].company,
    customerId: customers[0].id,
    currency: settings.currency as Invoice["currency"],
    status: "Draft",
    items: [
      { id: crypto.randomUUID(), description: "Sinai Pearl", finish: "Acid + Tumbled", size: "900 × 600 × 20 mm", quantity: 529, unit: "m²", unitPriceMinor: 2300, hsCode: "68-02-21", crates: 23, marks: "N\\M" },
      { id: crypto.randomUUID(), description: "Sinai Pearl", finish: "Acid + Tumbled", size: "900 × 600 × 20 mm", quantity: 529, unit: "m²", unitPriceMinor: 2300, hsCode: "68-02-21", crates: 23, marks: "N\\M" },
      { id: crypto.randomUUID(), description: "Sinai Pearl", finish: "Honed + Tumbled", size: "900 × 600 × 20 mm", quantity: 396.9, unit: "m²", unitPriceMinor: 2100, hsCode: "68-02-21", crates: 20, marks: "N\\M" },
      { id: crypto.randomUUID(), description: "Sinai Pearl", finish: "Honed", size: "300 × 600 × 30 mm", quantity: 86.4, unit: "m²", unitPriceMinor: 100, hsCode: "68-02-21", crates: 8, marks: "N\\M" },
      { id: crypto.randomUUID(), description: "Sinai Pearl", finish: "Acid + Tumbled", size: "50 × 200 × 30 mm", quantity: 353.8, unit: "m²", unitPriceMinor: 1300, hsCode: "68-02-21", crates: 40, marks: "N\\M" },
    ],
    containers: 4,
    containerType: "20′ GP",
    freightPerContainerMinor: 76000,
    downPaymentPercent: settings.downPaymentPercent,
    paidMinor: 0,
    portLoading: settings.portLoading,
    portDischarge: customers[0].port,
    notes: "Goods remain property of seller until full payment.",
    commercialRegistration: "6724 / 9",
    taxCard: "773-932-488",
    sellerName: settings.companyName,
    sellerAddress: settings.address,
    sellerPhone: settings.phone,
    sellerEmail: settings.email,
    shipToAddress: "Premier Paving & Tiles, 29s Purdeys Way, Rochford, Essex, United Kingdom, SS4 1 ND",
    originCountry: "EGYPT",
    hsCode: "68-02-21",
    grossWeightKg: 27000,
    netWeightKg: 26000,
    totalCrates: 114,
    paymentTerms: "25% DOWN PAYMENT AND THE REST UPON RECEIPT OF DOCUMENTS",
    bankAccountNumber: "100073581782",
    bankIban: "EG070010019200000100073581782",
    bankCompanyName: "Limestone for Marble and Granite",
    bankName: "BANQUE CIB",
    bankBranch: "Helwan",
    bankSwift: "CIBEEGCX192",
  });
  const [preview, setPreview] = useState(false);
  const totals = totalOf(form);
  const patch = (p: Partial<Invoice>) => setForm((f) => ({ ...f, ...p }));
  const patchItem = (id: string, p: Partial<Item>) =>
    patch({ items: form.items.map((i) => (i.id === id ? { ...i, ...p } : i)) });
  const addItem = () =>
    patch({
      items: [
        ...form.items,
        {
          id: crypto.randomUUID(),
          description: "Custom stone product",
          finish: "Honed",
          size: "600 × 400 × 20 mm",
          quantity: 1,
          unit: "m²",
          unitPriceMinor: 0,
          hsCode: "680292",
          crates: 0,
          marks: "N\\M",
        },
      ],
    });
  return (
    <div className="builder">
      <header>
        <div>
          <button className="icon-btn" onClick={onClose}>
            <X />
          </button>
          <div>
            <p className="eyebrow">PROFORMA INVOICE</p>
            <h2>{initial ? "Edit invoice" : "New invoice"} · {form.number}</h2>
          </div>
        </div>
        <div>
          <button className="secondary" onClick={() => setPreview(true)}>
            <Printer /> Preview
          </button>
          <button
            className="secondary"
            onClick={() => onSave({ ...form, status: "Draft" })}
          >
            Save draft
          </button>
          <button
            className="primary"
            onClick={() => onSave({ ...form, status: "Sent" })}
          >
            Save & finish <Check />
          </button>
        </div>
      </header>
      <div className="builder-body">
        <div className="builder-main">
          <section className="form-section">
            <SectionTitle
              n="01"
              title="Invoice details"
              copy="Customer, date and document preferences"
            />
            <div className="form-grid cols-4">
              <Field label="Invoice number">
                <input
                  value={form.number}
                  onChange={(e) => patch({ number: e.target.value })}
                />
              </Field>
              <Field label="Invoice date">
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => patch({ date: e.target.value })}
                />
              </Field>
              <Field label="Currency">
                <select
                  value={form.currency}
                  onChange={(e) =>
                    patch({ currency: e.target.value as Invoice["currency"] })
                  }
                >
                  <option>USD</option>
                  <option>EUR</option>
                  <option>GBP</option>
                  <option>EGP</option>
                </select>
              </Field>
              <Field label="Status">
                <select
                  value={form.status}
                  onChange={(e) => patch({ status: e.target.value })}
                >
                  <option>Draft</option>
                  <option>Sent</option>
                  <option>Approved</option>
                  <option>Production</option>
                </select>
              </Field>
            </div>
            <Field label="Customer">
              <select
                value={form.customerId}
                onChange={(e) => {
                  const c = customers.find((x) => x.id === e.target.value)!;
                  patch({
                    customerId: c.id,
                    customer: c.company,
                    portDischarge: c.port,
                  });
                }}
              >
                {customers.map((c) => (
                  <option value={c.id} key={c.id}>
                    {c.company} · {c.country}
                  </option>
                ))}
              </select>
            </Field>
          </section>
          <section className="form-section">
            <SectionTitle
              n="02"
              title="Exporter & customer details"
              copy="Every registration, contact and address line printed on the invoice"
            />
            <div className="form-grid cols-3">
              <Field label="Commercial registration">
                <input value={form.commercialRegistration} onChange={(e) => patch({ commercialRegistration: e.target.value })} />
              </Field>
              <Field label="Tax card">
                <input value={form.taxCard} onChange={(e) => patch({ taxCard: e.target.value })} />
              </Field>
              <Field label="Exporter name">
                <input value={form.sellerName} onChange={(e) => patch({ sellerName: e.target.value })} />
              </Field>
            </div>
            <Field label="Exporter address">
              <textarea rows={2} value={form.sellerAddress} onChange={(e) => patch({ sellerAddress: e.target.value })} />
            </Field>
            <div className="form-grid cols-2 field-row-gap">
              <Field label="Exporter phones">
                <input value={form.sellerPhone} onChange={(e) => patch({ sellerPhone: e.target.value })} />
              </Field>
              <Field label="Exporter email">
                <input value={form.sellerEmail} onChange={(e) => patch({ sellerEmail: e.target.value })} />
              </Field>
            </div>
            <Field label="Complete ship-to address">
              <textarea rows={3} value={form.shipToAddress} onChange={(e) => patch({ shipToAddress: e.target.value })} />
            </Field>
          </section>
          <section className="form-section">
            <SectionTitle
              n="03"
              title="Shipping information"
              copy="Route, containers and freight"
            />
            <div className="form-grid cols-3">
              <Field label="Port of loading">
                <input
                  value={form.portLoading}
                  onChange={(e) => patch({ portLoading: e.target.value })}
                />
              </Field>
              <Field label="Port of discharge">
                <input
                  value={form.portDischarge}
                  onChange={(e) => patch({ portDischarge: e.target.value })}
                />
              </Field>
              <Field label="Container type">
                <select
                  value={form.containerType}
                  onChange={(e) => patch({ containerType: e.target.value })}
                >
                  <option>20′ GP</option>
                  <option>40′ GP</option>
                  <option>40′ HC</option>
                </select>
              </Field>
              <Field label="Containers">
                <input
                  type="number"
                  min="0"
                  value={form.containers}
                  onChange={(e) =>
                    patch({ containers: Math.max(0, Number(e.target.value)) })
                  }
                />
              </Field>
              <Field label={`Freight / container (${form.currency})`}>
                <input
                  type="number"
                  min="0"
                  value={form.freightPerContainerMinor / 100}
                  onChange={(e) =>
                    patch({
                      freightPerContainerMinor: Math.round(
                        Number(e.target.value) * 100,
                      ),
                    })
                  }
                />
              </Field>
              <Field label="Incoterm">
                <select>
                  <option>CFR</option>
                  <option>FOB</option>
                  <option>CIF</option>
                  <option>EXW</option>
                </select>
              </Field>
              <Field label="Origin of goods">
                <input value={form.originCountry} onChange={(e) => patch({ originCountry: e.target.value })} />
              </Field>
              <Field label="H.S code">
                <input value={form.hsCode} onChange={(e) => patch({ hsCode: e.target.value })} />
              </Field>
              <Field label="Total crates">
                <input type="number" min="0" value={form.totalCrates} onChange={(e) => patch({ totalCrates: Number(e.target.value) })} />
              </Field>
              <Field label="Gross weight (kg)">
                <input type="number" min="0" value={form.grossWeightKg} onChange={(e) => patch({ grossWeightKg: Number(e.target.value) })} />
              </Field>
              <Field label="Net weight (kg)">
                <input type="number" min="0" value={form.netWeightKg} onChange={(e) => patch({ netWeightKg: Number(e.target.value) })} />
              </Field>
            </div>
          </section>
          <section className="form-section items-section">
            <div className="section-title">
              <span>04</span>
              <div>
                <h3>Stone products</h3>
                <p>Add saved products or custom line items</p>
              </div>
              <button className="secondary" onClick={addItem}>
                <Plus /> Add item
              </button>
            </div>
            <div className="item-head">
              <span>Description</span>
              <span>Finish</span>
              <span>Size</span>
              <span>Marks / HS code</span>
              <span>Qty</span>
              <span>Unit price</span>
              <span>Line total</span>
              <span />
            </div>
            {form.items.map((item) => (
              <div className="item-row" key={item.id}>
                <div>
                  <input
                    list={`product-options-${item.id}`}
                    value={item.description}
                    onChange={(e) => {
                      const p = products.find((x) => x.name === e.target.value);
                      patchItem(
                        item.id,
                        p
                          ? {
                              description: p.name,
                              finish: p.finish,
                              size: p.size,
                              unit: p.unit as Item["unit"],
                              unitPriceMinor: p.price * 100,
                              hsCode: p.hs,
                            }
                          : { description: e.target.value },
                      );
                    }}
                  />
                  <datalist id={`product-options-${item.id}`}>
                    {products.map((p) => (
                      <option key={p.id}>{p.name}</option>
                    ))}
                  </datalist>
                </div>
                <input value={item.finish} onChange={(e) => patchItem(item.id, { finish: e.target.value })} />
                <input value={item.size} onChange={(e) => patchItem(item.id, { size: e.target.value })} />
                <div className="stacked-inputs">
                  <input aria-label="Marks" value={item.marks} onChange={(e) => patchItem(item.id, { marks: e.target.value })} />
                  <input aria-label="HS code" value={item.hsCode} onChange={(e) => patchItem(item.id, { hsCode: e.target.value })} />
                </div>
                <div className="qty">
                  <input
                    type="number"
                    min=".01"
                    step=".01"
                    value={item.quantity}
                    onChange={(e) =>
                      patchItem(item.id, { quantity: Number(e.target.value) })
                    }
                  />
                  <select
                    value={item.unit}
                    onChange={(e) =>
                      patchItem(item.id, {
                        unit: e.target.value as Item["unit"],
                      })
                    }
                  >
                    <option>m²</option>
                    <option>m³</option>
                    <option>pcs</option>
                    <option>ton</option>
                    <option>kg</option>
                    <option>crate</option>
                  </select>
                </div>
                <input
                  type="number"
                  min="0"
                  step=".01"
                  value={item.unitPriceMinor / 100}
                  onChange={(e) =>
                    patchItem(item.id, {
                      unitPriceMinor: Math.round(Number(e.target.value) * 100),
                    })
                  }
                />
                <strong>
                  {currency(
                    Math.round(item.quantity * item.unitPriceMinor),
                    form.currency,
                  )}
                </strong>
                <button
                  className="icon-btn danger"
                  disabled={form.items.length === 1}
                  onClick={() =>
                    patch({ items: form.items.filter((i) => i.id !== item.id) })
                  }
                >
                  <Trash2 />
                </button>
              </div>
            ))}
          </section>
          <section className="form-section">
            <SectionTitle
              n="05"
              title="Payment & notes"
              copy="Terms shown on the final document"
            />
            <div className="form-grid cols-2">
              <Field label="Down payment percentage">
                <div className="input-suffix">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.downPaymentPercent}
                    onChange={(e) =>
                      patch({
                        downPaymentPercent: Math.min(
                          100,
                          Math.max(0, Number(e.target.value)),
                        ),
                      })
                    }
                  />
                  <span>%</span>
                </div>
              </Field>
              <Field label="Payment terms">
                <textarea rows={2} value={form.paymentTerms} onChange={(e) => patch({ paymentTerms: e.target.value })} />
              </Field>
            </div>
            <Field label="Notes">
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => patch({ notes: e.target.value })}
              />
            </Field>
          </section>
          <section className="form-section">
            <SectionTitle
              n="06"
              title="Bank details"
              copy="All banking lines shown at the bottom of the proforma"
            />
            <div className="form-grid cols-2">
              <Field label="Account number">
                <input value={form.bankAccountNumber} onChange={(e) => patch({ bankAccountNumber: e.target.value })} />
              </Field>
              <Field label="IBAN number">
                <input value={form.bankIban} onChange={(e) => patch({ bankIban: e.target.value })} />
              </Field>
              <Field label="Account / company name">
                <input value={form.bankCompanyName} onChange={(e) => patch({ bankCompanyName: e.target.value })} />
              </Field>
              <Field label="Bank">
                <input value={form.bankName} onChange={(e) => patch({ bankName: e.target.value })} />
              </Field>
              <Field label="Branch">
                <input value={form.bankBranch} onChange={(e) => patch({ bankBranch: e.target.value })} />
              </Field>
              <Field label="SWIFT / BIC">
                <input value={form.bankSwift} onChange={(e) => patch({ bankSwift: e.target.value })} />
              </Field>
            </div>
          </section>
        </div>
        <aside className="summary-card">
          <p className="eyebrow">LIVE SUMMARY</p>
          <h3>Invoice total</h3>
          <div className="summary-customer">
            <Building2 />
            <div>
              <span>Bill to</span>
              <strong>{form.customer}</strong>
              <small>
                {customers.find((c) => c.id === form.customerId)?.country}
              </small>
            </div>
          </div>
          <div className="summary-lines">
            <div>
              <span>FOB value</span>
              <b>{currency(totals.subtotalMinor, form.currency)}</b>
            </div>
            <div>
              <span>Ocean freight</span>
              <b>{currency(totals.freightMinor, form.currency)}</b>
            </div>
            <div className="grand">
              <span>Grand total</span>
              <b>{currency(totals.grandTotalMinor, form.currency)}</b>
            </div>
            <div>
              <span>Down payment ({form.downPaymentPercent}%)</span>
              <b>{currency(totals.downPaymentMinor, form.currency)}</b>
            </div>
            <div>
              <span>Remaining balance</span>
              <b>{currency(totals.balanceMinor, form.currency)}</b>
            </div>
          </div>
          <div className="calculation-note">
            <Check />
            <span>
              Totals use precise minor-unit calculations and will be revalidated
              before saving.
            </span>
          </div>
        </aside>
      </div>
      {preview && (
        <div className="invoice-preview-overlay">
          <div className="preview-toolbar">
            <button className="secondary" onClick={() => setPreview(false)}><X /> Close preview</button>
            <button className="primary" onClick={() => printInvoice(true)}><Printer /> Print / Save PDF</button>
          </div>
          <InvoicePaper invoice={form} />
        </div>
      )}
    </div>
  );
}
function SectionTitle({
  n,
  title,
  copy,
}: {
  n: string;
  title: string;
  copy: string;
}) {
  return (
    <div className="section-title">
      <span>{n}</span>
      <div>
        <h3>{title}</h3>
        <p>{copy}</p>
      </div>
    </div>
  );
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
function InvoiceDetail({
  invoice,
  onBack,
  onEdit,
  onDuplicate,
  onPayment,
}: {
  invoice: Invoice;
  onBack: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onPayment: () => void;
}) {
  const t = totalOf(invoice);
  return (
    <div className="detail-page">
      <div className="detail-toolbar">
        <div>
          <button className="back" onClick={onBack}>
            ← Back to invoices
          </button>
          <h1>Proforma {invoice.number}</h1>
          <span className={`status ${statusClass(invoice.status)}`}>
            {invoice.status}
          </span>
        </div>
        <div>
          <button className="secondary" onClick={onEdit}>
            <Pencil /> Edit everything
          </button>
          <button className="secondary" onClick={onDuplicate}>
            <Copy /> Duplicate
          </button>
          <button className="secondary" onClick={() => printInvoice()}>
            <Printer /> Print / PDF
          </button>
          <button className="primary" onClick={onPayment}>
            <Banknote /> Record payment
          </button>
        </div>
      </div>
      <div className="detail-layout">
        <InvoicePaper invoice={invoice} />
        <aside className="detail-side">
          <section className="panel payment-progress">
            <h3>Payment progress</h3>
            <strong>
              {currency(invoice.paidMinor, invoice.currency)}{" "}
              <small>received</small>
            </strong>
            <div className="progress">
              <i
                style={{
                  width: `${Math.min(100, (invoice.paidMinor / t.grandTotalMinor) * 100)}%`,
                }}
              />
            </div>
            <div>
              <span>
                {Math.round((invoice.paidMinor / t.grandTotalMinor) * 100)}%
                paid
              </span>
              <b>
                {currency(
                  t.grandTotalMinor - invoice.paidMinor,
                  invoice.currency,
                )}{" "}
                due
              </b>
            </div>
          </section>
          <section className="panel timeline">
            <h3>Activity</h3>
            {[
              ["Invoice created", "23 Aug, 09:12"],
              ["Sent to customer", "23 Aug, 10:04"],
              ["Customer approved", "25 Aug, 14:21"],
              ["Down payment received", "27 Aug, 10:42"],
            ].map(([x, d], n) => (
              <div key={x}>
                <i className={n === 3 ? "done" : ""} />
                <p>
                  <strong>{x}</strong>
                  <small>{d}</small>
                </p>
              </div>
            ))}
          </section>
          <button className="side-action">
            <FileText /> Create commercial invoice <span>→</span>
          </button>
          <button className="side-action">
            <Package /> Generate packing list <span>→</span>
          </button>
        </aside>
      </div>
    </div>
  );
}
function InvoicePaper({ invoice }: { invoice: Invoice }) {
  const { customers, settings } = useContext(CatalogContext);
  const t = totalOf(invoice),
    customer = customers.find((c) => c.id === invoice.customerId);
  return (
    <article className="invoice-paper reference-invoice">
      <div className="marble" />
      <header className="reference-header">
        <Logo />
        <div className="document-title">
          <span>PROFORMA</span>
          <strong>INVOICE</strong>
        </div>
      </header>
      <section className="registration-grid">
        <div><span>Commercial R.</span><strong>{invoice.commercialRegistration ?? settings.commercialRegistration}</strong></div>
        <div className="registration-brand">LIMESTONE</div>
        <div><span>Tax card</span><strong>{invoice.taxCard ?? settings.taxCard}</strong></div>
        <div className="customer-ribbon">{invoice.customer}</div>
      </section>
      <div className="section-ribbon">SHIP FROM</div>
      <section className="invoice-information-grid">
        <div className="seller-cell">
          <strong>{invoice.sellerName ?? settings.companyName}</strong>
          <p>{invoice.sellerAddress ?? settings.address}</p>
          <p>{invoice.sellerPhone ?? settings.phone}</p>
          <p>{invoice.sellerEmail ?? settings.email}</p>
        </div>
        <div className="shipping-facts">
          <div><span>INVOICE NO.</span><strong>{invoice.number}</strong></div>
          <div><span>INVOICE DATE</span><strong>{labelDate(invoice.date)}</strong></div>
          <div><span>PORT OF LOADING</span><strong>{invoice.portLoading}</strong></div>
        </div>
        <div className="ship-to-cell">
          <span>SHIP TO</span>
          <strong>{invoice.customer}</strong>
          <p>{invoice.shipToAddress ?? `${customer?.city}, ${customer?.country}`}</p>
          <p>VAT: {customer?.vat}</p>
        </div>
        <div className="shipping-facts lower">
          <div><span>PORT OF DESTINATION</span><strong>{invoice.portDischarge}</strong></div>
          <div><span>ORIGIN OF GOODS</span><strong>{invoice.originCountry ?? "EGYPT"}</strong></div>
          <div><span>H.S CODE</span><strong>{invoice.hsCode ?? invoice.items[0]?.hsCode}</strong></div>
          <div className="container-fact"><span>CONTAINERS</span><strong>{invoice.containers} × {invoice.containerType}</strong></div>
          <div className="weight-facts"><strong>G.W {invoice.grossWeightKg?.toLocaleString() ?? "27,000"} KG</strong><strong>N.W {invoice.netWeightKg?.toLocaleString() ?? "26,000"} KG</strong><strong>Total Crates {invoice.totalCrates ?? invoice.items.reduce((sum, item) => sum + item.crates, 0)}</strong></div>
        </div>
      </section>
      <div className="payment-ribbon">{invoice.paymentTerms ?? `${invoice.downPaymentPercent}% DOWN PAYMENT AND THE REST UPON RECEIPT OF DOCUMENTS`}</div>
      <table className="invoice-items">
        <thead>
          <tr>
            <th>Marks</th>
            <th>Description</th>
            <th>Qty</th>
            <th>Unit price</th>
            <th>Line total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((i) => (
            <tr key={i.id}>
              <td><strong>{i.marks ?? "N\\M"}</strong></td>
              <td>
                <strong>{i.description} {i.finish}</strong>
                <small>{i.size}</small>
              </td>
              <td>
                {i.quantity.toLocaleString()} {i.unit}
              </td>
              <td>{currency(i.unitPriceMinor, invoice.currency)}</td>
              <td>
                <strong>
                  {currency(
                    Math.round(i.quantity * i.unitPriceMinor),
                    invoice.currency,
                  )}
                </strong>
              </td>
            </tr>
          ))}
          <tr className="fob-row"><td>{invoice.items[0]?.marks ?? "N\\M"}</td><td colSpan={3}>TOTAL AMOUNT FOB ({invoice.currency})</td><td>{currency(t.subtotalMinor, invoice.currency)}</td></tr>
        </tbody>
      </table>
      <section className="reference-totals">
        <div><span>Ocean Freight / Container</span><strong>{currency(invoice.freightPerContainerMinor, invoice.currency)}</strong></div>
        <div><span>Total Containers Multiplied By Shipping</span><strong>{invoice.containers} × {currency(invoice.freightPerContainerMinor, invoice.currency)}</strong><b>{currency(t.freightMinor, invoice.currency)}</b></div>
        <div className="grand"><span>Total Amount</span><b>{currency(t.grandTotalMinor, invoice.currency)}</b></div>
      </section>
      <section className="reference-bank">
        <div><span>PAYMENT TERMS:</span><strong>{invoice.paymentTerms ?? `${invoice.downPaymentPercent}% DOWN PAYMENT AND THE REST UPON RECEIPT OF DOCUMENTS`}</strong></div>
        <div><span>ACCOUNT NO:</span><strong>{invoice.bankAccountNumber ?? "100073581782"}</strong></div>
        <div><span>IBAN NUMBER:</span><strong>{invoice.bankIban ?? "EG070010019200000100073581782"}</strong></div>
        <div><span>COMPANY NAME:</span><strong>{invoice.bankCompanyName ?? "Limestone for Marble and Granite"}</strong></div>
        <div><span>BANK:</span><strong>{invoice.bankName ?? "BANQUE CIB"}</strong></div>
        <div><span>BRANCH:</span><strong>{invoice.bankBranch ?? "Helwan"}</strong></div>
        <div><span>SWIFT CODE:</span><strong>{invoice.bankSwift ?? "CIBEEGCX192"}</strong></div>
      </section>
      <footer className="reference-footer"><span>{invoice.notes}</span><b>Egyptian natural stone, exported with distinction.</b></footer>
    </article>
  );
}
function CustomersPage() {
  const { customers } = useContext(CatalogContext);
  return (
    <EntityPage
      title="Customer directory"
      count={`${customers.length} customers`}
      button="Add customer"
      columns={[
        "Company",
        "Contact",
        "Country",
        "VAT / Tax",
        "Default port",
        "Status",
      ]}
      rows={customers.map((c) => [
        c.company,
        c.contact,
        c.country,
        c.vat,
        c.port,
        c.status,
      ])}
    />
  );
}
function ProductsPage() {
  const { products } = useContext(CatalogContext);
  return (
    <EntityPage
      title="Stone catalogue"
      count={`${products.length} active products`}
      button="Add product"
      columns={[
        "Product",
        "Stone type",
        "Finish",
        "Size",
        "Default price",
        "Available",
      ]}
      rows={products.map((p) => [
        p.name,
        p.type,
        p.finish,
        p.size,
        `$${p.price.toFixed(2)} / ${p.unit}`,
        p.available ? "In stock" : "Unavailable",
      ])}
    />
  );
}
function PaymentsPage() {
  const { payments } = useContext(CatalogContext);
  return (
    <EntityPage
      title="Payment ledger"
      count={`${payments.length} transactions`}
      button="Record payment"
      columns={["Reference", "Customer", "Invoice", "Date", "Method", "Amount"]}
      rows={payments}
    />
  );
}
function ShipmentsPage() {
  const { shipments } = useContext(CatalogContext);
  return (
    <EntityPage
      title="Export shipments"
      count={`${shipments.length} active shipments`}
      button="Create shipment"
      columns={[
        "Shipment",
        "Customer",
        "Route",
        "Vessel",
        "ETD / ETA",
        "Status",
      ]}
      rows={shipments}
    />
  );
}
function DocumentsPage({ notify }: { notify: (s: string) => void }) {
  const { documents } = useContext(CatalogContext);
  return (
    <EntityPage
      title="Export documents"
      count={`${documents.length} files`}
      button="Upload document"
      onAction={() => notify("Document upload ready")}
      columns={["Document", "Type", "Linked to", "Updated", "Owner", "Status"]}
      rows={documents}
    />
  );
}
function EntityPage({
  title,
  count,
  button,
  columns,
  rows,
  onAction,
}: {
  title: string;
  count: string;
  button: string;
  columns: string[];
  rows: string[][];
  onAction?: () => void;
}) {
  const [filter, setFilter] = useState("");
  const shown = rows.filter((r) =>
    r.join(" ").toLowerCase().includes(filter.toLowerCase()),
  );
  return (
    <section className="panel entity-page">
      <div className="entity-head">
        <div>
          <h3>{title}</h3>
          <p>{count}</p>
        </div>
        <button className="primary" onClick={onAction}>
          <Plus />
          {button}
        </button>
      </div>
      <div className="entity-tools">
        <label>
          <Search />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder={`Search ${title.toLowerCase()}…`}
          />
        </label>
        <button className="filter">
          <ChevronDown /> Filter
        </button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c}>{c}</th>
              ))}
              <th />
            </tr>
          </thead>
          <tbody>
            {shown.map((r, n) => (
              <tr key={n}>
                {r.map((v, i) => (
                  <td key={i} data-label={columns[i]}>
                    {i === 0 ? (
                      <strong>{v}</strong>
                    ) : i === r.length - 1 ? (
                      <span className={`status ${statusClass(v)}`}>{v}</span>
                    ) : (
                      v
                    )}
                  </td>
                ))}
                <td data-label="Actions">
                  <button className="row-menu">•••</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
function ReportsPage({ invoices }: { invoices: Invoice[] }) {
  const values = [42, 58, 47, 73, 62, 86, 100, 72, 91, 78, 95, 88],
    max = Math.max(...values);
  return (
    <div className="reports-grid">
      <section className="panel report-main">
        <div className="panel-head">
          <div>
            <h3>Sales performance</h3>
            <p>January — December 2026</p>
          </div>
          <button>Export CSV</button>
        </div>
        <div className="bar-chart">
          {values.map((v, i) => (
            <div key={i}>
              <span>{v > 80 ? `$${v}k` : ""}</span>
              <i style={{ height: `${(v / max) * 100}%` }} />
              <small>
                {
                  ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][
                    i
                  ]
                }
              </small>
            </div>
          ))}
        </div>
      </section>
      <section className="panel country-report">
        <div className="panel-head">
          <div>
            <h3>Sales by country</h3>
            <p>Top destinations</p>
          </div>
        </div>
        {[
          ["United Kingdom", 58],
          ["Sweden", 22],
          ["France", 14],
          ["Germany", 6],
        ].map(([n, v]) => (
          <div className="country-row" key={n}>
            <span>{n}</span>
            <div>
              <i style={{ width: `${v}%` }} />
            </div>
            <b>{v}%</b>
          </div>
        ))}
      </section>
      <section className="panel report-stat">
        <Globe2 />
        <span>Top destination</span>
        <strong>United Kingdom</strong>
        <small>$100,982 · 58% of sales</small>
      </section>
      <section className="panel report-stat">
        <Gauge />
        <span>Average invoice</span>
        <strong>
          {currency(
            invoices.reduce((s, i) => s + totalOf(i).grandTotalMinor, 0) /
              invoices.length,
          )}
        </strong>
        <small>↑ 8.2% year over year</small>
      </section>
    </div>
  );
}
function SettingsPage({
  dark,
  setDark,
  notify,
}: {
  dark: boolean;
  setDark: (v: boolean) => void;
  notify: (s: string) => void;
}) {
  const { settings } = useContext(CatalogContext);
  const [form, setForm] = useState(settings);
  const update = <K extends keyof CompanySettings>(
    key: K,
    value: CompanySettings[K],
  ) => setForm((current) => ({ ...current, [key]: value }));
  const saveSettings = () => {
    notify("Saving company settings…");
    void fetch("/api/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings: form }),
    })
      .then(async (response) => {
        if (response.ok) return;
        const result = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(result?.error ?? "Unable to save settings");
      })
      .then(() => notify("Company settings saved to Supabase"))
      .catch((error: unknown) =>
        notify(
          error instanceof Error ? error.message : "Unable to save settings",
        ),
      );
  };
  return (
    <div className="settings-layout">
      <aside className="settings-nav">
        <button className="selected">
          <Building2 />
          Company
        </button>
        <button>
          <Banknote />
          Bank accounts
        </button>
        <button>
          <FileText />
          Invoice preferences
        </button>
        <button>
          <Users />
          Users & roles
        </button>
        <button>
          <Activity />
          Audit log
        </button>
      </aside>
      <section className="panel settings-form">
        <div className="settings-head">
          <div>
            <h3>Company settings</h3>
            <p>Details used throughout the app and on export documents.</p>
          </div>
          <Logo />
        </div>
        <div className="form-grid cols-2">
          <Field label="Company name">
            <input
              value={form.companyName}
              onChange={(event) => update("companyName", event.target.value)}
            />
          </Field>
          <Field label="Tagline">
            <input
              value={form.tagline}
              onChange={(event) => update("tagline", event.target.value)}
            />
          </Field>
          <Field label="Email">
            <input
              value={form.email}
              onChange={(event) => update("email", event.target.value)}
            />
          </Field>
          <Field label="Phone">
            <input
              value={form.phone}
              onChange={(event) => update("phone", event.target.value)}
            />
          </Field>
          <Field label="Tax card">
            <input
              value={form.taxCard}
              onChange={(event) => update("taxCard", event.target.value)}
            />
          </Field>
          <Field label="Commercial registration">
            <input
              value={form.commercialRegistration}
              onChange={(event) =>
                update("commercialRegistration", event.target.value)
              }
            />
          </Field>
        </div>
        <Field label="Registered address">
          <textarea
            rows={3}
            value={form.address}
            onChange={(event) => update("address", event.target.value)}
          />
        </Field>
        <h4>Invoice defaults</h4>
        <div className="form-grid cols-3">
          <Field label="Currency">
            <select
              value={form.currency}
              onChange={(event) => update("currency", event.target.value)}
            >
              <option>USD</option>
              <option>EUR</option>
            </select>
          </Field>
          <Field label="Port of loading">
            <input
              value={form.portLoading}
              onChange={(event) => update("portLoading", event.target.value)}
            />
          </Field>
          <Field label="Down payment">
            <input
              type="number"
              min="0"
              max="100"
              value={form.downPaymentPercent}
              onChange={(event) =>
                update("downPaymentPercent", Number(event.target.value))
              }
            />
          </Field>
        </div>
        <div className="toggle-row">
          <div>
            <strong>Marble invoice background</strong>
            <small>Add a subtle premium texture to printable documents.</small>
          </div>
          <button
            type="button"
            className={form.marbleBackground ? "toggle on" : "toggle"}
            onClick={() => update("marbleBackground", !form.marbleBackground)}
          >
            <i />
          </button>
        </div>
        <div className="toggle-row">
          <div>
            <strong>Dark interface</strong>
            <small>Switch the business workspace to dark mode.</small>
          </div>
          <button
            className={dark ? "toggle on" : "toggle"}
            onClick={() => setDark(!dark)}
          >
            <i />
          </button>
        </div>
        <div className="settings-save">
          <button
            className="primary"
            onClick={saveSettings}
          >
            <Check />
            Save changes
          </button>
        </div>
      </section>
    </div>
  );
}
