import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function lkrToCents(value) {
  const n = typeof value === "number" ? value : Number(String(value).replace(/Rs\.?\s*/i, "").replace(/,/g, ""));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

async function main() {
  // Minimal seed matching the current frontend demo catalog.
  const products = [
    {
      name: "Floral Flare Mini Dress",
      sku: "DR-FLORAL-FLARE",
      category: "Dresses",
      subtitle: "Pink Flowers · Embroidered",
      collection: "The Atelier Collection",
      priceCents: lkrToCents("Rs. 8,450.00"),
      costCents: lkrToCents("Rs. 5,200.00"),
      stock: 24,
      originalCents: lkrToCents("Rs. 10,200.00"),
      badge: "Embroidered",
      badgeColorHex: "#854c6f",
      description:
        "Crafted from premium hand-woven cotton, this ethereal piece features intricate artisanal floral embroidery. The relaxed silhouette and flare hem evoke effortless movement and summer elegance.",
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: [
        { name: "Blush Rose", hex: "#e8a4b8" },
        { name: "Teal Mist", hex: "#6aada9" },
        { name: "Ivory Cream", hex: "#f5ede0" },
        { name: "Dusk Mauve", hex: "#9e7492" }
      ],
      details: [
        "Hand-embroidered pink floral motifs",
        "V-neck with tassel trim",
        "Flutter sleeves with teal cuff accent",
        "Relaxed A-line silhouette",
        "100% premium hand-woven cotton"
      ],
      images: [
        // Store frontend relative paths for now (or replace with CDN URLs later)
        "/src/assets/images/dresses/floral-flare/main.png",
        "/src/assets/images/dresses/floral-flare/2.png",
        "/src/assets/images/dresses/floral-flare/3.png",
        "/src/assets/images/dresses/floral-flare/4.png",
        "/src/assets/images/dresses/floral-flare/5.png"
      ],
      rating: "4.90",
      reviewsCount: 38
    },
    {
      name: "Maxi Sundress with Frill",
      sku: "DR-MAXI-SUNDRESS",
      category: "Dresses",
      subtitle: "White · Tiered Frills",
      collection: "The Atelier Collection",
      priceCents: lkrToCents("Rs. 6,400.00"),
      costCents: lkrToCents("Rs. 3,800.00"),
      stock: 18,
      badge: "New Arrival",
      badgeColorHex: "#486730",
      description:
        "Crisp white cotton with delicate ric-rac trim at each tier. Adjustable spaghetti straps, smocked back, and a sweeping floor-length skirt that moves beautifully.",
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: [
        { name: "Pure White", hex: "#f8f4ef" },
        { name: "Sky Blue", hex: "#9ec8e0" },
        { name: "Petal Blush", hex: "#f2c4c4" },
        { name: "Sage Whisper", hex: "#a8c5a0" }
      ],
      details: [
        "Ric-rac trim at each tiered frill",
        "Adjustable spaghetti straps",
        "Smocked back for a fitted bodice",
        "Floor-length tiered skirt",
        "Lightweight 100% cotton poplin"
      ],
      images: [
        "/src/assets/images/dresses/maxi-sundress/Main.png",
        "/src/assets/images/dresses/maxi-sundress/2.PNG",
        "/src/assets/images/dresses/maxi-sundress/3.png",
        "/src/assets/images/dresses/maxi-sundress/4.png",
        "/src/assets/images/dresses/maxi-sundress/5.png"
      ],
      rating: "4.70",
      reviewsCount: 21
    },
    {
      name: "Bow Print Long Sleeve Crop Shirt",
      sku: "SH-BOW-PRINT-CROP",
      category: "Shirts",
      subtitle: "Ivory Blossom · Lightweight Cotton",
      collection: "The Atelier Collection",
      priceCents: lkrToCents("Rs. 4,250.00"),
      costCents: lkrToCents("Rs. 2,500.00"),
      stock: 30,
      originalCents: lkrToCents("Rs. 5,100.00"),
      badge: "New Arrival",
      badgeColorHex: "#854c6f",
      description:
        "A sculpted crop shirt with a delicate bow print and extended cuffs. Crafted from breathable cotton, it blends playful romance with modern tailoring.",
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: [
        { name: "Ivory Blossom", hex: "#f5ede0" },
        { name: "Rosé Petal", hex: "#e8a4b8" },
        { name: "Lavender Haze", hex: "#c4b3d8" },
        { name: "Sage Green", hex: "#a8c5a0" }
      ],
      details: [
        "Lightweight cotton with soft drape",
        "Subtle bow print detail",
        "Button-front closure",
        "Structured collar with elongation",
        "Versatile crop silhouette"
      ],
      images: [
        "/src/assets/images/shirts/bow-print/main.png",
        "/src/assets/images/shirts/bow-print/1.png",
        "/src/assets/images/shirts/bow-print/2.png",
        "/src/assets/images/shirts/bow-print/3.png",
        "/src/assets/images/shirts/bow-print/4.png"
      ],
      rating: "4.80",
      reviewsCount: 26
    }
  ];

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { name: p.name },
      update: {
        sku: p.sku ?? null,
        category: p.category ?? null,
        subtitle: p.subtitle,
        collection: p.collection,
        description: p.description,
        badge: p.badge,
        badgeColorHex: p.badgeColorHex,
        priceCents: p.priceCents,
        costCents: p.costCents ?? 0,
        stock: p.stock ?? 0,
        coverImageUrl: p.images?.[0] ?? null,
        originalCents: p.originalCents ?? null,
        rating: p.rating,
        reviewsCount: p.reviewsCount
      },
      create: {
        name: p.name,
        sku: p.sku ?? null,
        category: p.category ?? null,
        subtitle: p.subtitle,
        collection: p.collection,
        description: p.description,
        badge: p.badge,
        badgeColorHex: p.badgeColorHex,
        priceCents: p.priceCents,
        costCents: p.costCents ?? 0,
        stock: p.stock ?? 0,
        coverImageUrl: p.images?.[0] ?? null,
        originalCents: p.originalCents ?? null,
        rating: p.rating,
        reviewsCount: p.reviewsCount
      }
    });

    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productDetail.deleteMany({ where: { productId: product.id } });
    await prisma.productSize.deleteMany({ where: { productId: product.id } });
    await prisma.productColor.deleteMany({ where: { productId: product.id } });

    await prisma.productImage.createMany({
      data: p.images.map((url, idx) => ({ productId: product.id, url, sortOrder: idx }))
    });
    await prisma.productDetail.createMany({
      data: p.details.map((text, idx) => ({ productId: product.id, text, sortOrder: idx }))
    });
    await prisma.productSize.createMany({
      data: p.sizes.map((code, idx) => ({ productId: product.id, code, sortOrder: idx }))
    });
    await prisma.productColor.createMany({
      data: p.colors.map((c, idx) => ({ productId: product.id, name: c.name, hex: c.hex ?? null, sortOrder: idx }))
    });
  }

  // Seed demo users matching the frontend mock (passwords are the same as the demo).
  // NOTE: In production, create users via /auth/register instead.
  const demoUsers = [
    { username: "Admin User", email: "admin@hues.com", password: "admin123", role: "Admin" },
    { username: "Super Admin", email: "super@hues.com", password: "super123", role: "SuperAdmin" },
    { username: "HUES Member", email: "user@hues.com", password: "user123", role: "User" }
  ];

  const bcrypt = await import("bcryptjs");
  for (const u of demoUsers) {
    const passwordHash = bcrypt.default.hashSync(u.password, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      update: { username: u.username, role: u.role, passwordHash },
      create: { username: u.username, email: u.email, role: u.role, passwordHash }
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
