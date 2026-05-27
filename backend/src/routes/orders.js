import express from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler, createHttpError } from "../lib/http.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

const createOrderSchema = z.object({
  paymentMethod: z.enum(["Card", "BankDeposit", "CashOnDelivery"]),
  promoCode: z.string().max(50).optional().nullable(),
  shippingCents: z.number().int().nonnegative(),
  discountCents: z.number().int().nonnegative().optional().default(0),
  currency: z.string().max(8).optional().default("LKR"),
  customer: z
    .object({
      name: z.string().min(1).max(120).optional().nullable(),
      email: z.string().email().optional().nullable(),
      phone: z.string().max(40).optional().nullable(),
      addressLine1: z.string().max(200).optional().nullable(),
      addressLine2: z.string().max(200).optional().nullable(),
      city: z.string().max(100).optional().nullable(),
      postalCode: z.string().max(40).optional().nullable(),
      country: z.string().max(80).optional().nullable()
    })
    .optional()
    .default({}),
  items: z
    .array(
      z.object({
        productId: z.string().optional().nullable(),
        productName: z.string().min(1).max(200),
        unitPriceCents: z.number().int().nonnegative(),
        quantity: z.number().int().positive(),
        size: z.string().max(20).optional().nullable(),
        color: z.string().max(60).optional().nullable()
      })
    )
    .min(1)
});

router.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = createOrderSchema.parse(req.body);

    const subtotalCents = input.items.reduce((s, it) => s + it.unitPriceCents * it.quantity, 0);
    const totalCents = Math.max(0, subtotalCents + input.shippingCents - (input.discountCents ?? 0));

    const order = await prisma.order.create({
      data: {
        userId: req.auth.sub,
        status: "order pending",
        paymentMethod: input.paymentMethod,
        promoCode: input.promoCode ?? null,
        currency: input.currency ?? "LKR",
        subtotalCents,
        shippingCents: input.shippingCents,
        discountCents: input.discountCents ?? 0,
        totalCents,
        customerName: input.customer?.name ?? null,
        customerEmail: input.customer?.email ?? null,
        phone: input.customer?.phone ?? null,
        addressLine1: input.customer?.addressLine1 ?? null,
        addressLine2: input.customer?.addressLine2 ?? null,
        city: input.customer?.city ?? null,
        postalCode: input.customer?.postalCode ?? null,
        country: input.customer?.country ?? null,
        items: {
          create: input.items.map((it) => ({
            productId: it.productId ?? null,
            productName: it.productName,
            unitPriceCents: it.unitPriceCents,
            quantity: it.quantity,
            size: it.size ?? null,
            color: it.color ?? null
          }))
        },
        payments: {
          create: {
            method: input.paymentMethod,
            amountCents: totalCents,
            currency: input.currency ?? "LKR"
          }
        }
      },
      include: { items: true, payments: true }
    });

    res.status(201).json({ order });
  })
);

router.get(
  "/mine",
  requireAuth,
  asyncHandler(async (req, res) => {
    const orders = await prisma.order.findMany({
      where: { userId: req.auth.sub },
      orderBy: { createdAt: "desc" },
      include: { items: true, payments: true }
    });
    res.json({ orders });
  })
);

router.get(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: true, payments: true }
    });
    if (!order) throw createHttpError(404, "Order not found.");
    if (order.userId && order.userId !== req.auth.sub) throw createHttpError(403, "Forbidden.");
    res.json({ order });
  })
);

export default router;
