import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import HoverRevealImage from "../../../components/HoverRevealImage";
import QuickView from "./QuickView";
import { matchesCollection, paginateProducts, sortCollectionProducts, useCollectionProducts } from "./collectionUtils";
import { getSubcategoriesForCategory } from "../../../lib/productCategories";

function ProductCard({ product, onQuickView }) {
  return (
    <article
      className="group overflow-hidden rounded-[26px] border border-[var(--color-outline-variant)] bg-[var(--color-surface)] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
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
          showTooltip={true}
        />
        <button
          type="button"
          className="mobile-quickview-btn"
          onClick={(e) => {
            e.stopPropagation();
            onQuickView(product);
          }}
          aria-label={`Quick view ${product.name}`}
        >
          <i className="ti ti-eye" aria-hidden="true"></i>
          Quick View
        </button>
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
      </div>
      <div className="p-6">
        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-primary)]">{product.collection}</div>
        {product.subcategory ? (
          <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-outline)]">
            {product.subcategory}
          </div>
        ) : null}
        <h3 className="mt-2 text-[22px] leading-tight text-[var(--color-on-surface)]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400 }}>
          {product.name}
        </h3>
        <p className="mt-2 text-[13px] leading-relaxed text-[var(--color-on-surface-variant)]">{product.subtitle || product.description}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-[15px] font-semibold text-[var(--color-on-surface)]">{product.price}</div>
            {product.originalPrice ? <div className="text-[11px] text-[var(--color-outline)] line-through">{product.originalPrice}</div> : null}
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
      </div>
    </article>
  );
}

export default function CollectionCategoryPage({
  categoryKey,
  title,
  eyebrow,
  intro,
  emptyTitle,
  emptyBody,
}) {
  const { products, loading, error } = useCollectionProducts();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;
  const activeSubcategory = searchParams.get("sub") || "";
  const subcategories = useMemo(() => getSubcategoriesForCategory(categoryKey), [categoryKey]);

  const filteredProducts = useMemo(
    () => sortCollectionProducts(products.filter((product) => matchesCollection(product, categoryKey, activeSubcategory))),
    [products, categoryKey, activeSubcategory]
  );
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const paginatedProducts = useMemo(
    () => paginateProducts(filteredProducts, currentPage, pageSize),
    [filteredProducts, currentPage]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [categoryKey, activeSubcategory]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <main className="mx-auto max-w-[1440px] px-6 pt-4 pb-12 md:px-10 lg:px-16">
        {subcategories.length ? (
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.delete("sub");
                setSearchParams(params, { replace: true });
              }}
              className={`rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] transition-colors ${
                activeSubcategory ? "border-[var(--color-outline-variant)] bg-[var(--color-surface)] text-[var(--color-primary)]" : "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
              }`}
            >
              All
            </button>
            {subcategories.map((subcategory) => (
              <button
                key={subcategory}
                type="button"
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  params.set("sub", subcategory);
                  setSearchParams(params, { replace: true });
                }}
                className={`rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] transition-colors ${
                  activeSubcategory === subcategory
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                    : "border-[var(--color-outline-variant)] bg-[var(--color-surface)] text-[var(--color-primary)]"
                }`}
              >
                {subcategory}
              </button>
            ))}
          </div>
        ) : null}

        {error ? (
          <div className="mt-8 rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] px-5 py-4 text-[var(--color-primary)]">
            {error}
          </div>
        ) : null}

        <section className="mt-12">
          {loading ? (
            <div className="rounded-3xl border border-dashed border-[var(--color-outline-variant)] bg-[var(--color-surface)] px-6 py-12 text-center text-[var(--color-on-surface-variant)]">
              Loading products from the database…
            </div>
          ) : filteredProducts.length ? (
            <>
              <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onQuickView={setSelectedProduct} />
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface)] px-5 py-4">
                <div className="text-[12px] text-[var(--color-on-surface-variant)]">
                  Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredProducts.length)} of {filteredProducts.length}
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
              <div className="text-2xl text-[var(--color-on-surface)]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400 }}>
                {emptyTitle}
              </div>
              <p className="mx-auto mt-3 max-w-xl text-[14px] leading-relaxed">{emptyBody}</p>
            </div>
          )}
        </section>
      </main>


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
