# LIMESTONE Invoice & Export Management

Premium ERP-lite workspace for LIMESTONE Egyptian Natural Stone Exporter. It includes dashboard analytics, customer and product catalogues, precise invoice calculations, automatic numbering, invoice duplication, payment tracking, shipping records, documents, reports, settings, and an A4 print/PDF template.

## Local development

Requirements: Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

The Sites runtime provides local D1, R2, and sign-in bindings. The database schema is in `db/schema.ts`; generated SQL migrations are in `drizzle/`.

## Validation

```bash
npm run lint
npm run build
```

Financial values are represented in currency minor units and calculated centrally in `lib/calculations.ts` to avoid floating-point money errors.
