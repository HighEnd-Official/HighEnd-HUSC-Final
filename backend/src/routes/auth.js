import express from "express";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import jwt from "jsonwebtoken";
import path from "node:path";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler, createHttpError } from "../lib/http.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
const avatarDir = path.resolve("uploads", "profile-pics");
const allowedAvatarTypes = new Map([
  ["image/png", ".png"],
  ["image/jpeg", ".jpg"],
  ["image/webp", ".webp"]
]);

const registerSchema = z.object({
  username: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  password: z.string().min(6).max(200),
  phone: z.string().max(40).optional().nullable()
});

const loginSchema = z.object({
  identifier: z.string().min(2),
  password: z.string().min(1)
});

const updateProfileSchema = z.object({
  username: z.string().trim().min(2).max(80).optional(),
  phone: z.string().max(40).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  addressLine1: z.string().max(200).optional().nullable(),
  addressLine2: z.string().max(200).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  postalCode: z.string().max(40).optional().nullable(),
  country: z.string().max(80).optional().nullable(),
  avatarImage: z
    .object({
      fileName: z.string().min(1).max(255),
      contentType: z.enum(["image/png", "image/jpeg", "image/webp"]),
      data: z.string().min(1)
    })
    .optional()
    .nullable()
});

const userSelect = {
  id: true,
  username: true,
  email: true,
  phone: true,
  avatarUrl: true,
  addressLine1: true,
  addressLine2: true,
  city: true,
  postalCode: true,
  country: true,
  role: true,
  createdAt: true,
  updatedAt: true
};

function serializeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    phone: user.phone ?? "",
    avatarUrl: user.avatarUrl ?? "",
    addressLine1: user.addressLine1 ?? "",
    addressLine2: user.addressLine2 ?? "",
    city: user.city ?? "",
    postalCode: user.postalCode ?? "",
    country: user.country ?? "",
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

function sign(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function normalizeNullable(value) {
  if (value == null) return null;
  const text = String(value).trim();
  return text.length ? text : null;
}

async function saveAvatarImage(avatarImage) {
  if (!avatarImage) return null;

  const extension = allowedAvatarTypes.get(avatarImage.contentType);
  if (!extension) throw createHttpError(400, "Unsupported profile image type.");

  const fileBuffer = Buffer.from(avatarImage.data, "base64");
  if (!fileBuffer.length) throw createHttpError(400, "Profile image is empty.");
  if (fileBuffer.length > 5 * 1024 * 1024) throw createHttpError(400, "Profile image must be 5 MB or less.");

  await fs.mkdir(avatarDir, { recursive: true });
  const fileName = `${crypto.randomUUID()}${extension}`;
  await fs.writeFile(path.join(avatarDir, fileName), fileBuffer);
  return `/uploads/profile-pics/${fileName}`;
}

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const input = registerSchema.parse(req.body);
    const email = input.email.toLowerCase();

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) throw createHttpError(409, "An account with this email already exists.");

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await prisma.user.create({
      data: {
        username: input.username.trim(),
        email,
        passwordHash,
        phone: normalizeNullable(input.phone),
        role: "User"
      },
      select: userSelect
    });

    res.status(201).json({ user: serializeUser(user), token: sign(user) });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const input = loginSchema.parse(req.body);
    const identifierLower = input.identifier.toLowerCase().trim();

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifierLower }, { username: input.identifier.trim() }]
      },
      select: { ...userSelect, passwordHash: true }
    });
    if (!user) throw createHttpError(401, "Invalid email/username or password.");

    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) throw createHttpError(401, "Invalid email/username or password.");

    res.json({
      user: serializeUser(user),
      token: sign(user)
    });
  })
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.auth.sub },
      select: userSelect
    });
    if (!user) throw createHttpError(404, "User not found.");
    res.json({ user: serializeUser(user) });
  })
);

router.put(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = updateProfileSchema.parse(req.body);
    const avatarUrl = await saveAvatarImage(input.avatarImage ?? null);

    const user = await prisma.user.update({
      where: { id: req.auth.sub },
      data: {
        ...(typeof input.username === "string" ? { username: input.username.trim() } : {}),
        ...(Object.prototype.hasOwnProperty.call(input, "phone") ? { phone: normalizeNullable(input.phone) } : {}),
        ...(avatarUrl ? { avatarUrl } : {}),
        ...(Object.prototype.hasOwnProperty.call(input, "avatarUrl") ? { avatarUrl: input.avatarUrl ?? null } : {}),
        ...(Object.prototype.hasOwnProperty.call(input, "addressLine1") ? { addressLine1: normalizeNullable(input.addressLine1) } : {}),
        ...(Object.prototype.hasOwnProperty.call(input, "addressLine2") ? { addressLine2: normalizeNullable(input.addressLine2) } : {}),
        ...(Object.prototype.hasOwnProperty.call(input, "city") ? { city: normalizeNullable(input.city) } : {}),
        ...(Object.prototype.hasOwnProperty.call(input, "postalCode") ? { postalCode: normalizeNullable(input.postalCode) } : {}),
        ...(Object.prototype.hasOwnProperty.call(input, "country") ? { country: normalizeNullable(input.country) } : {})
      },
      select: userSelect
    });

    res.json({ user: serializeUser(user) });
  })
);

export default router;
