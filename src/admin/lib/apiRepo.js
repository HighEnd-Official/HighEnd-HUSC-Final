import { apiFetch } from "../../api/client";

const centsToLkr = (cents) => (Number(cents) || 0) / 100;
const lkrToCents = (lkr) => Math.round((Number(lkr) || 0) * 100);
const normalizeSizeCodes = (sizes = []) =>
  Array.from(
    new Set(
      (Array.isArray(sizes) ? sizes : [])
        .map((size) => (typeof size === "string" ? size : size?.code))
        .map((size) => String(size || "").trim())
        .filter(Boolean)
    )
  );
const normalizeColors = (colors = []) =>
  Array.from(
    new Map(
      (Array.isArray(colors) ? colors : [])
        .map((color) => ({
          name: String((typeof color === "string" ? color : color?.name) || "").trim(),
          hex: String(color?.hex || color?.colorHex || "").trim(),
        }))
        .filter((color) => color.name)
        .map((color) => [color.name.toLowerCase(), color])
    ).values()
  );
const toAbsoluteApiUrl = (url) => {
  if (!url) return "";
  if (String(url).startsWith("http")) return url;
  return `${process.env.REACT_APP_API_BASE_URL || "http://localhost:4000"}${url}`;
};
const toDisplayImageUrl = (url) => {
  if (!url) return "";
  if (String(url).startsWith("/uploads/")) return toAbsoluteApiUrl(url);
  return url;
};

function orderToAdminShape(o) {
  const paymentWithProof = (o.payments || []).find((payment) => payment.attachmentUrl);
  return {
    id: o.id,
    createdAt: String(o.createdAt).slice(0, 10),
    customerName: o.customerName || o.customerEmail || o.user?.username || "-",
    customerPhone: o.phone || "",
    customerEmail: o.customerEmail || o.user?.email || "",
    status: o.status || "order pending",
    paymentMethod: o.paymentMethod || "",
    subtotal: centsToLkr(o.subtotalCents),
    shipping: centsToLkr(o.shippingCents),
    discount: centsToLkr(o.discountCents),
    total: centsToLkr(o.totalCents),
    paymentProofUrl: toAbsoluteApiUrl(paymentWithProof?.attachmentUrl),
    address: {
      line1: o.addressLine1 || "",
      line2: o.addressLine2 || "",
      city: o.city || "",
      postalCode: o.postalCode || "",
      country: o.country || "",
    },
    items: (o.items || []).map((it) => ({
      productId: it.productId || null,
      name: it.productName,
      qty: it.quantity,
      price: centsToLkr(it.unitPriceCents),
      cost: 0,
      size: it.size || "",
      color: it.color || "",
    })),
  };
}

function productToAdminShape(p) {
  return {
    id: p.id,
    name: p.name,
    sku: p.sku || "",
    category: p.category || "",
    price: centsToLkr(p.priceCents),
    cost: centsToLkr(p.costCents),
    stock: p.stock ?? 0,
    imageUrl: toDisplayImageUrl(p.coverImageUrl || p.images?.[0]?.url || ""),
    subtitle: p.subtitle || "",
    collection: p.collection || "",
    badge: p.badge || "",
    description: p.description || "",
    images: (p.images || []).map((i) => toDisplayImageUrl(i.url)),
    details: (p.details || []).map((d) => d.text),
    sizes: normalizeSizeCodes(p.sizes),
    colors: (p.colors || []).map((c) => ({ name: c.name, hex: c.hex || "" })),
  };
}

export async function getProducts() {
  const data = await apiFetch("/admin/products");
  return (data.products || []).map(productToAdminShape);
}

export async function upsertProduct(product) {
  const body = {
    name: product.name,
    sku: product.sku || null,
    category: product.category || null,
    priceCents: lkrToCents(product.price),
    costCents: lkrToCents(product.cost),
    stock: Number(product.stock) || 0,
    coverImageUrl: product.imageUrl || null,
    images: product.images || [],
    imageUploads: product.imageUploads || [],
    sizes: normalizeSizeCodes(product.sizes),
    colors: normalizeColors(product.colors),
    isActive: true,
  };

  if (product.id && !String(product.id).startsWith("prod_") && !String(product.id).startsWith("temp_")) {
    const data = await apiFetch(`/products/${product.id}`, { method: "PUT", body: JSON.stringify(body) });
    return productToAdminShape(data.product);
  }

  const data = await apiFetch("/products", { method: "POST", body: JSON.stringify(body) });
  return productToAdminShape(data.product);
}

export async function deleteProduct(productId) {
  await apiFetch(`/products/${productId}`, { method: "DELETE" });
}

export async function getOrders() {
  const data = await apiFetch("/admin/orders");
  return (data.orders || []).map(orderToAdminShape);
}

export async function updateOrderStatus(orderId, status) {
  const data = await apiFetch(`/admin/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return orderToAdminShape(data.order);
}
