import express from "express";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler, createHttpError } from "../lib/http.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();
const productImageDir = path.resolve("uploads", "product-images");
const allowedImageTypes = new Map([
  ["image/png", ".png"],
  ["image/jpeg", ".jpg"],
  ["image/webp", ".webp"]
]);
const normalizeSizeCodes = (sizes = []) =>
  Array.from(
    new Set(
      (Array.isArray(sizes) ? sizes : [])
        .map((size) => (typeof size === "string" ? size : size?.code))
        .map((size) => String(size || "").trim())
        .filter(Boolean)
    )
  );

async function saveProductImage(upload) {
  const extension = allowedImageTypes.get(upload.contentType);
  if (!extension) throw createHttpError(400, "Unsupported product image type.");

  const imageBuffer = Buffer.from(upload.data, "base64");
  if (!imageBuffer.length) throw createHttpError(400, "Product image file is empty.");
  if (imageBuffer.length > 5 * 1024 * 1024) throw createHttpError(400, "Each product image must be 5 MB or less.");

  await fs.mkdir(productImageDir, { recursive: true });
  const fileName = `${crypto.randomUUID()}${extension}`;
  await fs.writeFile(path.join(productImageDir, fileName), imageBuffer);
  return `/uploads/product-images/${fileName}`;
}

async function saveProductImages(uploads = []) {
  return Promise.all(uploads.map(saveProductImage));
}

async function buildProductImages(input) {
  const uploadedImageUrls = await saveProductImages(input.imageUploads || []);
  return [...(input.images || []), ...uploadedImageUrls].filter(Boolean);
}

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        details: { orderBy: { sortOrder: "asc" } },
        sizes: { orderBy: { sortOrder: "asc" } },
        colors: { orderBy: { sortOrder: "asc" } }
      }
    });
    res.json({ products });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        details: { orderBy: { sortOrder: "asc" } },
        sizes: { orderBy: { sortOrder: "asc" } },
        colors: { orderBy: { sortOrder: "asc" } }
      }
    });
    if (!product || !product.isActive) throw createHttpError(404, "Product not found.");
    res.json({ product });
  })
);

const upsertSchema = z.object({
  name: z.string().min(2).max(200),
  sku: z.string().max(80).optional().nullable(),
  category: z.string().max(120).optional().nullable(),
  subtitle: z.string().max(500).optional().nullable(),
  collection: z.string().max(200).optional().nullable(),
  description: z.string().optional().nullable(),
  badge: z.string().max(100).optional().nullable(),
  badgeColorHex: z.string().max(32).optional().nullable(),
  priceCents: z.number().int().nonnegative(),
  costCents: z.number().int().nonnegative().optional().default(0),
  stock: z.number().int().nonnegative().optional().default(0),
  coverImageUrl: z.string().max(2000).optional().nullable(),
  originalCents: z.number().int().nonnegative().optional().nullable(),
  currency: z.string().max(8).optional(),
  rating: z.number().min(0).max(5).optional().nullable(),
  reviewsCount: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
  images: z.array(z.string().min(1)).optional(),
  imageUploads: z.array(z.object({
    fileName: z.string().min(1).max(255),
    contentType: z.enum(["image/png", "image/jpeg", "image/webp"]),
    data: z.string().min(1)
  })).optional(),
  details: z.array(z.string().min(1)).optional(),
  sizes: z.array(z.string().min(1)).optional(),
  colors: z.array(z.object({ name: z.string().min(1), hex: z.string().min(1).optional().nullable() })).optional()
});

router.post(
  "/",
  requireAuth,
  requireRole(["Admin", "SuperAdmin"]),
  asyncHandler(async (req, res) => {
    const input = upsertSchema.parse(req.body);
    const imageUrls = await buildProductImages(input);
    const sizeCodes = normalizeSizeCodes(input.sizes);

    const product = await prisma.product.create({
      data: {
        name: input.name,
        sku: input.sku ?? null,
        category: input.category ?? null,
        subtitle: input.subtitle ?? null,
        collection: input.collection ?? null,
        description: input.description ?? null,
        badge: input.badge ?? null,
        badgeColorHex: input.badgeColorHex ?? null,
        priceCents: input.priceCents,
        costCents: input.costCents ?? 0,
        stock: input.stock ?? 0,
        coverImageUrl: input.coverImageUrl ?? imageUrls[0] ?? null,
        originalCents: input.originalCents ?? null,
        currency: input.currency ?? "LKR",
        rating: input.rating ?? null,
        reviewsCount: input.reviewsCount ?? 0,
        isActive: input.isActive ?? true,
        images: imageUrls.length
          ? { create: imageUrls.map((url, idx) => ({ url, sortOrder: idx })) }
          : undefined,
        details: input.details
          ? { create: input.details.map((text, idx) => ({ text, sortOrder: idx })) }
          : undefined,
        sizes: sizeCodes.length
          ? { create: sizeCodes.map((code, idx) => ({ code, sortOrder: idx })) }
          : undefined,
        colors: input.colors
          ? { create: input.colors.map((c, idx) => ({ name: c.name, hex: c.hex ?? null, sortOrder: idx })) }
          : undefined
      },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        details: { orderBy: { sortOrder: "asc" } },
        sizes: { orderBy: { sortOrder: "asc" } },
        colors: { orderBy: { sortOrder: "asc" } }
      }
    });

    res.status(201).json({ product });
  })
);

router.put(
  "/:id",
  requireAuth,
  requireRole(["Admin", "SuperAdmin"]),
  asyncHandler(async (req, res) => {
    const input = upsertSchema.parse(req.body);
    const imageUrls = await buildProductImages(input);
    const sizeCodes = normalizeSizeCodes(input.sizes);

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name: input.name,
        sku: input.sku ?? null,
        category: input.category ?? null,
        subtitle: input.subtitle ?? null,
        collection: input.collection ?? null,
        description: input.description ?? null,
        badge: input.badge ?? null,
        badgeColorHex: input.badgeColorHex ?? null,
        priceCents: input.priceCents,
        costCents: input.costCents ?? 0,
        stock: input.stock ?? 0,
        coverImageUrl: input.coverImageUrl ?? imageUrls[0] ?? null,
        originalCents: input.originalCents ?? null,
        currency: input.currency ?? "LKR",
        rating: input.rating ?? null,
        reviewsCount: input.reviewsCount ?? 0,
        isActive: input.isActive ?? true,
        images: {
          deleteMany: {},
          create: imageUrls.map((url, idx) => ({ url, sortOrder: idx })),
        },
        sizes: {
          deleteMany: {},
          create: sizeCodes.map((code, idx) => ({ code, sortOrder: idx })),
        },
      },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        details: { orderBy: { sortOrder: "asc" } },
        sizes: { orderBy: { sortOrder: "asc" } },
        colors: { orderBy: { sortOrder: "asc" } },
      },
    });

    res.json({ product });
  })
);

router.delete(
  "/:id",
  requireAuth,
  requireRole(["Admin", "SuperAdmin"]),
  asyncHandler(async (req, res) => {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: { isActive: false },
      select: { id: true, isActive: true },
    });
    res.json({ product });
  })
);

export default router;
