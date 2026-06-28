export function getTodayIsoDate(date = new Date()) {
  return new Date(date).toISOString().slice(0, 10);
}

export function isSeasonalProductExpired(product, now = new Date()) {
  if (!product?.seasonalBatch) return false;
  const seasonalEndsOn = String(product.seasonalEndsOn || "").trim();
  if (!seasonalEndsOn) return false;
  return seasonalEndsOn < getTodayIsoDate(now);
}

export function isProductVisible(product, now = new Date()) {
  if (!product) return false;
  if (Number(product.stock) <= 0) return false;
  if (product.isActive === false) return false;
  return !isSeasonalProductExpired(product, now);
}

export function getSeasonalBadgeText(product, fallback = "Seasonal") {
  if (!product?.seasonalBatch) return "";
  const text = String(product.seasonalBadgeText || "").trim();
  return text || fallback;
}
