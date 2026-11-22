import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router";

type NavItem = { label: string; to: string };
type NavShellProps = { brandTo: string; tag?: string; links: NavItem[]; actions?: ReactNode };

const desktopLink = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-1.5 text-sm transition-colors duration-150 hover:bg-hover hover:text-ink ${isActive ? "text-ink" : "text-muted"}`;
const mobileLink = ({ isActive }: { isActive: boolean }) =>
  `block rounded-md px-3 py-3 text-base transition-colors duration-150 hover:bg-hover ${isActive ? "text-ink" : "text-muted"}`;

// ==========================================
// * NAV BAR: inline links on desktop, a hamburger menu on phones. With no links, the action button stays visible.
// ==========================================
export default function NavShell({ brandTo, tag, links, actions }: NavShellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();
  const hasLinks = links.length > 0;

  useEffect(() => setIsOpen(false), [pathname]);
  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setIsOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-line bg-page/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
          <Link to={brandTo} className="flex min-w-0 items-center gap-3">
            <img src="/logo-icon.png" alt="" className="size-8 shrink-0 rounded-md" />
            <span className="truncate font-serif text-lg">Taken Point Agra</span>
            {tag && <span className="shrink-0 rounded-full border border-line px-2 py-0.5 text-xs text-muted">{tag}</span>}
          </Link>

          {hasLinks ? (
            <>
              <nav className="hidden items-center gap-1 md:flex">
                {links.map((link) => <NavLink key={link.to} to={link.to} end className={desktopLink}>{link.label}</NavLink>)}
                {actions && <div className="ml-2">{actions}</div>}
              </nav>
              <button
                aria-label={isOpen ? "Close menu" : "Open menu"}
                aria-expanded={isOpen}
                onClick={() => setIsOpen((open) => !open)}
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-line transition-colors duration-150 hover:bg-hover md:hidden"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  {isOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
                </svg>
              </button>
            </>
          ) : (
            actions && <div>{actions}</div>
          )}
        </div>
      </header>

      {/* Menu panel sits OUTSIDE the header so its blur does not break the fixed positioning */}
      {isOpen && hasLinks && (
        <>
          <div className="fixed inset-0 z-10 bg-black/50 md:hidden" onClick={() => setIsOpen(false)} />
          <nav className="fixed inset-x-0 top-14 z-20 border-b border-line bg-panel px-4 pb-4 pt-2 md:hidden">
            <ul>
              {links.map((link) => <li key={link.to}><NavLink to={link.to} end className={mobileLink}>{link.label}</NavLink></li>)}
            </ul>
            {actions && <div className="mt-3 border-t border-line pt-4 [&>*]:w-full">{actions}</div>}
          </nav>
        </>
      )}
    </>
  );
}
