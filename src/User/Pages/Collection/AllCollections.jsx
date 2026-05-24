import { useNavigate } from "react-router-dom";
import { useState } from "react";
import dressMain from "../../../assets/images/dresses/floral-flare/main.png";
import shirtMain from "../../../assets/images/shirts/bow-print/main.png";

/* ─── Keyframes + fonts injected once ───────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');

  @keyframes acFadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes acShimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes acPulse {
    0%, 100% { transform: scale(1);   opacity: 0.6; }
    50%       { transform: scale(1.1); opacity: 1;   }
  }
  @keyframes acFloat {
    0%, 100% { transform: translateY(0);    }
    50%       { transform: translateY(-8px); }
  }

  .ac-fade-1 { animation: acFadeUp 0.7s 0.05s ease both; }
  .ac-fade-2 { animation: acFadeUp 0.7s 0.15s ease both; }
  .ac-fade-3 { animation: acFadeUp 0.7s 0.25s ease both; }
  .ac-fade-4 { animation: acFadeUp 0.7s 0.35s ease both; }
  .ac-fade-5 { animation: acFadeUp 0.7s 0.45s ease both; }

  .ac-shimmer-text {
    background: linear-gradient(90deg, #8a3a60 0%, #c07898 40%, #8a3a60 60%, #5a1a40 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: acShimmer 4s linear infinite;
  }

  .ac-card-shine {
    position: relative; overflow: hidden;
  }
  .ac-card-shine::after {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%);
    transform: translateX(-100%);
    transition: transform 0.7s ease;
    pointer-events: none;
  }
  .ac-card-shine:hover::after { transform: translateX(100%); }

  .ac-coming-ring {
    animation: acPulse 2.8s ease-in-out infinite;
  }
  .ac-coming-icon {
    animation: acFloat 3.5s ease-in-out infinite;
  }
`;

/* ─── Arrow icon ─────────────────────────────────────────────────────────── */
const ArrowRight = ({ className = "" }) => (
  <svg
    width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.5"
    strokeLinecap="round" strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

/* ─── Product Card ───────────────────────────────────────────────────────── */
function CollectionCard({ tag, src, alt, subtitle, title, desc, cta, onClick, delay = "" }) {
  const [hovered, setHovered] = useState(false);

  return (
    <article
      className={`ac-card-shine group flex flex-col overflow-hidden rounded-[28px] bg-[#fff8f9] border border-[#ecd4de]/50 shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-[#8a3a60]/10 hover:-translate-y-1.5 cursor-pointer ${delay}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative h-[440px] overflow-hidden bg-gradient-to-br from-[#fce8f0] to-[#f5d8e8]">
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
        />

        {/* gradient overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent transition-opacity duration-500"
          style={{ opacity: hovered ? 1 : 0 }}
        />

        {/* Tag pill */}
        <span
          className="absolute top-4 left-4 rounded-full bg-[#fff8f9]/88 backdrop-blur-md px-4 py-1.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#8a3a60] shadow-sm border border-[#e8d0da]/40"
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
          {tag}
        </span>

        {/* Quick shop pill — slides up on hover */}
        <button
          className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/95 backdrop-blur-sm px-6 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8a3a60] shadow-lg transition-all duration-400 border border-[#e8d0da]/50 whitespace-nowrap"
          style={{
            fontFamily: "'Jost', sans-serif",
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(10px)",
            transition: "opacity 0.35s, transform 0.35s",
          }}
          onClick={(e) => { e.stopPropagation(); onClick(); }}
        >
          Quick Shop ↗
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-7 gap-2">
        <p
          className="text-[9.5px] font-semibold tracking-[0.22em] uppercase text-[#b090a0]"
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
          {subtitle}
        </p>
        <h3
          className="text-[21px] leading-snug text-[#1a0e14]"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400 }}
        >
          {title}
        </h3>
        <p
          className="text-[13px] text-[#7a5068] leading-relaxed flex-1"
          style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300 }}
        >
          {desc}
        </p>

        {/* CTA link */}
        <button
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          className="mt-4 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a3a60] hover:text-[#5a1a40] transition-colors self-start"
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
          {cta}
          <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </div>
    </article>
  );
}

/* ─── Coming Soon Card ───────────────────────────────────────────────────── */
function ComingSoonCard({ delay = "" }) {
  return (
    <article
      className={`flex flex-col overflow-hidden rounded-[28px] border border-dashed border-[#d4b0c4]/60 bg-gradient-to-br from-[#fff8f9] via-[#fce8f2] to-[#f9dced] shadow-sm ${delay}`}
    >
      <div className="flex flex-1 min-h-[440px] items-center justify-center px-10">
        <div className="flex flex-col items-center text-center gap-5">

          {/* Animated ring + icon */}
          <div className="relative">
            <div className="ac-coming-ring absolute inset-0 rounded-full border-2 border-[#e0a8c0]/50 scale-110" />
            <div
              className="ac-coming-icon w-24 h-24 rounded-full bg-gradient-to-br from-[#fce8f0] to-[#f5d0e4] flex items-center justify-center border border-[#e0b8cc]/50 shadow-inner"
            >
              <span
                className="text-[32px]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
                aria-hidden="true"
              >
                ✿
              </span>
            </div>
          </div>

          <span
            className="text-[9.5px] font-semibold tracking-[0.28em] uppercase text-[#c090a8]"
            style={{ fontFamily: "'Jost', sans-serif" }}
          >
            Blouse
          </span>

          <h3
            className="text-[28px] leading-tight text-[#1a0e14]"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontStyle: "italic" }}
          >
            Coming Soon
          </h3>

          <p
            className="text-[13px] text-[#7a5068] leading-relaxed max-w-[240px]"
            style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300 }}
          >
            A seasonal blouse edit is in development — soft finishes, sculpted lines, and everyday luxe.
          </p>

          {/* Notify pill */}
          <button
            disabled
            className="mt-2 inline-flex items-center gap-2 rounded-full border border-[#d4b0c4]/60 bg-white/60 px-7 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#c0a0b0] cursor-not-allowed select-none"
            style={{ fontFamily: "'Jost', sans-serif" }}
          >
            Notify Me
          </button>
        </div>
      </div>
    </article>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
const AllCollections = () => {
  const navigate = useNavigate();

  return (
    <section
      className="max-w-[1440px] mx-auto px-6 md:px-16 py-20"
      style={{ fontFamily: "'Jost', sans-serif" }}
    >
      <style>{STYLES}</style>

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-10 mb-16">

        <div className="max-w-2xl">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-5 ac-fade-1">
            <span className="w-8 h-px bg-[#9b3a6a]" aria-hidden="true" />
            <p
              className="text-[9.5px] font-semibold tracking-[0.32em] uppercase text-[#9b3a6a]"
              style={{ fontFamily: "'Jost', sans-serif" }}
            >
              All Collections
            </p>
          </div>

          {/* Title */}
          <h2
            className="text-[clamp(36px,5.5vw,60px)] leading-[1.05] text-[#1a0e14] mb-6 ac-fade-2"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}
          >
            Explore every edit from{" "}
            <em className="ac-shimmer-text not-italic" style={{ fontStyle: "italic" }}>
              the wardrobe
            </em>{" "}
            collection.
          </h2>

          {/* Body copy */}
          <p
            className="text-[15px] text-[#7a5068] leading-relaxed max-w-xl ac-fade-3"
            style={{ fontWeight: 300 }}
          >
            Curated stories shaped by ease, texture, and timeless detailing. Discover dresses for
            luminous days, shirts with modern polish, and the upcoming blouse collection.
          </p>
        </div>

        {/* CTA */}
        <div className="ac-fade-4 flex-shrink-0">
          <button
            onClick={() => navigate("/collections/dress")}
            className="group inline-flex items-center gap-3 rounded-full bg-[#8a3a60] px-9 py-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-white shadow-lg shadow-[#8a3a60]/25 transition-all duration-300 hover:bg-[#1a0e14] hover:shadow-xl hover:scale-105"
            style={{ fontFamily: "'Jost', sans-serif" }}
          >
            Shop Dresses
            <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-3 gap-4 mb-14 ac-fade-4">
        {[
          { val: "2",  label: "Active Collections" },
          { val: "24+", label: "Signature Pieces" },
          { val: "1",  label: "Arriving Soon" },
        ].map(({ val, label }) => (
          <div
            key={label}
            className="flex flex-col items-center justify-center py-6 rounded-2xl border border-[#ecd4de]/50 bg-[#fff8f9] gap-1"
          >
            <span
              className="text-[28px] font-light text-[#8a3a60] leading-none"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {val}
            </span>
            <span
              className="text-[10px] font-medium tracking-[0.14em] uppercase text-[#b090a0]"
              style={{ fontFamily: "'Jost', sans-serif" }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Cards grid ── */}
      <div className="grid gap-7 md:grid-cols-3 ac-fade-5">
        <CollectionCard
          tag="Dress"
          src={dressMain}
          alt="Floral Flare Mini Dress"
          subtitle="Floral Flare Mini"
          title="Statement silhouettes in motion."
          desc="A modern dress edit with embroidered details and soft movement for day-to-evening dressing."
          cta="View Dress Collection"
          onClick={() => navigate("/collections/dress")}
        />

        <CollectionCard
          tag="Shirt"
          src={shirtMain}
          alt="Bow Print Long Sleeve Crop Shirt"
          subtitle="Bow Print Crop"
          title="Crisp tailoring, feminine mood."
          desc="A lightweight crop shirt designed for layering, with modern bow print detail and easy polish."
          cta="View Shirt Collection"
          onClick={() => navigate("/collections/shirt")}
          delay="[animation-delay:0.1s]"
        />

        <ComingSoonCard delay="[animation-delay:0.2s]" />
      </div>

      {/* ── Bottom editorial note ── */}
      <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-[#ecd4de]/40">
        <p
          className="text-[12px] text-[#b090a0] tracking-wide italic max-w-md text-center sm:text-left"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}
        >
          "Each collection is designed to feel as beautiful as it looks — worn, lived in, and loved."
        </p>
        <button
          onClick={() => navigate("/collections/dress")}
          className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8a3a60] border-b border-[#8a3a60]/40 pb-0.5 hover:border-[#8a3a60] transition-colors"
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
          View All →
        </button>
      </div>
    </section>
  );
};

export default AllCollections;