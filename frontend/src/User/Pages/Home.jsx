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
          --home-bg: #EDE7EC;
          --home-text: #3a2b34;
          --home-muted: #7c6672;
          --home-soft: #9c8894;
          --home-accent: #A85D80;
          --home-accent-strong: #5c2a41;
          --home-surface: rgba(255, 255, 255, 0.52);
          --home-surface-strong: rgba(255, 255, 255, 0.75);
          --home-surface-soft: rgba(255, 255, 255, 0.4);
          --home-border: rgba(168, 93, 128, 0.28);
          --home-border-bright: rgba(255, 255, 255, 0.65);
          --home-shadow: rgba(120, 70, 95, 0.12);
          --home-accent-shadow: rgba(168, 93, 128, 0.28);
          --home-heart: #e0205a;
          --home-heart-muted: #d0607e;
          --home-star: #d99b4e;
          --home-star-muted: #c7b7c2;
          font-family: 'Playfair Display', serif;
          color: var(--home-text);
          min-height: 100vh;
          position: relative;
          isolation: isolate;
          overflow-x: hidden;
        }

        .dark .hues-root,
        [data-theme="dark"] .hues-root {
          --home-bg: #0c0809;
          --home-text: #f3eeef;
          --home-muted: #d7c6c7;
          --home-soft: #a08e90;
          --home-accent: #e8a9b4;
          --home-accent-strong: #f4c5ce;
          --home-surface: rgba(33, 23, 25, 0.74);
          --home-surface-strong: rgba(43, 29, 31, 0.86);
          --home-surface-soft: rgba(23, 17, 18, 0.78);
          --home-border: rgba(232, 169, 180, 0.24);
          --home-border-bright: rgba(232, 169, 180, 0.18);
          --home-shadow: rgba(0, 0, 0, 0.42);
          --home-accent-shadow: rgba(232, 169, 180, 0.18);
          --home-heart: #ff7aa2;
          --home-heart-muted: #e8a9b4;
          --home-star: #f0b867;
          --home-star-muted: #8f767b;
        }

        /* ============ LUXURY AURA BACKGROUND ============ */
        .hues-root::before {
          content: "";
          position: fixed;
          inset: 0;
          z-index: -2;
          background-color: var(--home-bg);
          background-image:
            radial-gradient(48% 38% at 14% 8%, #DDDEE9 0%, rgba(221,222,233,0) 70%),
            radial-gradient(55% 45% at 85% 0%, #E0DCE9 0%, rgba(224,220,233,0) 72%),
            radial-gradient(60% 50% at 50% 30%, #F2EEF3 0%, rgba(242,238,243,0) 68%),
            radial-gradient(50% 42% at 6% 55%, #DBC7DF 0%, rgba(219,199,223,0) 70%),
            radial-gradient(55% 48% at 95% 45%, #D6BFD7 0%, rgba(214,191,215,0) 72%),
            radial-gradient(60% 55% at 100% 100%, #CB8FAE 0%, rgba(203,143,174,0.55) 40%, rgba(203,143,174,0) 75%),
            radial-gradient(50% 45% at 75% 90%, #E4BFC9 0%, rgba(228,191,201,0) 72%),
            radial-gradient(45% 40% at 30% 95%, #E8CCD2 0%, rgba(232,204,210,0) 70%),
            radial-gradient(40% 35% at 0% 100%, #DDCBE0 0%, rgba(221,203,224,0) 68%);
          background-repeat: no-repeat;
        }

        .dark .hues-root::before,
        [data-theme="dark"] .hues-root::before {
          background-image:
            radial-gradient(48% 38% at 14% 8%, rgba(91, 42, 58, 0.5) 0%, rgba(91,42,58,0) 70%),
            radial-gradient(55% 45% at 85% 0%, rgba(58, 36, 62, 0.62) 0%, rgba(58,36,62,0) 72%),
            radial-gradient(60% 50% at 50% 30%, rgba(39, 25, 30, 0.8) 0%, rgba(39,25,30,0) 68%),
            radial-gradient(50% 42% at 6% 55%, rgba(111, 31, 47, 0.38) 0%, rgba(111,31,47,0) 70%),
            radial-gradient(55% 48% at 95% 45%, rgba(91, 53, 60, 0.44) 0%, rgba(91,53,60,0) 72%),
            radial-gradient(60% 55% at 100% 100%, rgba(133, 61, 82, 0.42) 0%, rgba(133,61,82,0.24) 40%, rgba(133,61,82,0) 75%),
            radial-gradient(50% 45% at 75% 90%, rgba(87, 48, 58, 0.36) 0%, rgba(87,48,58,0) 72%),
            radial-gradient(45% 40% at 30% 95%, rgba(94, 48, 58, 0.32) 0%, rgba(94,48,58,0) 70%);
        }
        .hues-root::after {
          content: "";
          position: fixed;
          inset: 0;
          z-index: -1;
          backdrop-filter: blur(60px);
          -webkit-backdrop-filter: blur(60px);
        }

        .serif { font-family: 'Playfair Display', Georgia, serif; }

        /* Frosted glass surface used for cards / pills sitting on the aura */
        .glass-surface {
          background: var(--home-surface);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 0.5px solid var(--home-border-bright);
        }

        /* HERO */
        .hero {
          position: relative; height: 88vh; overflow: hidden;
          border-radius: 0 0 32px 32px;
          margin: 0;
        }
        .hero-img {
          width: 100%; height: 100%; object-fit: cover;
          filter: brightness(0.75) saturate(1.05);
          transition: transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform;
        }
        .hero:hover .hero-img { transform: scale(1); }
        .hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(58,25,40,0.62) 0%, rgba(58,25,40,0.12) 60%, transparent 100%);
          display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
          padding-bottom: 80px; text-align: center;
        }
        .hero-badge {
          font-size: 10px; font-weight: 600; letter-spacing: 0.3em; text-transform: uppercase;
          color: rgba(255,255,255,0.92); background: rgba(255,255,255,0.16);
          backdrop-filter: blur(8px); border: 0.5px solid rgba(255,255,255,0.32);
          padding: 6px 20px; border-radius: 20px; margin-bottom: 20px;
        }
        .hero-title {
          font-family: 'Gillie Quest', serif; font-size: clamp(42px, 8vw, 80px);
          font-weight: 300; line-height: 1.1; color: white; margin-bottom: 16px;
        }
        .hero-subtitle { font-size: 15px; font-weight: 300; color: rgba(255,255,255,0.88); margin-bottom: 32px; max-width: 400px; line-height: 1.6; }
        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 32px; background: var(--color-on-surface); color: var(--color-surface);
          border-radius: 40px; font-size: 11px; font-weight: 600;
          letter-spacing: 0.14em; text-transform: uppercase; cursor: pointer;
          border: none; transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn-primary:hover { transform: scale(1.04); box-shadow: 0 12px 32px var(--home-accent-shadow); }

        /* MARQUEE */
        .marquee-wrap {
          overflow: hidden; padding: 12px 0;
          background: linear-gradient(90deg, var(--color-primary-container) 0%, var(--home-accent) 50%, var(--color-primary-container) 100%);
        }
        .marquee-inner {
          display: flex; gap: 48px; white-space: nowrap;
          animation: marquee 20s linear infinite;
        }
        .marquee-item {
          font-size: 10px; font-weight: 600; letter-spacing: 0.25em; text-transform: uppercase;
          color: #fff; flex-shrink: 0;
        }
        .marquee-dot { color: rgba(255,255,255,0.55); margin-right: 48px; }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }

        /* SECTION HEADER */
        .section-header { text-align: center; padding: 64px 40px 40px; }
        .section-tag {
          font-size: 10px; font-weight: 600; letter-spacing: 0.3em; text-transform: uppercase;
          color: var(--home-accent); display: block; margin-bottom: 12px;
        }
        .section-title { font-family: 'Playfair Display', serif; font-size: clamp(28px, 5vw, 46px); font-weight: 300; color: var(--home-text); }
        .section-title em { font-style: normal; color: var(--home-accent); }
        .section-title span { color: var(--home-accent); }
        .section-desc { font-size: 14px; color: var(--home-muted); margin-top: 10px; max-width: 360px; margin-left: auto; margin-right: auto; line-height: 1.7; }

        /* FILTER PILLS */
        .filter-row { display: flex; justify-content: center; gap: 8px; padding: 0 40px 36px; flex-wrap: wrap; }
        .pill {
          padding: 7px 18px; border-radius: 20px; font-size: 11px; font-weight: 500;
          letter-spacing: 0.08em; cursor: pointer; transition: all 0.2s;
          border: 0.5px solid var(--home-border);
          background: var(--home-surface);
          backdrop-filter: blur(10px);
          color: var(--home-muted);
        }
        .pill.active, .pill:hover { background: var(--home-accent); color: var(--color-on-primary); border-color: var(--home-accent); box-shadow: 0 6px 18px var(--home-accent-shadow); }

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
          background: var(--home-surface-soft);
          box-shadow: 0 10px 30px var(--home-shadow);
        }
        .product-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; display: block; }
        .product-card:hover .product-img { transform: scale(1); }
        .product-badge {
          position: absolute; top: 10px; left: 10px;
          font-size: 9px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase;
          padding: 4px 10px; border-radius: 12px; color: white;
          backdrop-filter: blur(4px);
        }

        .heart-btn {
          position: absolute; top: 10px; right: 10px; width: 32px; height: 32px;
          background: var(--home-surface-strong); border-radius: 50%; border: 0.5px solid var(--home-border-bright); cursor: pointer;
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
          color: var(--home-text);
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
          color: var(--home-muted);
          border: 1px solid var(--home-border);
          background: var(--home-surface);
        }
        .product-meta-pill--accent {
          color: var(--home-accent);
          border-color: var(--home-accent);
          background: var(--home-surface-strong);
        }
        .product-price-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 12px;
        }
        .product-price { font-size: 16px; font-weight: 500; color: var(--home-accent); }
        .product-details-line {
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--home-soft);
          line-height: 1.5;
        }
        .stars { color: var(--home-star); font-size: 10px; white-space: nowrap; }
        .stars span { color: var(--home-star-muted); font-size: 9px; margin-left: 3px; }

        /* BENTO */
        .bento { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; padding: 0 40px 64px; max-width: 1200px; margin: 0 auto; }
        @media (max-width: 768px) {
          .bento { grid-template-columns: 1fr; gap: 16px; padding: 0 20px 48px; }
        }
        .bento-card {
          border-radius: 20px; overflow: hidden;
          background: var(--home-surface);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 0.5px solid var(--home-border-bright);
          transition: box-shadow 0.3s, transform 0.3s;
        }
        .bento-card:hover {
          box-shadow: 0 16px 44px var(--home-accent-shadow);
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
        .bento-card:hover .bento-img-sq { transform: scale(1); }
        .bento-body {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: 30px 32px 32px;
          background: linear-gradient(180deg, color-mix(in srgb, var(--home-surface-strong) 48%, transparent), transparent 100%);
          border-top: 0.5px solid var(--home-border-bright);
        }
        .bento-body::before {
          content: "";
          width: 34px;
          height: 1px;
          margin-bottom: 16px;
          background: var(--home-accent);
          opacity: 0.8;
        }
        .bento-emoji { font-size: 28px; margin-bottom: 10px; display: block; }
        .bento-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(24px, 3vw, 32px);
          font-weight: 400;
          line-height: 1.12;
          color: var(--home-text);
          margin-bottom: 10px;
        }
        .bento-desc {
          max-width: 470px;
          font-family: 'Manrope', sans-serif;
          font-size: 13px;
          font-weight: 400;
          color: var(--home-muted);
          line-height: 1.85;
        }
        .bento-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 38px;
          margin-top: 22px;
          padding: 0 18px;
          border-radius: 999px;
          border: 0.5px solid var(--home-border);
          background: var(--home-surface-strong);
          color: var(--home-accent);
          font-family: 'Manrope', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          transition: transform 0.22s ease, border-color 0.22s ease, background-color 0.22s ease, box-shadow 0.22s ease;
        }
        .bento-link:hover {
          transform: translateY(-1px);
          border-color: var(--home-accent);
          background: color-mix(in srgb, var(--home-accent) 12%, var(--home-surface-strong));
          box-shadow: 0 10px 24px var(--home-accent-shadow);
        }
        .bento-link i {
          font-size: 14px;
          transition: transform 0.22s ease;
        }
        .bento-link:hover i { transform: translateX(3px); }
        .bento-right { display: flex; flex-direction: column; gap: 20px; }
        .bento-cta {
          background: linear-gradient(135deg, var(--home-surface) 0%, color-mix(in srgb, var(--home-accent) 18%, transparent) 100%);
          backdrop-filter: blur(16px);
          border-radius: 20px; padding: 32px 24px; text-align: center;
          border: 0.5px solid var(--home-border-bright); display: flex; flex-direction: column; align-items: center;
          justify-content: center;
        }
        .cta-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 300; color: var(--home-text); margin: 10px 0 8px; }
        .cta-desc { font-size: 12px; color: var(--home-muted); line-height: 1.6; margin-bottom: 18px; }
        .btn-outline {
          padding: 10px 24px; border-radius: 20px; background: var(--home-surface-strong); color: var(--home-accent);
          border: 0.5px solid var(--home-accent); font-size: 10px; font-weight: 600;
          letter-spacing: 0.12em; text-transform: uppercase; cursor: pointer;
          transition: all 0.2s;
        }
        .btn-outline:hover { background: var(--home-accent); color: var(--color-on-primary); border-color: var(--home-accent); }

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
        .editorial-img-wrap { border-radius: 16px; overflow: hidden; box-shadow: 0 12px 32px var(--home-shadow); }
        .editorial-img {
          width: 100%; aspect-ratio: 3/4; object-fit: cover; display: block;
          transition: transform 0.75s cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform;
        }
        .editorial-img-wrap:hover .editorial-img { transform: scale(1); }
        .editorial-img-wrap:first-child { margin-top: 40px; }
        @media (max-width: 768px) {
          .editorial-img-wrap:first-child { margin-top: 0; }
        }

        /* NEWSLETTER */
        .newsletter {
          background: linear-gradient(135deg, var(--color-primary-container) 0%, var(--home-accent) 100%);
          padding: 72px 40px; text-align: center; margin: 48px 0 0;
        }
        @media (max-width: 768px) {
          .newsletter { padding: 48px 20px; }
        }
        .nl-title { font-family: 'Playfair Display', serif; font-size: clamp(28px, 5vw, 44px); font-weight: 300; color: #fff; margin: 12px 0 10px; }
        .nl-desc { font-size: 14px; color: #fff; opacity: 0.92; max-width: 400px; margin: 0 auto 28px; line-height: 1.7; }
        .nl-form { display: flex; gap: 10px; max-width: 420px; margin: 0 auto; }
        @media (max-width: 480px) {
          .nl-form { flex-direction: column; gap: 8px; }
        }
        .nl-input {
          flex: 1; padding: 14px 20px; border-radius: 30px; border: none;
          font-size: 13px; outline: none; font-family: 'Playfair Display', serif;
          background: var(--home-surface-strong);
          color: var(--home-text);
        }
        .btn-white {
          padding: 14px 24px; background: var(--color-on-surface); color: var(--color-surface); border-radius: 30px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;
          cursor: pointer; border: none; white-space: nowrap; transition: all 0.2s;
        }
        .btn-white:hover { transform: scale(1.04); box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
        .nl-fine { font-size: 10px; color: #fff; opacity: 0.65; margin-top: 16px; }
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
          <h1 className="hero-title">Simplicity With<br /><span>A Touch Of Spice</span></h1>
          <p className="hero-subtitle">A curated collection of casuals and Indian-inspired everyday wear designed to keep you comfortable and stylish</p>
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
        <div style={{ textAlign: "center", marginTop: -20, marginBottom: 28, color: "var(--home-muted)", fontSize: 12 }}>
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
                  showTooltip={true}
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
                <span className="product-badge" style={{ background: outOfStock ? "var(--home-muted)" : p.badgeColor }}>
                  {outOfStock ? "Out of Stock" : p.badge}
                </span>
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
                      color: wishlisted ? "var(--home-heart)" : "var(--home-heart-muted)",
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
            <p className="bento-desc">Explore our newest arrivals featuring a blend of easy-going, normal casuals and vibrant, Indian-inspired everyday wear.</p>
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
            <i className="ti ti-star" style={{ fontSize: "28px", color: "var(--home-accent)" }} aria-hidden="true"></i>
            <div className="cta-title">Private Styling</div>
            <p className="cta-desc">Experience HUES with a personal design consultant, tailored to you.</p>
            <button className="btn-outline" 
            onClick={() => navigate("/contact")}>
              Book Appointment</button>
          </div>
        </div>
      </div>

      {/* EDITORIAL */}
      <section className="editorial-section" style={{ padding: "0 0 64px" }}>
        <div className="editorial">
          <div className="editorial-text">
            <span className="section-tag" style={{ textAlign: "left" }}>Our Story</span>
            <h2 className="section-title" style={{ textAlign: "left", lineHeight: "1.2" }}>Effortless Looks,<br />Thoughtfully Sourced</h2>
            <p className="section-desc" style={{ textAlign: "left", margin: "14px 0 24px", maxWidth: "360px" }}>Born from a passion for relaxed, easy-going fashion, we curate collections that seamlessly blend unique Indian-inspired details with normal, everyday casuals. Thoughtfully sourced and globally delivered, every piece is selected to bring a sense of effortless style to your wardrobe, wherever you are.</p>
            <button className="bento-link" style={{ fontSize: "11px" }} onClick={() => navigate("/about")}>
              Our Journey <i className="ti ti-arrow-right" aria-hidden="true"></i>
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
