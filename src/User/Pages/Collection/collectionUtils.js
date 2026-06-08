import { useEffect, useMemo, useState } from "react";
import { apiFetch, getApiBaseUrl } from "../../../api/client";
import { categoryMatchTerms, normalizeProductCategory, normalizeProductSubcategory } from "../../../lib/productCategories";
import { getSeasonalBadgeText, isProductVisible, isSeasonalProductExpired } from "../../../lib/productAvailability";
import { getDiscountPercent } from "../../../lib/productPricing";
import { groupProductsForDisplay } from "../../../lib/productGrouping";

const localProductImages = import.meta.glob("../../../assets/images/**/*.{png,jpg,jpeg,webp}", {
  eager: true,
  import: "default",
});
export const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=800&fit=crop";

export const normalizeSizeCodes = (sizes = []) =>
  Array.from(
    new Set(
      (Array.isArray(sizes) ? sizes : [])
        .map((size) => (typeof size === "string" ? size : size?.code))
        .map((size) => String(size || "").trim())
        .filter(Boolean)
    )
  );

export function formatLkr(cents) {
  const value = (Number(cents) || 0) / 100;
  return `Rs. ${value.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function resolveImageUrl(url) {
  if (!url) return FALLBACK_IMAGE;
  if (String(url).startsWith("/src/assets/images/")) {
    const assetKey = `../../../assets/images${String(url).replace("/src/assets/images", "")}`;
    return localProductImages[assetKey] || FALLBACK_IMAGE;
  }
  if (String(url).startsWith("/uploads/")) {
    return `${getApiBaseUrl()}${url}`;
  }
  return url;
}

export function productToCollectionShape(product) {
  const images = (product.images || []).map((image) => resolveImageUrl(image.url)).filter(Boolean);
  const mainImage = resolveImageUrl(product.coverImageUrl || product.images?.[0]?.url);
  const sizes = normalizeSizeCodes(product.sizes);
  const priceValue = (Number(product.priceCents) || 0) / 100;
  const originalPriceValue = product.originalCents ? (Number(product.originalCents) || 0) / 100 : 0;

  return {
    id: product.id,
    createdAt: product.createdAt ? new Date(product.createdAt).getTime() : 0,
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
    seasonalBadgeText: getSeasonalBadgeText(product),
    seasonalBatch: Boolean(product.seasonalBatch),
    seasonalEndsOn: product.seasonalEndsOn || "",
    seasonalExpired: isSeasonalProductExpired(product),
    variantGroupKey: product.variantGroupKey || "",
    category: normalizeProductCategory(product.category) || "Collection",
    subcategory: normalizeProductSubcategory(product.subcategory, product.category) || "",
    subtitle: product.subtitle || "",
    image: mainImage,
    images: images.length ? images : [mainImage],
    stars: Math.max(0, Math.min(5, Math.round(Number(product.rating) || 5))),
    reviews: Number(product.reviewsCount) || 0,
    reviewCount: Number(product.reviewsCount) || 0,
    likesCount: Number(product.likesCount) || 0,
    likedByMe: Boolean(product.likedByMe),
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
    reviewList: (product.reviews || []).map((review) => ({
      id: review.id,
      rating: review.rating,
      title: review.title || "",
      comment: review.comment || "",
      createdAt: review.createdAt,
      user: review.user || null,
    })),
  };
}

export function matchesCollection(product, categoryKey, subcategoryKey = "") {
  if (!categoryKey || categoryKey === "all") return true;
  const normalizedCategory = normalizeProductCategory(product.category);
  const normalizedSubcategory = normalizeProductSubcategory(product.subcategory, product.category);
  const raw = `${normalizedCategory} ${product.collection || ""} ${product.name || ""}`.toLowerCase();
  const { exact = [], keywords = [] } = categoryMatchTerms(categoryKey, subcategoryKey || normalizedSubcategory);
  const exactMatch = exact.some((term) => normalizedCategory.toLowerCase() === String(term).toLowerCase());
  const keywordMatch = keywords.some((term) =>
    raw.includes(String(term).toLowerCase()) || normalizedSubcategory.toLowerCase() === String(term).toLowerCase()
  );
  if (subcategoryKey) {
    const targetSub = String(subcategoryKey).toLowerCase();
    return exactMatch && normalizedSubcategory.toLowerCase() === targetSub;
  }
  return exactMatch || keywordMatch;
}

export function sortCollectionProducts(products = []) {
  return [...products].sort((left, right) => {
    const leftNewArrival = left.badge === "New Arrival" ? 1 : 0;
    const rightNewArrival = right.badge === "New Arrival" ? 1 : 0;
    if (leftNewArrival !== rightNewArrival) return rightNewArrival - leftNewArrival;

    const leftInStock = Number(left.stock) > 0 ? 1 : 0;
    const rightInStock = Number(right.stock) > 0 ? 1 : 0;
    if (leftInStock !== rightInStock) return rightInStock - leftInStock;

    if ((right.createdAt || 0) !== (left.createdAt || 0)) {
      return (right.createdAt || 0) - (left.createdAt || 0);
    }

    return String(left.name || "").localeCompare(String(right.name || ""));
  });
}

export function paginateProducts(products = [], page = 1, pageSize = 12) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeSize = Math.max(1, Number(pageSize) || 12);
  const start = (safePage - 1) * safeSize;
  return products.slice(start, start + safeSize);
}

export function useCollectionProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiFetch("/products")
      .then((data) => {
        if (cancelled) return;
        setProducts(
          groupProductsForDisplay(
            (data.products || []).map(productToCollectionShape).filter((product) => isProductVisible(product))
          )
        );
        setError("");
      })
      .catch((err) => {
        if (cancelled) return;
        setProducts([]);
        setError(err?.message || "Unable to load products.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo(() => ({ products, loading, error }), [products, loading, error]);
}
