import { useState } from "react";
import QuickView from "./QuickView";

// ── Replace these with your actual image imports ──────────────────────────
import floralMain from "../../../assets/images/dresses/floral-flare/main.png";
import floral2    from "../../../assets/images/dresses/floral-flare/2.png";
import floral3    from "../../../assets/images/dresses/floral-flare/3.png";
import floral4    from "../../../assets/images/dresses/floral-flare/4.png";
import floral5    from "../../../assets/images/dresses/floral-flare/5.png";

import sundressMain from "../../../assets/images/dresses/maxi-sundress/Main.png";
import sundress2    from "../../../assets/images/dresses/maxi-sundress/2.PNG";
import sundress3    from "../../../assets/images/dresses/maxi-sundress/3.png";
import sundress4    from "../../../assets/images/dresses/maxi-sundress/4.png";
import sundress5    from "../../../assets/images/dresses/maxi-sundress/5.png";

// ─────────────────────────────────────────────────────────────────────────
const dressProducts = [
  {
    id: 1,
    name: "Floral Flare Mini Dress",
    subtitle: "Pink Flowers · Embroidered",
    collection: "The Atelier Collection",
    price: "Rs. 8,450.00",
    originalPrice: "Rs. 10,200.00",
    badge: "Embroidered",
    badgeColor: "#854c6f",
    cover: floralMain,
    images: [floralMain, floral2, floral3, floral4, floral5],
    description:
      "Crafted from premium hand-woven cotton, this ethereal piece features intricate artisanal floral embroidery. The relaxed silhouette and flare hem evoke effortless movement and summer elegance.",
    details: [
      "Hand-embroidered pink floral motifs",
      "V-neck with tassel trim",
      "Flutter sleeves with teal cuff accent",
      "Relaxed A-line silhouette",
      "100% premium hand-woven cotton",
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Blush Rose",  hex: "#e8a4b8" },
      { name: "Teal Mist",   hex: "#6aada9" },
      { name: "Ivory Cream", hex: "#f5ede0" },
      { name: "Dusk Mauve",  hex: "#9e7492" },
    ],
    rating: 4.9,
    reviews: 38,
  },
  {
    id: 2,
    name: "Maxi Sundress with Frill",
    subtitle: "White · Tiered Frills",
    collection: "The Atelier Collection",
    price: "Rs. 6,400.00",
    originalPrice: null,
    badge: "New Arrival",
    badgeColor: "#486730",
    cover: sundressMain,
    images: [sundressMain, sundress2, sundress3, sundress4, sundress5],
    description:
      "Crisp white cotton with delicate ric-rac trim at each tier. Adjustable spaghetti straps, smocked back, and a sweeping floor-length skirt that moves beautifully.",
    details: [
      "Ric-rac trim at each tiered frill",
      "Adjustable spaghetti straps",
      "Smocked back for a fitted bodice",
      "Floor-length tiered skirt",
      "Lightweight 100% cotton poplin",
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Pure White",   hex: "#f8f4ef" },
      { name: "Sky Blue",     hex: "#9ec8e0" },
      { name: "Petal Blush",  hex: "#f2c4c4" },
      { name: "Sage Whisper", hex: "#a8c5a0" },
    ],
    rating: 4.7,
    reviews: 21,
  },
];

