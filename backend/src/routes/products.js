import express from "express";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import jwt from "jsonwebtoken";
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
const normalizeSeasonalEndsOn = (value) => {
  const text = String(value || "").trim();
  if (!text) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) throw createHttpError(400, "Seasonal end date must use YYYY-MM-DD.");
  return text;
};

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

function getOptionalAuth(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

function toReviewCount(product) {
  return Number(product?.reviewsCount) || 0;
}

function toLikeCount(product) {
  return Number(product?._count?.likes) || 0;
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
        colors: { orderBy: { sortOrder: "asc" } },
        _count: { select: { likes: true, reviews: true } }
      }
    });
    res.json({
      products: products.map((product) => ({
        ...product,
        likesCount: product._count?.likes || 0,
        reviewsCount: product._count?.reviews || 0
      }))
    });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const auth = getOptionalAuth(req);
    const include = {
      images: { orderBy: { sortOrder: "asc" } },
      details: { orderBy: { sortOrder: "asc" } },
      sizes: { orderBy: { sortOrder: "asc" } },
      colors: { orderBy: { sortOrder: "asc" } },
      reviews: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, username: true, avatarUrl: true } } }
      },
      _count: { select: { likes: true, reviews: true } }
    };
    if (auth?.sub) {
      include.likes = { where: { userId: auth.sub }, select: { id: true, userId: true } };
    }

    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include
    });
    if (!product || !product.isActive) throw createHttpError(404, "Product not found.");
    res.json({
      product: {
        ...product,
        likesCount: product._count?.likes || 0,
        reviewsCount: product._count?.reviews || 0,
        likedByMe: Boolean(product.likes?.length),
      }
    });
  })
);

const upsertSchema = z.object({
  name: z.string().min(2).max(200),
  sku: z.string().max(80).optional().nullable(),
  category: z.string().max(120).optional().nullable(),
  subcategory: z.string().max(120).optional().nullable(),
  subtitle: z.string().max(500).optional().nullable(),
  collection: z.string().max(200).optional().nullable(),
  description: z.string().optional().nullable(),
  badge: z.string().max(100).optional().nullable(),
  badgeColorHex: z.string().max(32).optional().nullable(),
  seasonalBadgeText: z.string().max(100).optional().nullable(),
  variantGroupKey: z.string().max(120).optional().nullable(),
  seasonalBatch: z.boolean().optional(),
  seasonalEndsOn: z.string().max(10).optional().nullable(),
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
        subcategory: input.subcategory ?? null,
        subtitle: input.subtitle ?? null,
        collection: input.collection ?? null,
        description: input.description ?? null,
        badge: input.badge ?? null,
        badgeColorHex: input.badgeColorHex ?? null,
        seasonalBadgeText: input.seasonalBadgeText ?? null,
        variantGroupKey: input.variantGroupKey ?? null,
        seasonalBatch: input.seasonalBatch ?? false,
        seasonalEndsOn: normalizeSeasonalEndsOn(input.seasonalEndsOn),
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
        subcategory: input.subcategory ?? null,
        subtitle: input.subtitle ?? null,
        collection: input.collection ?? null,
        description: input.description ?? null,
        badge: input.badge ?? null,
        badgeColorHex: input.badgeColorHex ?? null,
        seasonalBadgeText: input.seasonalBadgeText ?? null,
        variantGroupKey: input.variantGroupKey ?? null,
        seasonalBatch: input.seasonalBatch ?? false,
        seasonalEndsOn: normalizeSeasonalEndsOn(input.seasonalEndsOn),
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
        details: {
          deleteMany: {},
          create: (input.details || []).map((text, idx) => ({ text, sortOrder: idx })),
        },
        colors: {
          deleteMany: {},
          create: (input.colors || []).map((c, idx) => ({ name: c.name, hex: c.hex ?? null, sortOrder: idx })),
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

router.post(
  "/:id/like",
  requireAuth,
  asyncHandler(async (req, res) => {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      select: { id: true, isActive: true }
    });
    if (!product || !product.isActive) throw createHttpError(404, "Product not found.");

    const existingLike = await prisma.productLike.findUnique({
      where: { productId_userId: { productId: req.params.id, userId: req.auth.sub } }
    });

    const nextLiked = !existingLike;
    await prisma.$transaction(async (tx) => {
      if (existingLike) {
        await tx.productLike.delete({ where: { id: existingLike.id } });
      } else {
        await tx.productLike.create({
          data: { productId: req.params.id, userId: req.auth.sub }
        });
      }
    });

    const latest = await prisma.product.findUnique({
      where: { id: req.params.id },
      select: { _count: { select: { likes: true } } }
    });

    res.json({
      liked: nextLiked,
      likesCount: toLikeCount(latest)
    });
  })
);

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional().nullable(),
  comment: z.string().min(1).max(2000)
});

router.post(
  "/:id/reviews",
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = reviewSchema.parse(req.body);
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      select: { id: true, isActive: true }
    });
    if (!product || !product.isActive) throw createHttpError(404, "Product not found.");

    const review = await prisma.$transaction(async (tx) => {
      const saved = await tx.productReview.upsert({
        where: {
          productId_userId: {
            productId: req.params.id,
            userId: req.auth.sub
          }
        },
        create: {
          productId: req.params.id,
          userId: req.auth.sub,
          rating: input.rating,
          title: input.title?.trim() || null,
          comment: input.comment.trim()
        },
        update: {
          rating: input.rating,
          title: input.title?.trim() || null,
          comment: input.comment.trim()
        },
        include: { user: { select: { id: true, username: true, avatarUrl: true } } }
      });

      const aggregates = await tx.productReview.aggregate({
        where: { productId: req.params.id },
        _avg: { rating: true },
        _count: { rating: true }
      });

      await tx.product.update({
        where: { id: req.params.id },
        data: {
          rating: aggregates._avg.rating == null ? null : Number(aggregates._avg.rating.toFixed(2)),
          reviewsCount: aggregates._count.rating
        }
      });

      return saved;
    });

    const aggregates = await prisma.productReview.aggregate({
      where: { productId: req.params.id },
      _avg: { rating: true },
      _count: { rating: true }
    });

    res.status(201).json({
      review,
      rating: aggregates._avg.rating == null ? null : Number(aggregates._avg.rating.toFixed(2)),
      reviewsCount: aggregates._count.rating
    });
  })
);

router.get(
  "/:id/reviews",
  asyncHandler(async (req, res) => {
    const reviews = await prisma.productReview.findMany({
      where: { productId: req.params.id },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, username: true, avatarUrl: true } } }
    });
    res.json({ reviews });
  })
);

export default router;
