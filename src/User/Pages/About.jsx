import { useState, useEffect, useRef } from "react";

// ── Replace with your actual imports ─────────────────────────────────────
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";

// ─────────────────────────────────────────────────────────────────────────

/* ── Fade-in on scroll hook ── */
function useFadeIn(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ── Animated counter ── */
function useCounter(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor(easeOut(progress) * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

// ── Global styles ─────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Jost:wght@200;300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: #fff8fa; }
  ::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, #854c6f, #c4a0b8); border-radius: 10px; }

  @keyframes aboutFadeUp {
    from { opacity:0; transform:translateY(28px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes aboutFadeLeft {
    from { opacity:0; transform:translateX(-32px); }
    to   { opacity:1; transform:translateX(0); }
  }
  @keyframes aboutFadeRight {
    from { opacity:0; transform:translateX(32px); }
    to   { opacity:1; transform:translateX(0); }
  }
  @keyframes aboutShimmer {
    0%   { background-position: -300% center; }
    100% { background-position: 300% center; }
  }
  @keyframes aboutPetalDrift {
    0%,100% { transform: translateY(0) rotate(0deg); opacity:0.12; }
    33%     { transform: translateY(-18px) rotate(14deg); opacity:0.22; }
    66%     { transform: translateY(-8px) rotate(-8deg); opacity:0.16; }
  }
  @keyframes aboutOrb {
    0%,100% { transform: translate(0,0) scale(1); }
    33%     { transform: translate(30px,-20px) scale(1.08); }
    66%     { transform: translate(-20px,15px) scale(0.95); }
  }
  @keyframes aboutPulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(133,76,111,0.3); }
    50%     { box-shadow: 0 0 0 12px rgba(133,76,111,0); }
  }
  @keyframes aboutLineGrow {
    from { width:0; }
    to   { width:80px; }
  }
  @keyframes aboutFloat {
    0%,100% { transform: translateY(0px) rotate(-1deg); }
    50%     { transform: translateY(-12px) rotate(1deg); }
  }
  @keyframes aboutMarquee {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  @keyframes aboutCardHover {
    from { transform: translateY(0); }
    to   { transform: translateY(-6px); }
  }
  @keyframes aboutSpinSlow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes aboutGlowPulse {
    0%,100% { opacity:0.4; }
    50%     { opacity:0.8; }
  }
  @keyframes aboutDotBounce {
    0%,100% { transform: scale(1); }
    50%     { transform: scale(1.5); }
  }

  .about-root {
    background: #fffbfc;
    color: #1f1a1d;
    font-family: 'Jost', sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* ── Decorative petal ── */
  .about-petal {
    position: absolute;
    pointer-events: none;
    font-size: 13px;
    color: #854c6f;
    opacity: 0.14;
    animation: aboutPetalDrift 10s ease-in-out infinite;
  }

  /* ── Orb blobs ── */
  .about-orb {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    filter: blur(80px);
    animation: aboutOrb 14s ease-in-out infinite;
  }

  /* ── Section labels ── */
  .about-eyebrow {
    display: inline-flex; align-items: center; gap: 10px;
    font-size: 9.5px; font-weight: 600; letter-spacing: 0.3em;
    text-transform: uppercase; color: #854c6f;
  }
  .about-eyebrow-line { width: 22px; height: 0.5px; background: #854c6f; }

  /* ── Hero ── */
  .about-hero {
    position: relative; overflow: hidden;
    padding: 160px 48px 120px;
    background: linear-gradient(160deg, #fff8fa 0%, #fce8f0 35%, #f0e4f2 65%, #fffbfc 100%);
    border-bottom: 0.5px solid rgba(212,180,192,0.3);
    text-align: center;
  }
  @media(max-width:768px){ .about-hero{ padding:120px 24px 80px; } }

  .about-hero__badge {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 8px 20px; border-radius: 40px;
    border: 0.5px solid rgba(133,76,111,0.25);
    background: rgba(255,255,255,0.7); backdrop-filter: blur(10px);
    font-size: 9.5px; font-weight: 600; letter-spacing: 0.28em; text-transform: uppercase;
    color: #854c6f; margin-bottom: 28px;
    animation: aboutFadeUp 0.6s ease both;
  }
  .about-hero__title {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: clamp(44px, 8vw, 88px);
    font-weight: 300; line-height: 1.07; color: #1f1a1d;
    margin-bottom: 12px;
    animation: aboutFadeUp 0.7s 0.1s ease both; opacity: 0;
    animation-fill-mode: forwards;
  }
  .about-hero__title em {
    font-style: italic; color: #854c6f;
    background: linear-gradient(90deg, #854c6f 0%, #c07fa5 40%, #9e5580 60%, #854c6f 100%);
    background-size: 200% auto;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: aboutShimmer 4s linear infinite;
  }
  .about-hero__divider {
    width: 0; height: 0.5px;
    background: linear-gradient(90deg, transparent, #854c6f, transparent);
    margin: 20px auto;
    animation: aboutLineGrow 1s 0.5s ease forwards;
  }
  .about-hero__subtitle {
    font-size: 17px; font-weight: 300; line-height: 1.78; color: #504349;
    max-width: 580px; margin: 0 auto 36px;
    animation: aboutFadeUp 0.7s 0.2s ease both; opacity: 0;
    animation-fill-mode: forwards;
  }
  .about-hero__btns {
    display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;
    animation: aboutFadeUp 0.7s 0.3s ease both; opacity: 0;
    animation-fill-mode: forwards;
  }
  .about-hero__btn-primary {
    padding: 14px 40px; border-radius: 40px;
    background: #1f1a1d; color: #fff8f8;
    font-size: 10.5px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase;
    border: none; cursor: pointer; transition: all 0.3s; font-family: 'Jost', sans-serif;
    box-shadow: 0 8px 28px rgba(31,26,29,0.18);
  }
  .about-hero__btn-primary:hover { background: #854c6f; transform: translateY(-2px); box-shadow: 0 14px 36px rgba(133,76,111,0.3); }

  .about-hero__btn-outline {
    padding: 14px 40px; border-radius: 40px;
    border: 1px solid rgba(31,26,29,0.25); background: transparent; color: #1f1a1d;
    font-size: 10.5px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase;
    cursor: pointer; transition: all 0.3s; font-family: 'Jost', sans-serif;
  }
  .about-hero__btn-outline:hover { border-color: #854c6f; color: #854c6f; background: #fce8f0; transform: translateY(-2px); }

  /* ── Marquee strip ── */
  .about-marquee {
    overflow: hidden; height: 42px;
    display: flex; align-items: center;
    background: #1f1a1d;
  }
  .about-marquee__track {
    display: flex; gap: 0; white-space: nowrap;
    animation: aboutMarquee 28s linear infinite;
  }
  .about-marquee__item {
    display: flex; align-items: center; gap: 0;
    font-size: 9.5px; font-weight: 600; letter-spacing: 0.24em; text-transform: uppercase;
    color: rgba(255,251,252,0.7); padding: 0 32px;
  }
  .about-marquee__dot {
    width: 3px; height: 3px; border-radius: 50%;
    background: #854c6f; margin-left: 32px; flex-shrink: 0;
  }

  /* ── Editorial split ── */
  .about-editorial {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 80px; align-items: center;
    padding: 96px 80px; max-width: 1440px; margin: 0 auto;
  }
  @media(max-width:900px){ .about-editorial{ grid-template-columns:1fr; gap:48px; padding:60px 24px; } }

  .about-editorial__img-wrap {
    position: relative; border-radius: 16px; overflow: hidden;
    box-shadow: 0 24px 80px rgba(133,76,111,0.16);
  }
  .about-editorial__img {
    width: 100%; height: 620px; object-fit: cover; display: block;
    transition: transform 0.9s cubic-bezier(0.25,0.46,0.45,0.94);
  }
  .about-editorial__img-wrap:hover .about-editorial__img { transform: scale(1.06); }
  .about-editorial__img-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(31,26,29,0.45) 0%, transparent 60%);
  }
  .about-editorial__img-tag {
    position: absolute; bottom: 20px; left: 20px;
    display: inline-flex; align-items: center; gap: 8px;
    padding: 8px 16px; border-radius: 40px;
    background: rgba(255,255,255,0.92); backdrop-filter: blur(8px);
    font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #1f1a1d;
  }
  .about-editorial__img-count {
    position: absolute; top: 20px; right: 20px;
    width: 56px; height: 56px; border-radius: 50%;
    background: rgba(255,255,255,0.88); backdrop-filter: blur(8px);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    font-size: 18px; font-weight: 300; color: #854c6f;
    font-family: 'Cormorant Garamond', serif;
    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  }
  .about-editorial__img-count span { font-size: 7px; font-family: 'Jost', sans-serif; font-weight: 600; letter-spacing: 0.1em; color: #82737a; }

  .about-editorial__content { display: flex; flex-direction: column; gap: 0; }
  .about-editorial__title {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: clamp(32px, 4.5vw, 54px); font-weight: 400; color: #1f1a1d;
    line-height: 1.12; margin-bottom: 20px;
  }
  .about-editorial__title em { font-style: italic; color: #854c6f; }
  .about-editorial__body {
    font-size: 15px; font-weight: 300; line-height: 1.82; color: #504349;
    margin-bottom: 28px;
  }
  .about-editorial__artisans {
    display: flex; align-items: center; gap: 14px;
    padding: 18px 22px; border-radius: 14px;
    background: linear-gradient(135deg, #fce8f0, #f7ebee);
    border: 0.5px solid rgba(212,180,192,0.4);
    margin-bottom: 28px;
  }
  .about-editorial__artisan-avatars { display: flex; }
  .about-editorial__artisan-avatar {
    width: 34px; height: 34px; border-radius: 50%;
    background: linear-gradient(135deg, #e8a4b8, #c4b3d8);
    border: 2px solid #fffbfc;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; margin-left: -8px;
  }
  .about-editorial__artisan-avatar:first-child { margin-left: 0; }
  .about-editorial__artisan-text { font-size: 13px; color: #504349; font-weight: 400; }
  .about-editorial__artisan-text strong { color: #1f1a1d; font-weight: 600; }

  .about-editorial__cta {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 14px 36px; border-radius: 40px;
    border: 1px solid rgba(31,26,29,0.2); background: transparent; color: #1f1a1d;
    font-size: 10.5px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase;
    cursor: pointer; transition: all 0.3s; font-family: 'Jost', sans-serif; align-self: flex-start;
  }
  .about-editorial__cta:hover { background: #1f1a1d; color: #fff; border-color: #1f1a1d; }
  .about-editorial__cta svg { transition: transform 0.3s; }
  .about-editorial__cta:hover svg { transform: translateX(4px); }

  /* ── Stats ── */
  .about-stats {
    background: linear-gradient(135deg, #1f1a1d 0%, #2d2428 50%, #1f1a1d 100%);
    padding: 72px 48px; position: relative; overflow: hidden;
  }
  .about-stats__inner {
    max-width: 1200px; margin: 0 auto;
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 2px;
  }
  @media(max-width:768px){ .about-stats__inner{ grid-template-columns:repeat(2,1fr); } }

  .about-stats__item {
    display: flex; flex-direction: column; align-items: center;
    padding: 36px 24px; text-align: center;
    border-right: 0.5px solid rgba(255,255,255,0.07);
    cursor: default; transition: background 0.3s;
    position: relative; overflow: hidden;
  }
  .about-stats__item:last-child { border-right: none; }
  .about-stats__item:hover { background: rgba(133,76,111,0.1); }
  .about-stats__icon { font-size: 26px; margin-bottom: 14px; opacity: 0.85; }
  .about-stats__num {
    font-family: 'Cormorant Garamond', serif;
    font-size: 52px; font-weight: 300; color: #fff8f8;
    line-height: 1; margin-bottom: 6px;
  }
  .about-stats__accent { color: #c07fa5; }
  .about-stats__label {
    font-size: 9.5px; font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase;
    color: rgba(255,255,255,0.45);
  }

  /* ── Values ── */
  .about-values {
    padding: 96px 80px; max-width: 1440px; margin: 0 auto;
  }
  @media(max-width:768px){ .about-values{ padding:60px 24px; } }
  .about-values__header { text-align: center; margin-bottom: 64px; }
  .about-values__title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(34px,5vw,54px); font-weight: 400; color: #1f1a1d;
    margin-top: 12px; margin-bottom: 0;
  }
  .about-values__grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px;
  }
  @media(max-width:900px){ .about-values__grid{ grid-template-columns:1fr; } }

  .about-value-card {
    padding: 44px 36px; border-radius: 18px; position: relative; overflow: hidden;
    border: 0.5px solid rgba(212,180,192,0.35);
    background: #fffbfc;
    box-shadow: 0 4px 24px rgba(133,76,111,0.06);
    transition: all 0.45s cubic-bezier(0.25,0.46,0.45,0.94);
    cursor: default;
  }
  .about-value-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 56px rgba(133,76,111,0.15);
    border-color: rgba(133,76,111,0.3);
  }
  .about-value-card__glow {
    position: absolute; top: -60px; right: -60px;
    width: 160px; height: 160px; border-radius: 50%;
    opacity: 0; transition: opacity 0.45s;
    pointer-events: none;
  }
  .about-value-card:hover .about-value-card__glow { opacity: 1; }
  .about-value-card__number {
    font-family: 'Cormorant Garamond', serif;
    font-size: 72px; font-weight: 300; color: rgba(133,76,111,0.08);
    position: absolute; top: 10px; right: 20px; line-height: 1;
    transition: color 0.45s;
  }
  .about-value-card:hover .about-value-card__number { color: rgba(133,76,111,0.14); }
  .about-value-card__icon {
    width: 52px; height: 52px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 22px; transition: transform 0.3s;
    font-size: 22px;
  }
  .about-value-card:hover .about-value-card__icon { transform: scale(1.1) rotate(-4deg); }
  .about-value-card__title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 26px; font-weight: 500; color: #1f1a1d;
    margin-bottom: 12px; line-height: 1.2;
  }
  .about-value-card__body {
    font-size: 14px; font-weight: 300; line-height: 1.8; color: #504349;
    margin-bottom: 20px;
  }
  .about-value-card__link {
    font-size: 10px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase;
    color: #854c6f; opacity: 0; transition: opacity 0.3s;
    display: inline-flex; align-items: center; gap: 6px;
    background: none; border: none; cursor: pointer; font-family: 'Jost', sans-serif; padding: 0;
  }
  .about-value-card:hover .about-value-card__link { opacity: 1; }

  /* ── Texture / process section ── */
  .about-texture {
    background: linear-gradient(135deg, #fce8f0 0%, #f7ebee 40%, #ede0ea 100%);
    padding: 96px 80px;
    border-top: 0.5px solid rgba(212,180,192,0.3);
    border-bottom: 0.5px solid rgba(212,180,192,0.3);
    position: relative; overflow: hidden;
  }
  @media(max-width:768px){ .about-texture{ padding:60px 24px; } }
  .about-texture__inner {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 80px; align-items: center;
    max-width: 1440px; margin: 0 auto;
  }
  @media(max-width:900px){ .about-texture__inner{ grid-template-columns:1fr; gap:48px; } }

  .about-texture__title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(42px,6vw,74px); font-weight: 300; color: #1f1a1d;
    line-height: 1.07; margin-bottom: 20px;
  }
  .about-texture__title em { font-style: italic; color: #854c6f; }
  .about-texture__body {
    font-size: 15px; font-weight: 300; line-height: 1.82; color: #504349;
    margin-bottom: 28px; max-width: 440px;
  }
  .about-texture__blockquote {
    border-left: 2px solid #854c6f; padding-left: 22px;
    margin: 0 0 28px;
  }
  .about-texture__quote {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px; font-style: italic; font-weight: 300; color: #1f1a1d;
    line-height: 1.5; margin-bottom: 8px;
  }
  .about-texture__quote-attr {
    font-size: 11px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: #82737a;
  }
  .about-texture__img-wrap {
    position: relative; border-radius: 16px; overflow: hidden;
    box-shadow: 0 24px 80px rgba(133,76,111,0.14);
    animation: aboutFloat 7s ease-in-out infinite;
  }
  .about-texture__img {
    width: 100%; height: 560px; object-fit: cover; display: block;
    transition: transform 0.8s ease;
  }
  .about-texture__img-wrap:hover .about-texture__img { transform: scale(1.05); }
  .about-texture__img-badge {
    position: absolute; top: 20px; left: 20px;
    padding: 8px 18px; border-radius: 40px;
    background: rgba(255,255,255,0.9); backdrop-filter: blur(8px);
    font-size: 9.5px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: #854c6f;
  }

  /* ── Process steps ── */
  .about-process {
    padding: 96px 80px; max-width: 1440px; margin: 0 auto;
  }
  @media(max-width:768px){ .about-process{ padding:60px 24px; } }
  .about-process__steps { display: flex; flex-direction: column; gap: 0; position: relative; }
  .about-process__steps::before {
    content: ''; position: absolute; left: 26px; top: 0; bottom: 0;
    width: 1px; background: linear-gradient(to bottom, #854c6f, rgba(133,76,111,0.1));
  }
  .about-process__step {
    display: flex; gap: 32px; align-items: flex-start;
    padding: 32px 0; border-bottom: 0.5px solid rgba(212,180,192,0.25);
    cursor: default; transition: background 0.3s;
  }
  .about-process__step:last-child { border-bottom: none; }
  .about-process__step-num {
    width: 52px; height: 52px; border-radius: 50%; flex-shrink: 0;
    background: linear-gradient(135deg, #fce8f0, #f7ebee);
    border: 1px solid rgba(133,76,111,0.25);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 400; color: #854c6f;
    transition: all 0.3s; z-index: 1; position: relative;
  }
  .about-process__step:hover .about-process__step-num {
    background: #854c6f; color: #fff;
    box-shadow: 0 0 0 8px rgba(133,76,111,0.1);
  }
  .about-process__step-content { flex: 1; padding-top: 10px; }
  .about-process__step-title {
    font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 500; color: #1f1a1d;
    margin-bottom: 8px;
  }
  .about-process__step-body {
    font-size: 14px; font-weight: 300; line-height: 1.75; color: #504349;
  }

  /* ── Manifesto ── */
  .about-manifesto {
    position: relative; overflow: hidden;
    padding: 120px 48px; text-align: center;
    background: linear-gradient(160deg, #1f1a1d 0%, #2d2428 40%, #1a151b 100%);
  }
  .about-manifesto__inner { max-width: 720px; margin: 0 auto; position: relative; z-index: 1; }
  .about-manifesto__decor {
    display: flex; justify-content: center; gap: 10px; margin-bottom: 32px;
  }
  .about-manifesto__decor-dot {
    width: 6px; height: 6px; border-radius: 50%; background: #854c6f;
    animation: aboutDotBounce 2s ease-in-out infinite;
  }
  .about-manifesto__title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(36px,6vw,72px); font-weight: 300;
    color: #fff8f8; line-height: 1.1; margin-bottom: 20px;
  }
  .about-manifesto__title em { font-style: italic; color: #c07fa5; }
  .about-manifesto__line {
    width: 0; height: 0.5px; background: linear-gradient(90deg, transparent, #c07fa5, transparent);
    margin: 24px auto; animation: aboutLineGrow 1.2s 0.4s ease forwards;
  }
  .about-manifesto__body {
    font-size: 16px; font-weight: 300; line-height: 1.85; color: rgba(255,251,252,0.65);
    margin-bottom: 40px;
  }
  .about-manifesto__cta {
    padding: 15px 48px; border-radius: 40px;
    border: 1px solid rgba(192,127,165,0.5); background: transparent;
    color: #c07fa5; font-size: 10.5px; font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase;
    cursor: pointer; transition: all 0.3s; font-family: 'Jost', sans-serif;
    animation: aboutPulse 2.8s ease-in-out infinite;
  }
  .about-manifesto__cta:hover { background: #854c6f; color: #fff; border-color: #854c6f; animation: none; }

  /* ── Team strip ── */
  .about-team {
    padding: 96px 80px; max-width: 1440px; margin: 0 auto;
  }
  @media(max-width:768px){ .about-team{ padding:60px 24px; } }
  .about-team__grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 32px; margin-top: 56px; }
  @media(max-width:768px){ .about-team__grid{ grid-template-columns:1fr; } }

  .about-team-card {
    border-radius: 16px; overflow: hidden;
    border: 0.5px solid rgba(212,180,192,0.3);
    background: #fffbfc;
    box-shadow: 0 4px 20px rgba(133,76,111,0.06);
    transition: all 0.4s; cursor: default;
  }
  .about-team-card:hover { transform: translateY(-6px); box-shadow: 0 20px 52px rgba(133,76,111,0.14); }
  .about-team-card__img {
    width: 100%; height: 300px; object-fit: cover; display: block;
    transition: transform 0.7s; filter: saturate(0.9);
  }
  .about-team-card:hover .about-team-card__img { transform: scale(1.04); filter: saturate(1.1); }
  .about-team-card__info { padding: 22px 24px; }
  .about-team-card__role {
    font-size: 9.5px; font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase;
    color: #854c6f; margin-bottom: 6px;
  }
  .about-team-card__name {
    font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 400; color: #1f1a1d;
    margin-bottom: 8px;
  }
  .about-team-card__bio {
    font-size: 13px; font-weight: 300; line-height: 1.7; color: #82737a;
  }
`;

// ── Data ─────────────────────────────────────────────────────────────────
const VALUES = [
  {
    icon: "🌿", glow: "rgba(106,173,169,0.15)",
    iconBg: "linear-gradient(135deg,#e8f5f4,#d4eeec)",
    num: "01",
    title: "Sustainability",
    body: "Ethical sourcing isn't a goal — it's our foundation. We partner with heritage mills that prioritize low-impact production and regenerative practices to protect our shared landscape.",
  },
  {
    icon: "✦", glow: "rgba(133,76,111,0.15)",
    iconBg: "linear-gradient(135deg,#fce8f0,#f2d4e4)",
    num: "02",
    title: "Craftsmanship",
    body: "We celebrate the human touch. From hand-rolled hems to custom-dyed fibers, our designs are brought to life by artisans who have spent generations perfecting their craft.",
  },
  {
    icon: "◈", glow: "rgba(196,179,216,0.2)",
    iconBg: "linear-gradient(135deg,#f2edf8,#e4d8f2)",
    num: "03",
    title: "Individuality",
    body: "Elegance is personal. Our collections are designed to be interpreted by you — offering a canvas for self-expression that transcends fleeting seasonal trends.",
  },
];

const STATS = [
  { num: 2018, suffix: "", label: "Founded" },
  { num: 47,   suffix: "+", label: "Artisan Partners" },
  { num: 12,   suffix: "",  label: "Collections" },
  { num: 98,   suffix: "%", label: "Ethically Sourced" },
];

const PROCESS_STEPS = [
  {
    title: "Concept & Inspiration",
    body: "Each collection begins with a mood — an emotion translated into colour, texture, and form. Our design team sources inspiration from art, nature, and the movement of everyday life.",
  },
  {
    title: "Material Curation",
    body: "We travel to heritage mills across the world to select fabrics that meet our exacting standards. Every fibre is chosen for its hand-feel, drape, and longevity.",
  },
  {
    title: "Artisanal Construction",
    body: "Our atelier artisans bring the design to life — hand-stitching, embroidering, and pressing each garment with decades of inherited knowledge and quiet pride.",
  },
  {
    title: "Quality & Story",
    body: "Before a piece reaches you, it passes through 28 quality checkpoints. Each garment ships with a handwritten note from the artisan who made it — a small intimacy we never skip.",
  },
];

const TEAM = [
  {
    img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80",
    role: "Creative Director",
    name: "Nithya Ashan",
    bio: "Former head designer at Maison Margiela, Nithya brings 14 years of European couture sensibility to HUES.",
  },
  {
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80",
    role: "Head of Atelier",
    name: "Priya Menon",
    bio: "Third-generation embroiderer from Jaipur. Priya leads 47 artisans with an extraordinary eye for intricate detail.",
  },
  {
    img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80",
    role: "Sustainability Lead",
    name: "Amara De Silva",
    bio: "Environmental science graduate turned fashion activist. Amara ensures every process meets our strict ethical charter.",
  },
];

// ── Stat Item ─────────────────────────────────────────────────────────────
function StatItem({ icon, num, suffix, label, start }) {
  const count = useCounter(num, 2000, start);
  return (
    <div className="about-stats__item">
      <span className="about-stats__icon">{icon}</span>
      <span className="about-stats__num">
        {count}<span className="about-stats__accent">{suffix}</span>
      </span>
      <span className="about-stats__label">{label}</span>
    </div>
  );
}

// ── Value Card ────────────────────────────────────────────────────────────
function ValueCard({ v, i, visible }) {
  return (
    <div
      className="about-value-card"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(36px)",
        transition: `opacity 0.8s ${i * 0.15}s ease, transform 0.8s ${i * 0.15}s ease`,
      }}
    >
      <div className="about-value-card__glow" style={{ background: `radial-gradient(circle, ${v.glow} 0%, transparent 70%)` }} />
      <span className="about-value-card__number">{v.num}</span>
      <div className="about-value-card__icon" style={{ background: v.iconBg }}>
        {v.icon}
      </div>
      <h3 className="about-value-card__title">{v.title}</h3>
      <p className="about-value-card__body">{v.body}</p>
      <button className="about-value-card__link">
        Learn more
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </button>
    </div>
  );
}

// ── Sections ──────────────────────────────────────────────────────────────

function HeroSection() {
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  useEffect(() => {
    const fn = (e) => setMouse({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, []);

  return (
    <section className="about-hero">
      {/* Orb blobs */}
      <div className="about-orb" style={{
        width:520, height:520, top:-160, right:-120,
        background: "radial-gradient(circle, rgba(133,76,111,0.12) 0%, transparent 70%)",
        transform: `translate(${mouse.x * 28}px, ${mouse.y * 28}px)`,
        transition: "transform 0.5s ease",
      }} />
      <div className="about-orb" style={{
        width:400, height:400, bottom:-120, left:-100,
        background: "radial-gradient(circle, rgba(232,164,184,0.14) 0%, transparent 70%)",
        transform: `translate(${-mouse.x * 20}px, ${-mouse.y * 20}px)`,
        transition: "transform 0.5s ease",
      }} />

      {/* Petals */}
      <span className="about-petal" style={{ top:"22%", left:"7%", animationDelay:"0s" }}>✿</span>
      <span className="about-petal" style={{ top:"38%", right:"8%", animationDelay:"3s" }}>❀</span>
      <span className="about-petal" style={{ bottom:"24%", left:"13%", animationDelay:"6s" }}>✾</span>
      <span className="about-petal" style={{ bottom:"18%", right:"14%", animationDelay:"1.5s" }}>✿</span>

      {/* Badge */}
      <div className="about-hero__badge">
        <span>✨</span> Established 2024
      </div>

      {/* Title */}
      <h1 className="about-hero__title">
        Artistry in every thread,
        <br />
        <em>elegance in every movement.</em>
      </h1>

      {/* Divider line */}
      <div className="about-hero__divider" />

      {/* Subtitle */}
      <p className="about-hero__subtitle">
        HUES was founded on a singular vision: to redefine contemporary luxury through the lens of movement and texture.
        We believe a garment is more than an object — it is a narrative of grace.
      </p>

      {/* CTAs */}
      <div className="about-hero__btns">
        <button className="about-hero__btn-primary">Discover Our Story</button>
        <button className="about-hero__btn-outline">Watch Film ▶</button>
      </div>
    </section>
  );
}

function MarqueeStrip() {
  const items = [
    "Slow Luxury", "Timeless Design", "Handcrafted in Sri Lanka",
    "Ethically Sourced", "Season 2025", "The Atelier Collection",
  ];
  return (
    <div className="about-marquee">
      <div className="about-marquee__track">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="about-marquee__item">
            {item}
            <span className="about-marquee__dot" />
          </span>
        ))}
      </div>
    </div>
  );
}

function EditorialSplit() {
  const [ref, visible] = useFadeIn();
  return (
    <div ref={ref} className="about-editorial">
      {/* Image */}
      <div
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateX(0)" : "translateX(-32px)",
          transition: "opacity 0.9s ease, transform 0.9s ease",
        }}
      >
        <div className="about-editorial__img-wrap">
          <img
            src="https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80"
            alt="Elegance in movement"
            className="about-editorial__img"
          />
          <div className="about-editorial__img-overlay" />
          <div className="about-editorial__img-tag">📸 The Silk Archive</div>
          <div className="about-editorial__img-count">
            47
            <span>artisans</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className="about-editorial__content"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateX(0)" : "translateX(32px)",
          transition: "opacity 0.9s 0.15s ease, transform 0.9s 0.15s ease",
        }}
      >
        <div className="about-eyebrow" style={{ marginBottom:20 }}>
          <span className="about-eyebrow-line" />
          The Legacy
        </div>

        <h2 className="about-editorial__title">
          The Handcrafted
          <br /><em>Legacy</em>
        </h2>

        <p className="about-editorial__body">
          Our atelier is a sanctuary where time-honored techniques meet modern silhouettes.
          Every stitch is placed with intention, ensuring that each HUES piece carries the weight
          of history and the lightness of innovation. We do not chase trends — we craft permanence.
        </p>

        <div className="about-editorial__artisans">
          <div className="about-editorial__artisan-avatars">
            {[].map((e, i) => (
              <div key={i} className="about-editorial__artisan-avatar" style={{ marginLeft: i === 0 ? 0 : -8 }}>
                {e}
              </div>
            ))}
          </div>
          <p className="about-editorial__artisan-text">
            <strong>+47 master artisans</strong> across South Asia bring each piece to life
          </p>
        </div>

        <button className="about-editorial__cta">
          Discover The Process
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

function StatsBar() {
  const [ref, visible] = useFadeIn();
  return (
    <section className="about-stats">
      {/* Background orbs */}
      <div className="about-orb" style={{ width:300, height:300, top:-80, right:-60, background:"radial-gradient(circle,rgba(133,76,111,0.15) 0%,transparent 70%)", animation:"aboutOrb 18s ease-in-out infinite" }} />
      <div className="about-orb" style={{ width:200, height:200, bottom:-60, left:80, background:"radial-gradient(circle,rgba(192,127,165,0.12) 0%,transparent 70%)", animation:"aboutOrb 14s ease-in-out infinite 3s" }} />

      <div
        ref={ref}
        className="about-stats__inner"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.8s ease, transform 0.8s ease",
        }}
      >
        {STATS.map((s) => (
          <StatItem key={s.label} {...s} start={visible} />
        ))}
      </div>
    </section>
  );
}

function ValuesSection() {
  const [ref, visible] = useFadeIn();
  return (
    <div ref={ref} className="about-values">
      <div className="about-values__header">
        <div className="about-eyebrow" style={{ justifyContent:"center" }}>
          <span className="about-eyebrow-line" />
          What We Stand For
          <span className="about-eyebrow-line" />
        </div>
        <h2 className="about-values__title">Our Guiding Principles</h2>
      </div>
      <div className="about-values__grid">
        {VALUES.map((v, i) => <ValueCard key={v.title} v={v} i={i} visible={visible} />)}
      </div>
    </div>
  );
}

function TextureSection() {
  const [ref, visible] = useFadeIn();
  return (
    <section className="about-texture">
      <span className="about-petal" style={{ top:"15%", right:"6%", fontSize:16, animationDelay:"2s" }}>✿</span>
      <span className="about-petal" style={{ bottom:"20%", left:"4%", fontSize:11, animationDelay:"5s" }}>❀</span>
      <div ref={ref} className="about-texture__inner">
        <div style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateX(0)" : "translateX(-32px)",
          transition: "opacity 0.9s ease, transform 0.9s ease",
        }}>
          <div className="about-eyebrow" style={{ marginBottom:20 }}>
            <span className="about-eyebrow-line" /> Tactile Beauty
          </div>
          <h2 className="about-texture__title">
            Defined by<br /><em>Texture.</em>
          </h2>
          <p className="about-texture__body">
            We believe the way a fabric feels against the skin is as important as the way it catches the light.
            Our tactile approach creates an intimate connection between wearer and garment — one that deepens with every wear.
          </p>
          <div className="about-texture__blockquote">
            <p className="about-texture__quote">
              "Luxury is the ease of a t-shirt in a very expensive dress."
            </p>
            <span className="about-texture__quote-attr">— Karl Lagerfeld</span>
          </div>
        </div>

        <div style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateX(0)" : "translateX(32px)",
          transition: "opacity 0.9s 0.15s ease, transform 0.9s 0.15s ease",
        }}>
          <div className="about-texture__img-wrap">
            <img
              src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80"
              alt="Textural beauty"
              className="about-texture__img"
            />
            <div className="about-texture__img-badge">Tactile Luxury</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  const [ref, visible] = useFadeIn();
  return (
    <div ref={ref} className="about-process">
      <div className="about-eyebrow" style={{ marginBottom:14 }}>
        <span className="about-eyebrow-line" /> How We Create
      </div>
      <h2 style={{
        fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(34px,5vw,54px)",
        fontWeight:400, color:"#1f1a1d", marginBottom:52,
        opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.8s ease, transform 0.8s ease",
      }}>
        The Making of a HUES Piece
      </h2>
      <div className="about-process__steps">
        {PROCESS_STEPS.map((step, i) => (
          <div
            key={step.title}
            className="about-process__step"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateX(0)" : "translateX(-20px)",
              transition: `opacity 0.7s ${i * 0.12}s ease, transform 0.7s ${i * 0.12}s ease`,
            }}
          >
            <div className="about-process__step-num">{i + 1}</div>
            <div className="about-process__step-content">
              <h3 className="about-process__step-title">{step.title}</h3>
              <p className="about-process__step-body">{step.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamSection() {
  const [ref, visible] = useFadeIn();
  return (
    <section style={{ background:"linear-gradient(135deg,#fff8fa,#fce8f0)", borderTop:"0.5px solid rgba(212,180,192,0.3)", borderBottom:"0.5px solid rgba(212,180,192,0.3)" }}>
      <div ref={ref} className="about-team">
        <div className="about-eyebrow" style={{ marginBottom:12 }}>
          <span className="about-eyebrow-line" /> The Makers
        </div>
        <h2 style={{
          fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(34px,5vw,54px)",
          fontWeight:400, color:"#1f1a1d",
          opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.8s ease, transform 0.8s ease",
        }}>
          The Minds Behind HUES
        </h2>
        <div className="about-team__grid">
          {TEAM.map((member, i) => (
            <div
              key={member.name}
              className="about-team-card"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(32px)",
                transition: `opacity 0.8s ${i * 0.15}s ease, transform 0.8s ${i * 0.15}s ease`,
              }}
            >
              <div style={{ overflow:"hidden" }}>
                <img src={member.img} alt={member.name} className="about-team-card__img" />
              </div>
              <div className="about-team-card__info">
                <p className="about-team-card__role">{member.role}</p>
                <h3 className="about-team-card__name">{member.name}</h3>
                <p className="about-team-card__bio">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Manifesto() {
  const [ref, visible] = useFadeIn();
  return (
    <section className="about-manifesto">
      {/* Bg orbs */}
      <div className="about-orb" style={{ width:500, height:500, top:-150, left:"50%", transform:"translateX(-50%)", background:"radial-gradient(circle,rgba(133,76,111,0.18) 0%,transparent 70%)", animation:"aboutGlowPulse 4s ease-in-out infinite" }} />

      <div
        ref={ref}
        className="about-manifesto__inner"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(32px)",
          transition: "opacity 0.9s ease, transform 0.9s ease",
        }}
      >
        <div className="about-manifesto__decor">
          {[0, 0.3, 0.6].map((delay, i) => (
            <div key={i} className="about-manifesto__decor-dot" style={{ animationDelay:`${delay}s` }} />
          ))}
        </div>

        <div style={{ marginBottom:24 }}>
          <div className="about-eyebrow" style={{ justifyContent:"center", color:"rgba(192,127,165,0.8)" }}>
            <span style={{ width:22, height:"0.5px", background:"#c07fa5", display:"inline-block" }} />
            Our Manifesto
            <span style={{ width:22, height:"0.5px", background:"#c07fa5", display:"inline-block" }} />
          </div>
        </div>

        <h2 className="about-manifesto__title">
          HUES exists for those<br />
          who find power in <em>subtlety.</em>
        </h2>

        <div className="about-manifesto__line" />

        <p className="about-manifesto__body">
          For the quiet moments and the grand entrances. For the woman who moves through the world
          with intention and leaves a trace of beauty behind her. We are dedicated to the longevity of design
          and the enduring spirit of elegance — in every thread, in every choice, in every HUES piece.
        </p>

        <button className="about-manifesto__cta">
          Explore the Collection
        </button>
      </div>
    </section>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────
export default function About() {
  return (
    <div className="about-root">
      <style>{STYLES}</style>
      <NavBar />
      <main>
        <HeroSection />
        <MarqueeStrip />
        <EditorialSplit />
        <StatsBar />
        <ValuesSection />
        <TextureSection />
        <ProcessSection />
        <TeamSection />
        <Manifesto />
      </main>
      <Footer />
    </div>
  );
}