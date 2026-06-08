import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../../components/NavBar";
import Footer from "../../../components/Footer";
import HoverRevealImage from "../../../components/HoverRevealImage";
import QuickView from "./QuickView";
import { matchesCollection, paginateProducts, sortCollectionProducts, useCollectionProducts } from "./collectionUtils";
import { CATEGORY_GROUPS } from "../../../lib/productCategories";

function ProductCard({ product, onQuickView }) {
  return (
    <article
      className="group overflow-hidden rounded-[28px] border border-[var(--color-outline-variant)] bg-[var(--color-surface)] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
      onClick={() => onQuickView(product)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onQuickView(product)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-[var(--color-surface-container-low)] to-[var(--color-surface-container)]">
        <HoverRevealImage
          src={product.image}
          alt={product.name}
          wrapperClassName="h-full w-full"
          imgClassName="h-full w-full object-cover"
          zoom={1.18}
        />
        {product.seasonalBatch ? (
          <div
            className="absolute bottom-4 right-4 z-10 rounded-[18px] border border-white/20 px-3 py-2 text-white shadow-[0_12px_28px_rgba(0,0,0,0.18)] backdrop-blur-md"
            style={{
              background: "linear-gradient(135deg, rgba(111,31,47,0.96), rgba(69,18,29,0.88))"
            }}
          >
            <div className="text-[8px] font-semibold uppercase tracking-[0.24em] opacity-80">
              Seasonal
            </div>
            <div className="text-[13px] font-semibold leading-none">
              {product.seasonalBadgeText || "Seasonal"}
            </div>
            <div className="text-[8px] font-semibold uppercase tracking-[0.18em] opacity-70">
              Batch
            </div>
          </div>
        ) : null}
        <span
          className="absolute top-4 left-4 rounded-full px-4 py-1.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-white shadow-sm"
          style={{ background: product.badgeColor || "var(--color-primary)" }}
        >
          {product.badge}
        </span>
      </div>

      <div className="p-6">
        <p className="text-[10px] font-semibold tracking-[0.24em] uppercase text-[var(--color-outline)]">
          {product.collection}
        </p>
        <h3 className="mt-2 text-[22px] leading-tight text-[var(--color-on-surface)]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400 }}>
          {product.name}
        </h3>
        {product.subtitle ? (
          <p className="mt-2 text-[13px] leading-relaxed text-[var(--color-on-surface-variant)]">{product.subtitle}</p>
        ) : null}

        <div className="mt-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-[15px] font-semibold text-[var(--color-on-surface)]">{product.price}</div>
            {product.originalPrice ? (
              <div className="text-[11px] text-[var(--color-outline)] line-through">{product.originalPrice}</div>
            ) : null}
            {product.discountPercent ? (
              <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                Save {product.discountPercent}% off
              </div>
            ) : null}
            {product.variantCount > 1 ? (
              <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-outline)]">
                {product.variantCount} variants
              </div>
            ) : null}
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
            {product.stars}/5 · {product.reviews} reviews
          </div>
        </div>

        <button
          type="button"
          className="mt-5 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)] transition-colors hover:text-[var(--color-primary-container)]"
          onClick={(e) => {
            e.stopPropagation();
            onQuickView(product);
          }}
        >
          Quick View
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </article>
  );
}

function Hero({ productCount, categoryCount }) {
  return (
    <section className="relative overflow-hidden rounded-[36px] border border-[var(--color-outline-variant)] bg-gradient-to-br from-[var(--color-surface)] via-[var(--color-surface-container-low)] to-[var(--color-surface-container)] px-6 py-14 md:px-12 md:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-[10px] font-semibold tracking-[0.32em] uppercase text-[var(--color-primary)]">
          All Collections
        </p>
        <h1 className="mt-4 text-[clamp(42px,6vw,72px)] leading-[1.02] text-[var(--color-on-surface)]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}>
          Discover the pieces live from the database.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-[var(--color-on-surface-variant)]">
          Browse every active product, preview details instantly, and jump into each collection
          without hardcoded placeholders.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <span className="rounded-full border border-[var(--color-outline-variant)] bg-[var(--color-surface)]/80 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-primary)]">
            {productCount} products
          </span>
          <span className="rounded-full border border-[var(--color-outline-variant)] bg-[var(--color-surface)]/80 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-primary)]">
            {categoryCount} collection groups
          </span>
        </div>
      </div>
    </section>
  );
}

