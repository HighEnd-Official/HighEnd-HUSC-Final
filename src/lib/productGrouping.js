function normalizeText(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function normalizeColorValue(value) {
  const text = String(value || "").trim();
  return text || "";
}

export function getVariantGroupKey(product) {
  const explicitKey = normalizeText(product?.variantGroupKey);
  if (explicitKey) return `group:${explicitKey}`;

  const category = normalizeText(product?.category);
  const subcategory = normalizeText(product?.subcategory);
  const collection = normalizeText(product?.collection);
  const name = normalizeText(product?.name);
  const sku = normalizeText(product?.sku);

  if (sku) return `sku:${sku}`;
  return `name:${category}|${subcategory}|${collection}|${name}`;
}

export function groupProductsForDisplay(products = []) {
  const buckets = new Map();

  for (const product of products) {
    const key = getVariantGroupKey(product);
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(product);
  }

  return [...buckets.entries()].map(([groupKey, variants]) => {
    const sortedVariants = [...variants].sort((left, right) => {
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

    const representative = sortedVariants[0] || variants[0];
    const groupStock = variants.reduce((sum, product) => sum + (Number(product.stock) || 0), 0);
    const previewColors = [];

    for (const variant of sortedVariants) {
      const firstColor = Array.isArray(variant.colors) && variant.colors.length ? variant.colors[0] : null;
      const colorHex = normalizeColorValue(firstColor?.hex || variant.badgeColor || "#e05585");
      const colorKey = normalizeText(`${firstColor?.name || variant.name}|${colorHex}`);
      if (previewColors.some((color) => color.key === colorKey)) continue;
      previewColors.push({
        key: colorKey,
        id: variant.id,
        name: firstColor?.name || variant.name,
        colorHex,
      });
    }

    return {
      ...representative,
      groupKey,
      variants: sortedVariants,
      variantCount: sortedVariants.length,
      stock: groupStock,
      previewColors,
      colorVariants: sortedVariants.map((variant) => {
        const firstColor = Array.isArray(variant.colors) && variant.colors.length ? variant.colors[0] : null;
        const colorHex = normalizeColorValue(firstColor?.hex || variant.badgeColor || "#e05585");
        return {
          id: variant.id,
          name: firstColor?.name || variant.name,
          colorHex,
          images: variant.images?.length ? variant.images : [variant.image],
          price: variant.price,
          originalPrice: variant.originalPrice,
          inStock: Number(variant.stock) > 0,
          product: variant,
          floralPattern: variant.subtitle || variant.collection || "",
        };
      }),
    };
  });
}
