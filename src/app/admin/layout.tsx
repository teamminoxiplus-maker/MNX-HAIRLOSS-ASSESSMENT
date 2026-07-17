import Link from "next/link";
import { getAdminEmail } from "@/lib/assessment/admin";
import { signOut } from "@/app/login/actions";
import { Button } from "@/components/ui/button";

// Assessment admin shell (spec §12). Middleware already redirects anonymous
// users to /login; this layout gates on ADMIN_ALLOWLIST (403 if not allowed)
// and wraps the pages with a simple nav.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const email = await getAdminEmail();
  if (!email) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <h1 className="text-2xl font-bold">403 — No access</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account is not on the assessment admin allowlist. Ask an admin to
          add your email to <code>ADMIN_ALLOWLIST</code>.
        </p>
        <form action={signOut} className="mt-6">
          <Button variant="outline" size="sm">
            Sign out
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-6">
            <span
              className="rounded-md px-2.5 py-1 text-sm font-extrabold tracking-tight text-white"
              style={{ backgroundColor: "#0b1f4d" }}
            >
              MINOXIPLUS
            </span>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/admin" className="font-medium hover:text-primary">
                Dashboard
              </Link>
              <Link href="/admin/leads" className="font-medium hover:text-primary">
                Leads
              </Link>
              <a href="/admin/export" className="font-medium hover:text-primary">
                Export
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:inline">
              {email}
            </span>
            <form action={signOut}>
              <Button variant="ghost" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl p-4 sm:p-6">{children}</main>
    </div>
  );
}
