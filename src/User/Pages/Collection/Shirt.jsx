import { useState } from "react";
import QuickView from "./QuickView";

// ── Replace with your actual image imports ────────────────────────────────
import shirtMain from "../../../assets/images/shirts/bow-print/main.png";
import shirt1    from "../../../assets/images/shirts/bow-print/1.png";
import shirt2    from "../../../assets/images/shirts/bow-print/2.png";
import shirt3    from "../../../assets/images/shirts/bow-print/3.png";
import shirt4    from "../../../assets/images/shirts/bow-print/4.png";

// ─────────────────────────────────────────────────────────────────────────
const shirtProducts = [
  {
    id: 1,
    name: "Bow Print Long Sleeve Crop Shirt",
    subtitle: "Ivory Blossom · Lightweight Cotton",
    collection: "The Atelier Collection",
    price: "Rs. 4,250.00",
    originalPrice: "Rs. 5,100.00",
    badge: "New Arrival",
    badgeColor: "#854c6f",
    cover: shirtMain,
    images: [shirtMain, shirt1, shirt2, shirt3, shirt4],
    description:
      "A sculpted crop shirt with a delicate bow print and extended cuffs. Crafted from breathable cotton, it blends playful romance with modern tailoring.",
    details: [
      "Lightweight cotton with soft drape",
      "Subtle bow print detail",
      "Button-front closure",
      "Structured collar with elongation",
      "Versatile crop silhouette",
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Ivory Blossom", hex: "#f5ede0" },
      { name: "Rosé Petal",    hex: "#e8a4b8" },
      { name: "Lavender Haze", hex: "#c4b3d8" },
      { name: "Sage Green",    hex: "#a8c5a0" },
    ],
    rating: 4.8,
    reviews: 26,
  },
];

