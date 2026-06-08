import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { ZodError } from "zod";

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function runPrismaMaintenance() {
  const prismaBin =
    process.platform === "win32"
      ? path.join(backendRoot, "node_modules", ".bin", "prisma.cmd")
      : path.join(backendRoot, "node_modules", ".bin", "prisma");

  const migrateCommand =
    process.platform === "win32"
      ? { file: "cmd.exe", args: ["/c", prismaBin, "migrate", "deploy"] }
      : { file: prismaBin, args: ["migrate", "deploy"] };

  const migrateResult = spawnSync(migrateCommand.file, migrateCommand.args, {
    cwd: backendRoot,
    stdio: "inherit"
  });

  if (migrateResult.error) throw migrateResult.error;
  if (migrateResult.status !== 0) {
    throw new Error("Prisma migration deployment failed during backend startup.");
  }

  const generateCommand =
    process.platform === "win32"
      ? { file: "cmd.exe", args: ["/c", prismaBin, "generate"] }
      : { file: prismaBin, args: ["generate"] };

  const generateResult = spawnSync(generateCommand.file, generateCommand.args, {
    cwd: backendRoot,
    stdio: "inherit"
  });

  if (generateResult.error) throw generateResult.error;
  if (generateResult.status !== 0) {
    throw new Error("Prisma client generation failed during backend startup.");
  }
}

async function start() {
  runPrismaMaintenance();

  const [
    { default: authRoutes },
    { default: contactRoutes },
    { default: productRoutes },
    { default: orderRoutes },
    { default: adminRoutes }
  ] = await Promise.all([
    import("./routes/auth.js"),
    import("./routes/contact.js"),
    import("./routes/products.js"),
    import("./routes/orders.js"),
    import("./routes/admin.js")
  ]);

  const app = express();
  const configuredOrigins = String(process.env.CORS_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const isLocalDevelopmentOrigin = (origin) => {
    try {
      const parsed = new URL(origin);
      const localHostPattern =
        parsed.hostname === "localhost" ||
        parsed.hostname === "127.0.0.1" ||
        parsed.hostname.startsWith("192.168.") ||
        parsed.hostname.startsWith("10.") ||
        /^172\.(1[6-9]|2\d|3[0-1])\./.test(parsed.hostname);
      return parsed.protocol === "http:" && localHostPattern && (parsed.port === "3000" || parsed.port === "4173");
    } catch {
      return false;
    }
  };

  app.use(morgan("dev"));
  app.use(express.json({ limit: "25mb" }));

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) return callback(null, true);
        if (configuredOrigins.includes(origin) || isLocalDevelopmentOrigin(origin)) {
          return callback(null, true);
        }
        return callback(new Error(`CORS blocked for origin ${origin}`));
      },
      credentials: true
    })
  );

  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.use("/uploads", express.static(path.resolve("uploads")));
  app.use("/auth", authRoutes);
  app.use("/contact", contactRoutes);
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
}

start().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
