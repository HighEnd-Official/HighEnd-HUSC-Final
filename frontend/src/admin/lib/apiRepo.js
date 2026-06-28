import { apiFetch } from "../../api/client";

const centsToLkr = (cents) => (Number(cents) || 0) / 100;
const lkrToCents = (lkr) => Math.round((Number(lkr) || 0) * 100);
const DEFAULT_API_BASE_URL =
  typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:4000`
    : "http://localhost:4000";
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
          hex: String(color?.hex || color?.colorHex || "").trim() || null,
        }))
        .filter((color) => color.name)
        .map((color) => [color.name.toLowerCase(), color])
    ).values()
  );
const toAbsoluteApiUrl = (url) => {
  if (!url) return "";
  if (String(url).startsWith("http")) return url;
  return `${import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL}${url}`;
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
    createdAt: p.createdAt || "",
    name: p.name,
    sku: p.sku || "",
    category: p.category || "",
    subcategory: p.subcategory || "",
    price: centsToLkr(p.priceCents),
    cost: centsToLkr(p.costCents),
    originalPrice: p.originalCents != null ? centsToLkr(p.originalCents) : "",
    stock: p.stock ?? 0,
    imageUrl: toDisplayImageUrl(p.coverImageUrl || p.images?.[0]?.url || ""),
    subtitle: p.subtitle || "",
    collection: p.collection || "",
    badge: p.badge || "",
    badgeColor: p.badgeColorHex || "",
    seasonalBadgeText: p.seasonalBadgeText || "",
    variantGroupKey: p.variantGroupKey || "",
    seasonalBatch: Boolean(p.seasonalBatch),
    seasonalEndsOn: p.seasonalEndsOn || "",
    description: p.description || "",
    images: (p.images || []).map((i) => toDisplayImageUrl(i.url)),
    details: (p.details || []).map((d) => d.text),
    sizes: normalizeSizeCodes(p.sizes),
    colors: (p.colors || []).map((c) => ({ name: c.name, hex: c.hex || "" })),
    rating: p.rating != null ? Number(p.rating) : "",
    reviewsCount: Number(p.reviewsCount) || 0,
    currency: p.currency || "LKR",
    isActive: Boolean(p.isActive),
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
    subcategory: product.subcategory || null,
    subtitle: product.subtitle || null,
    collection: product.collection || null,
    description: product.description || null,
    badge: product.badge || null,
    badgeColorHex: product.badgeColor || null,
    seasonalBadgeText: product.seasonalBadgeText || null,
    variantGroupKey: product.variantGroupKey || null,
    seasonalBatch: Boolean(product.seasonalBatch),
    seasonalEndsOn: product.seasonalEndsOn || null,
    priceCents: lkrToCents(product.price),
    costCents: lkrToCents(product.cost),
    originalCents: product.originalPrice ? lkrToCents(product.originalPrice) : null,
    stock: Number(product.stock) || 0,
    coverImageUrl: product.imageUrl || null,
    images: product.images || [],
    imageUploads: product.imageUploads || [],
    details: product.details || [],
    sizes: normalizeSizeCodes(product.sizes),
    colors: normalizeColors(product.colors),
    currency: product.currency || "LKR",
    rating: product.rating === "" || product.rating == null ? null : Number(product.rating),
    reviewsCount: Number(product.reviewsCount) || 0,
    isActive: product.isActive ?? true,
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

function contactMessageToAdminShape(message) {
  return {
    id: message.id,
    createdAt: String(message.createdAt).slice(0, 16).replace("T", " "),
    name: message.name,
    email: message.email,
    message: message.message,
    isRead: Boolean(message.isRead),
    readAt: message.readAt ? String(message.readAt).slice(0, 16).replace("T", " ") : "",
    replyMessage: message.replyMessage || "",
    repliedAt: message.repliedAt ? String(message.repliedAt).slice(0, 16).replace("T", " ") : "",
    user: message.user || null,
  };
}

function expenseToAdminShape(expense) {
  return {
    id: expense.id,
    date: String(expense.date).slice(0, 10),
    category: expense.category,
    note: expense.note || '',
    amount: Number(expense.amount) || 0,
    createdAt: expense.createdAt ? String(expense.createdAt).slice(0, 19).replace('T', ' ') : '',
    updatedAt: expense.updatedAt ? String(expense.updatedAt).slice(0, 19).replace('T', ' ') : '',
    createdBy: expense.createdBy || null,
  };
}

export async function getContactMessages() {
  const data = await apiFetch("/admin/contact-messages");
  return (data.contactMessages || []).map(contactMessageToAdminShape);
}

export async function markContactMessageRead(messageId) {
  const data = await apiFetch(`/admin/contact-messages/${messageId}/read`, {
    method: "PATCH",
  });
  return contactMessageToAdminShape(data.contactMessage);
}

export async function replyContactMessage(messageId, replyMessage) {
  const data = await apiFetch(`/admin/contact-messages/${messageId}/reply`, {
    method: "POST",
    body: JSON.stringify({ replyMessage }),
  });
  return contactMessageToAdminShape(data.contactMessage);
}

export async function getExpenses() {
  const data = await apiFetch("/admin/expenses");
  return (data.expenses || []).map(expenseToAdminShape);
}

export async function addExpense(expense) {
  const data = await apiFetch("/admin/expenses", {
    method: "POST",
    body: JSON.stringify({
      date: expense.date,
      category: expense.category,
      note: expense.note || null,
      amount: Number(expense.amount) || 0,
    }),
  });
  return expenseToAdminShape(data.expense);
}
