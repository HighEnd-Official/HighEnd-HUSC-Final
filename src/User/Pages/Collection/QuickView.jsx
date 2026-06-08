import { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useCart } from "../../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { apiFetch } from "../../../api/client";
import { productToCollectionShape } from "./collectionUtils";
import HoverRevealImage from "../../../components/HoverRevealImage";

const normalizeSizeCodes = (sizes = []) =>
  Array.from(
    new Set(
      (Array.isArray(sizes) ? sizes : [])
        .map((size) => (typeof size === "string" ? size : size?.code))
        .map((size) => String(size || "").trim())
        .filter(Boolean)
    )
  );

const normalizeColorValue = (value, fallback = "#E5B6C8") => {
  const text = String(value || "").trim();
  return text || fallback;
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const hexToRgb = (hex) => {
  const cleaned = String(hex || "").replace("#", "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) return null;
  return {
    r: parseInt(cleaned.slice(0, 2), 16),
    g: parseInt(cleaned.slice(2, 4), 16),
    b: parseInt(cleaned.slice(4, 6), 16),
  };
};

const rgbToHex = ({ r, g, b }) =>
  `#${[r, g, b]
    .map((value) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0"))
    .join("")}`.toUpperCase();

const shiftHex = (hex, amount) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const next = {
    r: rgb.r + (255 - rgb.r) * amount,
    g: rgb.g + (255 - rgb.g) * amount,
    b: rgb.b + (255 - rgb.b) * amount,
  };
  if (amount < 0) {
    const darkAmount = Math.abs(amount);
    next.r = rgb.r * (1 - darkAmount);
    next.g = rgb.g * (1 - darkAmount);
    next.b = rgb.b * (1 - darkAmount);
  }
  return rgbToHex(next);
};

const COLOR_NAME_FALLBACKS = {
  pink: "#F3B6C8",
  rose: "#D97A96",
  blush: "#E9B3C2",
  mauve: "#C79BC6",
  cream: "#F6E9DA",
  ivory: "#FFF8F0",
  offwhite: "#FAF7F2",
  off_white: "#FAF7F2",
  "off-white": "#FAF7F2",
  yellow: "#D7A53A",
  mustard: "#B88A28",
  lemon: "#E0C24B",
  white: "#FFFFFF",
  black: "#1A1A1A",
  beige: "#D6B79B",
  sand: "#D8C4A9",
  nude: "#D8B79A",
  gold: "#C79A2B",
  amber: "#C9892A",
  maroon: "#6F1F2F",
  burgundy: "#7A2334",
  red: "#B24A4A",
  wine: "#74263A",
  blue: "#496A9F",
  navy: "#2F4D73",
  teal: "#2E7981",
  green: "#4F8A6B",
  olive: "#77754A",
  brown: "#8B6A4A",
  purple: "#8A63B8",
  lavender: "#B49AD8",
  lilac: "#CDB7E9",
  peach: "#F2B08F",
  coral: "#E98B7A",
  orange: "#D57F45",
  grey: "#9A9A9A",
  gray: "#9A9A9A",
  silver: "#CFCFCF",
};

const resolveSwatchColor = (color) => {
  const name = String(color?.name || "").trim().toLowerCase();
  if (name) {
    const isLight = /\blight\b|\bpale\b|\bsoft\b|\bpowder\b|\bpastel\b/.test(name);
    const isDark = /\bdark\b|\bdeep\b|\bnavy\b|\bmidnight\b|\bburgundy\b|\bwine\b/.test(name);

    const normalizedName = name
      .replace(/\b(light|dark|deep|pale|soft|powder|pastel|midnight)\b/g, "")
      .replace(/\s+/g, " ")
      .trim();

    const direct = COLOR_NAME_FALLBACKS[normalizedName] || COLOR_NAME_FALLBACKS[name];
    if (direct) {
      if (isLight && !isDark) return shiftHex(direct, 0.22);
      if (isDark && !isLight) return shiftHex(direct, -0.20);
      return direct;
    }

    const keywordMatch = Object.entries(COLOR_NAME_FALLBACKS).find(([keyword]) => normalizedName.includes(keyword) || name.includes(keyword));
    if (keywordMatch) {
      const matched = keywordMatch[1];
      if (isLight && !isDark) return shiftHex(matched, 0.22);
      if (isDark && !isLight) return shiftHex(matched, -0.20);
      return matched;
    }
  }
  return normalizeColorValue(color?.colorHex || color?.hex, "#E5B6C8");
};

const QuickView = ({ product, onClose }) => {
  const { isAuthenticated } = useAuth();
  const [activeProduct, setActiveProduct] = useState(product);
  const initialSizes = product?.hasManagedSizes
    ? normalizeSizeCodes(product.sizes)
    : normalizeSizeCodes(product?.sizes || ["XS", "S", "M", "L", "XL"]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState(() => initialSizes[0] || "");
  const [selectedColor, setSelectedColor] = useState(null);
  const [fading, setFading] = useState(false);
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [likeSaving, setLikeSaving] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  const { addItem, toggleWishlist, isInWishlist } = useCart();
  const productId = activeProduct?.id || activeProduct?.name;
  const isWishlisted = isInWishlist(productId);
  const navigate = useNavigate();
  const displayProduct = activeProduct || product;

  // Color variants and media state
  const colorVariants = useMemo(() => {
    if (product?.colorVariants) return product.colorVariants;
    if (product?.colors) {
      return product.colors.map((c, i) => ({
        id: c.id || c.name?.toLowerCase().replace(/\s+/g, "-") || `color-${i}`,
        name: c.name,
        colorHex: c.hex || c.colorHex,
        images: c.images || product.images || [],
        price: c.price || product.price,
        inStock: c.inStock !== undefined ? c.inStock : true,
        floralPattern: c.floralPattern || ""
      }));
    }
    return [
      {
        id: "white",
        name: "White",
        colorHex: "#FFFFFF",
        images: product?.images || [],
        price: product?.price,
        inStock: true,
      },
      {
        id: "pink",
        name: "Pink",
        colorHex: "#FFB6C1",
        images: product?.images || [],
        price: product?.price,
        inStock: true,
      },
      {
        id: "black",
        name: "Black",
        colorHex: "#1A1A1A",
        images: product?.images || [],
        price: product?.price,
        inStock: true,
      }
    ];
  }, [product]);

  useEffect(() => {
    if (colorVariants.length > 0 && !selectedColor) {
      setSelectedColor(colorVariants[0]);
    }
  }, [colorVariants, selectedColor]);

  useEffect(() => {
    if (selectedColor?.product) {
      setActiveProduct(selectedColor.product);
      return;
    }
    setActiveProduct(product);
  }, [selectedColor, product]);

  useEffect(() => {
    const nextSizes = product?.hasManagedSizes
      ? normalizeSizeCodes(product.sizes)
      : normalizeSizeCodes(product?.sizes || ["XS", "S", "M", "L", "XL"]);
    setSelectedSize(nextSizes[0] || "");
  }, [product]);

  useEffect(() => {
    let cancelled = false;
    if (!product?.id || product?.variants?.length) return undefined;

    setActiveProduct(product);
    apiFetch(`/products/${product.id}`)
      .then((data) => {
        if (!cancelled && data?.product) {
          setActiveProduct(productToCollectionShape(data.product));
        }
      })
      .catch(() => {
        if (!cancelled) setActiveProduct(product);
      });

    return () => {
      cancelled = true;
    };
  }, [product]);

  const currentImages = selectedColor?.images || displayProduct?.images || [];
  const currentPrice = selectedColor?.price || displayProduct?.price;
  const originalPrice = selectedColor?.originalPrice || displayProduct?.originalPrice || "";
  const stock = Number(displayProduct?.stock);
  const hasStockLimit = Number.isFinite(stock);
  const availableSizes = displayProduct?.hasManagedSizes
    ? normalizeSizeCodes(displayProduct.sizes)
    : normalizeSizeCodes(displayProduct?.sizes || ["XS", "S", "M", "L", "XL"]);
  const outOfStock = hasStockLimit && stock <= 0;
  const canAddToCart = !outOfStock && availableSizes.length > 0 && selectedColor?.inStock !== false && Boolean(selectedSize);
  const reviewList = displayProduct?.reviewList || [];
  const likesCount = Number(displayProduct?.likesCount) || 0;
  const likedByMe = Boolean(displayProduct?.likedByMe);
  const reviewCount = Number(displayProduct?.reviewCount || displayProduct?.reviews) || 0;
  const imageCount = currentImages.length;

  const handleWishlistClick = () => {
    toggleWishlist(displayProduct);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 450);
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      navigate("/signin");
      return;
    }
    if (!displayProduct?.id || likeSaving) return;
    setLikeSaving(true);
    try {
      const data = await apiFetch(`/products/${displayProduct.id}/like`, { method: "POST" });
      setActiveProduct((current) => ({
        ...current,
        likedByMe: data.liked,
        likesCount: data.likesCount,
      }));
    } finally {
      setLikeSaving(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewError("");
    if (!isAuthenticated) {
      navigate("/signin");
      return;
    }
    if (!reviewComment.trim()) {
      setReviewError("Please write a review before submitting.");
      return;
    }
    if (!displayProduct?.id) return;
    setReviewSaving(true);
    try {
      const data = await apiFetch(`/products/${displayProduct.id}/reviews`, {
        method: "POST",
        body: JSON.stringify({
          rating: Number(reviewRating) || 5,
          title: reviewTitle.trim() || null,
          comment: reviewComment.trim(),
        }),
      });
      setActiveProduct((current) => ({
        ...current,
        rating: data.rating,
        reviewCount: data.reviewsCount,
        reviews: data.reviewsCount,
      }));
      setReviewTitle("");
      setReviewComment("");
      setReviewRating(5);
      const refreshed = await apiFetch(`/products/${displayProduct.id}`);
      setActiveProduct(productToCollectionShape(refreshed.product));
    } catch (err) {
      setReviewError(err?.message || "Failed to submit your review.");
    } finally {
      setReviewSaving(false);
    }
  };

  const switchImage = useCallback((idx) => {
    if (!imageCount) return;
    if (idx === activeIdx) return;
    setFading(true);
    setTimeout(() => {
      setActiveIdx(idx % imageCount);
      setFading(false);
    }, 180);
  }, [activeIdx, imageCount]);

  const prev = useCallback(() => {
    if (!imageCount) return;
    switchImage((activeIdx - 1 + imageCount) % imageCount);
  }, [switchImage, activeIdx, imageCount]);
  const next = useCallback(() => {
    if (!imageCount) return;
    switchImage((activeIdx + 1) % imageCount);
  }, [switchImage, activeIdx, imageCount]);

  useEffect(() => {
    setActiveIdx(0);
  }, [selectedColor]);

  useEffect(() => {
    setSelectedColor(colorVariants[0] || null);
    setActiveIdx(0);
    setAdded(false);
    setQty(1);
  }, [product?.id, colorVariants]);

  useEffect(() => {
    if (hasStockLimit && stock > 0 && qty > stock) {
      setQty(stock);
    }
  }, [hasStockLimit, qty, stock]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeIdx, selectedColor, onClose, prev, next]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobileView(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);

  if (!displayProduct) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[500] grid place-items-center p-4 md:p-16"
      style={{
        backgroundColor: "rgba(29,18,22,0.36)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        animation: "fadeIn 0.25s ease both",
      }}
      onClick={onClose}
    >
      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
        @keyframes gentlePulse { 
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--color-outline-variant); border-radius: 10px; }
        .heartbeat-active {
          animation: gentlePulse 0.45s ease-in-out;
        }
        .size-btn:hover {
          transform: translateY(-2px);
        }
        .color-swatch:hover {
          transform: scale(1.1);
        }
        .quickview-panel {
          box-shadow: 0 28px 80px rgba(18, 10, 13, 0.28);
          border: 1px solid color-mix(in srgb, var(--color-outline-variant) 75%, transparent);
        }
        @media (max-width: 767px) {
          .quickview-mobile-gallery {
            min-height: 42vh;
          }
          .quickview-mobile-image img {
            object-fit: contain !important;
            padding: 10px;
          }
          .quickview-mobile-thumbs {
            height: 76px;
          }
        }
      `}</style>

      {/* Modal panel */}
      <div
        className="quickview-panel bg-[var(--color-surface)] w-full max-w-[1120px] max-h-[88vh] flex flex-col md:flex-row overflow-hidden relative rounded-[28px]"
        style={{ 
          animation: "slideUp 0.35s cubic-bezier(0.16,1,0.3,1) both",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative floral corner accents */}
        <div className="absolute top-0 left-0 text-4xl opacity-10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 text-4xl opacity-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 text-4xl opacity-10 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 text-4xl opacity-10 pointer-events-none"></div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full transition-all hover:scale-110 flex items-center justify-center bg-[var(--color-surface)]/80 backdrop-blur-sm hover:bg-[var(--color-primary)] hover:text-white group"
          style={{ boxShadow: "0 2px 8px rgba(133,76,111,0.15)" }}
        >
          <span
            className="text-[20px] group-hover:text-white transition-colors"
            style={{ color: "var(--color-primary)" }}
          >
            ✕
          </span>
        </button>

        {/* LEFT: Gallery */}
        <div className="quickview-mobile-gallery w-full md:w-[58%] lg:w-[62%] flex flex-col h-[52vh] md:h-auto bg-gradient-to-br from-[var(--color-surface-container-low)] to-[var(--color-surface)]">
          {/* Main image */}
          <div className="flex-1 relative overflow-hidden group">
            {displayProduct.seasonalBatch ? (
              <div
                className="absolute left-4 top-4 z-20 rounded-[18px] border border-white/20 px-3 py-2 text-white shadow-[0_12px_28px_rgba(0,0,0,0.18)] backdrop-blur-md"
                style={{ background: "linear-gradient(135deg, rgba(111,31,47,0.96), rgba(69,18,29,0.88))" }}
              >
                <div className="text-[8px] font-semibold uppercase tracking-[0.24em] opacity-80">
                  Seasonal
                </div>
                <div className="text-[13px] font-semibold leading-none">
                  {displayProduct.seasonalBadgeText || "Seasonal"}
                </div>
                <div className="text-[8px] font-semibold uppercase tracking-[0.18em] opacity-70">
                  Batch
                </div>
              </div>
            ) : null}
            {imageCount > 0 ? (
              <HoverRevealImage
                src={currentImages[activeIdx]}
                alt={displayProduct.name}
                wrapperClassName="quickview-mobile-image absolute inset-0 z-0"
                imgClassName="w-full h-full"
                fit={isMobileView ? "contain" : "cover"}
                zoom={isMobileView ? 1.04 : 1.28}
                style={{ backgroundColor: "var(--color-surface)" }}
                imgStyle={{ opacity: fading ? 0 : 1 }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)]">
                No preview available
              </div>
            )}
            
            {/* Decorative overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent pointer-events-none" />
            
            {/* Arrow controls */}
            <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={prev}
                className="pointer-events-auto w-10 h-10 rounded-full transition-all hover:scale-110 flex items-center justify-center bg-[var(--color-surface)]/90 shadow-lg"
                style={{ color: "var(--color-primary)" }}
              >
                <span className="text-2xl">←</span>
              </button>
              <button
                onClick={next}
                className="pointer-events-auto w-10 h-10 rounded-full transition-all hover:scale-110 flex items-center justify-center bg-[var(--color-surface)]/90 shadow-lg"
                style={{ color: "var(--color-primary)" }}
              >
                <span className="text-2xl">→</span>
              </button>
            </div>
            
            {/* Image counter */}
            {imageCount > 0 ? (
              <div className="absolute bottom-3 right-4 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1 text-[10px] font-semibold tracking-widest text-white/90 uppercase">
                {activeIdx + 1} / {imageCount}
              </div>
            ) : null}
          </div>

          {/* Thumbnails */}
          <div className="quickview-mobile-thumbs h-24 md:h-28 bg-[var(--color-surface)]/50 backdrop-blur-sm flex items-center gap-2 px-4 py-2 overflow-x-auto custom-scrollbar border-t border-[rgba(215,197,198,0.2)]">
            {currentImages.map((img, i) => (
              <button
                key={i}
                onClick={() => switchImage(i)}
                className="flex-shrink-0 h-full transition-all duration-200 rounded-lg overflow-hidden shadow-md hover:shadow-xl"
                style={{
                  aspectRatio: "3/4",
                  border: `2px solid ${activeIdx === i ? "var(--color-primary)" : "transparent"}`,
                  opacity: activeIdx === i ? 1 : 0.55,
                }}
              >
                <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.08]" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: Product Info */}
        <div
          className="w-full md:w-[42%] lg:w-[38%] flex flex-col justify-between overflow-y-auto custom-scrollbar p-8 md:p-10 bg-[var(--color-surface)]/60 backdrop-blur-sm"
          style={{ fontFamily: "'Manrope', serif" }}
        >
          <div className="space-y-6">
            {/* Title block with sparkle */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">✦</span>
                <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--color-primary)]">
                  {displayProduct.collection || "The Atelier Collection"}
                </p>
              </div>
              {displayProduct.badge ? (
                <div
                  className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.16em] uppercase"
                  style={{ backgroundColor: displayProduct.badgeColor || "var(--color-primary)", color: "var(--color-on-primary)", width: "fit-content" }}
                >
                  {displayProduct.badge}
                </div>
              ) : null}
              <h2
                className="text-[32px] leading-snug text-[var(--color-on-surface)]"
                style={{ fontFamily: "'Manrope', serif", fontWeight: 400 }}
              >
                {displayProduct.name}
              </h2>
              {displayProduct.subtitle ? (
                <p className="text-[13px] text-[var(--color-on-surface-variant)]">
                  {displayProduct.subtitle}
                </p>
              ) : null}
              <p className="text-[28px] font-light text-[var(--color-primary)]" style={{ fontFamily: "'Manrope', serif" }}>
                {currentPrice}
              </p>
              {originalPrice ? (
                <p className="text-[12px] text-[var(--color-outline)] line-through">
                  {originalPrice}
                </p>
              ) : null}
              {displayProduct.discountPercent ? (
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                  Save {displayProduct.discountPercent}% off
                </p>
              ) : null}
              <p className="text-[12px] text-[var(--color-on-surface-variant)]">
                {displayProduct.rating ? `${displayProduct.rating}/5` : "No rating"} · {reviewCount} reviews
              </p>
              <p className="text-[11px] font-semibold tracking-[0.14em] uppercase" style={{ color: outOfStock ? "var(--color-primary)" : "var(--color-tertiary)" }}>
                {outOfStock ? "Out of Stock" : hasStockLimit ? `${stock} in stock` : "In Stock"}
              </p>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-[var(--color-outline-variant)] to-transparent" />

            {/* COLOR SELECTION with floral emojis */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[var(--color-on-surface-variant)] flex items-center gap-1">
                  <span>◌</span> Choose Your Color
                </p>
                <p className="text-[11px] text-[var(--color-primary)] font-medium">
                  {selectedColor?.name || "White"} {selectedColor?.floralPattern}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {colorVariants.map((color) => (
                  <div key={color.id} className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => setSelectedColor(color)}
                      className="relative group transition-all duration-200 color-swatch"
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                      }}
                      disabled={!color.inStock}
                      aria-label={`Choose ${color.name}`}
                      title={color.name}
                    >
                      <div
                        className="w-full h-full rounded-full transition-all duration-200 shadow-md"
                        style={{
                          backgroundColor: resolveSwatchColor(color),
                          border: resolveSwatchColor(color).toLowerCase() === "#ffffff" ? "2px solid var(--color-outline-variant)" : "none",
                          outline: `2px solid ${selectedColor?.id === color.id ? "var(--color-primary)" : "transparent"}`,
                          outlineOffset: "2px",
                          boxShadow: selectedColor?.id === color.id
                            ? "0 0 0 3px var(--color-surface), 0 0 0 5px var(--color-primary)"
                            : "0 2px 4px rgba(0,0,0,0.1)",
                        }}
                      />
                      {!color.inStock && (
                        <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-sm">
                          <span className="text-[8px] font-bold text-white">OUT</span>
                        </div>
                      )}
                    </button>
                    <div className="text-center text-[10px] font-semibold text-[var(--color-on-surface-variant)] whitespace-nowrap pointer-events-none">
                      {color.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Size selector with cute styling */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[var(--color-on-surface-variant)] flex items-center gap-1">
                  <span>✧</span> Select Size
                </p>
                <button type="button" className="text-[10px] underline underline-offset-4 text-[var(--color-outline)] hover:text-[var(--color-primary)] transition-colors bg-transparent border-none p-0 cursor-pointer">
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className="size-btn px-4 py-2 text-[13px] font-medium rounded-full transition-all duration-200"
                    style={{
                      backgroundColor: selectedSize === s ? "var(--color-primary)" : "transparent",
                      color: selectedSize === s ? "white" : "var(--color-on-surface)",
                      border: `1px solid ${selectedSize === s ? "var(--color-primary)" : "var(--color-outline-variant)"}`,
                      boxShadow: selectedSize === s ? "0 2px 8px rgba(133,76,111,0.3)" : "none",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {!availableSizes.length ? (
                <p className="text-[11px] text-[var(--color-primary)]">No sizes are currently available.</p>
              ) : !selectedSize ? (
                <p className="text-[11px] text-[var(--color-outline)]">Choose a size before adding this item.</p>
              ) : null}
              {selectedSize ? (
                <p className="text-[11px] text-[var(--color-tertiary)]">Selected size: {selectedSize}</p>
              ) : null}
            </div>

            {/* Quantity Selector with cute + - */}
            <div className="space-y-3">
              <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[var(--color-on-surface-variant)] flex items-center gap-1">
                <span>◌</span> Quantity
              </p>
              <div className="flex items-center w-36 border-2 border-[var(--color-outline-variant)] rounded-full overflow-hidden bg-[var(--color-surface)] transition-all duration-200 hover:border-[var(--color-primary)]">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  className="w-10 h-10 flex items-center justify-center text-[18px] text-[var(--color-primary)] hover:bg-[var(--color-surface-container-low)] disabled:opacity-40 transition-colors"
                >
                  −
                </button>
                <span className="flex-1 text-center text-[16px] font-semibold text-[var(--color-on-surface)] select-none">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => hasStockLimit ? Math.min(stock, q + 1) : q + 1)}
                  disabled={outOfStock || (hasStockLimit && qty >= stock)}
                  className="w-10 h-10 flex items-center justify-center text-[18px] text-[var(--color-primary)] hover:bg-[var(--color-surface-container-low)] disabled:opacity-40 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Description with cute icons */}
            <div className="space-y-2">
              <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[var(--color-on-surface-variant)] flex items-center gap-1">
                <span>✦</span> Product Essence
              </p>
              <p className="text-[14px] text-[var(--color-on-surface-variant)] leading-relaxed">
                {displayProduct.description}
              </p>
            </div>

            {/* Details list with floral bullets */}
            {displayProduct.details && (
              <ul className="space-y-1.5">
                {displayProduct.details.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-[var(--color-on-surface-variant)]">
                    <span className="text-[var(--color-primary)]">•</span>
                    {d}
                  </li>
                ))}
              </ul>
            )}

            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[var(--color-on-surface-variant)]">
                  Customer Reviews
                </p>
                <button
                  type="button"
                  onClick={handleLike}
                  className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] transition-all"
                  style={{
                    borderColor: likedByMe ? "var(--color-primary)" : "var(--color-outline-variant)",
                    background: likedByMe ? "rgba(111,31,47,0.1)" : "var(--color-surface)",
                    color: "var(--color-primary)",
                  }}
                  disabled={likeSaving}
                >
                  <span aria-hidden="true">{likedByMe ? "♥" : "♡"}</span>
                  {likeSaving ? "Saving..." : `${likesCount} Likes`}
                </button>
              </div>

              {reviewList.length ? (
                <div className="space-y-3">
                  {reviewList.slice(0, 3).map((review) => (
                    <div key={review.id} className="rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface)]/70 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-[13px] font-semibold text-[var(--color-on-surface)]">{review.user?.username || "Customer"}</div>
                          <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--color-outline)]">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-[11px] font-semibold text-[var(--color-primary)]">{review.rating}/5</div>
                      </div>
                      {review.title ? <div className="mt-2 text-[13px] font-semibold text-[var(--color-on-surface)]">{review.title}</div> : null}
                      <p className="mt-1 text-[13px] leading-relaxed text-[var(--color-on-surface-variant)]">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-[var(--color-outline)]">No reviews yet. Be the first to share one.</p>
              )}

              <form onSubmit={submitReview} className="rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface)]/75 p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[var(--color-on-surface-variant)]">Write a review</p>
                  <select
                    className="rounded-full border border-[var(--color-outline-variant)] bg-[var(--color-surface)] px-3 py-2 text-[12px] outline-none"
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                  >
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <option key={rating} value={rating}>{rating} Star{rating === 1 ? "" : "s"}</option>
                    ))}
                  </select>
                </div>
                <input
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="Review title (optional)"
                  className="w-full rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface)] px-4 py-3 text-[13px] outline-none"
                />
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder={isAuthenticated ? "Tell us what you think..." : "Sign in to leave a review"}
                  className="min-h-28 w-full rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface)] px-4 py-3 text-[13px] outline-none resize-none"
                  disabled={!isAuthenticated}
                />
                {reviewError ? <div className="text-[12px] text-[var(--color-primary)]">{reviewError}</div> : null}
                <button
                  type="submit"
                  className="w-full rounded-full bg-[var(--color-primary)] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[var(--color-primary-container)] disabled:opacity-60"
                  disabled={reviewSaving || !isAuthenticated}
                >
                  {reviewSaving ? "Posting..." : isAuthenticated ? "Submit Review" : "Sign in to review"}
                </button>
              </form>
            </div>
          </div>

          {/* CTA block - Enhanced with Pay Now button */}
          <div className="pt-6 space-y-3 mt-4">
            <div className="flex gap-2">
              <button
                disabled={added || !canAddToCart}
                onClick={() => {
                  if (!canAddToCart) return;
                  const prod = {
                    ...displayProduct,
                    id: `${displayProduct.id || displayProduct.name}-${selectedColor?.id}`,
                    productId: displayProduct.id,
                    name: `${displayProduct.name} (${selectedColor?.name})`,
                    color: selectedColor?.name,
                    colorHex: selectedColor?.colorHex,
                    price: currentPrice,
                    images: currentImages,
                    stock,
                  };
                  if (addItem(prod, selectedSize, qty)) {
                    setAdded(true);
                    setTimeout(() => {
                      setAdded(false);
                      onClose();
                    }, 2000);
                  }
                }}
                className="flex-1 py-4 rounded-full text-[12px] font-semibold tracking-[0.12em] uppercase transition-all duration-300 text-white shadow-lg hover:shadow-xl"
                style={{ 
                  backgroundColor: "var(--color-on-surface)",
                  transform: added ? "scale(0.98)" : "scale(1)"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-primary)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--color-on-surface)")}
              >
                {!selectedSize ? "Select a Size" : outOfStock ? "Out of Stock" : added ? "Added to Bag" : "Add to Bag"}
              </button>
              
              <button
                onClick={handleWishlistClick}
                className={`w-12 h-12 rounded-full border-2 transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg ${
                  isAnimating ? "heartbeat-active" : ""
                }`}
                style={{ 
                  borderColor: isWishlisted ? "var(--color-primary)" : "var(--color-outline-variant)",
                  backgroundColor: isWishlisted ? "rgba(111,31,47,0.1)" : "var(--color-surface)"
                }}
              >
                <span className="text-xl">{isWishlisted ? "♥" : "♡"}</span>
              </button>
            </div>

            {/* NEW: Pay Now Button - Links directly to Payment */}
            <button
              disabled={!canAddToCart}
              onClick={() => {
                if (selectedColor && selectedSize && canAddToCart) {
                  const prod = {
                    ...displayProduct,
                    id: `${displayProduct.id || displayProduct.name}-${selectedColor?.id}`,
                    productId: displayProduct.id,
                    name: `${displayProduct.name} (${selectedColor?.name})`,
                    color: selectedColor?.name,
                    colorHex: selectedColor?.colorHex,
                    price: currentPrice,
                    images: currentImages,
                    stock,
                  };
                  if (addItem(prod, selectedSize, qty)) {
                    setTimeout(() => {
                      onClose();
                      navigate("/payment");
                    }, 300);
                  }
                }
              }}
              className="w-full py-3 rounded-full text-[13px] font-bold tracking-wide uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              style={{ 
                background: canAddToCart ? "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-container) 100%)" : "var(--color-outline)",
                color: "white",
                cursor: canAddToCart ? "pointer" : "not-allowed",
                opacity: canAddToCart ? 1 : 0.72
              }}
              onMouseEnter={(e) => { if (canAddToCart) e.currentTarget.style.transform = "scale(1.02)"; }}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <span>💳</span>
              {!selectedSize ? "Select a Size" : outOfStock ? "Out of Stock" : `Pay Now — ${currentPrice}`}
              <span>→</span>
            </button>

            {/* Trust badges with feminine styling */}
            <div className="flex items-center justify-center gap-4 pt-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-surface)]/60 rounded-full">
                <span className="text-base">🌿</span>
                <span className="text-[9px] font-semibold tracking-[0.05em] text-[var(--color-on-surface-variant)]">Sustainably Made</span>
              </div>
              <div className="w-px h-4 bg-[var(--color-outline-variant)]" />
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-surface)]/60 rounded-full">
                <span className="text-base">🚚</span>
                <span className="text-[9px] font-semibold tracking-[0.05em] text-[var(--color-on-surface-variant)]">Free Shipping</span>
              </div>
            </div>

            {/* Additional cute note */}
            <p className="text-center text-[9px] text-[var(--color-outline)] pt-2">
              💕 Ethically crafted with love and care 💕
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default QuickView;

