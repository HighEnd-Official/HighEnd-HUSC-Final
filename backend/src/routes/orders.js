import express from "express";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler, createHttpError } from "../lib/http.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";

const router = express.Router();
const paymentProofDir = path.resolve("uploads", "payment-proofs");
const allowedProofTypes = new Map([
  ["image/png", ".png"],
  ["image/jpeg", ".jpg"],
  ["application/pdf", ".pdf"]
]);

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
      addressLine1: z.string().min(1).max(200),
      addressLine2: z.string().max(200).optional().nullable(),
      city: z.string().min(1).max(100),
      postalCode: z.string().min(1).max(40),
      country: z.string().min(1).max(80)
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
    .min(1),
  paymentProof: z
    .object({
      fileName: z.string().min(1).max(255),
      contentType: z.enum(["image/png", "image/jpeg", "application/pdf"]),
      data: z.string().min(1)
    })
    .optional()
    .nullable()
});

async function savePaymentProof(paymentProof) {
  if (!paymentProof) return null;
  const extension = allowedProofTypes.get(paymentProof.contentType);
  if (!extension) throw createHttpError(400, "Unsupported payment proof file type.");

  const fileBuffer = Buffer.from(paymentProof.data, "base64");
  if (!fileBuffer.length) throw createHttpError(400, "Payment proof file is empty.");
  if (fileBuffer.length > 5 * 1024 * 1024) throw createHttpError(400, "Payment proof file must be 5 MB or less.");

  await fs.mkdir(paymentProofDir, { recursive: true });
  const fileName = `${crypto.randomUUID()}${extension}`;
  await fs.writeFile(path.join(paymentProofDir, fileName), fileBuffer);
  return `/uploads/payment-proofs/${fileName}`;
}

function getRequestedProductQuantities(items) {
  return Array.from(
    items.reduce((quantities, item) => {
      if (!item.productId) return quantities;
      quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity);
      return quantities;
    }, new Map())
  ).map(([productId, quantity]) => ({ productId, quantity }));
}

router.post(
  "/",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const input = createOrderSchema.parse(req.body);
    const productQuantities = getRequestedProductQuantities(input.items);

    if (productQuantities.length) {
      const products = await prisma.product.findMany({
        where: { id: { in: productQuantities.map((item) => item.productId) }, isActive: true },
        select: { id: true, name: true, stock: true }
      });
      const productById = new Map(products.map((product) => [product.id, product]));
      const unavailable = productQuantities.find((item) => {
        const product = productById.get(item.productId);
        return !product || product.stock < item.quantity;
      });

      if (unavailable) {
        const product = productById.get(unavailable.productId);
        throw createHttpError(400, product ? `${product.name} is out of stock.` : "A product in your bag is no longer available.");
      }
    }

    const subtotalCents = input.items.reduce((s, it) => s + it.unitPriceCents * it.quantity, 0);
    const totalCents = Math.max(0, subtotalCents + input.shippingCents - (input.discountCents ?? 0));
    const attachmentUrl = await savePaymentProof(input.paymentProof);

    const order = await prisma.$transaction(async (tx) => {
      for (const item of productQuantities) {
        const updated = await tx.product.updateMany({
          where: { id: item.productId, isActive: true, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } }
        });

        if (updated.count !== 1) {
          throw createHttpError(400, "A product in your bag is no longer available in the requested quantity.");
        }
      }

      return tx.order.create({
        data: {
          userId: req.auth?.sub ?? null,
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
              currency: input.currency ?? "LKR",
              attachmentUrl
            }
          }
        },
        include: { items: true, payments: true }
      });
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
