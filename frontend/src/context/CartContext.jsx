import React, { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

export const useCart = () => useContext(CartContext);

const parsePrice = (price) => {
  if (typeof price === "number") return price;
  if (typeof price === "string") {
    // Strip "Rs.", "Rs", whitespace, commas, etc., leaving only numbers and potential dot
    let cleaned = price.replace(/Rs\.?\s*/i, ''); // Remove Rs. or Rs
    cleaned = cleaned.replace(/,/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem("hues_cart");
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const raw = localStorage.getItem("hues_wishlist");
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  const [shippingMethod, setShippingMethod] = useState("standard");
  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);

  useEffect(() => {
    try {
      localStorage.setItem("hues_cart", JSON.stringify(items));
    } catch (e) {}
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem("hues_wishlist", JSON.stringify(wishlist));
    } catch (e) {}
  }, [wishlist]);

  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const productId = product.id || product.name;
      const exists = prev.some((p) => p.id === productId);
      if (exists) {
        return prev.filter((p) => p.id !== productId);
      }
      return [
        ...prev,
        {
          id: productId,
          productId: product.productId || product.id,
          name: product.name,
          price: product.priceValue || product.price,
          image: product.images?.[0] || product.image,
          stock: Number.isFinite(Number(product.stock)) ? Number(product.stock) : null,
        },
      ];
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.some((p) => p.id === productId);
  };

  const addItem = (product, size = "XS", qty = 1) => {
    const parsedPrice = parsePrice(product.priceValue || product.price);
    const stock = Number(product.stock);
    if (Number.isFinite(stock) && stock <= 0) return false;

    const requestedQty = Math.max(1, Number(qty) || 1);
    setItems((prev) => {
      const existing = prev.find((p) => p.id === product.id && p.size === size);
      if (existing) {
        const nextQty = Number.isFinite(stock) ? Math.min(stock, existing.qty + requestedQty) : existing.qty + requestedQty;
        return prev.map((p) =>
          p.id === product.id && p.size === size ? { ...p, qty: nextQty, stock: Number.isFinite(stock) ? stock : p.stock } : p
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          productId: product.productId || product.id,
          name: product.name,
          price: parsedPrice,
          priceLabel: product.price || `Rs. ${parsedPrice.toFixed(2)}`,
          size,
          qty: Number.isFinite(stock) ? Math.min(stock, requestedQty) : requestedQty,
          stock: Number.isFinite(stock) ? stock : null,
          color: product.color || "",
          image: product.images?.[0] || product.image,
        },
      ];
    });
    return true;
  };

  const removeItem = (id, size) => {
    setItems((prev) => prev.filter((p) => !(p.id === id && p.size === size)));
  };

  const changeQuantity = (id, size, qty) => {
    setItems((prev) =>
      prev.map((p) => {
        if (p.id !== id || p.size !== size) return p;
        const stock = Number(p.stock);
        const nextQty = Math.max(1, qty);
        return { ...p, qty: Number.isFinite(stock) && stock > 0 ? Math.min(stock, nextQty) : nextQty };
      })
    );
  };

  const updateItem = (id, currentSize, newSize, newQty) => {
    setItems((prev) => {
      const itemToUpdate = prev.find((p) => p.id === id && p.size === currentSize);
      if (!itemToUpdate) return prev;

      if (currentSize === newSize) {
        return prev.map((p) =>
          p.id === id && p.size === currentSize
            ? { ...p, qty: Number.isFinite(Number(p.stock)) && Number(p.stock) > 0 ? Math.min(Number(p.stock), Math.max(1, newQty)) : Math.max(1, newQty) }
            : p
        );
      }

      const existingTarget = prev.find((p) => p.id === id && p.size === newSize);
      if (existingTarget) {
        const targetStock = Number(existingTarget.stock);
        const mergedQty = existingTarget.qty + Math.max(1, newQty);
        return prev
          .filter((p) => !(p.id === id && p.size === currentSize))
          .map((p) =>
            p.id === id && p.size === newSize
              ? { ...p, qty: Number.isFinite(targetStock) && targetStock > 0 ? Math.min(targetStock, mergedQty) : mergedQty }
              : p
          );
      } else {
        return prev.map((p) =>
          p.id === id && p.size === currentSize
            ? { ...p, size: newSize, qty: Number.isFinite(Number(p.stock)) && Number(p.stock) > 0 ? Math.min(Number(p.stock), Math.max(1, newQty)) : Math.max(1, newQty) }
            : p
        );
      }
    });
  };

  const clear = () => {
    setItems([]);
    setPromoCode("");
    setDiscountPercent(0);
  };

  const applyPromoCode = (code) => {
    const normalized = code.toUpperCase().trim();
    if (normalized === "HUES10") {
      setPromoCode(normalized);
      setDiscountPercent(10);
      return { success: true, message: "Promo code HUES10 applied: 10% Off!" };
    } else if (normalized === "WELCOME20") {
      setPromoCode(normalized);
      setDiscountPercent(20);
      return { success: true, message: "Promo code WELCOME20 applied: 20% Off!" };
    } else if (normalized === "ATELIER30") {
      setPromoCode(normalized);
      setDiscountPercent(30);
      return { success: true, message: "Promo code ATELIER30 applied: 30% Off!" };
    }
    return { success: false, message: "Invalid promo code" };
  };

  const removePromoCode = () => {
    setPromoCode("");
    setDiscountPercent(0);
  };

  // Computations
  const subtotal = items.reduce((s, i) => s + (Number(i.price) || 0) * i.qty, 0);

  const standardShipping = 350;
  const expressShipping = 750;
  const shippingThreshold = 8000;

  let baseShipping = 0;
  if (items.length > 0) {
    if (shippingMethod === "express") {
      baseShipping = expressShipping;
    } else {
      baseShipping = subtotal >= shippingThreshold ? 0 : standardShipping;
    }
  }
  const shippingCost = baseShipping;

  const discountAmount = (subtotal * discountPercent) / 100;
  const totalPrice = Math.max(0, subtotal + shippingCost - discountAmount);
  const totalItems = items.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        changeQuantity,
        updateItem,
        clear,
        subtotal,
        shippingCost,
        shippingMethod,
        setShippingMethod,
        promoCode,
        discountPercent,
        discountAmount,
        applyPromoCode,
        removePromoCode,
        totalItems,
        totalPrice,
        wishlist,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
