import express from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler, createHttpError } from "../lib/http.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);
router.use(requireRole(["Admin", "SuperAdmin"]));

router.get(
  "/orders",
  asyncHandler(async (_req, res) => {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: true, payments: true, user: { select: { id: true, email: true, username: true, role: true } } },
    });
    res.json({ orders });
  })
);

const statusSchema = z.object({ status: z.string().min(1).max(60) });

router.patch(
  "/orders/:id/status",
  asyncHandler(async (req, res) => {
    const input = statusSchema.parse(req.body);
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: input.status },
      include: { items: true, payments: true },
    });
    res.json({ order });
  })
);

router.get(
  "/products",
  asyncHandler(async (_req, res) => {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        details: { orderBy: { sortOrder: "asc" } },
        sizes: { orderBy: { sortOrder: "asc" } },
        colors: { orderBy: { sortOrder: "asc" } },
      },
    });
    res.json({ products });
  })
);

router.get(
  "/users",
  asyncHandler(async (_req, res) => {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, username: true, email: true, role: true, createdAt: true },
    });
    res.json({ users });
  })
);

router.use((_req, _res, next) => next(createHttpError(404, "Not found")));

export default router;

