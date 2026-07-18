import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  const [fsOpen, setFsOpen] = useState(false);          // fullscreen viewer open
  const zoomImgRef = useRef(null);
  const zoomContainerRef = useRef(null);
  // ── Fullscreen pinch-to-zoom refs (all gesture state lives here — zero re-renders)
  const fsImgRef = useRef(null);
  const fsGesture = useRef({
    scale: 1, panX: 0, panY: 0,
    startDist: 0, startScale: 1,
    startX: 0, startY: 0, startPanX: 0, startPanY: 0,
    pointers: {},
  });

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

  // Reset zoom whenever the active image changes (thumbnail click / arrow nav)
  useEffect(() => {
    if (zoomImgRef.current) {
      zoomImgRef.current.style.transform = "scale(1)";
      zoomImgRef.current.style.transformOrigin = "center center";
    }
  }, [activeIdx]);

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

  /* ── Fullscreen viewer helpers ── */
  const applyFsTransform = () => {
    if (!fsImgRef.current) return;
    const { scale, panX, panY } = fsGesture.current;
    fsImgRef.current.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
  };

  const openFs = () => {
    const g = fsGesture.current;
    g.scale = 1; g.panX = 0; g.panY = 0;
    setFsOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeFs = () => {
    setFsOpen(false);
    // QuickView itself keeps body overflow hidden — restore only fs-specific block
  };

  const getTouchDist = (touches) => {
    const [a, b] = Object.values(touches);
    if (!a || !b) return 0;
    return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
  };

  const onFsTouchStart = (e) => {
    e.preventDefault();
    const g = fsGesture.current;
    Array.from(e.changedTouches).forEach(t => { g.pointers[t.identifier] = t; });
    const pCount = Object.keys(g.pointers).length;
    if (pCount === 2) {
      g.startDist = getTouchDist(g.pointers);
      g.startScale = g.scale;
    } else if (pCount === 1) {
      const t = Object.values(g.pointers)[0];
      g.startX = t.clientX;
      g.startY = t.clientY;
      g.startPanX = g.panX;
      g.startPanY = g.panY;
    }
  };

  const onFsTouchMove = (e) => {
    e.preventDefault();
    const g = fsGesture.current;
    Array.from(e.changedTouches).forEach(t => { g.pointers[t.identifier] = t; });
    const pCount = Object.keys(g.pointers).length;
    const MAX_SCALE = 4;
    if (pCount === 2) {
      const dist = getTouchDist(g.pointers);
      if (g.startDist > 0) {
        g.scale = Math.min(MAX_SCALE, Math.max(1, g.startScale * (dist / g.startDist)));
      }
    } else if (pCount === 1 && g.scale > 1) {
      const t = Object.values(g.pointers)[0];
      g.panX = g.startPanX + (t.clientX - g.startX);
      g.panY = g.startPanY + (t.clientY - g.startY);
    }
    applyFsTransform();
  };

  const onFsTouchEnd = (e) => {
    e.preventDefault();
    const g = fsGesture.current;
    Array.from(e.changedTouches).forEach(t => { delete g.pointers[t.identifier]; });
    if (g.scale <= 1.05) {
      g.scale = 1; g.panX = 0; g.panY = 0;
      applyFsTransform();
    }
    // Reset single-touch start refs for next move
    const remaining = Object.values(g.pointers);
    if (remaining.length === 1) {
      g.startX = remaining[0].clientX;
      g.startY = remaining[0].clientY;
      g.startPanX = g.panX;
      g.startPanY = g.panY;
    }
  };

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
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fsIn    { from { opacity:0; transform:scale(0.96) } to { opacity:1; transform:scale(1) } }
        @keyframes gentlePulse { 
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: var(--color-primary-container); 
          border-radius: 999px;
          opacity: 0.55;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--color-primary);
        }

        .heartbeat-active {
          animation: gentlePulse 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .quickview-panel {
          --quickview-ink: var(--color-on-surface);
          --quickview-muted: var(--color-outline);
          --quickview-line: rgba(111, 31, 47, 0.08);
          --quickview-line-strong: rgba(111, 31, 47, 0.16);
          --quickview-shadow: 0 40px 100px -20px rgba(111, 31, 47, 0.18), 0 0 1px rgba(111, 31, 47, 0.12);
          
          background: linear-gradient(135deg, rgba(255, 253, 254, 0.95), rgba(253, 248, 250, 0.92)) !important;
          box-shadow: var(--quickview-shadow);
          border: 1px solid var(--quickview-line);
          backdrop-filter: blur(32px) saturate(1.2);
          -webkit-backdrop-filter: blur(32px) saturate(1.2);
          transition: background 0.3s ease, border-color 0.3s ease;
        }
        
        .dark .quickview-panel,
        [data-theme="dark"] .quickview-panel {
          --quickview-ink: var(--color-on-surface);
          --quickview-muted: var(--color-outline);
          --quickview-line: rgba(232, 169, 180, 0.08);
          --quickview-line-strong: rgba(232, 169, 180, 0.18);
          --quickview-shadow: 0 40px 100px -25px rgba(0, 0, 0, 0.6), 0 0 1px rgba(255, 255, 255, 0.1);
          
          background: linear-gradient(135deg, rgba(20, 14, 16, 0.96), rgba(12, 8, 9, 0.94)) !important;
          border-color: var(--quickview-line);
        }

        .quickview-panel::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(circle at top left, rgba(203, 143, 174, 0.08), transparent 35%);
          z-index: 0;
        }

        .quickview-mobile-gallery {
          background: linear-gradient(135deg, var(--color-surface-container-low), var(--color-surface)) !important;
          border-right: 1px solid var(--quickview-line);
          position: relative;
        }

        .quickview-mobile-thumbs {
          background: rgba(255, 255, 255, 0.4) !important;
          border-top: 1px solid var(--quickview-line) !important;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        
        .dark .quickview-mobile-thumbs,
        [data-theme="dark"] .quickview-mobile-thumbs {
          background: rgba(20, 14, 16, 0.4) !important;
        }

        .quickview-panel button {
          outline: none;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .quickview-panel button:focus-visible,
        .quickview-panel input:focus,
        .quickview-panel textarea:focus,
        .quickview-panel select:focus {
          box-shadow: 0 0 0 3px rgba(111, 31, 47, 0.15) !important;
          border-color: var(--color-primary) !important;
        }

        .quickview-panel input,
        .quickview-panel textarea,
        .quickview-panel select {
          background: var(--color-surface) !important;
          border-color: var(--color-outline-variant) !important;
          color: var(--quickview-ink);
          border-radius: 14px;
          padding: 10px 14px;
          transition: all 0.2s ease;
        }

        .quickview-panel form {
          background: rgba(255, 255, 255, 0.35) !important;
          border-color: var(--quickview-line-strong) !important;
          backdrop-filter: blur(12px);
          box-shadow: 0 8px 32px rgba(111, 31, 47, 0.03);
          transition: all 0.3s ease;
        }
        
        .dark .quickview-panel form,
        [data-theme="dark"] .quickview-panel form {
          background: rgba(20, 14, 16, 0.35) !important;
        }

        .quickview-panel [class*="md:w-[42%]"],
        .quickview-panel [class*="lg:w-[38%]"] {
          background: transparent !important;
          border-left: 1px solid var(--quickview-line);
        }

        .size-btn {
          min-width: 44px;
          height: 44px;
          border-radius: 50% !important;
          font-size: 12px !important;
          letter-spacing: 0.05em;
          border: 1px solid var(--color-outline-variant) !important;
          color: var(--color-on-surface) !important;
          background: var(--color-surface) !important;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .size-btn:hover:not(:disabled) {
          border-color: var(--color-primary) !important;
          color: var(--color-primary) !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 14px rgba(111, 31, 47, 0.1);
        }

        .size-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .color-swatch {
          padding: 3px;
          border-radius: 50%;
          border: 2px solid transparent;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .color-swatch:hover:not(:disabled) {
          transform: scale(1.08);
        }

        .quickview-close-btn {
          box-shadow: 0 2px 8px rgba(133, 76, 111, 0.15);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .quickview-close-btn:hover {
          transform: scale(1.1) rotate(90deg) !important;
          background-color: var(--color-primary) !important;
          color: white !important;
        }
        
        .gallery-arrow-btn {
          opacity: 0.8;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
        }
        .gallery-arrow-btn:hover {
          opacity: 1 !important;
          background-color: var(--color-primary) !important;
          color: white !important;
          transform: scale(1.08) !important;
        }

        /* Review and Form Visual Enhancement */
        .quickview-review-card {
          transition: all 0.25s ease;
          border: 1px solid var(--quickview-line-strong);
        }
        .quickview-review-card:hover {
          border-color: var(--color-primary);
          box-shadow: 0 4px 16px rgba(111, 31, 47, 0.04);
        }

        @media (max-width: 767px) {
          /* ── Mobile gallery shell ── */
          .quickview-mobile-gallery {
            height: 56vw !important;
            min-height: 280px !important;
            max-height: 370px !important;
            flex-shrink: 0;
            border-right: 0;
            border-bottom: none;
            position: relative;
          }
          .quickview-mobile-gallery .flex-1 {
            flex: 1 1 0%;
            min-height: 0;
            position: relative;
            overflow: hidden;
          }
          /* ── Mobile image ── */
          .qv-mob-img-wrap {
            position: absolute;
            inset: 0;
            overflow: hidden;
          }
          .qv-mob-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center top;
            display: block;
            transition: opacity 0.25s ease;
          }
          /* ── Bottom gradient vignette ── */
          .qv-mob-vignette {
            position: absolute;
            inset: 0;
            pointer-events: none;
            background: linear-gradient(
              to bottom,
              transparent 45%,
              rgba(10,4,6,0.55) 100%
            );
          }
          /* ── Dot pagination ── */
          .qv-mob-dots {
            position: absolute;
            bottom: 12px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 6px;
            align-items: center;
            pointer-events: none;
          }
          .qv-mob-dot {
            width: 5px; height: 5px;
            border-radius: 50%;
            background: rgba(255,255,255,0.45);
            transition: all 0.25s ease;
            flex-shrink: 0;
          }
          .qv-mob-dot.active {
            width: 18px;
            border-radius: 3px;
            background: #fff;
          }
          /* ── Frosted tap arrows ── */
          .qv-mob-arrow {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            width: 36px; height: 36px;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            background: rgba(255,255,255,0.18);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border: 1px solid rgba(255,255,255,0.25);
            color: #fff;
            font-size: 16px;
            cursor: pointer;
            z-index: 10;
            transition: background 0.2s ease, transform 0.15s ease;
          }
          .qv-mob-arrow:active {
            background: rgba(255,255,255,0.35);
            transform: translateY(-50%) scale(0.93);
          }
          .qv-mob-arrow-left  { left: 10px; }
          .qv-mob-arrow-right { right: 10px; }
          /* ── Thumbnail strip ── */
          .quickview-mobile-thumbs {
            height: 50px !important;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 14px;
            overflow-x: auto;
            background: linear-gradient(
              to bottom,
              var(--color-surface-container-low),
              var(--color-surface)
            );
            border-top: 1px solid rgba(111,31,47,0.08);
          }
          .qv-thumb-btn {
            flex-shrink: 0;
            height: 100%;
            aspect-ratio: 3/4;
            border-radius: 8px;
            overflow: hidden;
            transition: all 0.2s ease;
            border: 2px solid transparent;
          }
          .qv-thumb-btn.active {
            border-color: var(--color-primary);
            box-shadow: 0 0 0 3px rgba(111,31,47,0.18);
            opacity: 1 !important;
          }
          .qv-thumb-btn:not(.active) { opacity: 0.5; }
          .qv-thumb-btn img {
            width: 100%; height: 100%;
            object-fit: cover;
            display: block;
          }
          /* ── Panel ── */
          .quickview-panel {
            border-radius: 22px !important;
            max-height: 96vh;
            overflow-y: auto;
          }
          .quickview-panel [class*="md:w-[42%]"],
          .quickview-panel [class*="lg:w-[38%]"] {
            border-left: 0;
            border-top: 1px solid var(--quickview-line);
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
          className="quickview-close-btn absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-surface)]/80 backdrop-blur-sm group"
        >
          <span
            className="text-[20px] transition-colors"
            style={{ color: "var(--color-primary)" }}
          >
            ✕
          </span>
        </button>

        {/* LEFT: Gallery */}
        <div className="quickview-mobile-gallery w-full md:w-[58%] lg:w-[62%] flex flex-col md:h-auto bg-gradient-to-br from-[var(--color-surface-container-low)] to-[var(--color-surface)]">
          {/* Main image area */}
          <div className="flex-1 relative overflow-hidden group">
            {/* Seasonal badge */}
            {displayProduct.seasonalBatch ? (
              <div
                className="absolute left-4 top-4 z-20 rounded-[18px] border border-white/20 px-3 py-2 text-white shadow-[0_12px_28px_rgba(0,0,0,0.18)] backdrop-blur-md"
                style={{ background: "linear-gradient(135deg, rgba(111,31,47,0.96), rgba(69,18,29,0.88))" }}
              >
                <div className="text-[8px] font-semibold uppercase tracking-[0.24em] opacity-80">Seasonal</div>
                <div className="text-[13px] font-semibold leading-none">{displayProduct.seasonalBadgeText || "Seasonal"}</div>
                <div className="text-[8px] font-semibold uppercase tracking-[0.18em] opacity-70">Batch</div>
              </div>
            ) : null}

            {imageCount > 0 ? (
              isMobileView ? (
                /* ── Mobile: Full-bleed editorial image — tap to open fullscreen ── */
                <>
                  <div
                    className="qv-mob-img-wrap"
                    onClick={openFs}
                    style={{ cursor: "zoom-in" }}
                  >
                    <img
                      src={currentImages[activeIdx]}
                      alt={displayProduct.name}
                      className="qv-mob-img"
                      style={{ opacity: fading ? 0 : 1 }}
                    />
                    {/* Tap-to-zoom hint */}
                    <div style={{
                      position: "absolute", bottom: 44, right: 12,
                      background: "rgba(0,0,0,0.38)", backdropFilter: "blur(6px)",
                      borderRadius: 999, padding: "4px 10px",
                      color: "#fff", fontSize: 10, fontWeight: 700,
                      letterSpacing: "0.1em", textTransform: "uppercase",
                      pointerEvents: "none", opacity: 0.85,
                    }}>⊕ Tap to zoom</div>
                  </div>

                  {/* Bottom gradient vignette */}
                  <div className="qv-mob-vignette" />

                  {/* Tap arrow: prev */}
                  {imageCount > 1 && (
                    <button className="qv-mob-arrow qv-mob-arrow-left" onClick={prev} aria-label="Previous image">
                      ‹
                    </button>
                  )}
                  {/* Tap arrow: next */}
                  {imageCount > 1 && (
                    <button className="qv-mob-arrow qv-mob-arrow-right" onClick={next} aria-label="Next image">
                      ›
                    </button>
                  )}

                  {/* Dot pagination */}
                  {imageCount > 1 && (
                    <div className="qv-mob-dots">
                      {currentImages.map((_, i) => (
                        <div key={i} className={`qv-mob-dot${i === activeIdx ? " active" : ""}`} />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                /* ── Desktop: Amazon-style mouse-follow zoom ── */
                <div
                  ref={zoomContainerRef}
                  className="absolute inset-0 z-0 overflow-hidden"
                  style={{ backgroundColor: "var(--color-surface)", cursor: "crosshair" }}
                  onMouseMove={(e) => {
                    const rect = zoomContainerRef.current?.getBoundingClientRect();
                    if (!rect || !zoomImgRef.current) return;
                    const x = clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100);
                    const y = clamp(((e.clientY - rect.top) / rect.height) * 100, 0, 100);
                    zoomImgRef.current.style.transformOrigin = `${x}% ${y}%`;
                    zoomImgRef.current.style.transform = "scale(2)";
                  }}
                  onMouseLeave={() => {
                    if (!zoomImgRef.current) return;
                    zoomImgRef.current.style.transform = "scale(1)";
                    zoomImgRef.current.style.transformOrigin = "center center";
                  }}
                >
                  <img
                    ref={zoomImgRef}
                    src={currentImages[activeIdx]}
                    alt={displayProduct.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                      transform: "scale(1)",
                      transformOrigin: "center center",
                      transition: "transform 0.18s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.25s ease",
                      opacity: fading ? 0 : 1,
                      willChange: "transform",
                    }}
                  />
                </div>
              )
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)]">
                No preview available
              </div>
            )}

            {/* Desktop-only decorative overlay + arrow controls */}
            {!isMobileView && (
              <>
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent pointer-events-none" />
                <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={prev}
                    className="gallery-arrow-btn pointer-events-auto w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-surface)]/95 shadow-md"
                    style={{ color: "var(--color-primary)" }}
                  >
                    <span className="text-2xl">←</span>
                  </button>
                  <button
                    onClick={next}
                    className="gallery-arrow-btn pointer-events-auto w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-surface)]/95 shadow-md"
                    style={{ color: "var(--color-primary)" }}
                  >
                    <span className="text-2xl">→</span>
                  </button>
                </div>
                {imageCount > 0 && (
                  <div className="absolute bottom-3 right-4 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1 text-[10px] font-semibold tracking-widest text-white/90 uppercase pointer-events-none">
                    {activeIdx + 1} / {imageCount}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Thumbnail strip — hidden on mobile (dot pagination used instead), shown on desktop */}
          <div className="hidden md:flex quickview-mobile-thumbs h-28 bg-[var(--color-surface)]/50 backdrop-blur-sm items-center gap-2 px-4 py-2 overflow-x-auto custom-scrollbar border-t border-[rgba(215,197,198,0.2)]">
            {currentImages.map((img, i) => (
              <button
                key={i}
                onClick={() => switchImage(i)}
                className={`qv-thumb-btn flex-shrink-0 h-full transition-all duration-200 rounded-lg overflow-hidden shadow-md hover:shadow-xl${activeIdx === i ? " active" : ""}`}
                style={{
                  aspectRatio: "3/4",
                  border: `2px solid ${activeIdx === i ? "var(--color-primary)" : "transparent"}`,
                  opacity: activeIdx === i ? 1 : 0.5,
                }}
              >
                <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-500" />
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
              {/* Stock status badge */}
              {(() => {
                let dot, label, bgColor, textColor, borderColor;
                if (outOfStock) {
                  dot = "🔴"; label = "Out of Stock";
                  bgColor = "rgba(220,38,38,0.08)"; textColor = "#dc2626"; borderColor = "rgba(220,38,38,0.22)";
                } else if (hasStockLimit && stock <= 5) {
                  dot = "🟡"; label = "Low Stock";
                  bgColor = "rgba(217,119,6,0.08)"; textColor = "#d97706"; borderColor = "rgba(217,119,6,0.22)";
                } else {
                  dot = "🟢"; label = "In Stock";
                  bgColor = "rgba(22,163,74,0.08)"; textColor = "#16a34a"; borderColor = "rgba(22,163,74,0.22)";
                }
                return (
                  <div
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-[0.12em] uppercase"
                    style={{ backgroundColor: bgColor, color: textColor, border: `1px solid ${borderColor}` }}
                  >
                    <span style={{ fontSize: "10px", lineHeight: 1 }}>{dot}</span>
                    {label}
                  </div>
                );
              })()}
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
                    <div key={review.id} className="quickview-review-card rounded-2xl border bg-[var(--color-surface)]/70 p-4">
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
                  background: canAddToCart ? (added ? "linear-gradient(135deg, #16a34a 0%, #15803d 100%)" : "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-container) 100%)") : "var(--color-outline)",
                  cursor: canAddToCart ? "pointer" : "not-allowed",
                  opacity: canAddToCart ? 1 : 0.72,
                  transform: added ? "scale(0.98)" : "scale(1)"
                }}
                onMouseEnter={(e) => {
                  if (canAddToCart && !added) {
                    e.currentTarget.style.transform = "scale(1.02)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                {!selectedSize ? "Select a Size" : outOfStock ? "Out of Stock" : added ? "Added to Cart" : "Add to Cart"}
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
               Ethically crafted with love and care 
            </p>
          </div>
        </div>
      </div>

      {/* ── Fullscreen image viewer (mobile only) ── */}
      {fsOpen && createPortal(
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "#000",
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "fsIn 0.22s cubic-bezier(0.16,1,0.3,1) both",
            touchAction: "none",
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
          onClick={(e) => {
            e.stopPropagation(); // prevent bubbling to QuickView backdrop
            if (e.target === e.currentTarget) closeFs();
          }}
        >
          {/* Image — gesture target */}
          <img
            ref={fsImgRef}
            src={currentImages[activeIdx]}
            alt={displayProduct.name}
            onTouchStart={onFsTouchStart}
            onTouchMove={onFsTouchMove}
            onTouchEnd={onFsTouchEnd}
            style={{
              maxWidth: "100vw",
              maxHeight: "100vh",
              objectFit: "contain",
              display: "block",
              transform: "translate(0px,0px) scale(1)",
              transformOrigin: "center center",
              transition: "none",
              touchAction: "none",
              userSelect: "none",
              WebkitUserSelect: "none",
              willChange: "transform",
            }}
            draggable={false}
          />

          {/* Close button */}
          <button
            onClick={closeFs}
            aria-label="Close fullscreen"
            style={{
              position: "absolute", top: 16, right: 16,
              width: 40, height: 40, borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.25)",
              color: "#fff", fontSize: 18,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", zIndex: 10,
              lineHeight: 1,
            }}
          >
            ✕
          </button>

          {/* Image counter */}
          {imageCount > 1 && (
            <div style={{
              position: "absolute", bottom: 20, left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 999, padding: "5px 14px",
              color: "#fff", fontSize: 11, fontWeight: 700,
              letterSpacing: "0.1em",
            }}>
              {activeIdx + 1} / {imageCount}
            </div>
          )}

          {/* Prev/Next taps when at 1x */}
          {imageCount > 1 && (
            <>
              <button
                onClick={() => { closeFs(); setTimeout(() => { prev(); openFs(); }, 10); }}
                aria-label="Previous"
                style={{
                  position:"absolute", left:10, top:"50%", transform:"translateY(-50%)",
                  width:40, height:40, borderRadius:"50%",
                  background:"rgba(255,255,255,0.15)", backdropFilter:"blur(8px)",
                  WebkitBackdropFilter:"blur(8px)",
                  border:"1px solid rgba(255,255,255,0.25)",
                  color:"#fff", fontSize:20, display:"flex",
                  alignItems:"center", justifyContent:"center", cursor:"pointer",
                }}
              >‹</button>
              <button
                onClick={() => { closeFs(); setTimeout(() => { next(); openFs(); }, 10); }}
                aria-label="Next"
                style={{
                  position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
                  width:40, height:40, borderRadius:"50%",
                  background:"rgba(255,255,255,0.15)", backdropFilter:"blur(8px)",
                  WebkitBackdropFilter:"blur(8px)",
                  border:"1px solid rgba(255,255,255,0.25)",
                  color:"#fff", fontSize:20, display:"flex",
                  alignItems:"center", justifyContent:"center", cursor:"pointer",
                }}
              >›</button>
            </>
          )}

          {/* Pinch hint */}
          <div style={{
            position:"absolute", bottom:56, left:"50%", transform:"translateX(-50%)",
            color:"rgba(255,255,255,0.45)", fontSize:10, fontWeight:600,
            letterSpacing:"0.1em", textTransform:"uppercase", whiteSpace:"nowrap",
            pointerEvents:"none",
          }}>Pinch to zoom · drag to pan</div>
        </div>,
        document.body
      )}
    </div>,
    document.body
  );
};

export default QuickView;
