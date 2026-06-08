export function getDiscountAmount(actualPriceValue, priceValue) {
  const actual = Number(actualPriceValue) || 0;
  const current = Number(priceValue) || 0;
  if (actual <= 0 || current <= 0 || current >= actual) return 0;
  return actual - current;
}

export function getDiscountPercent(actualPriceValue, priceValue) {
  const actual = Number(actualPriceValue) || 0;
  const discountAmount = getDiscountAmount(actualPriceValue, priceValue);
  if (actual <= 0 || discountAmount <= 0) return 0;
  return Math.round((discountAmount / actual) * 100);
}
