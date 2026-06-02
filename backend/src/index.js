import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "node:path";
import { ZodError } from "zod";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import adminRoutes from "./routes/admin.js";

const app = express();

app.use(morgan("dev"));
app.use(express.json({ limit: "25mb" }));

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim()) : true,
    credentials: true
  })
);

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/uploads", express.static(path.resolve("uploads")));
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/admin", adminRoutes);

app.use((err, _req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: "Validation error", issues: err.issues });
  }
  const status = err.status || 500;
  const payload = { error: err.message || "Internal server error" };
  if (err.details) payload.details = err.details;
  if (process.env.NODE_ENV !== "production" && err.stack) payload.stack = err.stack;
  res.status(status).json(payload);
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${port}`);
});
