import { useTheme } from "../context/ThemeContext";
import logoImg from "../assets/logo/logo.png";
import logoDarkImg from "../assets/logo/logow.png";

const FOOTER_SHOP = ["All Products", "New Arrivals", "Best Sellers"];
const FOOTER_ASSIST = ["Shipping & Returns", "Care Guide", "Size Chart"];

const SOCIALS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/huesforever?igsh=ZGQzZXcwemVsc3B0&utm_source=qr",
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
    href: "https://www.facebook.com/share/1BY7ewmvLN/?mibextid=wwXIfr",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@huesforever?_r=1&_t=ZS-91WObW5NP3R",
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
      <style>{`
        footer[role="contentinfo"] {
          --footer-ink: #2d2430;
          --footer-muted: rgba(95, 74, 91, 0.78);
          --footer-line: rgba(95, 67, 86, 0.12);
          --footer-line-strong: rgba(203, 143, 174, 0.34);
          --footer-glass: rgba(255, 255, 255, 0.50);
          --footer-glass-strong: rgba(255, 255, 255, 0.72);
          --footer-shadow: rgba(91, 59, 82, 0.14);
          background:
            radial-gradient(circle at 50% 30%, rgba(221, 222, 233, 0.86), transparent 30%),
            radial-gradient(circle at 12% 12%, rgba(224, 220, 233, 0.88), transparent 34%),
            radial-gradient(circle at 78% 18%, rgba(219, 199, 223, 0.70), transparent 30%),
            radial-gradient(circle at 18% 82%, rgba(232, 204, 210, 0.74), transparent 34%),
            radial-gradient(circle at 92% 90%, rgba(203, 143, 174, 0.62), transparent 34%),
            linear-gradient(135deg, #e0dce9 0%, #ddcbe0 26%, #e4bfc9 48%, #d6bfd7 72%, #dddee9 100%) !important;
          color: var(--footer-ink);
          isolation: isolate;
        }

        footer[role="contentinfo"]::before,
        footer[role="contentinfo"]::after {
          content: "";
          position: absolute;
          pointer-events: none;
          border-radius: 999px;
          filter: blur(58px);
          z-index: 0;
        }

        footer[role="contentinfo"]::before {
          width: min(58vw, 760px);
          height: min(58vw, 760px);
          left: 26%;
          top: 4%;
          background: radial-gradient(circle, rgba(221, 222, 233, 0.72), rgba(224, 220, 233, 0.34) 48%, transparent 72%);
        }

        footer[role="contentinfo"]::after {
          width: min(54vw, 720px);
          height: min(54vw, 720px);
          right: -14%;
          bottom: -24%;
          background: radial-gradient(circle, rgba(203, 143, 174, 0.48), rgba(228, 191, 201, 0.30) 48%, transparent 74%);
        }

        footer[role="contentinfo"] > div:first-of-type {
          height: 4px !important;
          background: linear-gradient(90deg, transparent 0%, #dbc7df 20%, #e8ccd2 44%, #cb8fae 72%, transparent 100%) !important;
          box-shadow: 0 10px 28px rgba(203, 143, 174, 0.18);
        }

        footer[role="contentinfo"] > span[aria-hidden="true"] {
          background: linear-gradient(115deg, rgba(219, 199, 223, 0.82), rgba(232, 204, 210, 0.78), rgba(203, 143, 174, 0.58)) !important;
          -webkit-background-clip: text !important;
          background-clip: text !important;
          opacity: 0.12 !important;
          filter: blur(0.2px);
        }

        footer[role="contentinfo"] > div.relative.z-10 {
          position: relative;
          z-index: 1;
        }

        footer[role="contentinfo"] > div.relative.z-10 > div:first-child {
          padding: 28px;
          border: 1px solid var(--footer-line) !important;
          border-radius: 28px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.64), rgba(255, 255, 255, 0.34));
          box-shadow: 0 24px 62px var(--footer-shadow);
          backdrop-filter: blur(22px) saturate(1.12);
          -webkit-backdrop-filter: blur(22px) saturate(1.12);
        }

        footer[role="contentinfo"] p,
        footer[role="contentinfo"] a {
          text-wrap: pretty;
        }

        footer[role="contentinfo"] p {
          color: var(--footer-muted) !important;
        }

        footer[role="contentinfo"] p.text-\\[var\\(--color-on-surface\\)\\],
        footer[role="contentinfo"] p.text-\\[var\\(--color-on-surface\\)\\] span {
          color: var(--footer-ink) !important;
        }

        footer[role="contentinfo"] p.text-\\[var\\(--color-on-surface\\)\\] span,
        footer[role="contentinfo"] h4,
        footer[role="contentinfo"] a.text-\\[var\\(--color-primary\\)\\] {
          color: #6f4a60 !important;
        }

        footer[role="contentinfo"] a[href="/collections/dress"] {
          border-color: rgba(95, 67, 86, 0.18) !important;
          background: linear-gradient(135deg, #5f4356 0%, #cb8fae 58%, #e4bfc9 100%);
          color: #ffffff !important;
          box-shadow: 0 18px 38px rgba(95, 67, 86, 0.22);
        }

        footer[role="contentinfo"] a[href="/collections/dress"]:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 22px 46px rgba(95, 67, 86, 0.28);
        }

        footer[role="contentinfo"] .grid > div {
          min-width: 0;
        }

        footer[role="contentinfo"] .grid > div:not(:first-child) {
          padding: 18px;
          border: 1px solid var(--footer-line);
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.30);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        footer[role="contentinfo"] li a {
          color: var(--footer-muted) !important;
          border-radius: 999px;
          padding: 4px 0;
        }

        footer[role="contentinfo"] li a:hover {
          color: #6f4a60 !important;
        }

        footer[role="contentinfo"] li a span {
          background: linear-gradient(90deg, #cb8fae, #e4bfc9) !important;
        }

        footer[role="contentinfo"] a[aria-label] {
          border-color: var(--footer-line) !important;
          background: rgba(255, 255, 255, 0.44) !important;
          color: #6f4a60 !important;
          box-shadow: 0 12px 26px rgba(91, 59, 82, 0.10);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }

        footer[role="contentinfo"] a[aria-label]:hover {
          border-color: var(--footer-line-strong) !important;
          background: rgba(255, 255, 255, 0.72) !important;
          color: #5f4356 !important;
          box-shadow: 0 16px 34px rgba(91, 59, 82, 0.16);
        }

        footer[role="contentinfo"] .h-px {
          background: linear-gradient(90deg, transparent, rgba(95, 67, 86, 0.20), transparent) !important;
        }

        footer[role="contentinfo"] img {
          filter: drop-shadow(0 12px 24px rgba(91, 59, 82, 0.14)) !important;
        }

        .dark footer[role="contentinfo"],
        [data-theme="dark"] footer[role="contentinfo"] {
          --footer-ink: var(--color-on-surface);
          --footer-muted: rgba(215, 198, 199, 0.84);
          --footer-line: rgba(232, 169, 180, 0.14);
          --footer-line-strong: rgba(232, 169, 180, 0.24);
          --footer-shadow: rgba(0, 0, 0, 0.36);
          background:
            radial-gradient(circle at 50% 34%, rgba(53, 46, 64, 0.82), transparent 30%),
            radial-gradient(circle at 12% 12%, rgba(73, 55, 78, 0.76), transparent 34%),
            radial-gradient(circle at 92% 90%, rgba(116, 58, 86, 0.42), transparent 34%),
            linear-gradient(135deg, #151018 0%, #1e1722 44%, #261722 100%) !important;
        }

        .dark footer[role="contentinfo"] > div.relative.z-10 > div:first-child,
        [data-theme="dark"] footer[role="contentinfo"] > div.relative.z-10 > div:first-child,
        .dark footer[role="contentinfo"] .grid > div:not(:first-child),
        [data-theme="dark"] footer[role="contentinfo"] .grid > div:not(:first-child),
        .dark footer[role="contentinfo"] a[aria-label],
        [data-theme="dark"] footer[role="contentinfo"] a[aria-label] {
          background: rgba(255, 255, 255, 0.06) !important;
          border-color: var(--footer-line) !important;
        }

        .dark footer[role="contentinfo"] p.text-\\[var\\(--color-on-surface\\)\\],
        [data-theme="dark"] footer[role="contentinfo"] p.text-\\[var\\(--color-on-surface\\)\\],
        .dark footer[role="contentinfo"] p.text-\\[var\\(--color-on-surface\\)\\] span,
        [data-theme="dark"] footer[role="contentinfo"] p.text-\\[var\\(--color-on-surface\\)\\] span {
          color: var(--footer-ink) !important;
        }

        @media (max-width: 900px) {
          footer[role="contentinfo"] > div.relative.z-10 {
            padding-left: 24px;
            padding-right: 24px;
          }
        }

        @media (max-width: 520px) {
          footer[role="contentinfo"] > div.relative.z-10 {
            padding-left: 18px;
            padding-right: 18px;
            padding-top: 48px;
          }

          footer[role="contentinfo"] > div.relative.z-10 > div:first-child {
            padding: 22px;
          }

          footer[role="contentinfo"] .grid > div:not(:first-child) {
            padding: 16px;
          }
        }
      `}</style>
      <div
        className="h-[3px] w-full"
        style={{
          background: "linear-gradient(90deg, transparent 0%, var(--color-primary) 30%, var(--color-primary-container) 60%, var(--color-inverse-primary) 100%)",
        }}
      />

        <span
          aria-hidden="true"
          className="pointer-events-none select-none absolute left-1/2 top-[68%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-light tracking-widest z-0 leading-none"
          style={{
            fontFamily: "'Gillie Quest', 'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(90px, 17vw, 170px)",
            background:
              "linear-gradient(115deg, var(--color-primary-container) 0%, color-mix(in srgb, var(--color-primary-container) 70%, var(--color-surface) 30%) 35%, color-mix(in srgb, var(--color-primary) 70%, var(--color-surface) 30%) 70%, var(--color-primary) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            opacity: 0.1,
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
            href="/collections/dress"
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
                <FooterLink key={item} href="/my-orders">{item}</FooterLink>
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
