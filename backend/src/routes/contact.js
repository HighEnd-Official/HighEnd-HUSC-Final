import express from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler, createHttpError } from "../lib/http.js";

const router = express.Router();

const contactSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(200),
  message: z.string().min(1).max(4000),
});

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

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = contactSchema.parse(req.body);
    const auth = getOptionalAuth(req);

    const contactMessage = await prisma.contactMessage.create({
      data: {
        userId: auth?.sub || null,
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        message: input.message.trim(),
      },
    });

    res.status(201).json({ contactMessage });
  })
);

router.use((_req, _res, next) => next(createHttpError(404, "Not found")));

export default router;
