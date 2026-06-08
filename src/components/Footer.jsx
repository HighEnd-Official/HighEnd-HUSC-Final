import { useTheme } from "../context/ThemeContext";
import logoImg from "../assets/logo/logo.png";
import logoDarkImg from "../assets/logo/logow.png";

const FOOTER_SHOP = ["All Products", "New Arrivals", "Best Sellers", "Archive"];
const FOOTER_ASSIST = ["Shipping & Returns", "Care Guide", "Size Chart", "Contact Us"];

const SOCIALS = [
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "#",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "#",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
      </svg>
    ),
  },
];

function Logo() {
  const { theme } = useTheme();

  return (
    <div className="flex items-center mb-4">
      <img
        src={theme === "dark" ? logoDarkImg : logoImg}
        alt="HUES"
        className="h-8 w-auto object-contain rounded-md"
        decoding="async"
        style={{ filter: "drop-shadow(0 2px 8px rgba(111,31,47,0.18))" }}
      />
    </div>
  );
}

function FooterLink({ children, href = "#" }) {
  return (
    <li>
      <a
        href={href}
        className="group relative inline-flex items-center gap-2 text-[13px] font-normal tracking-wide text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors duration-250 font-[Jost,'Helvetica_Neue',sans-serif]"
      >
        <span
          className="block h-px w-0 bg-[var(--color-primary)] transition-all duration-300 ease-out flex-shrink-0 group-hover:w-3.5"
          aria-hidden="true"
        />
        {children}
      </a>
    </li>
  );
}

export default function Footer() {
  return (
    <footer
      className="relative overflow-hidden bg-[var(--color-surface)] text-[var(--color-on-surface)] font-[Jost,'Helvetica_Neue',sans-serif]"
      role="contentinfo"
    >
      <div
        className="h-[3px] w-full"
        style={{
          background: "linear-gradient(90deg, transparent 0%, var(--color-primary) 30%, var(--color-primary-container) 60%, var(--color-inverse-primary) 100%)",
        }}
      />

      <span
        aria-hidden="true"
        className="pointer-events-none select-none absolute bottom-[-14px] left-1/2 -translate-x-1/2 whitespace-nowrap font-light tracking-widest z-0"
        style={{
          fontFamily: "'Gillie Quest', 'Cormorant Garamond', Georgia, serif",
          fontSize: "clamp(72px, 13vw, 100px)",
          background: "linear-gradient(115deg, var(--color-primary-container) 0%, color-mix(in srgb, var(--color-primary-container) 70%, var(--color-surface) 30%) 35%, color-mix(in srgb, var(--color-primary) 70%, var(--color-surface) 30%) 70%, var(--color-primary) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          opacity: 0.25,
        }}
      >
        HUES
      </span>

      <div className="relative z-10 max-w-[1440px] mx-auto px-12 pt-16 pb-8">
        <div className="flex flex-wrap items-center justify-between gap-6 pb-10 mb-14 border-b border-[var(--color-outline-variant)]">
          <p
            className="text-[var(--color-on-surface)] leading-snug max-w-[520px]"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(22px, 3vw, 32px)",
              fontWeight: 300,
              letterSpacing: "0.01em",
            }}
          >
            Elevating the everyday through<br />
            <span className="text-[var(--color-primary)]">curated luxury</span> and intentional design.
          </p>
          <a
            href="/collections"
            className="inline-flex items-center gap-2.5 px-7 py-3 rounded-full border border-[var(--color-primary)] text-[var(--color-primary)] text-[10px] font-semibold tracking-[0.18em] uppercase transition-all duration-300 hover:bg-[var(--color-primary)] hover:text-[var(--color-on-primary)] hover:scale-[1.03] no-underline"
            style={{ fontFamily: "'Cormorant Garamond', serif", whiteSpace: "nowrap" }}
          >
            Explore Collection
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>

        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-x-8 gap-y-10 mb-14 max-[900px]:grid-cols-2 max-[520px]:grid-cols-1">
          <div>
            <Logo />
            <p
              className="text-[var(--color-on-surface-variant)] text-sm leading-relaxed max-w-[220px] mb-5"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 300 }}
            >
              Where minimalism meets feminine elegance — crafted for the modern woman.
            </p>
            <div
              className="flex max-w-[240px] rounded overflow-hidden border border-[var(--color-outline-variant)]"
              role="form"
              aria-label="Newsletter signup"
            >
              <input
                type="email"
                placeholder="Your email"
                aria-label="Email address"
                className="flex-1 px-3 py-2 text-[11px] tracking-wide bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] placeholder-[var(--color-on-surface-variant)] border-none outline-none font-[Jost,'Helvetica_Neue',sans-serif]"
              />
              <button
                type="button"
                aria-label="Subscribe"
                className="px-3.5 py-2 bg-[var(--color-primary)] text-[var(--color-on-primary)] text-[11px] font-semibold tracking-[0.1em] uppercase border-none cursor-pointer transition-colors duration-250 hover:bg-[var(--color-primary-container)] font-[Jost,'Helvetica_Neue',sans-serif]"
              >
                Join
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-[var(--color-primary)] text-[10px] font-semibold tracking-[0.22em] uppercase mb-5" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Shop
            </h4>
            <ul className="flex flex-col gap-2.5 list-none m-0 p-0">
              {FOOTER_SHOP.map((item) => (
                <FooterLink key={item} href="/collections">{item}</FooterLink>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[var(--color-primary)] text-[10px] font-semibold tracking-[0.22em] uppercase mb-5" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Assistance
            </h4>
            <ul className="flex flex-col gap-2.5 list-none m-0 p-0">
              {FOOTER_ASSIST.map((item) => (
                <FooterLink key={item} href="#">{item}</FooterLink>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[var(--color-primary)] text-[10px] font-semibold tracking-[0.22em] uppercase mb-5" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Connect
            </h4>
            <div className="flex flex-wrap gap-2.5 mt-1">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  className="w-[38px] h-[38px] flex items-center justify-center rounded-full border border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] bg-transparent transition-all duration-250 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-container-low)] hover:-translate-y-0.5 no-underline"
                  aria-label={s.label}
                  title={s.label}
                >
                  {s.icon}
                </a>
              ))}
            </div>

            <p
              className="mt-7 text-[11px] leading-[1.75] text-[var(--color-on-surface-variant)]"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 300 }}
            >
              Private styling appointments<br />available by request.
            </p>
            <a
              href="/contact"
              className="inline-block mt-2.5 text-[9px] font-semibold tracking-[0.16em] uppercase text-[var(--color-primary)] no-underline border-b border-b-[var(--color-primary)] pb-px transition-opacity hover:opacity-70"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Book now →
            </a>
          </div>
        </div>

        <div className="h-px bg-[var(--color-outline-variant)] mb-6" aria-hidden="true" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[10px] tracking-[0.14em] uppercase text-[var(--color-on-surface-variant)]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            © 2026 HUES Editorial Fashion. All rights reserved.
          </p>
          <p className="text-[10px] tracking-[0.14em] uppercase text-[var(--color-on-surface-variant)]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            🚀 HIGH END
          </p>
        </div>
      </div>
    </footer>
  );
}
