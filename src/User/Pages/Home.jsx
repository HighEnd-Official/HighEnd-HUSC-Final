import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import HoverRevealImage from "../../components/HoverRevealImage";
import QuickView from "./Collection/QuickView";
import { useCart } from "../../context/CartContext";
import { apiFetch, getApiBaseUrl } from "../../api/client";
import { normalizeProductCategory, normalizeProductSubcategory } from "../../lib/productCategories";
import { getSeasonalBadgeText, isProductVisible } from "../../lib/productAvailability";
import { getDiscountPercent } from "../../lib/productPricing";
import { groupProductsForDisplay } from "../../lib/productGrouping";

const localProductImages = import.meta.glob("../../assets/images/**/*.{png,jpg,jpeg,webp}", {
  eager: true,
  import: "default",
});
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=800&fit=crop";
const normalizeSizeCodes = (sizes = []) =>
  Array.from(
    new Set(
      (Array.isArray(sizes) ? sizes : [])
        .map((size) => (typeof size === "string" ? size : size?.code))
        .map((size) => String(size || "").trim())
        .filter(Boolean)
    )
  );

const STATIC_PRODUCTS = [
  
];

function centsToLkr(cents) {
  return (Number(cents) || 0) / 100;
}

function formatLkr(cents) {
  return `Rs. ${centsToLkr(cents).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function resolveImageUrl(url) {
  if (!url) return FALLBACK_IMAGE;
  if (String(url).startsWith("/src/assets/images/")) {
    const assetKey = `../../assets/images${String(url).replace("/src/assets/images", "")}`;
    return localProductImages[assetKey] || FALLBACK_IMAGE;
  }
  if (String(url).startsWith("/uploads/")) {
    return `${getApiBaseUrl()}${url}`;
  }
  return url;
}

function productToHomeShape(product) {
  const images = (product.images || []).map((image) => resolveImageUrl(image.url)).filter(Boolean);
  const mainImage = resolveImageUrl(product.coverImageUrl || product.images?.[0]?.url);
  const sizes = normalizeSizeCodes(product.sizes);
  const priceValue = centsToLkr(product.priceCents);
  const originalPriceValue = product.originalCents ? centsToLkr(product.originalCents) : 0;
  return {
    id: product.id,
    name: product.name,
    price: formatLkr(product.priceCents),
    priceValue,
    originalPrice: originalPriceValue > priceValue ? formatLkr(originalPriceValue * 100) : "",
    originalPriceValue,
    actualPriceValue: originalPriceValue,
    discountAmountValue: originalPriceValue > priceValue ? originalPriceValue - priceValue : 0,
    discountPercent: getDiscountPercent(originalPriceValue, priceValue),
    badge: product.badge || "New Arrival",
    badgeColor: product.badgeColorHex || "#e05585",
    category: normalizeProductCategory(product.category) || "Collection",
    subcategory: normalizeProductSubcategory(product.subcategory, product.category) || "",
    subtitle: product.subtitle || "",
    createdAt: product.createdAt ? new Date(product.createdAt).getTime() : 0,
    image: mainImage,
    images: images.length ? images : [mainImage],
    stars: Math.max(0, Math.min(5, Math.round(Number(product.rating) || 5))),
    reviews: Number(product.reviewsCount) || 0,
    description: product.description || product.subtitle || "",
    collection: product.collection || "The Atelier Collection",
    stock: Number(product.stock) || 0,
    isActive: Boolean(product.isActive),
    details: (product.details || []).map((detail) => detail.text),
    sizes,
    sizeSummary: sizes.length > 3 ? `${sizes.slice(0, 2).join(", ")} +${sizes.length - 2}` : sizes.join(", "),
    hasManagedSizes: true,
    colors: (product.colors || []).map((color) => ({
      id: color.id,
      name: color.name,
      hex: color.hex,
    })),
    seasonalBadgeText: getSeasonalBadgeText(product),
    seasonalBatch: Boolean(product.seasonalBatch),
    seasonalEndsOn: product.seasonalEndsOn || "",
  };
}

export default function Home() {
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist } = useCart();
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState(STATIC_PRODUCTS);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setIsLoadingProducts(true);
    apiFetch("/products")
      .then((data) => {
        if (cancelled) return;
        const nextProducts = groupProductsForDisplay(
          (data.products || []).map(productToHomeShape).filter((product) => isProductVisible(product))
        );
        if (nextProducts.length) {
          setProducts(nextProducts);
          setProductsError("");
        } else {
          setProductsError("No backend products found.");
        }
      })
      .catch((error) => {
        if (!cancelled) setProductsError(error?.message || "Unable to load backend products.");
      })
      .finally(() => {
        if (!cancelled) setIsLoadingProducts(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => {
    return ["All", ...Array.from(new Set(products.map((product) => product.category).filter(Boolean)))];
  }, [products]);

  useEffect(() => {
    if (!categories.includes(activeCategory)) setActiveCategory("All");
  }, [activeCategory, categories]);

  const filteredProducts = useMemo(() => {
    const inStockProducts = products.filter((product) => Number(product.stock) > 0);
    const categoryProducts = activeCategory === "All"
      ? inStockProducts
      : inStockProducts.filter((product) => product.category === activeCategory);

    return [...categoryProducts].sort((left, right) => {
      const leftNewArrival = left.badge === "New Arrival" ? 1 : 0;
      const rightNewArrival = right.badge === "New Arrival" ? 1 : 0;
      if (leftNewArrival !== rightNewArrival) return rightNewArrival - leftNewArrival;

      if (left.createdAt !== right.createdAt) return right.createdAt - left.createdAt;

      return Number(right.stock) - Number(left.stock);
    }).slice(0, 12);
  }, [activeCategory, products]);

  return (
    <div className="hues-root pt-[72px]">
      <NavBar />
      
      <style>{`
                @import url('https://db.onlinewebfonts.com/c/6117699ecee5085080fe85709d590fc3?family=Gillie+Quest');
                @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css');

        .hues-root {
          font-family: 'Playfair Display', serif;
          background: var(--color-surface);
          color: var(--color-on-surface);
          min-height: 100vh;
          transition: background-color 0.4s ease, color 0.4s ease;
        }

        .serif { font-family: 'Playfair Display', Georgia, serif; }

        /* HERO */
        .hero {
          position: relative; height: 88vh; overflow: hidden;
          border-radius: 0 0 32px 32px;
          margin: 0;
        }
        .hero-img {
          width: 100%; height: 100%; object-fit: cover;
          filter: brightness(0.75);
          transition: transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform;
        }
        .hero:hover .hero-img { transform: scale(1.06); }
        .hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(20,8,12,0.6) 0%, rgba(20,8,12,0.1) 60%, transparent 100%);
          display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
          padding-bottom: 80px; text-align: center;
        }
        .hero-badge {
          font-size: 10px; font-weight: 600; letter-spacing: 0.3em; text-transform: uppercase;
          color: rgba(255,255,255,0.9); background: rgba(255,255,255,0.15);
          backdrop-filter: blur(8px); border: 0.5px solid rgba(255,255,255,0.3);
          padding: 6px 20px; border-radius: 20px; margin-bottom: 20px;
        }
        .hero-title {
          font-family: 'Gillie Quest', serif; font-size: clamp(42px, 8vw, 80px);
          font-weight: 300; line-height: 1.1; color: white; margin-bottom: 16px;
        }
        .hero-subtitle { font-size: 15px; font-weight: 300; color: rgba(255,255,255,0.85); margin-bottom: 32px; max-width: 400px; line-height: 1.6; }
        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 32px; background: white; color: #1a0f12;
          border-radius: 40px; font-size: 11px; font-weight: 600;
          letter-spacing: 0.14em; text-transform: uppercase; cursor: pointer;
          border: none; transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn-primary:hover { transform: scale(1.04); box-shadow: 0 12px 32px rgba(0,0,0,0.2); }

        /* MARQUEE */
        .marquee-wrap {
          overflow: hidden; background: var(--color-primary); padding: 12px 0;
        }
        .marquee-inner {
          display: flex; gap: 48px; white-space: nowrap;
          animation: marquee 20s linear infinite;
        }
        .marquee-item {
          font-size: 10px; font-weight: 600; letter-spacing: 0.25em; text-transform: uppercase;
          color: var(--color-on-primary); flex-shrink: 0;
        }
        .marquee-dot { color: var(--color-primary-container); margin-right: 48px; }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }

        /* SECTION HEADER */
        .section-header { text-align: center; padding: 64px 40px 40px; }
        .section-tag {
          font-size: 10px; font-weight: 600; letter-spacing: 0.3em; text-transform: uppercase;
          color: var(--color-primary); display: block; margin-bottom: 12px;
        }
        .section-title { font-family: 'Playfair Display', serif; font-size: clamp(28px, 5vw, 46px); font-weight: 300; color: var(--color-on-surface); }
        .section-title em { font-style: normal; color: var(--color-primary); }
        .section-desc { font-size: 14px; color: var(--color-on-surface-variant); margin-top: 10px; max-width: 360px; margin-left: auto; margin-right: auto; line-height: 1.7; }

        /* FILTER PILLS */
        .filter-row { display: flex; justify-content: center; gap: 8px; padding: 0 40px 36px; flex-wrap: wrap; }
        .pill {
          padding: 7px 18px; border-radius: 20px; font-size: 11px; font-weight: 500;
          letter-spacing: 0.08em; cursor: pointer; transition: all 0.2s; border: 0.5px solid var(--color-outline-variant);
          background: var(--color-surface-container); color: var(--color-on-surface-variant);
        }
        .pill.active, .pill:hover { background: var(--color-primary); color: var(--color-on-primary); border-color: var(--color-primary); }

        /* PRODUCT GRID */
        .product-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px;
          padding: 0 40px 64px; max-width: 1200px; margin: 0 auto;
        }
        @media (max-width: 1024px) {
          .product-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 768px) {
          .product-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; padding: 0 20px 48px; }
        }
        @media (max-width: 480px) {
          .product-grid { grid-template-columns: 1fr; }
        }

        .product-card { cursor: pointer; }
        .product-img-wrap {
          position: relative; aspect-ratio: 3/4; border-radius: 16px; overflow: hidden;
          background: var(--color-surface-container-low);
        }
        .product-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; display: block; }
        .product-card:hover .product-img { transform: scale(1.07); }
        .product-badge {
          position: absolute; top: 10px; left: 10px;
          font-size: 9px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase;
          padding: 4px 10px; border-radius: 12px; color: white;
          backdrop-filter: blur(4px);
        }
        .quick-view {
          position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%) translateY(8px);
          background: white; color: #1a0f12; padding: 8px 20px; border-radius: 20px;
          font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;
          opacity: 0; transition: all 0.3s; white-space: nowrap; border: none; cursor: pointer;
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }
        .product-card:hover .quick-view { opacity: 1; transform: translateX(-50%) translateY(0); }
        .heart-btn {
          position: absolute; top: 10px; right: 10px; width: 32px; height: 32px;
          background: rgba(255,255,255,0.9); border-radius: 50%; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: all 0.3s; backdrop-filter: blur(4px);
        }
        .product-card:hover .heart-btn { opacity: 1; }
        .heart-btn i { font-size: 14px; }
        .product-info {
          padding: 16px 2px 0;
          display: grid;
          gap: 10px;
          text-align: left;
        }
        .product-info-main { display: grid; gap: 7px; }
        .product-name {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          line-height: 1.45;
          min-height: 2.9em;
          color: var(--color-on-surface);
        }
        .product-meta-row { display: flex; flex-wrap: wrap; gap: 6px; }
        .product-meta-pill {
          display: inline-flex;
          align-items: center;
          min-height: 22px;
          padding: 0 10px;
          border-radius: 999px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--color-on-surface-variant);
          border: 1px solid var(--color-outline-variant);
          background: var(--color-surface-container);
        }
        .product-meta-pill--accent {
          color: var(--color-primary);
          border-color: var(--color-primary);
          background: var(--color-surface-container-high);
        }
        .product-price-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 12px;
        }
        .product-price { font-size: 16px; font-weight: 500; color: var(--color-primary); }
        .product-details-line {
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--color-on-surface-variant);
          line-height: 1.5;
        }
        .stars { color: #f5c518; font-size: 10px; white-space: nowrap; }
        .stars span { color: var(--color-outline); font-size: 9px; margin-left: 3px; }

        /* BENTO */
        .bento { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; padding: 0 40px 64px; max-width: 1200px; margin: 0 auto; }
        @media (max-width: 768px) {
          .bento { grid-template-columns: 1fr; gap: 16px; padding: 0 20px 48px; }
        }
        .bento-card {
          border-radius: 20px; overflow: hidden; background: var(--color-surface-container);
          border: 0.5px solid var(--color-outline-variant); transition: box-shadow 0.3s, transform 0.3s;
        }
        .bento-card:hover {
          box-shadow: 0 12px 40px rgba(133,76,111,0.12);
          transform: translateY(-2px);
        }
        .bento-img,
        .bento-img-sq {
          width: 100%; object-fit: cover; display: block;
          transition: transform 0.75s cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform;
        }
        .bento-img { aspect-ratio: 16/9; }
        .bento-img-sq { aspect-ratio: 1/1; }
        .bento-card:hover .bento-img,
        .bento-card:hover .bento-img-sq { transform: scale(1.05); }
        .bento-body { padding: 28px; }
        .bento-emoji { font-size: 28px; margin-bottom: 10px; display: block; }
        .bento-title { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 300; color: var(--color-on-surface); margin-bottom: 8px; }
        .bento-desc { font-size: 13px; color: var(--color-on-surface-variant); line-height: 1.7; max-width: 380px; }
        .bento-link { display: inline-flex; align-items: center; gap: 6px; margin-top: 16px; font-size: 10px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--color-primary); cursor: pointer; background: none; border: none; padding: 0; }
        .bento-link i { font-size: 14px; }
        .bento-right { display: flex; flex-direction: column; gap: 20px; }
        .bento-cta {
          background: linear-gradient(135deg, var(--color-surface-container-low) 0%, var(--color-surface-container-high) 100%);
          border-radius: 20px; padding: 32px 24px; text-align: center;
          border: 0.5px solid var(--color-outline-variant); display: flex; flex-direction: column; align-items: center;
          justify-content: center;
        }
        .cta-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 300; color: var(--color-on-surface); margin: 10px 0 8px; }
        .cta-desc { font-size: 12px; color: var(--color-on-surface-variant); line-height: 1.6; margin-bottom: 18px; }
        .btn-outline {
          padding: 10px 24px; border-radius: 20px; background: var(--color-surface); color: var(--color-primary);
          border: 0.5px solid var(--color-outline); font-size: 10px; font-weight: 600;
          letter-spacing: 0.12em; text-transform: uppercase; cursor: pointer;
          transition: all 0.2s;
        }
        .btn-outline:hover { background: var(--color-primary); color: var(--color-on-primary); border-color: var(--color-primary); }

        /* EDITORIAL */
        .editorial {
          background: transparent; padding: 64px 40px;
          display: flex; gap: 80px; align-items: center; max-width: 1200px; margin: 0 auto;
        }
        @media (max-width: 768px) {
          .editorial { flex-direction: column; gap: 40px; padding: 48px 20px; }
        }
        .editorial-text { flex: 1; }
        .editorial-images { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .editorial-img-wrap { border-radius: 16px; overflow: hidden; }
        .editorial-img {
          width: 100%; aspect-ratio: 3/4; object-fit: cover; display: block;
          transition: transform 0.75s cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform;
        }
        .editorial-img-wrap:hover .editorial-img { transform: scale(1.05); }
        .editorial-img-wrap:first-child { margin-top: 40px; }
        @media (max-width: 768px) {
          .editorial-img-wrap:first-child { margin-top: 0; }
        }

        /* NEWSLETTER */
        .newsletter {
          background: linear-gradient(135deg, var(--color-primary-container) 0%, var(--color-primary) 100%);
          padding: 72px 40px; text-align: center; margin: 48px 0 0;
        }
        @media (max-width: 768px) {
          .newsletter { padding: 48px 20px; }
        }
        .nl-title { font-family: 'Playfair Display', serif; font-size: clamp(28px, 5vw, 44px); font-weight: 300; color: var(--color-on-primary); margin: 12px 0 10px; }
        .nl-desc { font-size: 14px; color: var(--color-on-primary); opacity: 0.9; max-width: 400px; margin: 0 auto 28px; line-height: 1.7; }
        .nl-form { display: flex; gap: 10px; max-width: 420px; margin: 0 auto; }
        @media (max-width: 480px) {
          .nl-form { flex-direction: column; gap: 8px; }
        }
        .nl-input {
          flex: 1; padding: 14px 20px; border-radius: 30px; border: none;
          font-size: 13px; outline: none; font-family: 'Playfair Display', serif;
          background: var(--color-surface);
          color: var(--color-on-surface);
        }
        .btn-white {
          padding: 14px 24px; background: var(--color-surface); color: var(--color-primary); border-radius: 30px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;
          cursor: pointer; border: none; white-space: nowrap; transition: all 0.2s;
        }
        .btn-white:hover { transform: scale(1.04); box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
        .nl-fine { font-size: 10px; color: var(--color-on-primary); opacity: 0.6; margin-top: 16px; }
      `}</style>

      {/* HERO */}
      <section className="hero">
        <HoverRevealImage
          wrapperClassName="absolute inset-0"
          imgClassName="hero-img"
          src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920&h=1080&fit=crop"
          alt="Hero fashion editorial"
          zoom={1.12}
        />
        <div className="hero-overlay">
          <span className="hero-badge">Summer Collection 2026</span>
          <h1 className="hero-title">The Poetry of<br /><span>Elegance</span></h1>
          <p className="hero-subtitle">Timeless pieces crafted with love and attention to every delicate detail.</p>
          <button className="btn-primary" onClick={() => navigate("/collections/dress")}>
            Explore Collection <i className="ti ti-arrow-right" aria-hidden="true"></i>
          </button>
        </div>
      </section>

      {/* PRODUCTS */}
      <div className="section-header">
        <span className="section-tag">Curated for you</span>
        <h2 className="section-title">The <span>New</span> Collection</h2>
        <p className="section-desc">Hand-picked pieces that celebrate your unique beauty and refined taste.</p>
      </div>

      <div className="filter-row">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`pill ${activeCategory === cat ? "active" : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {(isLoadingProducts || productsError) && (
        <div style={{ textAlign: "center", marginTop: -20, marginBottom: 28, color: "var(--color-on-surface-variant)", fontSize: 12 }}>
          {isLoadingProducts ? "Loading latest collection..." : productsError}
        </div>
      )}

      <div className="product-grid">
        {filteredProducts.map((p) => {
          const wishlisted = isInWishlist(p.id);
          const outOfStock = Number(p.stock) <= 0;
          return (
            <div key={p.id} className="product-card" onClick={() => setSelectedProduct(p)}>
              <div className="product-img-wrap">
                <HoverRevealImage
                  src={p.image}
                  alt={p.name}
                  wrapperClassName="image-zoom image-zoom--soft h-full w-full"
                  imgClassName="product-img"
                  zoom={1.2}
                />
                {p.seasonalBatch ? (
                  <div
                    className="absolute bottom-3 right-3 z-10 rounded-[18px] border border-white/20 px-3 py-2 text-white shadow-[0_12px_28px_rgba(0,0,0,0.18)] backdrop-blur-md"
                    style={{
                      background: "linear-gradient(135deg, rgba(111,31,47,0.96), rgba(69,18,29,0.88))"
                    }}
                  >
                    <div className="text-[8px] font-semibold uppercase tracking-[0.24em] opacity-80">
                      Seasonal
                    </div>
                    <div className="text-[13px] font-semibold leading-none">
                      {p.seasonalBadgeText || "Seasonal"}
                    </div>
                    <div className="text-[8px] font-semibold uppercase tracking-[0.18em] opacity-70">
                      Batch
                    </div>
                  </div>
                ) : null}
                <span className="product-badge" style={{ background: outOfStock ? "#4a4045" : p.badgeColor }}>
                  {outOfStock ? "Out of Stock" : p.badge}
                </span>
                <button
                  className="quick-view"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProduct(p);
                  }}
                >
                  Quick View
                </button>
                <button
                  className="heart-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(p);
                  }}
                  aria-label="Wishlist"
                  style={{ opacity: wishlisted ? 1 : undefined }}
                >
                  <i
                    className="ti ti-heart"
                    style={{
                      color: wishlisted ? "#e0205a" : "#d0607e",
                      opacity: wishlisted ? 1 : 0.5
                    }}
                  ></i>
                </button>
              </div>
               <div className="product-info">
                 <div className="product-info-main">
                   <div className="product-name">{p.name}</div>
                   <div className="product-meta-row">
                     {p.discountPercent ? (
                       <span className="product-meta-pill product-meta-pill--accent">
                         Save {p.discountPercent}% off
                       </span>
                     ) : null}
                     {/* {p.variantCount > 1 ? (
                       <span className="product-meta-pill">
                         {p.variantCount} variants
                       </span>
                     ) : null} */}
                   </div>
                 </div>
                 <div className="product-price-row">
                   <div className="product-price">{p.price}</div>
                    <div className="stars">
                      {"★".repeat(p.stars) + "☆".repeat(5 - p.stars)}
                      <span>({p.reviews})</span>
                    </div>
                 </div>
                 <div className="product-details-line">
                   {p.sizes?.length ? `Sizes: ${p.sizeSummary || p.sizes.join(", ")}` : "One size / custom fit"}
                 </div>
               </div>
            </div>
           );
         })}
       </div>

      {/* BENTO */}
      <div className="section-header" style={{ paddingTop: "16px" }}>
        <span className="section-tag">The art of refinement</span>
        <h2 className="section-title">Our <span>World</span></h2>
      </div>

      <div className="bento">
          <div className="bento-card">
            <HoverRevealImage
              wrapperClassName="image-zoom image-zoom--soft"
              imgClassName="bento-img"
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=450&fit=crop"
              alt="New arrivals"
              zoom={1.09}
            />
            <div className="bento-body">
            <span className="bento-emoji"></span>
            <div className="bento-title">New Arrivals</div>
            <p className="bento-desc">Refined silhouettes that speak to the modern minimalist. Discover the latest curation of seasonal essentials crafted with intention.</p>
            <button className="bento-link" onClick={() => navigate("/collections")}>
              Shop Now <i className="ti ti-arrow-right" aria-hidden="true"></i>
            </button>
          </div>
        </div>
        <div className="bento-right">
          <div className="bento-card">
            <HoverRevealImage
              wrapperClassName="image-zoom image-zoom--soft"
              imgClassName="bento-img-sq"
              src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop"
              alt="Accessories"
              zoom={1.09}
            />
            <div className="bento-body" style={{ padding: "16px 18px" }}>
              <span style={{ fontSize: "20px" }}></span>
              <div className="bento-title" style={{ fontSize: "20px", marginTop: "6px" }}>Essential Accents</div>
              <p className="bento-desc" style={{ fontSize: "12px" }}>The fine line between subtle and statement.</p>
            </div>
          </div>
          <div className="bento-cta">
            <i className="ti ti-star" style={{ fontSize: "28px", color: "var(--color-primary)" }} aria-hidden="true"></i>
            <div className="cta-title">Private Styling</div>
            <p className="cta-desc">Experience HUES with a personal design consultant, tailored to you.</p>
            <button className="btn-outline" onClick={() => navigate("/contact")}>Book Appointment</button>
          </div>
        </div>
      </div>

      {/* EDITORIAL */}
      <section className="editorial-section" style={{ padding: "0 0 64px" }}>
        <div className="editorial">
          <div className="editorial-text">
            <span className="section-tag" style={{ textAlign: "left" }}>The Journal</span>
            <h2 className="section-title" style={{ textAlign: "left", lineHeight: "1.2" }}>Crafting Beauty<br />in Every <span>Stitch</span></h2>
            <p className="section-desc" style={{ textAlign: "left", margin: "14px 0 24px", maxWidth: "360px" }}>An exploration of the artisan techniques behind our signature collections and the philosophy of slow luxury.</p>
            <button className="bento-link" style={{ fontSize: "11px" }} onClick={() => navigate("/about")}>
              Read the Story <i className="ti ti-arrow-right" aria-hidden="true"></i>
            </button>
          </div>
          <div className="editorial-images">
            <div className="editorial-img-wrap" style={{ marginTop: "40px" }}>
              <HoverRevealImage
                wrapperClassName="image-zoom image-zoom--subtle"
                imgClassName="editorial-img"
                src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=500&h=650&fit=crop"
                alt="Editorial 1"
                zoom={1.08}
              />
            </div>
            <div className="editorial-img-wrap">
              <HoverRevealImage
                wrapperClassName="image-zoom image-zoom--subtle"
                imgClassName="editorial-img"
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=500&h=650&fit=crop"
                alt="Editorial 2"
                zoom={1.08}
              />
            </div>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="newsletter">
        <span style={{ fontSize: "36px", display: "block" }}>💌</span>
        <h2 className="nl-title">Join Our Circle</h2>
        <p className="nl-desc">Be the first to discover new arrivals, exclusive offers, and style inspiration.</p>
        <div className="nl-form">
          <input className="nl-input" type="email" placeholder="Your email address" />
          <button className="btn-white">Subscribe</button>
        </div>
        <p className="nl-fine">By subscribing you agree to our Privacy Policy. Unsubscribe anytime.</p>
      </section>

      <Footer />

      {/* Quick View Modal */}
      {selectedProduct && (
        <QuickView
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}

