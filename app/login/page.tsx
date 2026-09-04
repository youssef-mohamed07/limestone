import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; return_to?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="login-page">
      <section className="login-card">
        <Image
          src="/limestone-logo-original.png"
          alt="LIMESTONE"
          width="116"
          height="116"
        />
        <p className="eyebrow">PRIVATE WORKSPACE</p>
        <h1>Welcome back</h1>
        <p>Enter the workspace password to manage invoices and exports.</p>
        <form action="/api/login" method="post">
          <input type="hidden" name="return_to" value={params.return_to ?? '/'} />
          <label>
            <span>Password</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              autoFocus
            />
          </label>
          {params.error && <strong className="login-error">Incorrect password. Please try again.</strong>}
          <button type="submit">Sign in securely</button>
        </form>
      </section>
    </main>
  );
}