// ── Global styles & keyframes ─────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500;600;700&display=swap');

  @keyframes shirtFadeUp {
    from { opacity:0; transform:translateY(22px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes shirtModalIn {
    from { opacity:0; transform:scale(0.95) translateY(16px); }
    to   { opacity:1; transform:scale(1) translateY(0); }
  }
  @keyframes shirtOverlayIn {
    from { opacity:0; }
    to   { opacity:1; }
  }
  @keyframes shirtShimmer {
    0%   { background-position:-200% center; }
    100% { background-position:200% center; }
  }
  @keyframes shirtHeartPop {
    0%  { transform:scale(1); }
    40% { transform:scale(1.45); }
    100%{ transform:scale(1); }
  }
  @keyframes shirtPetal {
    0%,100% { transform:translateY(0) rotate(0deg); opacity:0.13; }
    50%      { transform:translateY(-14px) rotate(18deg); opacity:0.22; }
  }
  @keyframes shirtToastIn {
    from { transform:translateX(120%); opacity:0; }
    to   { transform:translateX(0);    opacity:1; }
  }
  @keyframes shirtPulse {
    0%,100% { box-shadow:0 0 0 0 rgba(133,76,111,0.35); }
    50%     { box-shadow:0 0 0 8px rgba(133,76,111,0); }
  }
  @keyframes shirtFloat {
    0%,100% { transform:translateY(0); }
    50%     { transform:translateY(-6px); }
  }

  .shirt-root { font-family:'Jost',sans-serif; background:#fffbfc; position:relative; }

  /* ── Stars ── */
  .shirt-star-on  { color:#e8a4b8; font-size:12px; }
  .shirt-star-off { color:#e0d0d6; font-size:12px; }

  /* ── Hero banner ── */
  .shirt-hero {
    position:relative; overflow:hidden;
    background:linear-gradient(135deg,#fce8f0 0%,#f7ebee 40%,#ede0ea 100%);
    padding:56px 48px 44px; margin-bottom:0;
    border-bottom:0.5px solid rgba(212,180,192,0.3);
  }
  .shirt-hero__ring {
    position:absolute; border:1px solid rgba(133,76,111,0.08);
    border-radius:50%; pointer-events:none;
  }
  .shirt-hero__eyebrow {
    font-size:9.5px; font-weight:600; letter-spacing:0.32em; text-transform:uppercase;
    color:#854c6f; margin-bottom:10px; display:flex; align-items:center; gap:10px;
  }
  .shirt-hero__eyebrow-line { width:22px; height:0.5px; background:#854c6f; }
  .shirt-hero__title {
    font-family:'Cormorant Garamond',Georgia,serif;
    font-size:clamp(36px,6vw,64px); font-weight:300; color:#1f1a1d; line-height:1.08;
    margin-bottom:10px;
    background:linear-gradient(90deg,#1f1a1d 0%,#854c6f 40%,#c4a0b8 60%,#1f1a1d 100%);
    background-size:200% auto;
    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
    background-clip:text;
    animation:shirtShimmer 5s linear infinite;
  }
  .shirt-hero__sub {
    font-size:14px; font-weight:300; color:#82737a; letter-spacing:0.05em; line-height:1.65;
  }
  .shirt-hero__meta { font-size:12px; color:#9e8a93; margin-top:6px; }
  .shirt-hero__petal {
    position:absolute; pointer-events:none; font-size:13px; color:#854c6f;
  }

  /* ── Filter strip ── */
  .shirt-filters {
    display:flex; align-items:center; gap:8px; flex-wrap:wrap;
    padding:22px 48px; border-bottom:0.5px solid rgba(212,180,192,0.2);
    background:rgba(255,251,252,0.96);
    position:sticky; top:64px; z-index:30;
    backdrop-filter:blur(14px);
  }
  @media(max-width:768px){ .shirt-filters{ padding:16px 20px; } }
  .shirt-filter-btn {
    padding:6px 18px; border-radius:30px; cursor:pointer;
    font-size:10.5px; font-weight:600; letter-spacing:0.1em; text-transform:uppercase;
    transition:all 0.22s; font-family:'Jost',sans-serif;
    border:0.5px solid rgba(212,180,192,0.45); background:transparent; color:#82737a;
  }
  .shirt-filter-btn:hover,
  .shirt-filter-btn.active {
    border-color:#854c6f; background:#fce8f0; color:#854c6f;
  }
  .shirt-sort {
    margin-left:auto; padding:6px 16px; border-radius:30px;
    border:0.5px solid rgba(212,180,192,0.45); background:transparent;
    color:#82737a; font-size:10.5px; font-weight:600; letter-spacing:0.08em;
    cursor:pointer; outline:none; font-family:'Jost',sans-serif;
  }

  /* ── Grid ── */
  .shirt-grid {
    display:grid;
    grid-template-columns:repeat(auto-fill,minmax(320px,1fr));
    gap:56px 48px;
    padding:60px 48px 80px;
    max-width:1440px; margin:0 auto;
  }
  @media(max-width:768px){ .shirt-grid{ padding:40px 20px 60px; gap:40px; } }

  /* ── Card ── */
  .shirt-card { animation:shirtFadeUp 0.65s ease both; cursor:pointer; }
  .shirt-card__img-wrap {
    position:relative; overflow:hidden;
    background:linear-gradient(145deg,#fce8f0,#f0e4ec,#f7ebee);
    aspect-ratio:3/4; border-radius:10px;
    box-shadow:0 6px 28px rgba(133,76,111,0.1);
    transition:box-shadow 0.4s;
  }
  .shirt-card__img-wrap:hover {
    box-shadow:0 16px 48px rgba(133,76,111,0.18);
  }
  .shirt-card__img {
    width:100%; height:100%; object-fit:cover; display:block;
    transition:transform 0.78s cubic-bezier(0.25,0.46,0.45,0.94);
  }
  .shirt-card__img-wrap:hover .shirt-card__img { transform:scale(1.06); }

  /* Gradient overlay on hover */
  .shirt-card__grad {
    position:absolute; inset:0; pointer-events:none;
    background:linear-gradient(to top,rgba(31,26,29,0.48) 0%,transparent 55%);
    opacity:0; transition:opacity 0.4s;
  }
  .shirt-card__img-wrap:hover .shirt-card__grad { opacity:1; }

  .shirt-card__overlay {
    position:absolute; inset-x:0; bottom:0;
    display:flex; align-items:flex-end; justify-content:center; padding-bottom:22px;
    opacity:0; transform:translateY(10px); transition:all 0.38s ease;
  }
  .shirt-card__img-wrap:hover .shirt-card__overlay { opacity:1; transform:translateY(0); }

  .shirt-card__qv-btn {
    font-size:10.5px; font-weight:700; letter-spacing:0.2em; text-transform:uppercase;
    padding:11px 34px; background:#fffbfc; color:#1f1a1d; border:none; cursor:pointer;
    border-radius:2px; transition:all 0.28s; font-family:'Jost',sans-serif;
    box-shadow:0 4px 16px rgba(0,0,0,0.12);
  }
  .shirt-card__qv-btn:hover { background:#854c6f; color:#fff; }

  .shirt-card__wish {
    position:absolute; bottom:14px; right:14px;
    width:36px; height:36px; border-radius:50%; border:none;
    background:rgba(255,255,255,0.88); backdrop-filter:blur(6px);
    cursor:pointer; font-size:16px; display:flex; align-items:center; justify-content:center;
    opacity:0; transition:opacity 0.3s; box-shadow:0 2px 10px rgba(0,0,0,0.1);
  }
  .shirt-card__img-wrap:hover .shirt-card__wish { opacity:1; }
  .shirt-card__wish.on { opacity:1 !important; animation:shirtHeartPop 0.35s ease; }

  .shirt-card__badge {
    position:absolute; top:13px; left:13px;
    font-size:9.5px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase;
    padding:5px 14px; color:#fff; border-radius:3px;
  }
  .shirt-card__pill {
    position:absolute; top:13px; right:13px;
    font-size:9px; font-weight:600; letter-spacing:0.1em; text-transform:uppercase;
    background:rgba(255,255,255,0.8); backdrop-filter:blur(6px);
    padding:4px 10px; border-radius:20px; color:#1f1a1d;
  }

  /* ── Card info ── */
  .shirt-card__info { padding:16px 0 8px; }
  .shirt-card__stars { display:flex; align-items:center; gap:6px; margin-bottom:6px; }
  .shirt-card__review { font-size:10.5px; color:#82737a; }
  .shirt-card__sub {
    font-size:10px; font-weight:600; letter-spacing:0.14em; text-transform:uppercase;
    color:#854c6f; margin-bottom:5px;
  }
  .shirt-card__name {
    font-family:'Cormorant Garamond',Georgia,serif;
    font-size:23px; font-weight:400; color:#1f1a1d; line-height:1.2; margin-bottom:10px;
  }
  .shirt-card__price-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
  .shirt-card__price { font-size:17px; color:#504349; }
  .shirt-card__original { font-size:13px; color:#9e8a93; text-decoration:line-through; margin-left:8px; }
  .shirt-card__link {
    font-size:10px; font-weight:600; letter-spacing:0.1em; text-transform:uppercase;
    color:#854c6f; border-bottom:1px solid #854c6f; padding-bottom:1px;
    background:none; border-top:none; border-left:none; border-right:none;
    cursor:pointer; transition:opacity 0.2s; font-family:'Jost',sans-serif;
  }
  .shirt-card__link:hover { opacity:0.6; }
  .shirt-card__colors { display:flex; gap:7px; }
  .shirt-card__swatch {
    width:13px; height:13px; border-radius:50%;
    box-shadow:0 0 0 1.5px rgba(255,255,255,0.9),0 0 0 2.5px rgba(0,0,0,0.09);
    cursor:pointer; transition:transform 0.2s;
  }
  .shirt-card__swatch:hover { transform:scale(1.4); }

  /* ── Quick View ── */
  .shirt-qv-overlay {
    position:fixed; inset:0; z-index:9999;
    background:rgba(31,26,29,0.62); backdrop-filter:blur(7px);
    display:flex; align-items:center; justify-content:center; padding:20px;
    animation:shirtOverlayIn 0.3s ease;
  }
  .shirt-qv-modal {
    background:#fffbfc; border-radius:18px; overflow:hidden;
    width:100%; max-width:1000px; max-height:92vh; display:flex;
    box-shadow:0 40px 100px rgba(0,0,0,0.22);
    animation:shirtModalIn 0.4s cubic-bezier(0.25,0.46,0.45,0.94);
    position:relative;
  }
  .shirt-qv-gallery {
    width:52%; background:linear-gradient(145deg,#fce8f0,#f0e4ec,#f7ebee);
    display:flex; flex-direction:column; flex-shrink:0; overflow:hidden;
  }
  .shirt-qv-gallery__main-wrap { flex:1; overflow:hidden; min-height:0; }
  .shirt-qv-gallery__main { width:100%; height:100%; object-fit:cover; display:block; transition:opacity 0.22s; }
  .shirt-qv-gallery__thumbs {
    display:flex; gap:6px; padding:10px;
    background:rgba(255,255,255,0.45); overflow-x:auto; scrollbar-width:none;
  }
  .shirt-qv-gallery__thumbs::-webkit-scrollbar { display:none; }
  .shirt-qv-gallery__thumb {
    width:60px; height:76px; object-fit:cover; flex-shrink:0;
    border-radius:5px; cursor:pointer; border:2px solid transparent; transition:all 0.2s;
  }
  .shirt-qv-gallery__thumb.active { border-color:#854c6f; box-shadow:0 0 0 2px rgba(133,76,111,0.2); }

  .shirt-qv-info {
    flex:1; padding:38px 34px; overflow-y:auto; display:flex; flex-direction:column;
  }
  .shirt-qv-info::-webkit-scrollbar { width:3px; }
  .shirt-qv-info::-webkit-scrollbar-thumb { background:#d4c2c9; border-radius:10px; }

  .shirt-qv-close {
    position:absolute; top:14px; right:14px; z-index:10;
    width:32px; height:32px; border-radius:50%; border:none;
    background:rgba(31,26,29,0.08); cursor:pointer; font-size:15px; color:#1f1a1d;
    display:flex; align-items:center; justify-content:center; transition:all 0.2s;
    font-family:'Jost',sans-serif;
  }
  .shirt-qv-close:hover { background:rgba(133,76,111,0.15); color:#854c6f; }

  /* ── Size btn ── */
  .shirt-size-btn {
    padding:9px 18px; border-radius:6px; cursor:pointer;
    border:1px solid rgba(212,180,192,0.5); background:transparent;
    font-size:11px; font-weight:600; letter-spacing:0.08em; color:#504349;
    transition:all 0.2s; font-family:'Jost',sans-serif;
  }
  .shirt-size-btn:hover { border-color:#854c6f; color:#854c6f; background:#fce8f0; }
  .shirt-size-btn.active { background:#854c6f; color:#fff; border-color:#854c6f; }

  /* ── Add to bag ── */
  .shirt-add-btn {
    width:100%; padding:15px; border-radius:40px;
    background:#854c6f; color:#fff8f8;
    font-size:11px; font-weight:700; letter-spacing:0.22em; text-transform:uppercase;
    border:none; cursor:pointer; font-family:'Jost',sans-serif;
    box-shadow:0 10px 32px rgba(133,76,111,0.28); transition:all 0.3s;
    animation:shirtPulse 2.5s ease-in-out infinite;
  }
  .shirt-add-btn:hover { background:#6e3b5b; transform:translateY(-2px); box-shadow:0 16px 40px rgba(133,76,111,0.36); }
  .shirt-add-btn.added { background:#486730; animation:none; }

  /* ── Wishlist btn in modal ── */
  .shirt-wish-btn {
    flex:1; padding:15px; border-radius:40px;
    border:1px solid rgba(133,76,111,0.4); background:transparent; color:#854c6f;
    font-size:11px; font-weight:600; letter-spacing:0.18em; text-transform:uppercase;
    cursor:pointer; transition:all 0.3s; font-family:'Jost',sans-serif;
  }
  .shirt-wish-btn:hover { background:#fce8f0; }
  .shirt-wish-btn.wished { background:#fce8f0; border-color:#854c6f; }

  /* ── Toast ── */
  .shirt-toast {
    position:fixed; bottom:28px; right:28px; z-index:99999;
    background:#1f1a1d; color:#fff8f8; padding:14px 24px;
    border-radius:40px; font-size:12px; font-weight:600; letter-spacing:0.08em;
    box-shadow:0 10px 40px rgba(0,0,0,0.24);
    animation:shirtToastIn 0.35s cubic-bezier(0.25,0.46,0.45,0.94) both;
    display:flex; align-items:center; gap:10px; font-family:'Jost',sans-serif;
  }

  /* ── Load more ── */
  .shirt-loadmore {
    display:block; margin:0 auto 72px;
    padding:14px 52px; border-radius:40px;
    border:1px solid rgba(133,76,111,0.4); background:transparent;
    color:#854c6f; font-size:11px; font-weight:600; letter-spacing:0.2em; text-transform:uppercase;
    cursor:pointer; transition:all 0.3s; font-family:'Jost',sans-serif;
    animation:shirtFloat 3s ease-in-out infinite;
  }
  .shirt-loadmore:hover { background:#854c6f; color:#fff; border-color:#854c6f; animation:none; }

  /* ── Divider ── */
  .shirt-divider { height:0.5px; background:rgba(212,180,192,0.35); margin:16px 0; }

  @media(max-width:768px){
    .shirt-qv-modal { flex-direction:column; }
    .shirt-qv-gallery { width:100%; max-height:260px; }
    .shirt-qv-gallery__main-wrap { max-height:200px; }
  }
`;

// ── Helpers ───────────────────────────────────────────────────────────────
function Stars({ rating }) {
  return (
    <span style={{ display:"flex", alignItems:"center", gap:2 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= Math.round(rating) ? "shirt-star-on" : "shirt-star-off"}>★</span>
      ))}
    </span>
  );
}



// ── Shirt Card ────────────────────────────────────────────────────────────
function ShirtCard({ product, onQuickView, delay }) {
  const [wished, setWished] = useState(false);

  return (
    <div className="shirt-card" style={{ animationDelay:`${delay}s` }}>

      {/* Image wrap */}
      <div className="shirt-card__img-wrap">
        <img src={product.cover} alt={product.name} className="shirt-card__img" />

        <div className="shirt-card__grad" />

        <span className="shirt-card__badge" style={{ background:product.badgeColor }}>
          {product.badge}
        </span>

        <span className="shirt-card__pill">
          {product.images.length} photos
        </span>

        <div className="shirt-card__overlay">
          <button className="shirt-card__qv-btn" onClick={() => onQuickView(product)}>
            Quick View
          </button>
        </div>

        <button
          className={`shirt-card__wish ${wished ? "on" : ""}`}
          onClick={(e) => { e.stopPropagation(); setWished(w => !w); }}
        >
          {wished ? "❤️" : "🤍"}
        </button>
      </div>

      {/* Info */}
      <div className="shirt-card__info">
        <div className="shirt-card__stars">
          <Stars rating={product.rating} />
          <span className="shirt-card__review">({product.reviews})</span>
        </div>

        <p className="shirt-card__sub">{product.subtitle}</p>

        <h3 className="shirt-card__name">{product.name}</h3>

        <div className="shirt-card__price-row">
          <div style={{ display:"flex", alignItems:"baseline" }}>
            <span className="shirt-card__price">{product.price}</span>
            {product.originalPrice && (
              <span className="shirt-card__original">{product.originalPrice}</span>
            )}
          </div>
          <button className="shirt-card__link" onClick={() => onQuickView(product)}>
            View All →
          </button>
        </div>

        <div className="shirt-card__colors">
          {product.colors.map((c, i) => (
            <div
              key={i}
              className="shirt-card__swatch"
              style={{ background:c.hex }}
              title={c.name}
              onMouseEnter={e => e.currentTarget.style.transform="scale(1.4)"}
              onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Shirt Page ───────────────────────────────────────────────────────
const Shirt = () => {
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const [activeFilter,     setActiveFilter]     = useState("All");

  const filters = ["All","New Arrivals","Cotton","Crop","Printed","Casual"];

  return (
    <>
      <style>{STYLES}</style>

      <div className="shirt-root">

        {/* ── Hero banner ── */}
        <div className="shirt-hero">
          {/* Decorative rings */}
          <div className="shirt-hero__ring" style={{ width:500, height:500, top:-220, right:-180 }} />
          <div className="shirt-hero__ring" style={{ width:300, height:300, bottom:-80, left:-60 }} />

          {/* Floating petals */}
          <span className="shirt-hero__petal" style={{ top:"22%", left:"6%",  fontSize:11, color:"#854c6f", opacity:0.14, animation:"shirtPetal 8s ease-in-out infinite" }}>✿</span>
          <span className="shirt-hero__petal" style={{ top:"40%", right:"8%", fontSize:10, color:"#c4b3d8", opacity:0.16, animation:"shirtPetal 10s ease-in-out infinite 2s" }}>❀</span>
          <span className="shirt-hero__petal" style={{ bottom:"20%", left:"14%", fontSize:13, color:"#e8a4b8", opacity:0.12, animation:"shirtPetal 12s ease-in-out infinite 4s" }}>✾</span>

          <div className="shirt-hero__eyebrow">
            <span className="shirt-hero__eyebrow-line" />
            Curated Essence · Season 2025
            <span className="shirt-hero__eyebrow-line" />
          </div>

          <h1 className="shirt-hero__title">The Shirt Collection</h1>

          <p className="shirt-hero__sub">
            Sharp tailoring softened by feminine details — effortlessly elevated.
          </p>
          <p className="shirt-hero__meta">{shirtProducts.length} piece{shirtProducts.length > 1 ? "s" : ""} · Handcrafted with Intention</p>
        </div>

        {/* ── Filter & Sort strip ── */}
        <div className="shirt-filters">
          {filters.map((f) => (
            <button
              key={f}
              className={`shirt-filter-btn ${activeFilter === f ? "active" : ""}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
          <select className="shirt-sort">
            <option>Sort: Newest</option>
            <option>Price: Low–High</option>
            <option>Price: High–Low</option>
            <option>Best Sellers</option>
          </select>
        </div>

        {/* ── Section header ── */}
        <div
          style={{
            maxWidth:1440, margin:"0 auto",
            padding:"48px 48px 0",
            display:"flex", flexWrap:"wrap", alignItems:"flex-end",
            justifyContent:"space-between", gap:16,
            borderBottom:"0.5px solid rgba(212,180,192,0.25)",
            paddingBottom:20,
          }}
        >
          <div>
            <p style={{ fontSize:10, fontWeight:600, letterSpacing:"0.22em", textTransform:"uppercase", color:"#854c6f", marginBottom:6 }}>
              Category
            </p>
            <h2 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:36, fontWeight:400, color:"#1f1a1d" }}>
              Shirt
            </h2>
          </div>
          <div style={{ textAlign:"right" }}>
            <p style={{ fontSize:13, color:"#504349" }}>{shirtProducts.length} piece{shirtProducts.length > 1 ? "s" : ""} available</p>
            <p style={{ fontSize:11, color:"#9e8a93", marginTop:3 }}>Free shipping over Rs. 5,000</p>
          </div>
        </div>

        {/* ── Products grid ── */}
        <div className="shirt-grid">
          {shirtProducts.map((product, i) => (
            <div key={product.id} style={{ animationDelay:`${i * 0.13}s` }}>
              <p style={{
                fontSize:10, fontWeight:600, letterSpacing:"0.18em", textTransform:"uppercase",
                color:"#9e8a93", marginBottom:14, fontFamily:"'Jost',sans-serif",
              }}>
                {product.name}
              </p>
              <ShirtCard product={product} onQuickView={setQuickViewProduct} delay={i * 0.13} />
            </div>
          ))}
        </div>

        {/* ── Load more ── */}
        <div style={{ textAlign:"center" }}>
          <button className="shirt-loadmore">
            Explore More Pieces
          </button>
        </div>
      </div>

      {/* ── Quick View Modal ── */}
      {quickViewProduct && (
        <QuickView
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}


    </>
  );
};

export default Shirt;