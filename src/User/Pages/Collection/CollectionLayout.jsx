import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useState } from "react";
import NavBar from "../../../components/NavBar";
import Footer from "../../../components/Footer";

const tabs = ["Blouse", "Dress", "Shirt"];

/* ─── Floating petal particle ─────────────────────────────────────────── */
function Petal({ style }) {
  return (
    <span
      aria-hidden="true"
      className="hues-petal"
      style={style}
    >
      ✿
    </span>
  );
}

/* ─── Hero section ────────────────────────────────────────────────────── */
function Hero({ activeTab }) {
  const subtitles = {
    Blouse: "Delicate layers and artisan detailing — the blouse reimagined for quiet luxury.",
    Dress:  "Fluid silhouettes and ethereal femininity — find your signature dress.",
    Shirt:  "Sharp tailoring softened by feminine details — effortlessly elevated.",
  };

  return (
    <section className="hues-col-hero">
      {/* Decorative rings */}
      <div className="hues-col-hero__ring hues-col-hero__ring--1" />
      <div className="hues-col-hero__ring hues-col-hero__ring--2" />
      <div className="hues-col-hero__ring hues-col-hero__ring--3" />

      {/* Petals */}
      <Petal style={{ top: "18%", left: "8%",  animationDelay: "0s",   animation: "huesDrift 8s ease-in-out infinite" }} />
      <Petal style={{ top: "30%", right: "10%", animationDelay: "2s",  animation: "huesDrift 10s ease-in-out infinite" }} />
      <Petal style={{ top: "60%", left: "15%", animationDelay: "4s",   animation: "huesDrift 12s ease-in-out infinite" }} />
      <Petal style={{ top: "75%", right: "18%", animationDelay: "1s",  animation: "huesDrift 9s ease-in-out infinite" }} />

      {/* Season tag */}
      <div className="hues-col-hero__badge animate-[huesFadeUp_0.6s_ease_both]">
        <span className="hues-col-hero__badge-line" />
        <span className="hues-col-hero__badge-text">
          Curated Essence · Season 2025
        </span>
        <span className="hues-col-hero__badge-line" />
      </div>

      {/* Title */}
      <h1 className="hues-col-hero__title animate-[huesFadeUp_0.7s_0.1s_ease_both]">
        The <em>{activeTab}</em> Collection
      </h1>

      {/* Subtitle */}
      <p className="hues-col-hero__subtitle animate-[huesFadeUp_0.7s_0.2s_ease_both]">
        {subtitles[activeTab] || subtitles.Dress}
      </p>

      {/* CTA row */}
      <div className="hues-col-hero__btn-row animate-[huesFadeUp_0.7s_0.3s_ease_both]">
        <button className="hues-col-hero__btn-primary">
          Shop Now
        </button>
        <button className="hues-col-hero__btn-outline">
          View Lookbook
        </button>
      </div>

      {/* Scroll hint */}
      <div className="hues-col-hero__scroll-hint">
        <span className="hues-col-hero__scroll-line" />
        <span className="hues-col-hero__scroll-text">Scroll</span>
      </div>
    </section>
  );
}

