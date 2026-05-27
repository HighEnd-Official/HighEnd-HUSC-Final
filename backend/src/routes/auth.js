import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler, createHttpError } from "../lib/http.js";

const router = express.Router();

const registerSchema = z.object({
  username: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(200)
});

const loginSchema = z.object({
  identifier: z.string().min(2),
  password: z.string().min(1)
});

function sign(user) {
  const token = jwt.sign(
    { sub: user.id, email: user.email, role: user.role, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  return token;
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
      data: { username: input.username, email, passwordHash, role: "User" },
      select: { id: true, username: true, email: true, role: true }
    });

    const token = sign(user);
    res.status(201).json({ user, token });
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
      }
    });
    if (!user) throw createHttpError(401, "Invalid email/username or password.");

    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) throw createHttpError(401, "Invalid email/username or password.");

    const token = sign(user);
    res.json({
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
      token
    });
  })
);

export default router;