// ── Injected global styles & keyframes ────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500;600;700&display=swap');

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(20px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes modalIn {
    from { opacity:0; transform:scale(0.96) translateY(14px); }
    to   { opacity:1; transform:scale(1) translateY(0); }
  }
  @keyframes overlayIn {
    from { opacity:0; }
    to   { opacity:1; }
  }
  @keyframes shimmerSlide {
    0%   { background-position:-200% center; }
    100% { background-position:200% center; }
  }
  @keyframes heartPop {
    0%   { transform:scale(1); }
    40%  { transform:scale(1.4); }
    100% { transform:scale(1); }
  }
  @keyframes petal {
    0%,100% { transform:translateY(0) rotate(0deg); }
    50%      { transform:translateY(-12px) rotate(15deg); }
  }
  @keyframes slideIn {
    from { transform:translateX(100%); opacity:0; }
    to   { transform:translateX(0);    opacity:1; }
  }

  .dress-root { font-family:'Jost',sans-serif; }

  /* ── Stars ── */
  .star-filled { color:#e8a4b8; }
  .star-empty  { color:#ddd; }

  /* ── Card ── */
  .dress-card { animation:fadeUp 0.65s ease both; }
  .dress-card__img-wrap {
    position:relative; overflow:hidden;
    background:linear-gradient(145deg,#fce8f0,#f7ebee);
    aspect-ratio:3/4; border-radius:8px;
    box-shadow:0 8px 32px rgba(133,76,111,0.1);
  }
  .dress-card__img {
    width:100%; height:100%; object-fit:cover; display:block;
    transition:transform 0.75s cubic-bezier(0.25,0.46,0.45,0.94);
  }
  .dress-card__img-wrap:hover .dress-card__img { transform:scale(1.06); }

  .dress-card__overlay {
    position:absolute; inset-x:0; bottom:0;
    padding-bottom:24px; display:flex; align-items:flex-end; justify-content:center;
    background:linear-gradient(to top,rgba(31,26,29,0.5) 0%,transparent 100%);
    opacity:0; transform:translateY(10px); transition:all 0.4s ease;
  }
  .dress-card__img-wrap:hover .dress-card__overlay { opacity:1; transform:translateY(0); }

  .dress-card__qv-btn {
    font-size:10.5px; font-weight:700; letter-spacing:0.2em; text-transform:uppercase;
    padding:11px 32px; background:#fffbfc; color:#1f1a1d; border:none; cursor:pointer;
    border-radius:2px; transition:all 0.3s;
  }
  .dress-card__qv-btn:hover { background:#854c6f; color:#fff; }

  .dress-card__wish {
    position:absolute; bottom:14px; right:14px;
    width:36px; height:36px; border-radius:50%; border:none;
    background:rgba(255,255,255,0.85); backdrop-filter:blur(6px);
    cursor:pointer; font-size:16px; display:flex; align-items:center; justify-content:center;
    opacity:0; transition:opacity 0.3s; box-shadow:0 2px 8px rgba(0,0,0,0.1);
  }
  .dress-card__img-wrap:hover .dress-card__wish { opacity:1; }
  .dress-card__wish.wished { opacity:1; animation:heartPop 0.35s ease; }

  /* ── Quick View ── */
  .qv-overlay {
    position:fixed; inset:0; z-index:9999;
    background:rgba(31,26,29,0.6); backdrop-filter:blur(6px);
    display:flex; align-items:center; justify-content:center; padding:20px;
    animation:overlayIn 0.3s ease;
  }
  .qv-modal {
    background:#fffbfc; border-radius:16px; overflow:hidden;
    width:100%; max-width:980px; max-height:90vh; display:flex;
    box-shadow:0 40px 100px rgba(0,0,0,0.2);
    animation:modalIn 0.4s cubic-bezier(0.25,0.46,0.45,0.94) both;
    position:relative;
  }
  .qv-gallery {
    width:52%; background:linear-gradient(145deg,#fce8f0,#f7ebee);
    display:flex; flex-direction:column; flex-shrink:0; overflow:hidden;
  }
  .qv-gallery__main-wrap { flex:1; overflow:hidden; position:relative; }
  .qv-gallery__main {
    width:100%; height:100%; object-fit:cover; display:block;
    transition:opacity 0.25s;
  }
  .qv-gallery__thumbs {
    display:flex; gap:6px; padding:10px; overflow-x:auto; background:rgba(255,255,255,0.4);
    scrollbar-width:none;
  }
  .qv-gallery__thumbs::-webkit-scrollbar { display:none; }
  .qv-gallery__thumb {
    width:60px; height:76px; object-fit:cover; flex-shrink:0;
    border-radius:4px; cursor:pointer; border:2px solid transparent; transition:all 0.2s;
  }
  .qv-gallery__thumb--active { border-color:#854c6f; box-shadow:0 0 0 2px rgba(133,76,111,0.2); }

  .qv-info { flex:1; padding:36px 32px; overflow-y:auto; display:flex; flex-direction:column; gap:0; }

  .qv-close {
    position:absolute; top:14px; right:14px; z-index:10;
    width:32px; height:32px; border-radius:50%; border:none;
    background:rgba(31,26,29,0.09); cursor:pointer; font-size:15px; color:#1f1a1d;
    display:flex; align-items:center; justify-content:center; transition:all 0.2s;
  }
  .qv-close:hover { background:rgba(133,76,111,0.15); color:#854c6f; }

  /* ── Size button ── */
  .size-btn {
    padding:9px 18px; border-radius:6px;
    border:1px solid rgba(212,180,192,0.5);
    background:transparent; font-size:11px; font-weight:600; letter-spacing:0.08em;
    color:#504349; cursor:pointer; transition:all 0.2s; font-family:'Jost',sans-serif;
  }
  .size-btn:hover { border-color:#854c6f; color:#854c6f; background:#fce8f0; }
  .size-btn.active { background:#854c6f; color:#fff; border-color:#854c6f; }

  /* ── Add to bag ── */
  .add-btn {
    width:100%; padding:15px; border-radius:40px;
    background:#854c6f; color:#fff8f8;
    font-size:11px; font-weight:700; letter-spacing:0.22em; text-transform:uppercase;
    border:none; cursor:pointer;
    box-shadow:0 10px 30px rgba(133,76,111,0.28); transition:all 0.3s;
    font-family:'Jost',sans-serif;
  }
  .add-btn:hover { background:#6e3b5b; transform:translateY(-2px); box-shadow:0 14px 36px rgba(133,76,111,0.38); }
  .add-btn.added { background:#486730; }

  /* ── Toast ── */
  .toast {
    position:fixed; bottom:28px; right:28px; z-index:99999;
    background:#1f1a1d; color:#fff8f8; padding:14px 24px;
    border-radius:40px; font-size:12px; font-weight:600; letter-spacing:0.1em;
    box-shadow:0 10px 40px rgba(0,0,0,0.22);
    animation:slideIn 0.35s cubic-bezier(0.25,0.46,0.45,0.94) both;
    display:flex; align-items:center; gap:10px;
  }

  /* ── Section header shimmer ── */
  .shimmer-text {
    background:linear-gradient(90deg,#854c6f 0%,#d4a0b8 40%,#854c6f 60%,#854c6f 100%);
    background-size:200% auto;
    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
    background-clip:text;
    animation:shimmerSlide 4s linear infinite;
  }

  /* ── Scrollbar in modal ── */
  .qv-info::-webkit-scrollbar { width:3px; }
  .qv-info::-webkit-scrollbar-track { background:transparent; }
  .qv-info::-webkit-scrollbar-thumb { background:#d4c2c9; border-radius:10px; }

  /* ── Petal deco ── */
  .petal-deco { position:absolute; pointer-events:none; color:#854c6f; opacity:0.13; font-size:12px; }

  @media(max-width:768px) {
    .qv-modal { flex-direction:column; }
    .qv-gallery { width:100%; max-height:280px; }
    .qv-gallery__main-wrap { max-height:220px; }
  }
`;

// ── Star Rating ───────────────────────────────────────────────────────────
function Stars({ rating }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= Math.round(rating) ? "star-filled" : "star-empty"} style={{ fontSize:12 }}>★</span>
      ))}
    </span>
  );
}





// ── Dress Card ────────────────────────────────────────────────────────────
function DressCard({ product, onQuickView, delay }) {
  const [wished, setWished] = useState(false);

  return (
    <div className="dress-card" style={{ animationDelay:`${delay}s` }}>
      {/* Image block */}
      <div className="dress-card__img-wrap">
        <img src={product.cover} alt={product.name} className="dress-card__img" />

        {/* Badge */}
        <span
          style={{
            position:"absolute", top:12, left:12,
            fontSize:9.5, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase",
            padding:"5px 14px", color:"#fff", background:product.badgeColor, borderRadius:2,
          }}
        >
          {product.badge}
        </span>

        {/* Photo count */}
        <span
          style={{
            position:"absolute", top:12, right:12,
            fontSize:9, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase",
            background:"rgba(255,255,255,0.78)", backdropFilter:"blur(6px)",
            padding:"4px 10px", borderRadius:20, color:"#1f1a1d",
          }}
        >
          {product.images.length} photos
        </span>

        {/* Quick view overlay */}
        <div className="dress-card__overlay">
          <button className="dress-card__qv-btn" onClick={() => onQuickView(product)}>
            Quick View
          </button>
        </div>

        {/* Wishlist */}
        <button
          className={`dress-card__wish ${wished ? "wished" : ""}`}
          onClick={(e) => { e.stopPropagation(); setWished(w => !w); }}
        >
          {wished ? "❤️" : "🤍"}
        </button>
      </div>

      {/* Product info */}
      <div style={{ paddingTop:18, paddingBottom:8 }}>
        {/* Rating row */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
          <Stars rating={product.rating} />
          <span style={{ fontSize:10.5, color:"#82737a" }}>({product.reviews})</span>
        </div>

        <p style={{
          fontSize:10, fontWeight:600, letterSpacing:"0.14em", textTransform:"uppercase",
          color:"#854c6f", marginBottom:5,
        }}>
          {product.subtitle}
        </p>

        <h3 style={{
          fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:24,
          color:"#1f1a1d", fontWeight:400, lineHeight:1.2, marginBottom:10,
        }}>
          {product.name}
        </h3>

        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
            <span style={{ fontSize:17, color:"#504349" }}>{product.price}</span>
            {product.originalPrice && (
              <span style={{ fontSize:13, color:"#9e8a93", textDecoration:"line-through" }}>{product.originalPrice}</span>
            )}
          </div>
          <button
            onClick={() => onQuickView(product)}
            style={{
              fontSize:10, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase",
              color:"#854c6f", borderBottom:"1px solid #854c6f", paddingBottom:1,
              background:"none", border:"none",
              cursor:"pointer", transition:"opacity 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity="0.6"}
            onMouseLeave={e => e.currentTarget.style.opacity="1"}
          >
            View All →
          </button>
        </div>

        {/* Color dots */}
        <div style={{ display:"flex", gap:7, marginTop:10 }}>
          {product.colors.map((c, i) => (
            <div
              key={i}
              title={c.name}
              style={{
                width:13, height:13, borderRadius:"50%", background:c.hex,
                boxShadow:"0 0 0 1.5px rgba(255,255,255,0.8), 0 0 0 2.5px rgba(0,0,0,0.08)",
                cursor:"pointer", transition:"transform 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.transform="scale(1.35)"}
              onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Dress Page ───────────────────────────────────────────────────────
const Dress = () => {
  const [quickViewProduct, setQuickViewProduct] = useState(null);


  return (
    <>
      <style>{STYLES}</style>

      <section
        className="dress-root"
        style={{ maxWidth:1440, margin:"0 auto", padding:"64px 48px 80px", position:"relative" }}
      >
        {/* ── Decorative floating petals ── */}
        <span className="petal-deco" style={{ top:30, right:80, animation:"petal 8s ease-in-out infinite" }}>✿</span>
        <span className="petal-deco" style={{ top:120, left:20, animation:"petal 10s ease-in-out infinite 2s" }}>❀</span>

        {/* ── Section header ── */}
        <div
          style={{
            display:"flex", flexWrap:"wrap", alignItems:"flex-end", justifyContent:"space-between",
            marginBottom:52, paddingBottom:20,
            borderBottom:"0.5px solid rgba(212,180,192,0.3)", gap:16,
          }}
        >
          <div>
            <p style={{ fontSize:10, fontWeight:600, letterSpacing:"0.24em", textTransform:"uppercase", color:"#854c6f", marginBottom:8 }}>
              Category · Season 2025
            </p>
            <h2
              className="shimmer-text"
              style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:42, fontWeight:400, lineHeight:1.1 }}
            >
              Dress Collection
            </h2>
            <p style={{ fontSize:13.5, color:"#82737a", fontWeight:300, marginTop:6, letterSpacing:"0.04em" }}>
              Handcrafted with intention · Feminine by design
            </p>
          </div>
          <div style={{ textAlign:"right" }}>
            <p style={{ fontSize:13, color:"#504349" }}>{dressProducts.length} pieces available</p>
            <p style={{ fontSize:11, color:"#9e8a93", marginTop:4 }}>Free shipping over Rs. 5,000</p>
          </div>
        </div>

        {/* ── Filters strip ── */}
        <div
          style={{
            display:"flex", alignItems:"center", gap:8, marginBottom:48, flexWrap:"wrap",
          }}
        >
          {["All","Embroidered","New Arrivals","Cotton","Maxi","Mini"].map((f, i) => (
            <button
              key={f}
              style={{
                padding:"7px 20px", borderRadius:30,
                border:`0.5px solid ${i === 0 ? "#854c6f" : "rgba(212,180,192,0.45)"}`,
                background: i === 0 ? "#fce8f0" : "transparent",
                color: i === 0 ? "#854c6f" : "#82737a",
                fontSize:11, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase",
                cursor:"pointer", transition:"all 0.2s", fontFamily:"'Jost',sans-serif",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor="#854c6f"; e.currentTarget.style.color="#854c6f"; e.currentTarget.style.background="#fce8f0"; }}
              onMouseLeave={e => { if (i !== 0) { e.currentTarget.style.borderColor="rgba(212,180,192,0.45)"; e.currentTarget.style.color="#82737a"; e.currentTarget.style.background="transparent"; }}}
            >
              {f}
            </button>
          ))}

          {/* Sort */}
          <div style={{ marginLeft:"auto" }}>
            <select
              style={{
                padding:"7px 16px", borderRadius:30,
                border:"0.5px solid rgba(212,180,192,0.45)", background:"transparent",
                color:"#82737a", fontSize:11, fontWeight:600, letterSpacing:"0.08em",
                cursor:"pointer", outline:"none", fontFamily:"'Jost',sans-serif",
              }}
            >
              <option>Sort: Newest</option>
              <option>Price: Low–High</option>
              <option>Price: High–Low</option>
              <option>Best Sellers</option>
            </select>
          </div>
        </div>

        {/* ── Product grid ── */}
        <div
          style={{
            display:"grid",
            gridTemplateColumns:"repeat(auto-fill, minmax(340px, 1fr))",
            gap:"56px 48px",
          }}
        >
          {dressProducts.map((product, i) => (
            <DressCard
              key={product.id}
              product={product}
              onQuickView={setQuickViewProduct}
              delay={i * 0.13}
            />
          ))}
        </div>

        {/* ── Load more ── */}
        <div style={{ textAlign:"center", marginTop:64 }}>
          <button
            style={{
              padding:"14px 52px", borderRadius:40,
              border:"1px solid rgba(133,76,111,0.4)", background:"transparent",
              color:"#854c6f", fontSize:11, fontWeight:600, letterSpacing:"0.2em", textTransform:"uppercase",
              cursor:"pointer", transition:"all 0.3s", fontFamily:"'Jost',sans-serif",
            }}
            onMouseEnter={e => { e.currentTarget.style.background="#854c6f"; e.currentTarget.style.color="#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#854c6f"; }}
          >
            Load More Pieces
          </button>
        </div>
      </section>

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

export default Dress; 