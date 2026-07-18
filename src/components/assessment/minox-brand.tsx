import { cn } from "@/lib/utils";

// MINOXIPLUS visual identity — dark premium "clinical" look (matches the brand's
// original screening design): near-black background, elegant serif display,
// emerald accent for actions, gold accents for results.
export const MINOX = {
  name: "MINOXIPLUS",
  bg: "#080b14",
  emerald: "#34d399",
  gold: "#f5c451",
};

// Silver-script wordmark. Approximates the metallic Minoxiplus logo; to use the
// exact brand PNG, drop a transparent file at public/minoxiplus-logo.png and set
// USE_LOGO_IMAGE = true.
const USE_LOGO_IMAGE = false;

export function MinoxLogo({ className }: { className?: string }) {
  if (USE_LOGO_IMAGE) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/minoxiplus-logo.png"
        alt="Minoxiplus"
        className={cn("h-10 w-auto", className)}
      />
    );
  }
  return (
    <span
      className={cn(
        "bg-gradient-to-b from-white via-slate-300 to-slate-500 bg-clip-text font-serif text-3xl italic tracking-tight text-transparent",
        className,
      )}
      style={{ textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}
    >
      Minoxiplus
    </span>
  );
}

// Full-height mobile-first dark shell with a subtle aura and centered logo.
export function MinoxShell({
  children,
  showHeader = true,
}: {
  children: React.ReactNode;
  showHeader?: boolean;
}) {
  return (
    <div
      className="min-h-screen text-slate-100"
      style={{
        backgroundColor: MINOX.bg,
        backgroundImage:
          "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(52,211,153,0.10), transparent 60%), radial-gradient(ellipse 70% 40% at 100% 20%, rgba(37,99,235,0.10), transparent 60%)",
      }}
    >
      {showHeader && (
        <header className="flex items-center justify-center px-4 pt-6 pb-2">
          <MinoxLogo />
        </header>
      )}
      <main className="mx-auto w-full max-w-md px-5 pb-20 pt-4">{children}</main>
    </div>
  );
}