/* ─── Category tabs bar ───────────────────────────────────────────────── */
function TabBar({ activeTab, onTab, onFilter, onSort }) {
  return (
    <div className="hues-col-tabs">
      <div className="hues-col-tabs__inner">

        {/* Tabs */}
        <div className="hues-col-tabs__list">
          {tabs.map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => onTab(tab)}
                className={`hues-col-tabs__btn ${active ? "hues-col-tabs__btn--active" : ""}`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <span className="hues-col-tabs__divider" />

        {/* Filter & Sort */}
        <div className="hues-col-tabs__actions">
          <button onClick={onFilter} className="hues-col-tabs__action-btn">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="12" y1="18" x2="12" y2="18"/>
            </svg>
            Filter
          </button>
          <button onClick={onSort} className="hues-col-tabs__action-btn">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M3 9l4-4 4 4"/><path d="M7 5v14"/><path d="M21 15l-4 4-4-4"/><path d="M17 19V5"/>
            </svg>
            Sort
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Philosophy / Editorial strip ───────────────────────────────────── */
function EditorialStrip() {
  const [email, setEmail]       = useState("");
  const [subscribed, setSub]    = useState(false);

  const handleSub = () => {
    if (email.trim()) { setSub(true); setEmail(""); }
  };

  return (
    <section className="hues-col-editorial">
      {/* Large decorative serif watermark */}
      <span className="hues-col-editorial__watermark" aria-hidden="true">H</span>

      <div className="hues-col-editorial__inner">
        {/* Left — quote */}
        <div className="hues-col-editorial__quote-box">
          <span className="hues-col-editorial__tag">The Philosophy</span>

          <blockquote className="hues-col-editorial__quote">
            "Clothing should be an extension of one's aura — subtle, evocative, and profoundly personal."
          </blockquote>

          <div className="hues-col-editorial__author-row">
            <span className="hues-col-editorial__author-line" />
            <p className="hues-col-editorial__author-text">Creative Director, HUES</p>
          </div>

          <p className="hues-col-editorial__desc">
            Every piece is designed with the intention of effortless elegance — focused on the tiny
            details that ensure your presence is felt before it is seen.
          </p>

          <button className="hues-col-editorial__lookbook-btn">
            Explore the Lookbook
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>

        {/* Right — newsletter card */}
        <div className="hues-col-editorial__card">
          <span className="hues-col-editorial__card-emoji" aria-hidden="true">💌</span>
          <h3 className="hues-col-editorial__card-title">Join the World of HUES</h3>
          <p className="hues-col-editorial__card-desc">
            Receive exclusive access to new collections, editorial insights, and private sale invitations.
          </p>

          {subscribed ? (
            <div className="hues-col-editorial__success">
              <span className="hues-col-editorial__success-emoji">🌸</span>
              <p className="hues-col-editorial__success-text">Welcome to the world of HUES.</p>
            </div>
          ) : (
            <div className="hues-col-editorial__form">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSub()}
                placeholder="Email Address"
                className="hues-col-editorial__input"
                aria-label="Email address"
              />
              <button onClick={handleSub} className="hues-col-editorial__submit-btn">
                Subscribe
              </button>
              <p className="hues-col-editorial__fine-print">
                No spam, ever. Unsubscribe anytime.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ─── Styles & Keyframes ─────────────────────────────────────────────── */
const KEYFRAMES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');

  @keyframes huesFadeUp {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes huesDrift {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50%       { transform: translateY(-14px) rotate(12deg); }
  }
  @keyframes huesMarquee {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }

  .hues-col-root {
    background: var(--color-surface);
    color: var(--color-on-surface);
    min-height: 100vh;
    font-family: 'Jost', sans-serif;
    transition: background-color 0.4s ease, color 0.4s ease;
  }

  /* Petal particles */
  .hues-petal {
    position: absolute;
    pointer-events: none;
    select-none: none;
    color: var(--color-primary);
    opacity: 0.18;
    font-size: 10px;
  }

  /* ── Hero ── */
  .hues-col-hero {
    position: relative; width: 100%;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    text-align: center; padding: 144px 32px 96px;
    overflow: hidden;
    background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-container-low) 50%, var(--color-surface-container) 100%);
    border-bottom: 0.5px solid var(--color-outline-variant);
    transition: background 0.4s ease, border-color 0.4s ease;
  }
  .hues-col-hero__ring {
    position: absolute; border: 1px solid var(--color-outline-variant); opacity: 0.12; border-radius: 50%; pointer-events: none;
  }
  .hues-col-hero__ring--1 { width: 600px; height: 600px; -top: 400px; -right: 400px; }
  .hues-col-hero__ring--2 { width: 400px; height: 400px; -top: 200px; -right: 200px; }
  .hues-col-hero__ring--3 { width: 300px; height: 300px; -bottom: 200px; -left: 200px; }

  .hues-col-hero__badge { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; }
  .hues-col-hero__badge-line { width: 20px; height: 0.5px; background: var(--color-primary); }
  .hues-col-hero__badge-text {
    font-size: 9.5px; font-weight: 600; letter-spacing: 0.32em; text-transform: uppercase; color: var(--color-primary);
  }
  .hues-col-hero__title {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: clamp(40px, 8vw, 84px);
    font-weight: 300; line-height: 1.05;
    color: var(--color-on-surface);
    margin-bottom: 12px;
  }
  .hues-col-hero__title em { font-style: italic; color: var(--color-primary); font-weight: 300; }
  .hues-col-hero__subtitle {
    font-size: 15px; font-weight: 300; line-height: 1.7;
    color: var(--color-on-surface-variant);
    max-width: 440px; margin-bottom: 36px;
  }
  .hues-col-hero__btn-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; justify-content: center; }

  .hues-col-hero__btn-primary {
    padding: 13px 36px; border-radius: 40px;
    background: var(--color-primary); color: var(--color-on-primary);
    font-size: 10px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase;
    border: none; cursor: pointer;
    box-shadow: 0 10px 30px rgba(133, 76, 111, 0.18);
    transition: background 0.3s, transform 0.2s, box-shadow 0.3s;
  }
  .hues-col-hero__btn-primary:hover {
    background: var(--color-primary-container);
    transform: translateY(-2px);
    box-shadow: 0 12px 36px rgba(133, 76, 111, 0.25);
  }
  .hues-col-hero__btn-primary:active { transform: translateY(0); }

  .hues-col-hero__btn-outline {
    padding: 13px 36px; border-radius: 40px;
    border: 1px solid var(--color-outline);
    background: transparent; color: var(--color-on-surface);
    font-size: 10px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase;
    cursor: pointer;
    transition: background 0.3s, color 0.3s, border-color 0.3s, transform 0.2s;
  }
  .hues-col-hero__btn-outline:hover {
    background: var(--color-surface-container-high);
    border-color: var(--color-primary);
    color: var(--color-primary);
    transform: translateY(-2px);
  }

  .hues-col-hero__scroll-hint {
    position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%);
    display: flex; flex-direction: column; align-items: center; gap: 6px;
    opacity: 0.45; animation: bounce 2s infinite;
  }
  .hues-col-hero__scroll-line { width: 0.5px; height: 28px; background: var(--color-primary); }
  .hues-col-hero__scroll-text {
    font-size: 8.5px; tracking: 0.22em; text-transform: uppercase; color: var(--color-primary);
  }

  /* ── Marquee strip ── */
  .hues-col-marquee {
    overflow: hidden; background: var(--color-primary); py: 12px; height: 38px;
    display: flex; align-items: center;
  }
  .hues-col-marquee__track {
    display: flex; gap: 48px; whitespace-nowrap: nowrap;
    animation: huesMarquee 28s linear infinite;
  }
  .hues-col-marquee__item {
    font-size: 10px; font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase;
    color: var(--color-on-primary); display: flex; align-items: center;
  }
  .hues-col-marquee__sep { color: var(--color-primary-container); margin-left: 48px; }

  /* ── Tab Bar ── */
  .hues-col-tabs {
    position: sticky; top: 64px; z-index: 40;
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    background: color-mix(in srgb, var(--color-surface) 90%, transparent);
    border-bottom: 0.5px solid var(--color-outline-variant);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.02);
    transition: background 0.4s ease, border-color 0.4s ease;
  }
  .hues-col-tabs__inner {
    max-width: 1440px; margin: 0 auto;
    padding: 0 48px; display: flex; align-items: center; justify-content: space-between;
  }
  @media (max-width: 768px) {
    .hues-col-tabs__inner { padding: 0 20px; overflow-x: auto; gap: 16px; }
  }
  .hues-col-tabs__list { display: flex; align-items: center; }
  .hues-col-tabs__btn {
    position: relative;
    padding: 20px 24px;
    font-size: 11px; font-weight: 600;
    letter-spacing: 0.18em; text-transform: uppercase;
    color: var(--color-outline);
    background: transparent; border: none; cursor: pointer;
    transition: color 0.3s;
  }
  .hues-col-tabs__btn:hover { color: var(--color-primary); }
  .hues-col-tabs__btn--active { color: var(--color-primary); }
  .hues-col-tabs__btn--active::after {
    content: ''; position: absolute; bottom: 0; left: 0; right: 0;
    height: 1.5px; background: var(--color-primary); border-radius: 2px 2px 0 0;
  }
  .hues-col-tabs__divider { width: 0.5px; height: 16px; background: var(--color-outline-variant); margin: 0 12px; }
  .hues-col-tabs__actions { display: flex; align-items: center; gap: 8px; ml: auto; }
  
  .hues-col-tabs__action-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 18px; border-radius: 30px;
    border: 0.5px solid var(--color-outline);
    background: transparent; color: var(--color-outline);
    font-size: 10px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase;
    cursor: pointer; transition: all 0.25s;
  }
  .hues-col-tabs__action-btn:hover {
    background: var(--color-surface-container-high);
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  /* ── Editorial strip ── */
  .hues-col-editorial {
    position: relative; overflow: hidden;
    padding: 96px 48px;
    background: linear-gradient(135deg, var(--color-surface-container-low) 0%, var(--color-surface-container) 50%, var(--color-surface-container-high) 100%);
    border-top: 0.5px solid var(--color-outline-variant);
    transition: background 0.4s ease, border-color 0.4s ease;
  }
  @media (max-width: 768px) {
    .hues-col-editorial { padding: 64px 20px; }
  }
  .hues-col-editorial__watermark {
    pointer-events: none; position: absolute; top: 50%; right: -24px; transform: translateY(-50%);
    font-family: 'Cormorant Garamond', serif; font-size: clamp(200px, 30vw, 360px);
    color: var(--color-primary); opacity: 0.035; user-select: none; font-weight: 300;
  }
  .hues-col-editorial__inner {
    max-width: 1440px; margin: 0 auto;
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 80px; align-items: center; position: relative; z-index: 1;
  }
  @media (max-width: 900px) {
    .hues-col-editorial__inner { grid-template-columns: 1fr; gap: 48px; }
  }
  .hues-col-editorial__quote-box { display: flex; flex-direction: column; align-items: flex-start; }
  .hues-col-editorial__tag {
    font-size: 10px; font-weight: 600; letter-spacing: 0.28em; text-transform: uppercase;
    color: var(--color-primary); margin-bottom: 24px;
  }
  .hues-col-editorial__quote {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: clamp(24px, 3.5vw, 38px);
    font-weight: 300; line-height: 1.25; italic: italic;
    color: var(--color-on-surface); margin-bottom: 24px;
  }
  .hues-col-editorial__author-row { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
  .hues-col-editorial__author-line { width: 30px; height: 0.5px; background: var(--color-primary); }
  .hues-col-editorial__author-text {
    font-size: 9.5px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--color-outline);
  }
  .hues-col-editorial__desc {
    font-size: 14.5px; font-weight: 300; line-height: 1.7;
    color: var(--color-on-surface-variant); max-width: 420px; margin-bottom: 32px;
  }
  .hues-col-editorial__lookbook-btn {
    display: inline-flex; align-items: center; gap: 12px;
    padding: 14px 40px; border-radius: 40px;
    border: 1px solid var(--color-outline); background: transparent; color: var(--color-on-surface);
    font-size: 10px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase;
    cursor: pointer; transition: all 0.3s;
  }
  .hues-col-editorial__lookbook-btn:hover {
    background: var(--color-on-surface); color: var(--color-surface); border-color: var(--color-on-surface);
  }
  .hues-col-editorial__lookbook-btn svg { transition: transform 0.3s; }
  .hues-col-editorial__lookbook-btn:hover svg { transform: translateX(4px); }

  /* ── Newsletter Card ── */
  .hues-col-editorial__card {
    background: var(--color-surface);
    padding: 48px; border-radius: 20px;
    border: 0.5px solid var(--color-outline-variant);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.03);
    transition: background 0.4s ease, border-color 0.4s ease;
  }
  @media (max-width: 480px) {
    .hues-col-editorial__card { padding: 32px 20px; }
  }
  .hues-col-editorial__card-emoji { font-size: 32px; display: block; margin-bottom: 16px; }
  .hues-col-editorial__card-title {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 28px; font-weight: 400; color: var(--color-on-surface); margin-bottom: 8px;
  }
  .hues-col-editorial__card-desc {
    font-size: 14px; font-weight: 300; line-height: 1.6;
    color: var(--color-on-surface-variant); margin-bottom: 32px;
  }
  .hues-col-editorial__success { padding: 24px 0; text-align: center; }
  .hues-col-editorial__success-emoji { font-size: 28px; display: block; margin-bottom: 12px; }
  .hues-col-editorial__success-text {
    font-size: 13.5px; font-weight: 600; color: var(--color-primary); letter-spacing: 0.05em;
  }
  .hues-col-editorial__form { display: flex; flex-direction: column; gap: 16px; }
  .hues-col-editorial__input {
    width: 100%; bg: transparent; border: none; border-bottom: 0.5px solid var(--color-outline);
    padding: 12px 4px; font-size: 15px; background: transparent; color: var(--color-on-surface);
    outline: none; transition: border-color 0.3s;
  }
  .hues-col-editorial__input:focus { border-color: var(--color-primary); }
  .hues-col-editorial__submit-btn {
    width: 100%; padding: 14px; border-radius: 30px;
    background: var(--color-primary); color: var(--color-on-primary);
    font-size: 10.5px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase;
    border: none; cursor: pointer; transition: background 0.3s;
  }
  .hues-col-editorial__submit-btn:hover { background: var(--color-primary-container); }
  .hues-col-editorial__fine-print {
    font-size: 10px; color: var(--color-outline); text-align: center; margin-top: 4px;
  }

  /* ── Filter / Sort Panel ── */
  .hues-col-panel {
    max-width: 1440px; margin: 0 auto; padding: 16px 48px 0;
    animation: huesFadeUp 0.25s ease both;
  }
  @media (max-width: 768px) {
    .hues-col-panel { padding: 16px 20px 0; }
  }
  .hues-col-panel__inner {
    border: 0.5px solid var(--color-outline-variant); padding: 24px;
    border-radius: 12px; background: var(--color-surface-container-low);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.01);
  }
  .hues-col-panel__title {
    font-size: 11px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase;
    color: var(--color-primary); margin-bottom: 16px;
  }
  .hues-col-panel__row { display: flex; flex-wrap: wrap; gap: 8px; }
  
  .hues-col-panel__item-btn {
    padding: 7px 20px; border-radius: 30px;
    border: 0.5px solid var(--color-outline-variant);
    background: var(--color-surface); color: var(--color-on-surface-variant);
    font-size: 11px; font-weight: 500; cursor: pointer; transition: all 0.2s;
  }
  .hues-col-panel__item-btn:hover {
    background: var(--color-surface-container-high);
    border-color: var(--color-primary);
    color: var(--color-primary);
  }
