import express from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler, createHttpError } from "../lib/http.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { sendEmail } from "../lib/mailer.js";

const router = express.Router();

router.use(requireAuth);
router.use(requireRole(["Admin", "SuperAdmin"]));

const expenseSchema = z.object({
  date: z.string().min(1).max(10),
  category: z.string().min(1).max(120),
  note: z.string().max(500).optional().nullable(),
  amount: z.number().positive(),
});

const replySchema = z.object({
  replyMessage: z.string().trim().min(1).max(4000),
});

function expenseToResponse(expense) {
  return {
    id: expense.id,
    date: expense.date,
    category: expense.category,
    note: expense.note || "",
    amount: Number(expense.amountCents) / 100,
    createdAt: expense.createdAt,
    updatedAt: expense.updatedAt,
    createdBy: expense.createdBy || null,
  };
}

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

router.get(
  "/expenses",
  asyncHandler(async (_req, res) => {
    const expenses = await prisma.expense.findMany({
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      include: { createdBy: { select: { id: true, username: true, email: true, role: true } } },
    });
    res.json({ expenses: expenses.map(expenseToResponse) });
  })
);

router.post(
  "/expenses",
  asyncHandler(async (req, res) => {
    const input = expenseSchema.parse(req.body);
    const expense = await prisma.expense.create({
      data: {
        date: input.date.slice(0, 10),
        category: input.category.trim(),
        note: input.note?.trim() || null,
        amountCents: Math.round(input.amount * 100),
        createdById: req.auth.sub,
      },
      include: { createdBy: { select: { id: true, username: true, email: true, role: true } } },
    });
    res.status(201).json({ expense: expenseToResponse(expense) });
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

router.get(
  "/contact-messages",
  asyncHandler(async (_req, res) => {
    const contactMessages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, username: true, email: true, role: true } } },
    });
    res.json({ contactMessages });
  })
);

function buildReplyBody(contactMessage, replyMessage) {
  return [
    `Hi ${contactMessage.name},`,
    "",
    "Thanks for contacting Huse. Here's our reply:",
    "",
    replyMessage,
    "",
    "Original message:",
    contactMessage.message,
    "",
    "Best regards,",
    "Huse Support",
  ].join("\n");
}

router.patch(
  "/contact-messages/:id/read",
  asyncHandler(async (req, res) => {
    const contactMessage = await prisma.contactMessage.update({
      where: { id: req.params.id },
      data: { isRead: true, readAt: new Date() },
      include: { user: { select: { id: true, username: true, email: true, role: true } } },
    });
    res.json({ contactMessage });
  })
);

router.post(
  "/contact-messages/:id/reply",
  asyncHandler(async (req, res) => {
    const input = replySchema.parse(req.body);
    const contactMessage = await prisma.contactMessage.findUnique({
      where: { id: req.params.id },
      include: { user: { select: { id: true, username: true, email: true, role: true } } },
    });

    if (!contactMessage) {
      throw createHttpError(404, "Contact message not found.");
    }

    await sendEmail({
      to: contactMessage.email,
      subject: `Reply from Huse Support`,
      text: buildReplyBody(contactMessage, input.replyMessage),
    });

    const updatedContactMessage = await prisma.contactMessage.update({
      where: { id: req.params.id },
      data: {
        replyMessage: input.replyMessage,
        repliedAt: new Date(),
        isRead: true,
        readAt: contactMessage.readAt || new Date(),
      },
      include: { user: { select: { id: true, username: true, email: true, role: true } } },
    });

    res.json({ contactMessage: updatedContactMessage });
  })
);

router.use((_req, _res, next) => next(createHttpError(404, "Not found")));

export default router;
