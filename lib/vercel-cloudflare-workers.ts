/**
 * Next.js/Vercel compatibility shim. Vinext resolves the real
 * `cloudflare:workers` module when building for OpenAI Sites.
 */
export const env = process.env;