`;

/* ─── CollectionLayout ────────────────────────────────────────────────── */
const CollectionLayout = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen,   setSortOpen]   = useState(false);

  const activeTab =
    tabs.find((t) => location.pathname.toLowerCase().includes(t.toLowerCase())) || "Dress";

  const handleTab = (tab) => navigate(`/collections/${tab.toLowerCase()}`);

  return (
    <div className="hues-col-root">
      <style>{KEYFRAMES}</style>

      <NavBar />

      {/* Hero */}
      <Hero activeTab={activeTab} />

      {/* Tab Bar */}
      <TabBar
        activeTab={activeTab}
        onTab={handleTab}
        onFilter={() => { setFilterOpen(f => !f); setSortOpen(false); }}
        onSort={() => { setSortOpen(s => !s); setFilterOpen(false); }}
      />

      {/* Filter / Sort Panels */}
      {filterOpen && (
        <div className="hues-col-panel">
          <div className="hues-col-panel__inner">
            <p className="hues-col-panel__title">Filter Options</p>
            <div className="hues-col-panel__row">
              {["XS","S","M","L","XL"].map(sz => (
                <button key={sz} className="hues-col-panel__item-btn">
                  {sz}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {sortOpen && (
        <div className="hues-col-panel">
          <div className="hues-col-panel__inner">
            <p className="hues-col-panel__title">Sort By</p>
            <div className="hues-col-panel__row">
              {["Newest","Price: Low–High","Price: High–Low","Best Sellers"].map(opt => (
                <button key={opt} className="hues-col-panel__item-btn">
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Page content via Outlet */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Editorial strip + newsletter */}
      <EditorialStrip />

      <Footer />
    </div>
  );
};

export default CollectionLayout;