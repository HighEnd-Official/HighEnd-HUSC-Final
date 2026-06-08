import "dotenv/config";
import fs from "node:fs/promises";
import { PrismaClient } from "@prisma/client";
import {
  getCategoryBySubcategory,
  normalizeProductCategory,
  normalizeProductSubcategory,
} from "../../src/lib/productCategories.js";

const prisma = new PrismaClient();

function parseLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function parseCsv(text) {
  const lines = String(text || "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .filter((line) => line.trim().length > 0);

  if (!lines.length) return [];

  const headers = parseLine(lines[0]).map((header) => header.trim());
  return lines.slice(1).map((line) =>
    parseLine(line).reduce((row, value, index) => {
      row[headers[index]] = value ?? "";
      return row;
    }, {}),
  );
}

function cleanText(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function isBlank(value) {
  return !cleanText(value);
}

function isGenericBrand(value) {
  const normalized = cleanText(value).toLowerCase();
  return (
    !normalized ||
    normalized === "no" ||
    normalized === "no brand" ||
    normalized === "unknown" ||
    normalized === "n/a" ||
    normalized === "na" ||
    normalized === "none" ||
    /^\d{4}-\d{2}-\d{2}/.test(normalized)
  );
}

function titleCase(value) {
  const text = cleanText(value);
  if (!text) return "";
  if (text.length <= 4 && text === text.toUpperCase()) return text;
  return text.replace(/\b\w/g, (match) => match.toUpperCase());
}

function toNumber(value) {
  const numeric = Number(String(value || "").replace(/,/g, "").trim());
  return Number.isFinite(numeric) ? numeric : null;
}

function lkrToCents(value) {
  const numeric = typeof value === "number" ? value : toNumber(value);
  return Number.isFinite(numeric) ? Math.round(numeric * 100) : 0;
}

function normalizeBrand(value) {
  if (isGenericBrand(value)) return "Imported Inventory";
  return titleCase(value);
}

function inferCategory(row, name) {
  const explicitCategory = cleanText(row.category).toLowerCase();
  const explicitSubcategory = cleanText(row.subcategory).toLowerCase();
  const searchable = `${name} ${row.color || ""} ${explicitCategory} ${explicitSubcategory}`.toLowerCase();

  if (explicitCategory && explicitCategory !== "other") {
    if (explicitCategory.includes("dress")) return "Dresses";
    if (explicitCategory.includes("top") || explicitCategory.includes("blouse")) return "Tops";
    if (explicitCategory.includes("shirt")) return "Shirts";
    if (explicitCategory.includes("skirt")) return "Skirts";
    if (explicitCategory.includes("pant") || explicitCategory.includes("trouser")) return "Pants";
    if (explicitCategory.includes("ethnic") || explicitCategory.includes("kurti") || explicitCategory.includes("lehenga")) return "Indian Ethnic Wear";
    if (explicitCategory.includes("footwear") || explicitCategory.includes("shoe") || explicitCategory.includes("flat") || explicitCategory.includes("jutti")) return "Footwear";
    if (explicitCategory.includes("accessor") || explicitCategory.includes("jewel") || explicitCategory.includes("bangle") || explicitCategory.includes("earring") || explicitCategory.includes("necklace")) return "Accessories";
  }

  if (searchable.includes("kurti") || searchable.includes("lehenga")) return "Indian Ethnic Wear";
  if (searchable.includes("dress")) return "Dresses";
  if (searchable.includes("skirt")) return "Skirts";
  if (searchable.includes("shirt")) return "Shirts";
  if (searchable.includes("pant") || searchable.includes("trouser") || searchable.includes("wide-leg")) return "Pants";
  if (searchable.includes("flat") || searchable.includes("jutti") || searchable.includes("shoe") || searchable.includes("heel") || searchable.includes("footwear")) return "Footwear";
  if (searchable.includes("bangle") || searchable.includes("earring") || searchable.includes("necklace") || searchable.includes("accessory")) return "Accessories";
  if (searchable.includes("top") || searchable.includes("blouse") || searchable.includes("crop") || searchable.includes("tank")) return "Tops";

  const categoryFromSubcategory = getCategoryBySubcategory(cleanText(row.subcategory));
  if (categoryFromSubcategory) return categoryFromSubcategory;

  return "Accessories";
}

function inferSubcategory(row, category, name) {
  const explicit = normalizeProductSubcategory(row.subcategory);
  if (explicit) return explicit;

  const lower = `${name} ${row.color || ""}`.toLowerCase();

  if (category === "Dresses") {
    if (lower.includes("maxi")) return "Maxi Dresses";
    if (lower.includes("mini")) return "Mini Dresses";
    return "Midi Dresses";
  }

  if (category === "Tops") {
    if (lower.includes("crop")) return "Crop Tops";
    if (lower.includes("tank")) return "Tank Tops";
    if (lower.includes("crochet")) return "Crochet Tops";
    if (lower.includes("sleeveless") || lower.includes("tube") || lower.includes("peplum") || lower.includes("blouse")) return "Sleeveless Tops";
    if (lower.includes("long sleeve") || lower.includes("full sleeve")) return "Long Sleeved Tops";
    if (lower.includes("short sleeve")) return "Short Sleeved Tops";
    return "Sleeveless Tops";
  }

  if (category === "Skirts") {
    if (lower.includes("mini")) return "Mini Skirts";
    if (lower.includes("maxi")) return "Maxi Skirts";
    return "Midi Skirts";
  }

  if (category === "Indian Ethnic Wear") {
    if (lower.includes("kurti set") || lower.includes("set")) return "Kurti Sets";
    if (lower.includes("kurti pant") || lower.includes("pant")) return "Kurti Pants";
    if (lower.includes("long")) return "Long Kurtis";
    if (lower.includes("mid")) return "Mid Kurtis";
    return "Short Kurtis";
  }

  if (category === "Footwear") {
    if (lower.includes("jutti")) return "Indian Jutti";
    return "Flats";
  }

  if (category === "Accessories") {
    if (lower.includes("earring")) return "Earrings";
    if (lower.includes("necklace")) return "Necklaces";
    return "Bangles";
  }

  return "";
}

function pickImage(category) {
  if (category === "Tops" || category === "Shirts") {
    return "/src/assets/images/shirts/bow-print/main.png";
  }

  return "/src/assets/images/dresses/floral-flare/main.png";
}

function buildSizes(category) {
  if (category === "Footwear" || category === "Accessories") {
    return ["One Size"];
  }

  return ["XS", "S", "M", "L", "XL"];
}

async function resetCatalog() {
  await prisma.$transaction([
    prisma.payment.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.productLike.deleteMany(),
    prisma.productReview.deleteMany(),
    prisma.productColor.deleteMany(),
    prisma.productSize.deleteMany(),
    prisma.productDetail.deleteMany(),
    prisma.productImage.deleteMany(),
    prisma.product.deleteMany(),
  ]);
}

async function seedProducts(rows) {
  for (const [index, row] of rows.entries()) {
    const name = cleanText(row.product_name);
    if (isBlank(name)) continue;

    const category = normalizeProductCategory(inferCategory(row, name)) || "Accessories";
    const subcategory = normalizeProductSubcategory(inferSubcategory(row, category, name));
    const brand = normalizeBrand(row.brand);
    const color = cleanText(row.color) || "Standard";
    const sku = cleanText(row.sku) || null;
    const costValue = toNumber(row.cost_price_lkr);
    const priceValue = toNumber(row.selling_price_lkr);
    const stock = Math.max(0, Math.round(toNumber(row.stock_qty) ?? 0));
    const soldQty = Math.max(0, Math.round(toNumber(row.sold_qty) ?? 0));
    const coverImageUrl = pickImage(category);
    const badge = stock <= 2 ? "Low Stock" : soldQty > 5 ? "Popular" : "Imported";

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        category,
        subcategory: subcategory || null,
        subtitle: `${brand} · ${color}`,
        collection: brand === "Imported Inventory" ? category : brand,
        description: `Imported inventory item for ${brand}. ${category}${subcategory ? ` · ${subcategory}` : ""}. ${color}.`,
        badge,
        badgeColorHex: "#6f1f2f",
        priceCents: lkrToCents(priceValue ?? costValue ?? 0),
        costCents: lkrToCents(costValue ?? priceValue ?? 0),
        stock,
        coverImageUrl,
        originalCents: null,
        currency: "LKR",
        rating: null,
        reviewsCount: 0,
        isActive: true,
        images: {
          create: [{ url: coverImageUrl, sortOrder: 0 }],
        },
        details: {
          create: [
            { text: `Brand: ${brand}`, sortOrder: 0 },
            { text: `Color: ${color}`, sortOrder: 1 },
            { text: `SKU: ${sku || "Not supplied"}`, sortOrder: 2 },
            { text: `Imported from CSV row ${index + 1}`, sortOrder: 3 },
          ],
        },
        sizes: {
          create: buildSizes(category).map((code, sizeIndex) => ({ code, sortOrder: sizeIndex })),
        },
        colors: {
          create: [{ name: color, hex: null, sortOrder: 0 }],
        },
      },
    });

    await prisma.product.update({
      where: { id: product.id },
      data: { coverImageUrl },
    });
  }
}

async function seedUsers() {
  const bcrypt = await import("bcryptjs");
  const users = [
    { username: "Admin User", email: "admin@hues.com", password: "admin123", role: "Admin" },
    { username: "Super Admin", email: "super@hues.com", password: "super123", role: "SuperAdmin" },
    { username: "HUES Member", email: "user@hues.com", password: "user123", role: "User" },
  ];

  for (const user of users) {
    const passwordHash = bcrypt.default.hashSync(user.password, 10);
    await prisma.user.upsert({
      where: { email: user.email },
      update: { username: user.username, role: user.role, passwordHash },
      create: { username: user.username, email: user.email, role: user.role, passwordHash },
    });
  }
}

async function main() {
  const csvPath = new URL("./shop_inventory_import.csv", import.meta.url);
  const csvText = await fs.readFile(csvPath, "utf8");
  const rows = parseCsv(csvText).filter((row) => !isBlank(row.product_name));

  await resetCatalog();
  await seedProducts(rows);
  await seedUsers();

  console.log(`Seeded ${rows.length} imported products.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