export default function AllCollections() {
  const navigate = useNavigate();
  const { products, loading, error } = useCollectionProducts();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const visibleProducts = useMemo(
    () => sortCollectionProducts(products.filter((product) => matchesCollection(product, "all"))),
    [products]
  );
  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / pageSize));
  const paginatedProducts = useMemo(
    () => paginateProducts(visibleProducts, currentPage, pageSize),
    [visibleProducts, currentPage]
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const categoryGroups = useMemo(() => {
    return CATEGORY_GROUPS
      .map((group) => ({
        ...group,
        products: products.filter((product) => matchesCollection(product, group.label)),
      }))
      .filter((group) => group.products.length > 0);
  }, [products]);

  return (
    <div className="min-h-screen bg-[var(--color-surface)] pt-[72px]">
      <NavBar />
      <main className="mx-auto max-w-[1440px] px-6 py-12 md:px-10 lg:px-16">
        <Hero productCount={visibleProducts.length} categoryCount={categoryGroups.length} />

        <div className="mt-10 flex flex-wrap gap-3">
          {[
            ...CATEGORY_GROUPS.map((group) => ({ label: group.label, to: group.route })),
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => navigate(item.to)}
              className="rounded-full border border-[var(--color-outline-variant)] bg-[var(--color-surface)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)] transition-colors hover:bg-[var(--color-surface-container-low)]"
            >
              {item.label}
            </button>
          ))}
        </div>

        {error ? (
          <div className="mt-8 rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] px-5 py-4 text-[var(--color-primary)]">
            {error}
          </div>
        ) : null}

        <section className="mt-12">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.24em] uppercase text-[var(--color-primary)]">Curated</p>
              <h2 className="mt-2 text-3xl text-[var(--color-on-surface)]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400 }}>
                Live product lineup
              </h2>
            </div>
            <button
              type="button"
              className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)] underline-offset-4 hover:underline"
              onClick={() => navigate("/admin/products")}
            >
              Manage in Admin
            </button>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-dashed border-[var(--color-outline-variant)] bg-[var(--color-surface)] px-6 py-12 text-center text-[var(--color-on-surface-variant)]">
              Loading products from the database…
            </div>
          ) : visibleProducts.length ? (
            <>
              <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onQuickView={setSelectedProduct} />
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface)] px-5 py-4">
                <div className="text-[12px] text-[var(--color-on-surface-variant)]">
                  Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, visibleProducts.length)} of {visibleProducts.length}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                    className="rounded-full border border-[var(--color-outline-variant)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)] transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <span className="rounded-full border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-on-surface-variant)]">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-full border border-[var(--color-outline-variant)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)] transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-3xl border border-dashed border-[var(--color-outline-variant)] bg-[var(--color-surface)] px-6 py-12 text-center text-[var(--color-on-surface-variant)]">
              No products are available yet.
            </div>
          )}
        </section>

        <section className="mt-16">
          <div className="mb-6">
            <p className="text-[10px] font-semibold tracking-[0.24em] uppercase text-[var(--color-primary)]">Collections</p>
            <h2 className="mt-2 text-3xl text-[var(--color-on-surface)]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400 }}>
              Browse by collection group
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {CATEGORY_GROUPS.map((item) => {
              const group = categoryGroups.find((groupItem) => groupItem.label === item.label);
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => navigate(item.route)}
                  className="rounded-[28px] border border-[var(--color-outline-variant)] bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-container-low)] p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-primary)]">
                    {item.label}
                  </div>
                  <div className="mt-3 text-2xl text-[var(--color-on-surface)]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400 }}>
                    {group ? `${group.products.length} active product${group.products.length === 1 ? "" : "s"}` : "Coming soon"}
                  </div>
                  <div className="mt-2 text-[13px] leading-relaxed text-[var(--color-on-surface-variant)]">
                    Explore live items pulled straight from the backend.
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />

      {selectedProduct ? (
        <QuickView
          key={selectedProduct.id}
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      ) : null}
    </div>
  );
}
