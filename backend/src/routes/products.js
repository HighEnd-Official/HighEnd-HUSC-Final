import express from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler, createHttpError } from "../lib/http.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

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
        coverImageUrl: input.coverImageUrl ?? null,
        originalCents: input.originalCents ?? null,
        currency: input.currency ?? "LKR",
        rating: input.rating ?? null,
        reviewsCount: input.reviewsCount ?? 0,
        isActive: input.isActive ?? true,
        images: input.images
          ? { create: input.images.map((url, idx) => ({ url, sortOrder: idx })) }
          : undefined,
        details: input.details
          ? { create: input.details.map((text, idx) => ({ text, sortOrder: idx })) }
          : undefined,
        sizes: input.sizes
          ? { create: input.sizes.map((code, idx) => ({ code, sortOrder: idx })) }
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
        coverImageUrl: input.coverImageUrl ?? null,
        originalCents: input.originalCents ?? null,
        currency: input.currency ?? "LKR",
        rating: input.rating ?? null,
        reviewsCount: input.reviewsCount ?? 0,
        isActive: input.isActive ?? true,
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
