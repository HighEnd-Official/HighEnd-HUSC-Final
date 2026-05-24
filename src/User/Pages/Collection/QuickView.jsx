import { useState, useEffect, useCallback, useMemo } from "react";
import { useCart } from "../../../context/CartContext";
import { useNavigate } from "react-router-dom";

const QuickView = ({ product, onClose }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState(() => (product?.sizes && product.sizes.length > 0) ? product.sizes[0] : "XS");
  const [selectedColor, setSelectedColor] = useState(null);
  const [fading, setFading] = useState(false);
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  const { addItem, toggleWishlist, isInWishlist } = useCart();
  const productId = product?.id || product?.name;
  const isWishlisted = isInWishlist(productId);
  const navigate = useNavigate();

  // Color variants
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

  const currentImages = selectedColor?.images || product?.images || [];
  const currentPrice = selectedColor?.price || product?.price;

  const handleWishlistClick = () => {
    toggleWishlist(product);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 450);
  };

  const switchImage = useCallback((idx) => {
    if (idx === activeIdx) return;
    setFading(true);
    setTimeout(() => {
      setActiveIdx(idx);
      setFading(false);
    }, 180);
  }, [activeIdx]);

  const prev = useCallback(() => switchImage((activeIdx - 1 + currentImages.length) % currentImages.length), [switchImage, activeIdx, currentImages.length]);
  const next = useCallback(() => switchImage((activeIdx + 1) % currentImages.length), [switchImage, activeIdx, currentImages.length]);

  useEffect(() => {
    setActiveIdx(0);
  }, [selectedColor]);

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

  if (!product) return null;

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center p-4 md:p-16"
      style={{
        backgroundColor: "rgba(133,76,111,0.2)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
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
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4c2c9; border-radius: 10px; }
        .heartbeat-active {
          animation: gentlePulse 0.45s ease-in-out;
        }
        .size-btn:hover {
          transform: translateY(-2px);
        }
        .color-swatch:hover {
          transform: scale(1.1);
        }
      `}</style>

      {/* Modal panel */}
      <div
        className="bg-gradient-to-br from-[#fff8f8] via-white to-[#fff5f7] w-full max-w-[1100px] max-h-[88vh] flex flex-col md:flex-row overflow-hidden relative rounded-2xl shadow-2xl"
        style={{ 
          animation: "slideUp 0.35s cubic-bezier(0.16,1,0.3,1) both",
          boxShadow: "0 30px 60px -15px rgba(133,76,111,0.25)"
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
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full transition-all hover:scale-110 flex items-center justify-center bg-white/80 backdrop-blur-sm hover:bg-[#854c6f] hover:text-white group"
          style={{ boxShadow: "0 2px 8px rgba(133,76,111,0.15)" }}
        >
          <span
            className="text-[20px] group-hover:text-white transition-colors"
            style={{ color: "#854c6f" }}
          >
            ✕
          </span>
        </button>

        {/* ── LEFT: Gallery ── */}
        <div className="w-full md:w-[60%] lg:w-[65%] flex flex-col h-[52vh] md:h-auto bg-gradient-to-br from-[#fff5f7] to-[#fff8f8]">
          {/* Main image */}
          <div className="flex-1 relative overflow-hidden group">
            <img
              src={currentImages[activeIdx]}
              alt={product.name}
              className="w-full h-full object-cover transition-opacity duration-200"
              style={{ opacity: fading ? 0 : 1 }}
            />
            
            {/* Decorative overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent pointer-events-none" />
            
            {/* Arrow controls */}
            <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={prev}
                className="w-10 h-10 rounded-full transition-all hover:scale-110 flex items-center justify-center bg-white/90 shadow-lg"
                style={{ color: "#854c6f" }}
              >
                <span className="text-2xl">←</span>
              </button>
              <button
                onClick={next}
                className="w-10 h-10 rounded-full transition-all hover:scale-110 flex items-center justify-center bg-white/90 shadow-lg"
                style={{ color: "#854c6f" }}
              >
                <span className="text-2xl">→</span>
              </button>
            </div>
            
            {/* Image counter */}
            <div className="absolute bottom-3 right-4 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1 text-[10px] font-semibold tracking-widest text-white/90 uppercase">
              {activeIdx + 1} / {currentImages.length}
            </div>
          </div>

          {/* Thumbnails */}
          <div className="h-24 md:h-28 bg-white/50 backdrop-blur-sm flex items-center gap-2 px-4 py-2 overflow-x-auto custom-scrollbar border-t border-[#d4c2c9]/20">
            {currentImages.map((img, i) => (
              <button
                key={i}
                onClick={() => switchImage(i)}
                className="flex-shrink-0 h-full transition-all duration-200 rounded-lg overflow-hidden shadow-md hover:shadow-xl"
                style={{
                  aspectRatio: "3/4",
                  border: `2px solid ${activeIdx === i ? "#854c6f" : "transparent"}`,
                  opacity: activeIdx === i ? 1 : 0.55,
                }}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Product Info ── */}
        <div
          className="w-full md:w-[40%] lg:w-[35%] flex flex-col justify-between overflow-y-auto custom-scrollbar p-8 md:p-10 bg-white/50 backdrop-blur-sm"
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          <div className="space-y-6">
            {/* Title block with sparkle */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-lg"></span>
                <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#854c6f]">
                  {product.collection || "The Atelier Collection"}
                </p>
              </div>
              <h2
                className="text-[32px] leading-snug text-[#1f1a1d]"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
              >
                {product.name}
              </h2>
              <p className="text-[28px] font-light text-[#854c6f]" style={{ fontFamily: "'Playfair Display', serif" }}>
                {currentPrice}
              </p>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-[#d4c2c9] to-transparent" />

            {/* ── COLOR SELECTION with floral emojis ── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#504349] flex items-center gap-1">
                  <span></span> Choose Your Color
                </p>
                <p className="text-[11px] text-[#854c6f] font-medium">
                  {selectedColor?.name || "White"} {selectedColor?.floralPattern}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {colorVariants.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColor(color)}
                    className="relative group transition-all duration-200 color-swatch"
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                    }}
                    disabled={!color.inStock}
                  >
                    <div
                      className="w-full h-full rounded-full transition-all duration-200 shadow-md"
                      style={{
                        backgroundColor: color.colorHex,
                        border: color.id === "white" ? "2px solid #d4c2c9" : "none",
                        outline: `2px solid ${selectedColor?.id === color.id ? "#854c6f" : "transparent"}`,
                        outlineOffset: "2px",
                        boxShadow: selectedColor?.id === color.id 
                          ? "0 0 0 3px #fff8f8, 0 0 0 5px #854c6f" 
                          : "0 2px 4px rgba(0,0,0,0.1)",
                      }}
                    />
                    <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      {color.floralPattern}
                    </span>
                    <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-[10px] font-semibold text-[#504349] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      {color.name}
                    </span>
                    {!color.inStock && (
                      <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-sm">
                        <span className="text-[8px] font-bold text-white">OUT</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Size selector with cute styling */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#504349] flex items-center gap-1">
                  <span>📏</span> Select Size
                </p>
                <button type="button" className="text-[10px] underline underline-offset-4 text-[#82737a] hover:text-[#854c6f] transition-colors bg-transparent border-none p-0 cursor-pointer">
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(product.sizes || ["XS", "S", "M", "L", "XL"]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className="size-btn px-4 py-2 text-[13px] font-medium rounded-full transition-all duration-200"
                    style={{
                      backgroundColor: selectedSize === s ? "#854c6f" : "transparent",
                      color: selectedSize === s ? "white" : "#1f1a1d",
                      border: `1px solid ${selectedSize === s ? "#854c6f" : "#d4c2c9"}`,
                      boxShadow: selectedSize === s ? "0 2px 8px rgba(133,76,111,0.3)" : "none",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector with cute + - */}
            <div className="space-y-3">
              <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#504349] flex items-center gap-1">
                <span>🛍️</span> Quantity
              </p>
              <div className="flex items-center w-36 border-2 border-[#d4c2c9] rounded-full overflow-hidden bg-white transition-all duration-200 hover:border-[#854c6f]">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  className="w-10 h-10 flex items-center justify-center text-[18px] text-[#854c6f] hover:bg-[#fcf1f4] disabled:opacity-40 transition-colors"
                >
                  −
                </button>
                <span className="flex-1 text-center text-[16px] font-semibold text-[#1f1a1d] select-none">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  className="w-10 h-10 flex items-center justify-center text-[18px] text-[#854c6f] hover:bg-[#fcf1f4] transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Description with cute icons */}
            <div className="space-y-2">
              <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#504349] flex items-center gap-1">
                <span>💖</span> Product Essence
              </p>
              <p className="text-[14px] text-[#504349] leading-relaxed italic">
                {product.description}
              </p>
            </div>

            {/* Details list with floral bullets */}
            {product.details && (
              <ul className="space-y-1.5">
                {product.details.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-[#504349]">
                    <span className="text-[#854c6f]">🌸</span>
                    {d}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* CTA block - Enhanced with Pay Now button */}
          <div className="pt-6 space-y-3 mt-4">
            <div className="flex gap-2">
              <button
                disabled={added || !selectedColor?.inStock}
                onClick={() => {
                  const prod = {
                    ...product,
                    id: `${product.id || product.name}-${selectedColor?.id}`,
                    name: `${product.name} (${selectedColor?.name})`,
                    color: selectedColor?.name,
                    colorHex: selectedColor?.colorHex,
                    price: currentPrice,
                    images: currentImages,
                  };
                  addItem(prod, selectedSize, qty);
                  setAdded(true);
                  setTimeout(() => {
                    setAdded(false);
                    onClose();
                  }, 2000);
                }}
                className="flex-1 py-4 rounded-full text-[12px] font-semibold tracking-[0.12em] uppercase transition-all duration-300 text-white shadow-lg hover:shadow-xl"
                style={{ 
                  backgroundColor: "#1f1a1d",
                  transform: added ? "scale(0.98)" : "scale(1)"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#854c6f")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1f1a1d")}
              >
                {added ? "✨ Added to Bag ✨" : "🛒 Add to Bag"}
              </button>
              
              <button
                onClick={handleWishlistClick}
                className={`w-12 h-12 rounded-full border-2 transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg ${
                  isAnimating ? "heartbeat-active" : ""
                }`}
                style={{ 
                  borderColor: isWishlisted ? "#854c6f" : "#d4c2c9",
                  backgroundColor: isWishlisted ? "rgba(133,76,111,0.1)" : "white"
                }}
              >
                <span className="text-xl">
                  {isWishlisted ? "❤️" : "🤍"}
                </span>
              </button>
            </div>

            {/* NEW: Pay Now Button - Links directly to Payment */}
            <button
              onClick={() => {
                if (selectedColor && selectedSize) {
                  const prod = {
                    ...product,
                    id: `${product.id || product.name}-${selectedColor?.id}`,
                    name: `${product.name} (${selectedColor?.name})`,
                    color: selectedColor?.name,
                    colorHex: selectedColor?.colorHex,
                    price: currentPrice,
                    images: currentImages,
                  };
                  addItem(prod, selectedSize, qty);
                  setTimeout(() => {
                    onClose();
                    navigate("/payment");
                  }, 300);
                }
              }}
              className="w-full py-3 rounded-full text-[13px] font-bold tracking-wide uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              style={{ 
                background: "linear-gradient(135deg, #854c6f 0%, #b5799b 100%)",
                color: "white"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <span>💳</span>
              Pay Now — {currentPrice}
              <span>→</span>
            </button>

            {/* Trust badges with feminine styling */}
            <div className="flex items-center justify-center gap-4 pt-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/60 rounded-full">
                <span className="text-base">🌿</span>
                <span className="text-[9px] font-semibold tracking-[0.05em] text-[#504349]">Sustainably Made</span>
              </div>
              <div className="w-px h-4 bg-[#d4c2c9]" />
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/60 rounded-full">
                <span className="text-base">🚚</span>
                <span className="text-[9px] font-semibold tracking-[0.05em] text-[#504349]">Free Shipping</span>
              </div>
            </div>

            {/* Additional cute note */}
            <p className="text-center text-[9px] text-[#82737a] pt-2">
              💕 Ethically crafted with love and care 💕
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickView;