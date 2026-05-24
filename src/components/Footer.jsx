import logoImg from "../assets/logo/logo.jpg";

const FOOTER_SHOP   = ["All Products", "New Arrivals", "Best Sellers", "Archive"];
const FOOTER_ASSIST = ["Shipping & Returns", "Care Guide", "Size Chart", "Contact Us"];

const SOCIALS = [
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "#",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "#",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
      </svg>
    ),
  },
];

/* ─── Logo ─────────────────────────────────────────────────────────────── */
function Logo() {
  return (
    <div className="flex items-center mb-4">
      <img
        src={logoImg}
        alt="HUES"
        className="h-11 w-auto object-contain rounded-md"
        style={{ filter: "drop-shadow(0 2px 8px rgba(180,140,210,0.18))" }}
      />
    </div>
  );
}

/* ─── Footer Link ───────────────────────────────────────────────────────── */
function FooterLink({ children, href = "#" }) {
  return (
    <li>
      <a
        href={href}
        className="group relative inline-flex items-center gap-2 text-[13px] font-normal tracking-wide text-[#7a5068] hover:text-[#8a3a60] transition-colors duration-250 font-[Jost,'Helvetica_Neue',sans-serif]"
      >
        <span
          className="block h-px w-0 bg-[#8a3a60] transition-all duration-300 ease-out flex-shrink-0 group-hover:w-3.5"
          aria-hidden="true"
        />
        {children}
      </a>
    </li>
  );
}

/* ─── Main Footer ───────────────────────────────────────────────────────── */
export default function Footer() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');
      `}</style>

      <footer
        className="relative overflow-hidden bg-[#fff8f9] text-[#1c1018] font-[Jost,'Helvetica_Neue',sans-serif]"
        role="contentinfo"
      >
        {/* ── Top gradient stripe ── */}
        <div
          className="h-[3px] w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, #8a3a60 30%, #c07fa5 60%, #e8d5f0 100%)",
          }}
        />

        {/* ── Watermark ── */}
        <span
          aria-hidden="true"
          className="pointer-events-none select-none absolute bottom-[-12px] left-1/2 -translate-x-1/2 whitespace-nowrap italic font-light tracking-widest z-0"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(72px, 13vw, 148px)",
            /* Slightly darker pastel pink–purple–lavender, lightly desaturated */
            background:
              "linear-gradient(115deg, #c9a8d4 0%, #b8a0cc 35%, #a9b0d8 70%, #b8c0e0 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            opacity: 0.28,
          }}
        >
          HUES
        </span>

        {/* ── Inner ── */}
        <div className="relative z-10 max-w-[1440px] mx-auto px-12 pt-16 pb-8">

          {/* ── Editorial band ── */}
          <div className="flex flex-wrap items-center justify-between gap-6 pb-10 mb-14 border-b border-[rgba(170,110,140,0.18)]">
            <p
              className="text-[#1c1018] leading-snug max-w-[520px]"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(22px, 3vw, 32px)",
                fontWeight: 300,
                letterSpacing: "0.01em",
              }}
            >
              Elevating the everyday through<br />
              <em className="text-[#8a3a60] italic">curated luxury</em> and intentional design.
            </p>
            <a
              href="/collections"
              className="inline-flex items-center gap-2.5 px-7 py-3 rounded-full border border-[#8a3a60] text-[#8a3a60] text-[10px] font-semibold tracking-[0.18em] uppercase transition-all duration-300 hover:bg-[#8a3a60] hover:text-white hover:scale-[1.03] no-underline"
              style={{ fontFamily: "Jost, 'Helvetica Neue', sans-serif", whiteSpace: "nowrap" }}
            >
              Explore Collection
              <svg
                width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round"
                className="transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              >
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </a>
          </div>

          {/* ── Grid ── */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-x-8 gap-y-10 mb-14 max-[900px]:grid-cols-2 max-[520px]:grid-cols-1">

            {/* Brand column */}
            <div>
              <Logo />
              <p
                className="text-[#7a5068] text-sm leading-relaxed max-w-[220px] mb-5"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 300 }}
              >
                Where minimalism meets feminine elegance — crafted for the modern woman.
              </p>
              {/* Newsletter */}
              <div
                className="flex max-w-[240px] rounded overflow-hidden border border-[rgba(170,110,140,0.18)]"
                role="form"
                aria-label="Newsletter signup"
              >
                <input
                  type="email"
                  placeholder="Your email"
                  aria-label="Email address"
                  className="flex-1 px-3 py-2 text-[11px] tracking-wide bg-[#fce8f0] text-[#1c1018] placeholder-[#7a5068] border-none outline-none font-[Jost,'Helvetica_Neue',sans-serif]"
                />
                <button
                  type="button"
                  aria-label="Subscribe"
                  className="px-3.5 py-2 bg-[#8a3a60] text-white text-[11px] font-semibold tracking-[0.1em] uppercase border-none cursor-pointer transition-colors duration-250 hover:bg-[#c07fa5] font-[Jost,'Helvetica_Neue',sans-serif]"
                >
                  Join
                </button>
              </div>
            </div>

            {/* Shop */}
            <div>
              <h4
                className="text-[#8a3a60] text-[10px] font-semibold tracking-[0.22em] uppercase mb-5"
                style={{ fontFamily: "Jost, 'Helvetica Neue', sans-serif" }}
              >
                Shop
              </h4>
              <ul className="flex flex-col gap-2.5 list-none m-0 p-0">
                {FOOTER_SHOP.map(item => (
                  <FooterLink key={item} href="/collections">{item}</FooterLink>
                ))}
              </ul>
            </div>

            {/* Assistance */}
            <div>
              <h4
                className="text-[#8a3a60] text-[10px] font-semibold tracking-[0.22em] uppercase mb-5"
                style={{ fontFamily: "Jost, 'Helvetica Neue', sans-serif" }}
              >
                Assistance
              </h4>
              <ul className="flex flex-col gap-2.5 list-none m-0 p-0">
                {FOOTER_ASSIST.map(item => (
                  <FooterLink key={item} href="#">{item}</FooterLink>
                ))}
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h4
                className="text-[#8a3a60] text-[10px] font-semibold tracking-[0.22em] uppercase mb-5"
                style={{ fontFamily: "Jost, 'Helvetica Neue', sans-serif" }}
              >
                Connect
              </h4>
              <div className="flex flex-wrap gap-2.5 mt-1">
                {SOCIALS.map(s => (
                  <a
                    key={s.label}
                    href={s.href}
                    className="w-[38px] h-[38px] flex items-center justify-center rounded-full border border-[rgba(170,110,140,0.18)] text-[#7a5068] bg-transparent transition-all duration-250 hover:border-[#8a3a60] hover:text-[#8a3a60] hover:bg-[#fce8f0] hover:-translate-y-0.5 no-underline"
                    aria-label={s.label}
                    title={s.label}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>

              <p
                className="mt-7 text-[11px] leading-[1.75] text-[#7a5068]"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 300 }}
              >
                Private styling appointments<br />available by request.
              </p>
              <a
                href="/contact"
                className="inline-block mt-2.5 text-[9px] font-semibold tracking-[0.16em] uppercase text-[#8a3a60] no-underline border-b border-b-[#8a3a60] pb-px transition-opacity hover:opacity-70"
                style={{ fontFamily: "Jost, 'Helvetica Neue', sans-serif" }}
              >
                Book now →
              </a>
            </div>

          </div>{/* /grid */}

          {/* ── Bottom bar ── */}
          <div className="h-px bg-[rgba(170,110,140,0.18)] mb-6" aria-hidden="true" />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p
              className="text-[10px] tracking-[0.14em] uppercase text-[#7a5068]"
              style={{ fontFamily: "Jost, 'Helvetica Neue', sans-serif" }}
            >
              © 2026 HUES Editorial Fashion. All rights reserved.
            </p>
          </div>

        </div>
      </footer>
    </>
  );
}