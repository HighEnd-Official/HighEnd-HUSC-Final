// import { useEffect, useMemo, useState } from 'react';
// import '../admin.css';
// import { deleteProduct, getProducts, upsertProduct } from '../lib/apiRepo';
// import { uid } from '../lib/storage';
// import { formatMoneyLKR } from '../lib/format';
// import {
//   CATEGORY_OPTIONS,
//   getSubcategoriesForCategory,
//   normalizeProductCategory,
//   normalizeProductSubcategory,
// } from '../../lib/productCategories';

// const acceptedImageTypes = ['image/png', 'image/jpeg', 'image/webp'];
// const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];
// const badgeColorOptions = [
//   { label: 'Maroon', value: '#6f1f2f' },
//   { label: 'Berry', value: '#8d2850' },
//   { label: 'Rose', value: '#c14672' },
//   { label: 'Plum', value: '#6b3fa0' },
//   { label: 'Gold', value: '#b8872b' },
//   { label: 'Forest', value: '#2f6b4f' },
//   { label: 'Navy', value: '#2f4d73' },
//   { label: 'Charcoal', value: '#4a4045' },
//   { label: 'Teal', value: '#2e7981' },
//   { label: 'Sand', value: '#a27b5c' },
// ];
// const colorPalette = ['var(--color-primary)', 'var(--color-primary)', 'var(--color-primary-container)', 'var(--color-primary-container)', 'var(--color-secondary)', 'var(--color-tertiary)', 'var(--color-on-surface)', 'var(--color-tertiary-container)'];
// const normalizeSizeCodes = (sizes = []) =>
//   Array.from(
//     new Set(
//       (Array.isArray(sizes) ? sizes : [])
//         .map((size) => (typeof size === 'string' ? size : size?.code))
//         .map((size) => String(size || '').trim())
//         .filter(Boolean)
//     )
//   );
// const normalizeColors = (colors = []) =>
//   Array.from(
//     new Map(
//       (Array.isArray(colors) ? colors : [])
//         .map((color) => ({
//           name: String((typeof color === 'string' ? color : color?.name) || '').trim(),
//           hex: String(color?.hex || color?.colorHex || '').trim() || null,
//         }))
//         .filter((color) => color.name)
//         .map((color) => [color.name.toLowerCase(), color])
//     ).values()
//   );
// const normalizeDetailLines = (details = "") =>
//   Array.from(
//     new Set(
//       String(details)
//         .split(/\r?\n/)
//         .map((detail) => detail.trim())
//         .filter(Boolean)
//     )
//   );
// const normalizeBadgeColor = (value = '') => String(value || '').trim() || badgeColorOptions[0].value;
// const isPresetBadgeColor = (value = '') => badgeColorOptions.some((option) => option.value === value);

// const emptyForm = () => ({
//   id: '',
//   name: '',
//   sku: '',
//   category: '',
//   subcategory: '',
//   subtitle: '',
//   collection: '',
//   description: '',
//   badge: '',
//   badgeColor: badgeColorOptions[0].value,
//   seasonalBadgeText: '',
//   variantGroupKey: '',
//   seasonalBatch: false,
//   seasonalEndsOn: '',
//   price: '',
//   cost: '',
//   originalPrice: '',
//   stock: '',
//   rating: '',
//   reviewsCount: '',
//   currency: 'LKR',
//   isActive: true,
//   imageUrl: '',
//   images: [],
//   imageUploads: [],
//   sizes: [],
//   colors: [],
//   details: '',
// });

// function fileToImageUpload(file) {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onload = () => {
//       const dataUrl = String(reader.result || '');
//       const [, data = ''] = dataUrl.split(',');
//       resolve({
//         fileName: file.name,
//         contentType: file.type,
//         data,
//         previewUrl: dataUrl,
//       });
//     };
//     reader.onerror = () => reject(reader.error || new Error('Could not read image file.'));
//     reader.readAsDataURL(file);
//   });
// }

// const uploadPayload = ({ fileName, contentType, data }) => ({ fileName, contentType, data });

// export default function Products() {
//   const [refresh, setRefresh] = useState(0);
//   const [editingId, setEditingId] = useState('');
//   const [form, setForm] = useState(emptyForm());
//   const [query, setQuery] = useState('');
//   const [sortBy, setSortBy] = useState('newest');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [productsState, setProductsState] = useState([]);
//   const [selected, setSelected] = useState(null);
//   const [imageError, setImageError] = useState('');
//   const pageSize = 10;

//   const products = useMemo(() => {
//     void refresh;
//     return productsState;
//   }, [productsState, refresh]);

//   useEffect(() => {
//     let cancelled = false;
//     getProducts()
//       .then((list) => {
//         if (!cancelled) setProductsState(list);
//       })
//       .catch(() => {
//         if (!cancelled) setProductsState([]);
//       });
//     return () => {
//       cancelled = true;
//     };
//   }, [refresh]);
//   const filtered = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     const matching = !q ? products : products.filter((p) =>
//       [p.name, p.sku, p.category, p.subcategory].some((x) => String(x || '').toLowerCase().includes(q))
//     );
//     const sorted = [...matching].sort((left, right) => {
//       switch (sortBy) {
//         case 'price-asc':
//           return (Number(left.price) || 0) - (Number(right.price) || 0);
//         case 'price-desc':
//           return (Number(right.price) || 0) - (Number(left.price) || 0);
//         case 'stock-asc':
//           return (Number(left.stock) || 0) - (Number(right.stock) || 0);
//         case 'stock-desc':
//           return (Number(right.stock) || 0) - (Number(left.stock) || 0);
//         case 'name-asc':
//           return String(left.name || '').localeCompare(String(right.name || ''));
//         case 'name-desc':
//           return String(right.name || '').localeCompare(String(left.name || ''));
//         case 'newest':
//         default:
//           return new Date(String(right.createdAt || 0)).getTime() - new Date(String(left.createdAt || 0)).getTime();
//       }
//     });
//     return sorted;
//   }, [products, query, sortBy]);

//   const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
//   const visibleProducts = useMemo(
//     () => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
//     [filtered, currentPage]
//   );

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [query, sortBy]);

//   useEffect(() => {
//     if (currentPage > totalPages) {
//       setCurrentPage(totalPages);
//     }
//   }, [currentPage, totalPages]);

//   const dashboardStats = useMemo(() => {
//     const totalStock = products.reduce((sum, product) => sum + (Number(product.stock) || 0), 0);
//     const sizeCodes = new Set(products.flatMap((product) => normalizeSizeCodes(product.sizes)));
//     const lowStockProducts = products.filter((product) => (Number(product.stock) || 0) <= 10).length;
//     return {
//       totalProducts: products.length,
//       totalStock,
//       sizeCount: sizeCodes.size,
//       lowStockProducts,
//     };
//   }, [products]);

//   function startNew() {
//     setEditingId('__new__');
//     setForm({ ...emptyForm(), id: uid('prod') });
//     setImageError('');
//   }

//   function startEdit(product) {
//     const images = product.images?.length ? product.images : product.imageUrl ? [product.imageUrl] : [];
//     setEditingId(product.id);
//     setForm({
//       id: product.id,
//       name: product.name || '',
//       sku: product.sku || '',
//       category: normalizeProductCategory(product.category) || '',
//       subcategory: normalizeProductSubcategory(product.subcategory, product.category) || '',
//       subtitle: product.subtitle || '',
//       collection: product.collection || '',
//       description: product.description || '',
//       badge: product.badge || '',
//       badgeColor: normalizeBadgeColor(product.badgeColor),
//       seasonalBadgeText: product.seasonalBadgeText || '',
//       variantGroupKey: product.variantGroupKey || '',
//       seasonalBatch: Boolean(product.seasonalBatch),
//       seasonalEndsOn: product.seasonalEndsOn || '',
//       price: String(product.price ?? ''),
//       cost: String(product.cost ?? ''),
//       originalPrice: String(product.originalPrice ?? ''),
//       stock: String(product.stock ?? ''),
//       rating: product.rating === '' ? '' : String(product.rating ?? ''),
//       reviewsCount: String(product.reviewsCount ?? ''),
//       currency: product.currency || 'LKR',
//       isActive: product.isActive ?? true,
//       imageUrl: product.imageUrl || '',
//       images,
//       imageUploads: [],
//       sizes: normalizeSizeCodes(product.sizes),
//       colors: normalizeColors(product.colors),
//       details: (product.details || []).join('\n'),
//     });
//     setImageError('');
//   }

//   function cancel() {
//     setEditingId('');
//     setForm(emptyForm());
//     setImageError('');
//   }

//   async function onImageFilesChange(e) {
//     const files = Array.from(e.target.files || []);
//     e.target.value = '';
//     if (!files.length) return;

//     const validFiles = files.filter((file) => acceptedImageTypes.includes(file.type) && file.size <= 5 * 1024 * 1024);
//     setImageError(validFiles.length === files.length ? '' : 'Some images were skipped. Use JPG, PNG or WebP under 5 MB.');
//     const uploads = await Promise.all(validFiles.map(fileToImageUpload));
//     setForm((s) => ({ ...s, imageUploads: [...s.imageUploads, ...uploads] }));
//   }

//   function addImageUrl() {
//     const url = form.imageUrl.trim();
//     if (!url) return;
//     setForm((s) => ({
//       ...s,
//       imageUrl: '',
//       images: s.images.includes(url) ? s.images : [...s.images, url],
//     }));
//   }

//   function removeExistingImage(url) {
//     setForm((s) => ({ ...s, images: s.images.filter((imageUrl) => imageUrl !== url) }));
//   }

//   function removeUploadedImage(index) {
//     setForm((s) => ({ ...s, imageUploads: s.imageUploads.filter((_, uploadIndex) => uploadIndex !== index) }));
//   }

//   function toggleSize(size) {
//     setForm((s) => ({
//       ...s,
//       sizes: s.sizes.includes(size)
//         ? s.sizes.filter((selectedSize) => selectedSize !== size)
//         : [...s.sizes, size],
//     }));
//   }

//   function addColor() {
//     setForm((s) => ({
//       ...s,
//       colors: [...normalizeColors(s.colors), { name: '', hex: '' }],
//     }));
//   }

//   function updateColor(index, field, value) {
//     setForm((s) => ({
//       ...s,
//       colors: s.colors.map((color, colorIndex) =>
//         colorIndex === index ? { ...color, [field]: value } : color
//       ),
//     }));
//   }

//   function removeColor(index) {
//     setForm((s) => ({
//       ...s,
//       colors: s.colors.filter((_, colorIndex) => colorIndex !== index),
//     }));
//   }

//   async function onSave(e) {
//     e.preventDefault();
//     const price = Number(form.price);
//     const cost = Number(form.cost);
//     const originalPrice = form.originalPrice.trim() ? Number(form.originalPrice) : null;
//     const stock = Number(form.stock);
//     const rating = form.rating.trim() === '' ? null : Number(form.rating);
//     const reviewsCount = form.reviewsCount.trim() === '' ? 0 : Number(form.reviewsCount);
//     if (!form.name.trim()) return;
//     if (!Number.isFinite(price) || price < 0) return;
//     if (!Number.isFinite(cost) || cost < 0) return;
//     if (originalPrice != null && (!Number.isFinite(originalPrice) || originalPrice < 0)) return;
//     if (!Number.isFinite(stock) || stock < 0) return;
//     if (rating != null && (!Number.isFinite(rating) || rating < 0 || rating > 5)) return;
//     if (!Number.isFinite(reviewsCount) || reviewsCount < 0) return;

//     const pendingImageUrl = form.imageUrl.trim();
//     const images = pendingImageUrl && !form.images.includes(pendingImageUrl)
//       ? [...form.images, pendingImageUrl]
//       : form.images;

//     await upsertProduct({
//       id: form.id,
//       name: form.name.trim(),
//       sku: form.sku.trim(),
//       category: normalizeProductCategory(form.category.trim()),
//       subcategory: normalizeProductSubcategory(form.subcategory.trim(), form.category.trim()),
//       subtitle: form.subtitle.trim(),
//       collection: form.collection.trim(),
//       description: form.description.trim(),
//       badge: form.badge.trim(),
//       badgeColor: normalizeBadgeColor(form.badgeColor),
//       seasonalBadgeText: form.seasonalBadgeText.trim(),
//       variantGroupKey: form.variantGroupKey.trim(),
//       seasonalBatch: Boolean(form.seasonalBatch),
//       seasonalEndsOn: form.seasonalBatch ? (form.seasonalEndsOn.trim() || null) : null,
//       price,
//       cost,
//       originalPrice,
//       stock,
//       rating,
//       reviewsCount,
//       currency: form.currency.trim() || 'LKR',
//       isActive: form.isActive,
//       imageUrl: images[0] || null,
//       images,
//       imageUploads: form.imageUploads.map(uploadPayload),
//       details: normalizeDetailLines(form.details),
//       sizes: normalizeSizeCodes(form.sizes),
//       colors: normalizeColors(form.colors),
//     });
//     setRefresh((x) => x + 1);
//     cancel();
//   }

//   async function onDelete(productId) {
//     // eslint-disable-next-line no-alert
//     if (!window.confirm('Delete this product?')) return;
//     await deleteProduct(productId);
//     setRefresh((x) => x + 1);
//     if (editingId === productId) cancel();
//   }

//   return (
//     <div className="grid admin-products-page" style={{ gap: 16 }}>
//       <div className="card content-card admin-hero">
//         <div className="admin-hero__copy">
//           <div className="admin-hero__eyebrow">Catalog Studio</div>
//           <h1 className="page-title" style={{ margin: 0 }}>Products</h1>
//           <div className="page-subtitle">Add, update and manage clothing products, sizes, and media in one clean workspace.</div>
//         </div>
//         <div className="admin-hero__actions">
//           <input
//             className="input admin-search"
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             placeholder="Search name / SKU / category"
//           />
//           <select
//             className="input"
//             value={sortBy}
//             onChange={(e) => setSortBy(e.target.value)}
//             aria-label="Sort products"
//             style={{ minWidth: 180 }}
//           >
//             <option value="newest">Newest first</option>
//             <option value="name-asc">Name A → Z</option>
//             <option value="name-desc">Name Z → A</option>
//             <option value="price-asc">Price low → high</option>
//             <option value="price-desc">Price high → low</option>
//             <option value="stock-desc">Stock high → low</option>
//             <option value="stock-asc">Stock low → high</option>
//           </select>
//           <button className="btn primary" onClick={startNew} type="button">
//             Add Product
//           </button>
//         </div>
//       </div>

//       <div className="kpi-row admin-kpis">
//         <div className="card kpi-card admin-kpi-card">
//           <div className="kpi-label">Products</div>
//           <div className="kpi-value">{dashboardStats.totalProducts}</div>
//           <div className="kpi-sub">Visible in your catalog</div>
//         </div>
//         <div className="card kpi-card admin-kpi-card">
//           <div className="kpi-label">Total Stock</div>
//           <div className="kpi-value">{dashboardStats.totalStock}</div>
//           <div className="kpi-sub">Across all active variants</div>
//         </div>
//         <div className="card kpi-card admin-kpi-card">
//           <div className="kpi-label">Sizes</div>
//           <div className="kpi-value">{dashboardStats.sizeCount}</div>
//           <div className="kpi-sub">Configured size codes</div>
//         </div>
//         <div className="card kpi-card admin-kpi-card">
//           <div className="kpi-label">Low Stock</div>
//           <div className="kpi-value">{dashboardStats.lowStockProducts}</div>
//           <div className="kpi-sub">At or below 10 units</div>
//         </div>
//       </div>

//       <div className="split admin-products-layout">
//         <div className="card content-card admin-table-card">
//           <div className="admin-panel-head">
//             <div>
//               <div className="admin-panel-title">Product catalog</div>
//               <div className="admin-panel-subtitle">
//                 {filtered.length} item{filtered.length === 1 ? '' : 's'} shown • Page {currentPage} of {totalPages}
//               </div>
//             </div>
//             <div className="badge">
//               <span className="dot" />
//               Managed inventory
//             </div>
//           </div>
//           <table className="table admin-table">
//             <thead>
//               <tr>
//                 <th>Product</th>
//                 <th>Sizes</th>
//                 <th>Price</th>
//                 <th>Stock</th>
//                 <th />
//               </tr>
//             </thead>
//             <tbody>
//               {visibleProducts.map((p) => {
//                 const rowSizes = normalizeSizeCodes(p.sizes);
//                 const stock = Number(p.stock) || 0;
//                 return (
//                   <tr key={p.id}>
//                     <td>
//                       <div className="product-cell">
//                         <div className="product-thumb">
//                           {p.imageUrl ? <img src={p.imageUrl} alt={p.name} /> : null}
//                         </div>
//                         <div>
//                           <div style={{ fontWeight: 800 }}>{p.name}</div>
//                           <div className="muted" style={{ fontSize: 12 }}>
//                             {p.sku || [p.category, p.subcategory].filter(Boolean).join(" · ") || '-'}
//                           </div>
//                         </div>
//                       </div>
//                     </td>
//                     <td>
//                       <div className="size-chip-list">
//                         {rowSizes.length ? rowSizes.map((size) => (
//                           <span key={size} className="size-chip">{size}</span>
//                         )) : <span className="muted">No sizes</span>}
//                       </div>
//                     </td>
//                     <td style={{ fontWeight: 750 }}>{formatMoneyLKR(p.price)}</td>
//                     <td>
//                       <span className={`stock-pill ${stock <= 10 ? 'warning' : ''} ${stock <= 0 ? 'danger' : ''}`}>
//                         {stock <= 0 ? 'Out' : `${stock} pcs`}
//                       </span>
//                     </td>
//                     <td style={{ textAlign: 'right' }}>
//                       <div className="toolbar" style={{ justifyContent: 'flex-end' }}>
//                         <button className="btn" type="button" onClick={() => setSelected(p)}>
//                           View
//                         </button>
//                         <button className="btn" type="button" onClick={() => startEdit(p)}>
//                           Edit
//                         </button>
//                         <button className="btn danger" type="button" onClick={() => onDelete(p.id)}>
//                           Delete
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })}
//               {filtered.length === 0 ? (
//                 <tr>
//                   <td colSpan={5} className="muted" style={{ padding: '24px 10px' }}>
//                     No products found.
//                   </td>
//                 </tr>
//               ) : null}
//             </tbody>
//           </table>
//           {filtered.length > 0 ? (
//             <div className="toolbar" style={{ justifyContent: 'space-between', marginTop: 14, flexWrap: 'wrap', gap: 10 }}>
//               <div className="muted" style={{ fontSize: 12 }}>
//                 Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
//               </div>
//               <div className="toolbar" style={{ gap: 8 }}>
//                 <button
//                   className="btn"
//                   type="button"
//                   onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
//                   disabled={currentPage === 1}
//                 >
//                   Prev
//                 </button>
//                 <button
//                   className="btn"
//                   type="button"
//                   onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
//                   disabled={currentPage === totalPages}
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           ) : null}
//         </div>

//         <div className="grid" style={{ gap: 14 }}>
//           <div className="card content-card admin-form-card">
//             <div className="admin-panel-head">
//               <div>
//                 <div className="admin-panel-title">
//                   {editingId ? (editingId === '__new__' ? 'Add product' : 'Edit product') : 'Product editor'}
//                 </div>
//                 <div className="admin-panel-subtitle">
//                   {editingId ? 'Update product details, sizes, and images.' : 'Choose an item or create a new one.'}
//                 </div>
//               </div>
//               {editingId ? (
//                 <button className="btn" type="button" onClick={cancel}>
//                   Cancel
//                 </button>
//               ) : null}
//             </div>

//           {editingId ? (
//             <form onSubmit={onSave} className="form-grid admin-form">
//               <div className="field span-2">
//                 <div className="field-label">Name</div>
//                 <input
//                   className="input"
//                   value={form.name}
//                   onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
//                   placeholder="e.g. Oversized T-Shirt (Black)"
//                 />
//               </div>
//               <div className="field">
//                 <div className="field-label">Badge</div>
//                 <input
//                   className="input"
//                   value={form.badge}
//                   onChange={(e) => setForm((s) => ({ ...s, badge: e.target.value }))}
//                   placeholder="New Arrival"
//                 />
//               </div>
//               <div className="field">
//                 <div className="field-label">Seasonal Badge Text</div>
//                 <input
//                   className="input"
//                   value={form.seasonalBadgeText}
//                   onChange={(e) => setForm((s) => ({ ...s, seasonalBadgeText: e.target.value }))}
//                   placeholder="Limited Edition"
//                   disabled={!form.seasonalBatch}
//                 />
//               </div>
//               <div className="field">
//                 <div className="field-label">Variant Group</div>
//                 <input
//                   className="input"
//                   value={form.variantGroupKey}
//                   onChange={(e) => setForm((s) => ({ ...s, variantGroupKey: e.target.value }))}
//                   placeholder="e.g. linen-maxi-dress"
//                 />
//                 <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
//                   Use the same group key for color/size variants of the same product.
//                 </div>
//               </div>
//               <div className="field">
//                 <div className="field-label">Badge Color</div>
//                 <select
//                   className="input"
//                   value={form.badgeColor}
//                   onChange={(e) => setForm((s) => ({ ...s, badgeColor: e.target.value }))}
//                 >
//                   {badgeColorOptions.map((option) => (
//                     <option key={option.value} value={option.value}>
//                       {option.label}
//                     </option>
//                   ))}
//                   {!isPresetBadgeColor(form.badgeColor) ? (
//                     <option value={form.badgeColor}>Custom</option>
//                   ) : null}
//                 </select>
//                 <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
//                   Pick a badge-safe tone that reads well on product images.
//                 </div>
//               </div>
//               <div className="field span-2">
//                 <label className="size-check" style={{ alignSelf: 'end', marginBottom: 8 }}>
//                   <input
//                     type="checkbox"
//                     checked={form.seasonalBatch}
//                     onChange={(e) => setForm((s) => ({ ...s, seasonalBatch: e.target.checked }))}
//                   />
//                   <span className="size-check__box" aria-hidden="true">
//                     {form.seasonalBatch ? '✓' : ''}
//                   </span>
//                   <span className="size-check__text">Seasonal batch</span>
//                 </label>
//                 <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>
//                   Use this for limited seasonal products that should disappear after a set date.
//                 </div>
//                 <div className="field" style={{ maxWidth: 240 }}>
//                   <div className="field-label">Off date</div>
//                   <input
//                     className="input"
//                     type="date"
//                     value={form.seasonalEndsOn}
//                     onChange={(e) => setForm((s) => ({ ...s, seasonalEndsOn: e.target.value }))}
//                     disabled={!form.seasonalBatch}
//                   />
//                 </div>
//               </div>
//               <div className="field">
//                 <div className="field-label">SKU</div>
//                 <input
//                   className="input"
//                   value={form.sku}
//                   onChange={(e) => setForm((s) => ({ ...s, sku: e.target.value }))}
//                   placeholder="e.g. TS-BLK-OS"
//                 />
//               </div>
//               <div className="field">
//                 <div className="field-label">Category</div>
//                 <select
//                   className="input"
//                   value={form.category}
//                   onChange={(e) => setForm((s) => ({ ...s, category: e.target.value, subcategory: '' }))}
//                 >
//                   <option value="">Select main category</option>
//                   {CATEGORY_OPTIONS.map((option) => (
//                     <option key={option} value={option}>{option}</option>
//                   ))}
//                 </select>
//               </div>
//               <div className="field">
//                 <div className="field-label">Subcategory</div>
//                 <select
//                   className="input"
//                   value={form.subcategory}
//                   onChange={(e) => setForm((s) => ({ ...s, subcategory: e.target.value }))}
//                   disabled={!form.category}
//                 >
//                   <option value="">Optional</option>
//                   {getSubcategoriesForCategory(form.category).map((option) => (
//                     <option key={option} value={option}>{option}</option>
//                   ))}
//                 </select>
//               </div>
//               <div className="field span-2">
//                 <div className="field-label">Subtitle</div>
//                 <input
//                   className="input"
//                   value={form.subtitle}
//                   onChange={(e) => setForm((s) => ({ ...s, subtitle: e.target.value }))}
//                   placeholder="Pink Flowers · Embroidered"
//                 />
//               </div>
//               <div className="field span-2">
//                 <div className="field-label">Collection</div>
//                 <input
//                   className="input"
//                   value={form.collection}
//                   onChange={(e) => setForm((s) => ({ ...s, collection: e.target.value }))}
//                   placeholder="The Atelier Collection"
//                 />
//               </div>
//               <div className="field span-2">
//                 <div className="field-label">Description</div>
//                 <textarea
//                   className="input"
//                   rows={4}
//                   value={form.description}
//                   onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
//                   placeholder="Short product story and material notes..."
//                 />
//               </div>
//               <div className="field">
//                 <div className="field-label">Price (LKR)</div>
//                 <input
//                   className="input"
//                   inputMode="numeric"
//                   value={form.price}
//                   onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))}
//                   placeholder="3500"
//                 />
//               </div>
//               <div className="field">
//                 <div className="field-label">Original Price (LKR)</div>
//                 <input
//                   className="input"
//                   inputMode="numeric"
//                   value={form.originalPrice}
//                   onChange={(e) => setForm((s) => ({ ...s, originalPrice: e.target.value }))}
//                   placeholder="4500"
//                 />
//               </div>
//               <div className="field">
//                 <div className="field-label">Cost (LKR)</div>
//                 <input
//                   className="input"
//                   inputMode="numeric"
//                   value={form.cost}
//                   onChange={(e) => setForm((s) => ({ ...s, cost: e.target.value }))}
//                   placeholder="2100"
//                 />
//               </div>
//               <div className="field">
//                 <div className="field-label">Stock</div>
//                 <input
//                   className="input"
//                   inputMode="numeric"
//                   value={form.stock}
//                   onChange={(e) => setForm((s) => ({ ...s, stock: e.target.value }))}
//                   placeholder="24"
//                 />
//               </div>
//               <div className="field">
//                 <div className="field-label">Rating</div>
//                 <input
//                   className="input"
//                   inputMode="decimal"
//                   value={form.rating}
//                   onChange={(e) => setForm((s) => ({ ...s, rating: e.target.value }))}
//                   placeholder="4.8"
//                 />
//               </div>
//               <div className="field">
//                 <div className="field-label">Reviews</div>
//                 <input
//                   className="input"
//                   inputMode="numeric"
//                   value={form.reviewsCount}
//                   onChange={(e) => setForm((s) => ({ ...s, reviewsCount: e.target.value }))}
//                   placeholder="38"
//                 />
//               </div>
//               <div className="field">
//                 <div className="field-label">Currency</div>
//                 <input
//                   className="input"
//                   value={form.currency}
//                   onChange={(e) => setForm((s) => ({ ...s, currency: e.target.value }))}
//                   placeholder="LKR"
//                 />
//               </div>
//               <label className="size-check" style={{ alignSelf: 'end' }}>
//                 <input
//                   type="checkbox"
//                   checked={form.isActive}
//                   onChange={(e) => setForm((s) => ({ ...s, isActive: e.target.checked }))}
//                 />
//                 <span className="size-check__box" aria-hidden="true">{form.isActive ? '✓' : ''}</span>
//                 <span className="size-check__text">Active</span>
//               </label>
//               <div className="field span-2">
//                 <div className="field-label">Available Sizes</div>
//                 <div className="size-checkbox-grid">
//                   {sizeOptions.map((size) => {
//                     const selectedSize = form.sizes.includes(size);
//                     return (
//                       <label key={size} className={`size-check ${selectedSize ? 'checked' : ''}`}>
//                         <input
//                           type="checkbox"
//                           checked={selectedSize}
//                           onChange={() => toggleSize(size)}
//                         />
//                         <span className="size-check__box" aria-hidden="true">
//                           {selectedSize ? '✓' : ''}
//                         </span>
//                         <span className="size-check__text">{size}</span>
//                       </label>
//                     );
//                   })}
//                 </div>
//                 <div className="muted" style={{ fontSize: 12 }}>
//                   Selected sizes appear on the product page. Update this list whenever sizes sell out or return.
//                 </div>
//               </div>
//               <div className="field span-2">
//                 <div className="toolbar" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
//                   <div className="field-label" style={{ marginBottom: 0 }}>Available Colors</div>
//                   <button className="btn" type="button" onClick={addColor}>
//                     Add Color
//                   </button>
//                 </div>
//                 <div className="color-editor">
//                   {form.colors.length ? form.colors.map((color, index) => (
//                     <div key={`${color.name || 'color'}-${index}`} className="color-editor__row">
//                       <div className="field" style={{ flex: 1 }}>
//                         <div className="field-label">Name</div>
//                         <input
//                           className="input"
//                           value={color.name}
//                           onChange={(e) => updateColor(index, 'name', e.target.value)}
//                           placeholder="e.g. Rose Pink"
//                         />
//                       </div>
//                       <div className="field" style={{ width: 200 }}>
//                         <div className="field-label">Hex</div>
//                         <input
//                           className="input"
//                           value={color.hex ?? ''}
//                           onChange={(e) => updateColor(index, 'hex', e.target.value)}
//                           placeholder="var(--color-primary)"
//                         />
//                       </div>
//                       <div className="color-editor__swatch" style={{ background: color.hex || 'var(--color-surface-container-low)' }} />
//                       <button className="btn danger" type="button" onClick={() => removeColor(index)}>
//                         Remove
//                       </button>
//                     </div>
//                   )) : (
//                     <div className="muted" style={{ fontSize: 12 }}>
//                       No colors added yet. Use Add Color to create available color options.
//                     </div>
//                   )}
//                 </div>
//                 <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>
//                   Add or update color names and hex codes for the product page.
//                 </div>
//                 <div className="color-swatch-palette" style={{ marginTop: 10 }}>
//                   {colorPalette.map((hex) => (
//                     <button
//                       key={hex}
//                       type="button"
//                       className="color-swatch-chip"
//                       style={{ background: hex }}
//                       onClick={() => setForm((s) => ({ ...s, colors: [...normalizeColors(s.colors), { name: '', hex }] }))}
//                       aria-label={`Use ${hex} for a new color`}
//                     />
//                   ))}
//                 </div>
//                 <div className="field" style={{ marginTop: 12 }}>
//                   <div className="field-label">Details</div>
//                   <textarea
//                     className="input"
//                     rows={5}
//                     value={form.details}
//                     onChange={(e) => setForm((s) => ({ ...s, details: e.target.value }))}
//                     placeholder={"One detail per line\nHand-embroidered floral motifs\nRelaxed A-line silhouette"}
//                   />
//                 </div>
//               </div>
//               <div className="field span-2">
//                 <div className="field-label">Image URL</div>
//                 <input
//                   className="input"
//                   value={form.imageUrl}
//                   onChange={(e) => setForm((s) => ({ ...s, imageUrl: e.target.value }))}
//                   placeholder="https://... or /src/assets/..."
//                 />
//                 <div className="toolbar" style={{ justifyContent: 'flex-end' }}>
//                   <button className="btn" type="button" onClick={addImageUrl}>
//                     Add URL
//                   </button>
//                 </div>
//               </div>
//               <div className="field span-2">
//                 <div className="field-label">Upload Images</div>
//                 <input
//                   className="input"
//                   type="file"
//                   accept="image/png,image/jpeg,image/webp"
//                   multiple
//                   onChange={onImageFilesChange}
//                 />
//               </div>
//               {(form.images.length || form.imageUploads.length) ? (
//                 <div className="span-2">
//                   <div className="field-label">Product Images</div>
//                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(86px, 1fr))', gap: 10 }}>
//                     {form.images.map((url, index) => (
//                       <div key={`${url}-${index}`} style={{ display: 'grid', gap: 6 }}>
//                         <div style={{ height: 86, borderRadius: 12, overflow: 'hidden', background: 'var(--admin-surface-soft)' }}>
//                           <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//                         </div>
//                         <button className="btn danger" type="button" onClick={() => removeExistingImage(url)}>
//                           Remove
//                         </button>
//                       </div>
//                     ))}
//                     {form.imageUploads.map((upload, index) => (
//                       <div key={`${upload.fileName}-${index}`} style={{ display: 'grid', gap: 6 }}>
//                         <div style={{ height: 86, borderRadius: 12, overflow: 'hidden', background: 'var(--admin-surface-soft)' }}>
//                           <img src={upload.previewUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//                         </div>
//                         <button className="btn danger" type="button" onClick={() => removeUploadedImage(index)}>
//                           Remove
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                   <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>
//                     The first saved image is used as the product cover.
//                   </div>
//                 </div>
//               ) : null}
//               <div className="span-2 muted" style={{ fontSize: 12 }}>
//                 JPG, PNG and WebP images up to 5 MB each are supported.
//               </div>
//               {imageError ? (
//                 <div className="span-2 danger-text" style={{ fontSize: 12 }}>
//                   {imageError}
//                 </div>
//               ) : null}
//               <div className="span-2 toolbar" style={{ justifyContent: 'flex-end' }}>
//                 <button className="btn primary" type="submit">
//                   Save Product
//                 </button>
//               </div>
//               <div className="span-2 muted" style={{ fontSize: 12 }}>
//                 Note: Profit is calculated using (price - cost) for delivered/received orders.
//               </div>
//             </form>
//           ) : (
//             <div className="muted" style={{ fontSize: 13, lineHeight: 1.5 }}>
//               Click <b>Add Product</b> or <b>Edit</b> to manage items.
//             </div>
//           )}
//         </div>
//       </div>

//           {selected ? (
//             <div className="card content-card admin-detail-card">
//               <div className="admin-panel-head">
//                 <div>
//                   <div className="admin-panel-title">Item details</div>
//                   <div className="admin-panel-subtitle">Preview the selected product as customers see it.</div>
//                 </div>
//                 <button className="btn" type="button" onClick={() => setSelected(null)}>
//                   Close
//                 </button>
//               </div>
//               <div className="detail-grid">
//                 <div className="detail-hero">
//                   <div className="detail-image">
//                     {selected.imageUrl ? <img src={selected.imageUrl} alt={selected.name} /> : null}
//                   </div>
//                   <div style={{ flex: 1 }}>
//                     <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 4 }}>{selected.name}</div>
//                     <div className="muted" style={{ marginBottom: 8 }}>
//                       {selected.sku ? `SKU: ${selected.sku}` : 'SKU not set'}{selected.category ? ` · ${selected.category}` : ''}{selected.subcategory ? ` · ${selected.subcategory}` : ''}
//                     </div>
//                     {selected.subtitle ? <div className="muted" style={{ marginBottom: 4 }}>{selected.subtitle}</div> : null}
//                     {selected.collection ? <div className="muted" style={{ marginBottom: 8 }}>{selected.collection}</div> : null}
//                     {selected.badge ? (
//                       <div className="badge" style={{ marginBottom: 8, background: selected.badgeColor || 'var(--color-primary)', color: 'var(--color-on-primary)' }}>
//                         {selected.badge}
//                       </div>
//                     ) : null}
//                     {selected.seasonalBatch ? (
//                       <div className="badge" style={{ marginBottom: 8, background: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-container)' }}>
//                         {selected.seasonalBadgeText || 'Seasonal'}{selected.seasonalEndsOn ? ` · off ${selected.seasonalEndsOn}` : ''}
//                       </div>
//                     ) : null}
//                     {selected.originalPrice ? (
//                       <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>
//                         Compare at {formatMoneyLKR(selected.originalPrice)}
//                       </div>
//                     ) : null}
//                     <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>
//                       {selected.rating ? `Rating ${selected.rating}/5` : 'No rating set'} · {selected.reviewsCount || 0} reviews · {selected.currency}
//                       {selected.isActive ? ' · Active' : ' · Inactive'}
//                     </div>
//                     <div style={{ fontWeight: 850, fontSize: 16 }}>
//                       {formatMoneyLKR(selected.price)} <span className="muted" style={{ fontWeight: 600 }}>· stock {selected.stock}</span>
//                     </div>
//                   </div>
//                 </div>

//                 {selected.description ? (
//                   <div>
//                     <div className="field-label" style={{ marginBottom: 6 }}>Description</div>
//                     <div style={{ lineHeight: 1.65 }}>{selected.description}</div>
//                   </div>
//                 ) : null}

//                 {selected.details?.length ? (
//                   <div>
//                     <div className="field-label" style={{ marginBottom: 6 }}>Details</div>
//                     <ul style={{ margin: 0, paddingLeft: 18 }}>
//                       {selected.details.map((d) => (
//                         <li key={d} style={{ marginBottom: 5 }}>{d}</li>
//                       ))}
//                     </ul>
//                   </div>
//                 ) : null}

//                 <div className="toolbar" style={{ flexWrap: 'wrap', gap: 8 }}>
//                   {selected.sizes?.length ? (
//                     <div className="size-chip-list">
//                       {selected.sizes.map((size) => (
//                         <span key={size} className="size-chip">{size}</span>
//                       ))}
//                     </div>
//                   ) : (
//                     <div className="muted" style={{ fontSize: 12 }}>No sizes configured</div>
//                   )}
//                   {selected.colors?.length ? (
//                     <div className="muted" style={{ fontSize: 12 }}>Colors: {selected.colors.map((c) => c.name).join(', ')}</div>
//                   ) : null}
//                 </div>

//                 {selected.images?.length ? (
//                   <div>
//                     <div className="field-label" style={{ marginBottom: 8 }}>Images</div>
//                     <div className="detail-gallery">
//                       {selected.images.slice(0, 8).map((url) => (
//                         <div key={url} className="detail-gallery-item">
//                           <img src={url} alt="" />
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 ) : null}
//               </div>
//             </div>
//           ) : null}
//     </div>
//     </div>
//   );
// }

import { useEffect, useMemo, useState } from 'react';
import '../admin.css';
import { deleteProduct, getProducts, upsertProduct } from '../lib/apiRepo';
import { uid } from '../lib/storage';
import { formatMoneyLKR } from '../lib/format';
import {
  CATEGORY_OPTIONS,
  getSubcategoriesForCategory,
  normalizeProductCategory,
  normalizeProductSubcategory,
} from '../../lib/productCategories';

const acceptedImageTypes = ['image/png', 'image/jpeg', 'image/webp'];
const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];
const badgeColorOptions = [
  { label: 'Maroon', value: '#6f1f2f' },
  { label: 'Berry', value: '#8d2850' },
  { label: 'Rose', value: '#c14672' },
  { label: 'Plum', value: '#6b3fa0' },
  { label: 'Gold', value: '#b8872b' },
  { label: 'Forest', value: '#2f6b4f' },
  { label: 'Navy', value: '#2f4d73' },
  { label: 'Charcoal', value: '#4a4045' },
  { label: 'Teal', value: '#2e7981' },
  { label: 'Sand', value: '#a27b5c' },
];
const colorPalette = ['var(--color-primary)', 'var(--color-primary)', 'var(--color-primary-container)', 'var(--color-primary-container)', 'var(--color-secondary)', 'var(--color-tertiary)', 'var(--color-on-surface)', 'var(--color-tertiary-container)'];
const normalizeSizeCodes = (sizes = []) =>
  Array.from(
    new Set(
      (Array.isArray(sizes) ? sizes : [])
        .map((size) => (typeof size === 'string' ? size : size?.code))
        .map((size) => String(size || '').trim())
        .filter(Boolean)
    )
  );
const normalizeColors = (colors = []) =>
  Array.from(
    new Map(
      (Array.isArray(colors) ? colors : [])
        .map((color) => ({
          name: String((typeof color === 'string' ? color : color?.name) || '').trim(),
          hex: String(color?.hex || color?.colorHex || '').trim() || null,
        }))
        .filter((color) => color.name)
        .map((color) => [color.name.toLowerCase(), color])
    ).values()
  );
const normalizeDetailLines = (details = "") =>
  Array.from(
    new Set(
      String(details)
        .split(/\r?\n/)
        .map((detail) => detail.trim())
        .filter(Boolean)
    )
  );
const normalizeBadgeColor = (value = '') => String(value || '').trim() || badgeColorOptions[0].value;
const isPresetBadgeColor = (value = '') => badgeColorOptions.some((option) => option.value === value);

const emptyForm = () => ({
  id: '',
  name: '',
  sku: '',
  category: '',
  subcategory: '',
  subtitle: '',
  collection: '',
  description: '',
  badge: '',
  badgeColor: badgeColorOptions[0].value,
  seasonalBadgeText: '',
  variantGroupKey: '',
  seasonalBatch: false,
  seasonalEndsOn: '',
  price: '',
  cost: '',
  originalPrice: '',
  stock: '',
  rating: '',
  reviewsCount: '',
  currency: 'LKR',
  isActive: true,
  imageUrl: '',
  images: [],
  imageUploads: [],
  sizes: [],
  colors: [],
  details: '',
});

function fileToImageUpload(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      const [, data = ''] = dataUrl.split(',');
      resolve({
        fileName: file.name,
        contentType: file.type,
        data,
        previewUrl: dataUrl,
      });
    };
    reader.onerror = () => reject(reader.error || new Error('Could not read image file.'));
    reader.readAsDataURL(file);
  });
}

const uploadPayload = ({ fileName, contentType, data }) => ({ fileName, contentType, data });

export default function Products() {
  const [refresh, setRefresh] = useState(0);
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState(emptyForm());
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsState, setProductsState] = useState([]);
  const [selected, setSelected] = useState(null);
  const [imageError, setImageError] = useState('');
  const pageSize = 10;

  const products = useMemo(() => {
    void refresh;
    return productsState;
  }, [productsState, refresh]);

  useEffect(() => {
    let cancelled = false;
    getProducts()
      .then((list) => {
        if (!cancelled) setProductsState(list);
      })
      .catch(() => {
        if (!cancelled) setProductsState([]);
      });
    return () => {
      cancelled = true;
    };
  }, [refresh]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matching = !q ? products : products.filter((p) =>
      [p.name, p.sku, p.category, p.subcategory].some((x) => String(x || '').toLowerCase().includes(q))
    );
    const sorted = [...matching].sort((left, right) => {
      switch (sortBy) {
        case 'price-asc':
          return (Number(left.price) || 0) - (Number(right.price) || 0);
        case 'price-desc':
          return (Number(right.price) || 0) - (Number(left.price) || 0);
        case 'stock-asc':
          return (Number(left.stock) || 0) - (Number(right.stock) || 0);
        case 'stock-desc':
          return (Number(right.stock) || 0) - (Number(left.stock) || 0);
        case 'name-asc':
          return String(left.name || '').localeCompare(String(right.name || ''));
        case 'name-desc':
          return String(right.name || '').localeCompare(String(left.name || ''));
        case 'newest':
        default:
          return new Date(String(right.createdAt || 0)).getTime() - new Date(String(left.createdAt || 0)).getTime();
      }
    });
    return sorted;
  }, [products, query, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visibleProducts = useMemo(
    () => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filtered, currentPage]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [query, sortBy]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const dashboardStats = useMemo(() => {
    const totalStock = products.reduce((sum, product) => sum + (Number(product.stock) || 0), 0);
    const sizeCodes = new Set(products.flatMap((product) => normalizeSizeCodes(product.sizes)));
    const lowStockProducts = products.filter((product) => (Number(product.stock) || 0) <= 10).length;
    return {
      totalProducts: products.length,
      totalStock,
      sizeCount: sizeCodes.size,
      lowStockProducts,
    };
  }, [products]);

  function startNew() {
    setEditingId('__new__');
    setForm({ ...emptyForm(), id: uid('prod') });
    setImageError('');
  }

  function startEdit(product) {
    const images = product.images?.length ? product.images : product.imageUrl ? [product.imageUrl] : [];
    setEditingId(product.id);
    setForm({
      id: product.id,
      name: product.name || '',
      sku: product.sku || '',
      category: normalizeProductCategory(product.category) || '',
      subcategory: normalizeProductSubcategory(product.subcategory, product.category) || '',
      subtitle: product.subtitle || '',
      collection: product.collection || '',
      description: product.description || '',
      badge: product.badge || '',
      badgeColor: normalizeBadgeColor(product.badgeColor),
      seasonalBadgeText: product.seasonalBadgeText || '',
      variantGroupKey: product.variantGroupKey || '',
      seasonalBatch: Boolean(product.seasonalBatch),
      seasonalEndsOn: product.seasonalEndsOn || '',
      price: String(product.price ?? ''),
      cost: String(product.cost ?? ''),
      originalPrice: String(product.originalPrice ?? ''),
      stock: String(product.stock ?? ''),
      rating: product.rating === '' ? '' : String(product.rating ?? ''),
      reviewsCount: String(product.reviewsCount ?? ''),
      currency: product.currency || 'LKR',
      isActive: product.isActive ?? true,
      imageUrl: product.imageUrl || '',
      images,
      imageUploads: [],
      sizes: normalizeSizeCodes(product.sizes),
      colors: normalizeColors(product.colors),
      details: (product.details || []).join('\n'),
    });
    setImageError('');
  }

  function cancel() {
    setEditingId('');
    setForm(emptyForm());
    setImageError('');
  }

  async function onImageFilesChange(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;

    const validFiles = files.filter((file) => acceptedImageTypes.includes(file.type) && file.size <= 5 * 1024 * 1024);
    setImageError(validFiles.length === files.length ? '' : 'Some images were skipped. Use JPG, PNG or WebP under 5 MB.');
    const uploads = await Promise.all(validFiles.map(fileToImageUpload));
    setForm((s) => ({ ...s, imageUploads: [...s.imageUploads, ...uploads] }));
  }

  function addImageUrl() {
    const url = form.imageUrl.trim();
    if (!url) return;
    setForm((s) => ({
      ...s,
      imageUrl: '',
      images: s.images.includes(url) ? s.images : [...s.images, url],
    }));
  }

  function removeExistingImage(url) {
    setForm((s) => ({ ...s, images: s.images.filter((imageUrl) => imageUrl !== url) }));
  }

  function removeUploadedImage(index) {
    setForm((s) => ({ ...s, imageUploads: s.imageUploads.filter((_, uploadIndex) => uploadIndex !== index) }));
  }

  function toggleSize(size) {
    setForm((s) => ({
      ...s,
      sizes: s.sizes.includes(size)
        ? s.sizes.filter((selectedSize) => selectedSize !== size)
        : [...s.sizes, size],
    }));
  }

  function addColor() {
    setForm((s) => ({
      ...s,
      colors: [...normalizeColors(s.colors), { name: '', hex: '' }],
    }));
  }

  function updateColor(index, field, value) {
    setForm((s) => ({
      ...s,
      colors: s.colors.map((color, colorIndex) =>
        colorIndex === index ? { ...color, [field]: value } : color
      ),
    }));
  }

  function removeColor(index) {
    setForm((s) => ({
      ...s,
      colors: s.colors.filter((_, colorIndex) => colorIndex !== index),
    }));
  }

  async function onSave(e) {
    e.preventDefault();
    const price = Number(form.price);
    const cost = Number(form.cost);
    const originalPrice = form.originalPrice.trim() ? Number(form.originalPrice) : null;
    const stock = Number(form.stock);
    const rating = form.rating.trim() === '' ? null : Number(form.rating);
    const reviewsCount = form.reviewsCount.trim() === '' ? 0 : Number(form.reviewsCount);
    if (!form.name.trim()) return;
    if (!Number.isFinite(price) || price < 0) return;
    if (!Number.isFinite(cost) || cost < 0) return;
    if (originalPrice != null && (!Number.isFinite(originalPrice) || originalPrice < 0)) return;
    if (!Number.isFinite(stock) || stock < 0) return;
    if (rating != null && (!Number.isFinite(rating) || rating < 0 || rating > 5)) return;
    if (!Number.isFinite(reviewsCount) || reviewsCount < 0) return;

    const pendingImageUrl = form.imageUrl.trim();
    const images = pendingImageUrl && !form.images.includes(pendingImageUrl)
      ? [...form.images, pendingImageUrl]
      : form.images;

    await upsertProduct({
      id: form.id,
      name: form.name.trim(),
      sku: form.sku.trim(),
      category: normalizeProductCategory(form.category.trim()),
      subcategory: normalizeProductSubcategory(form.subcategory.trim(), form.category.trim()),
      subtitle: form.subtitle.trim(),
      collection: form.collection.trim(),
      description: form.description.trim(),
      badge: form.badge.trim(),
      badgeColor: normalizeBadgeColor(form.badgeColor),
      seasonalBadgeText: form.seasonalBadgeText.trim(),
      variantGroupKey: form.variantGroupKey.trim(),
      seasonalBatch: Boolean(form.seasonalBatch),
      seasonalEndsOn: form.seasonalBatch ? (form.seasonalEndsOn.trim() || null) : null,
      price,
      cost,
      originalPrice,
      stock,
      rating,
      reviewsCount,
      currency: form.currency.trim() || 'LKR',
      isActive: form.isActive,
      imageUrl: images[0] || null,
      images,
      imageUploads: form.imageUploads.map(uploadPayload),
      details: normalizeDetailLines(form.details),
      sizes: normalizeSizeCodes(form.sizes),
      colors: normalizeColors(form.colors),
    });
    setRefresh((x) => x + 1);
    cancel();
  }

  async function onDelete(productId) {
    // eslint-disable-next-line no-alert
    if (!window.confirm('Delete this product?')) return;
    await deleteProduct(productId);
    setRefresh((x) => x + 1);
    if (editingId === productId) cancel();
  }

  return (
    <div className="grid admin-products-page" style={{ gap: 16 }}>
      <div className="card content-card admin-hero">
        <div className="admin-hero__copy">
          <div className="admin-hero__eyebrow">Catalog Studio</div>
          <h1 className="page-title" style={{ margin: 0 }}>Products</h1>
          <div className="page-subtitle">Add, update and manage clothing products, sizes, and media in one clean workspace.</div>
        </div>
        <div className="admin-hero__actions">
          <input
            className="input admin-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name / SKU / category"
          />
          <select
            className="input"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort products"
            style={{ minWidth: 180 }}
          >
            <option value="newest">Newest first</option>
            <option value="name-asc">Name A → Z</option>
            <option value="name-desc">Name Z → A</option>
            <option value="price-asc">Price low → high</option>
            <option value="price-desc">Price high → low</option>
            <option value="stock-desc">Stock high → low</option>
            <option value="stock-asc">Stock low → high</option>
          </select>
          <button className="btn primary" onClick={startNew} type="button">
            Add Product
          </button>
        </div>
      </div>

      <div className="kpi-row admin-kpis">
        <div className="card kpi-card admin-kpi-card">
          <div className="kpi-label">Products</div>
          <div className="kpi-value">{dashboardStats.totalProducts}</div>
          <div className="kpi-sub">Visible in your catalog</div>
        </div>
        <div className="card kpi-card admin-kpi-card">
          <div className="kpi-label">Total Stock</div>
          <div className="kpi-value">{dashboardStats.totalStock}</div>
          <div className="kpi-sub">Across all active variants</div>
        </div>
        <div className="card kpi-card admin-kpi-card">
          <div className="kpi-label">Sizes</div>
          <div className="kpi-value">{dashboardStats.sizeCount}</div>
          <div className="kpi-sub">Configured size codes</div>
        </div>
        <div className="card kpi-card admin-kpi-card">
          <div className="kpi-label">Low Stock</div>
          <div className="kpi-value">{dashboardStats.lowStockProducts}</div>
          <div className="kpi-sub">At or below 10 units</div>
        </div>
      </div>

      <div className="split admin-products-layout">
        <div className="card content-card admin-table-card">
          <div className="admin-panel-head">
            <div>
              <div className="admin-panel-title">Product catalog</div>
              <div className="admin-panel-subtitle">
                {filtered.length} item{filtered.length === 1 ? '' : 's'} shown • Page {currentPage} of {totalPages}
              </div>
            </div>
            <div className="badge">
              <span className="dot" />
              Managed inventory
            </div>
          </div>
          <table className="table admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Sizes</th>
                <th>Price</th>
                <th>Stock</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visibleProducts.map((p) => {
                const rowSizes = normalizeSizeCodes(p.sizes);
                const stock = Number(p.stock) || 0;
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="product-cell">
                        <div className="product-thumb">
                          {p.imageUrl ? <img src={p.imageUrl} alt={p.name} /> : null}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800 }}>{p.name}</div>
                          <div className="muted" style={{ fontSize: 12 }}>
                            {p.sku || [p.category, p.subcategory].filter(Boolean).join(" · ") || '-'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="size-chip-list">
                        {rowSizes.length ? rowSizes.map((size) => (
                          <span key={size} className="size-chip">{size}</span>
                        )) : <span className="muted">No sizes</span>}
                      </div>
                    </td>
                    <td style={{ fontWeight: 750 }}>{formatMoneyLKR(p.price)}</td>
                    <td>
                      <span className={`stock-pill ${stock <= 10 ? 'warning' : ''} ${stock <= 0 ? 'danger' : ''}`}>
                        {stock <= 0 ? 'Out' : `${stock} pcs`}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="toolbar" style={{ justifyContent: 'flex-end' }}>
                        <button className="btn" type="button" onClick={() => setSelected(p)}>
                          View
                        </button>
                        <button className="btn" type="button" onClick={() => startEdit(p)}>
                          Edit
                        </button>
                        <button className="btn danger" type="button" onClick={() => onDelete(p.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="muted" style={{ padding: '24px 10px' }}>
                    No products found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
          {filtered.length > 0 ? (
            <div className="toolbar" style={{ justifyContent: 'space-between', marginTop: 14, flexWrap: 'wrap', gap: 10 }}>
              <div className="muted" style={{ fontSize: 12 }}>
                Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
              </div>
              <div className="toolbar" style={{ gap: 8 }}>
                <button
                  className="btn"
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                >
                  Prev
                </button>
                <button
                  className="btn"
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="grid" style={{ gap: 14 }}>
          <div className="card content-card admin-form-card">
            <div className="admin-panel-head">
              <div>
                <div className="admin-panel-title">
                  {editingId ? (editingId === '__new__' ? 'Add product' : 'Edit product') : 'Product editor'}
                </div>
                <div className="admin-panel-subtitle">
                  {editingId ? 'Update product details, sizes, and images.' : 'Choose an item or create a new one.'}
                </div>
              </div>
              {editingId ? (
                <button className="btn" type="button" onClick={cancel}>
                  Cancel
                </button>
              ) : null}
            </div>

          {editingId ? (
            <form onSubmit={onSave} className="form-grid admin-form">
              <div className="field span-2">
                <div className="field-label">Name</div>
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                  placeholder="e.g. Oversized T-Shirt (Black)"
                />
              </div>
              <div className="field">
                <div className="field-label">Badge</div>
                <input
                  className="input"
                  value={form.badge}
                  onChange={(e) => setForm((s) => ({ ...s, badge: e.target.value }))}
                  placeholder="New Arrival"
                />
              </div>
              <div className="field">
                <div className="field-label">Seasonal Badge Text</div>
                <input
                  className="input"
                  value={form.seasonalBadgeText}
                  onChange={(e) => setForm((s) => ({ ...s, seasonalBadgeText: e.target.value }))}
                  placeholder="Limited Edition"
                  disabled={!form.seasonalBatch}
                />
              </div>
              <div className="field">
                <div className="field-label">Variant Group</div>
                <input
                  className="input"
                  value={form.variantGroupKey}
                  onChange={(e) => setForm((s) => ({ ...s, variantGroupKey: e.target.value }))}
                  placeholder="e.g. linen-maxi-dress"
                />
                <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
                  Use the same group key for color/size variants of the same product.
                </div>
              </div>
              <div className="field">
                <div className="field-label">Badge Color</div>
                <select
                  className="input"
                  value={form.badgeColor}
                  onChange={(e) => setForm((s) => ({ ...s, badgeColor: e.target.value }))}
                >
                  {badgeColorOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                  {!isPresetBadgeColor(form.badgeColor) ? (
                    <option value={form.badgeColor}>Custom</option>
                  ) : null}
                </select>
                <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
                  Pick a badge-safe tone that reads well on product images.
                </div>
              </div>
              <div className="field span-2">
                <label className="size-check" style={{ alignSelf: 'end', marginBottom: 8 }}>
                  <input
                    type="checkbox"
                    checked={form.seasonalBatch}
                    onChange={(e) => setForm((s) => ({ ...s, seasonalBatch: e.target.checked }))}
                  />
                  <span className="size-check__box" aria-hidden="true">
                    {form.seasonalBatch ? '✓' : ''}
                  </span>
                  <span className="size-check__text">Seasonal batch</span>
                </label>
                <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>
                  Use this for limited seasonal products that should disappear after a set date.
                </div>
                <div className="field" style={{ maxWidth: 240 }}>
                  <div className="field-label">Off date</div>
                  <input
                    className="input"
                    type="date"
                    value={form.seasonalEndsOn}
                    onChange={(e) => setForm((s) => ({ ...s, seasonalEndsOn: e.target.value }))}
                    disabled={!form.seasonalBatch}
                  />
                </div>
              </div>
              <div className="field">
                <div className="field-label">SKU</div>
                <input
                  className="input"
                  value={form.sku}
                  onChange={(e) => setForm((s) => ({ ...s, sku: e.target.value }))}
                  placeholder="e.g. TS-BLK-OS"
                />
              </div>
              <div className="field">
                <div className="field-label">Category</div>
                <select
                  className="input"
                  value={form.category}
                  onChange={(e) => setForm((s) => ({ ...s, category: e.target.value, subcategory: '' }))}
                >
                  <option value="">Select main category</option>
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <div className="field-label">Subcategory</div>
                <select
                  className="input"
                  value={form.subcategory}
                  onChange={(e) => setForm((s) => ({ ...s, subcategory: e.target.value }))}
                  disabled={!form.category}
                >
                  <option value="">Optional</option>
                  {getSubcategoriesForCategory(form.category).map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div className="field span-2">
                <div className="field-label">Subtitle</div>
                <input
                  className="input"
                  value={form.subtitle}
                  onChange={(e) => setForm((s) => ({ ...s, subtitle: e.target.value }))}
                  placeholder="Pink Flowers · Embroidered"
                />
              </div>
              <div className="field span-2">
                <div className="field-label">Collection</div>
                <input
                  className="input"
                  value={form.collection}
                  onChange={(e) => setForm((s) => ({ ...s, collection: e.target.value }))}
                  placeholder="The Atelier Collection"
                />
              </div>
              <div className="field span-2">
                <div className="field-label">Description</div>
                <textarea
                  className="input"
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                  placeholder="Short product story and material notes..."
                />
              </div>
              <div className="field">
                <div className="field-label">Price (LKR)</div>
                <input
                  className="input"
                  inputMode="numeric"
                  value={form.price}
                  onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))}
                  placeholder="3500"
                />
              </div>
              <div className="field">
                <div className="field-label">Original Price (LKR)</div>
                <input
                  className="input"
                  inputMode="numeric"
                  value={form.originalPrice}
                  onChange={(e) => setForm((s) => ({ ...s, originalPrice: e.target.value }))}
                  placeholder="4500"
                />
              </div>
              <div className="field">
                <div className="field-label">Cost (LKR)</div>
                <input
                  className="input"
                  inputMode="numeric"
                  value={form.cost}
                  onChange={(e) => setForm((s) => ({ ...s, cost: e.target.value }))}
                  placeholder="2100"
                />
              </div>
              <div className="field">
                <div className="field-label">Stock</div>
                <input
                  className="input"
                  inputMode="numeric"
                  value={form.stock}
                  onChange={(e) => setForm((s) => ({ ...s, stock: e.target.value }))}
                  placeholder="24"
                />
              </div>
              <div className="field">
                <div className="field-label">Rating</div>
                <input
                  className="input"
                  inputMode="decimal"
                  value={form.rating}
                  onChange={(e) => setForm((s) => ({ ...s, rating: e.target.value }))}
                  placeholder="4.8"
                />
              </div>
              <div className="field">
                <div className="field-label">Reviews</div>
                <input
                  className="input"
                  inputMode="numeric"
                  value={form.reviewsCount}
                  onChange={(e) => setForm((s) => ({ ...s, reviewsCount: e.target.value }))}
                  placeholder="38"
                />
              </div>
              <div className="field">
                <div className="field-label">Currency</div>
                <input
                  className="input"
                  value={form.currency}
                  onChange={(e) => setForm((s) => ({ ...s, currency: e.target.value }))}
                  placeholder="LKR"
                />
              </div>
              <label className="size-check" style={{ alignSelf: 'end' }}>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((s) => ({ ...s, isActive: e.target.checked }))}
                />
                <span className="size-check__box" aria-hidden="true">{form.isActive ? '✓' : ''}</span>
                <span className="size-check__text">Active</span>
              </label>
              <div className="field span-2">
                <div className="field-label">Available Sizes</div>
                <div className="size-checkbox-grid">
                  {sizeOptions.map((size) => {
                    const selectedSize = form.sizes.includes(size);
                    return (
                      <label key={size} className={`size-check ${selectedSize ? 'checked' : ''}`}>
                        <input
                          type="checkbox"
                          checked={selectedSize}
                          onChange={() => toggleSize(size)}
                        />
                        <span className="size-check__box" aria-hidden="true">
                          {selectedSize ? '✓' : ''}
                        </span>
                        <span className="size-check__text">{size}</span>
                      </label>
                    );
                  })}
                </div>
                <div className="muted" style={{ fontSize: 12 }}>
                  Selected sizes appear on the product page. Update this list whenever sizes sell out or return.
                </div>
              </div>
              <div className="field span-2">
                <div className="toolbar" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
                  <div className="field-label" style={{ marginBottom: 0 }}>Available Colors</div>
                  <button className="btn" type="button" onClick={addColor}>
                    Add Color
                  </button>
                </div>
                <div className="color-editor">
                  {form.colors.length ? form.colors.map((color, index) => (
                    <div key={`${color.name || 'color'}-${index}`} className="color-editor__row">
                      <div className="field" style={{ flex: 1 }}>
                        <div className="field-label">Name</div>
                        <input
                          className="input"
                          value={color.name}
                          onChange={(e) => updateColor(index, 'name', e.target.value)}
                          placeholder="e.g. Rose Pink"
                        />
                      </div>
                      <div className="field" style={{ width: 200 }}>
                        <div className="field-label">Hex</div>
                        <input
                          className="input"
                          value={color.hex ?? ''}
                          onChange={(e) => updateColor(index, 'hex', e.target.value)}
                          placeholder="var(--color-primary)"
                        />
                      </div>
                      <div className="color-editor__swatch" style={{ background: color.hex || 'var(--color-surface-container-low)' }} />
                      <button className="btn danger" type="button" onClick={() => removeColor(index)}>
                        Remove
                      </button>
                    </div>
                  )) : (
                    <div className="muted" style={{ fontSize: 12 }}>
                      No colors added yet. Use Add Color to create available color options.
                    </div>
                  )}
                </div>
                <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>
                  Add or update color names and hex codes for the product page.
                </div>
                <div className="color-swatch-palette" style={{ marginTop: 10 }}>
                  {colorPalette.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      className="color-swatch-chip"
                      style={{ background: hex }}
                      onClick={() => setForm((s) => ({ ...s, colors: [...normalizeColors(s.colors), { name: '', hex }] }))}
                      aria-label={`Use ${hex} for a new color`}
                    />
                  ))}
                </div>
                <div className="field" style={{ marginTop: 12 }}>
                  <div className="field-label">Details</div>
                  <textarea
                    className="input"
                    rows={5}
                    value={form.details}
                    onChange={(e) => setForm((s) => ({ ...s, details: e.target.value }))}
                    placeholder={"One detail per line\nHand-embroidered floral motifs\nRelaxed A-line silhouette"}
                  />
                </div>
              </div>
              <div className="field span-2">
                <div className="field-label">Image URL</div>
                <input
                  className="input"
                  value={form.imageUrl}
                  onChange={(e) => setForm((s) => ({ ...s, imageUrl: e.target.value }))}
                  placeholder="https://... or /src/assets/..."
                />
                <div className="toolbar" style={{ justifyContent: 'flex-end' }}>
                  <button className="btn" type="button" onClick={addImageUrl}>
                    Add URL
                  </button>
                </div>
              </div>
              <div className="field span-2">
                <div className="field-label">Upload Images</div>
                <input
                  className="input"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  onChange={onImageFilesChange}
                />
              </div>
              {(form.images.length || form.imageUploads.length) ? (
                <div className="span-2">
                  <div className="field-label">Product Images</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(86px, 1fr))', gap: 10 }}>
                    {form.images.map((url, index) => (
                      <div key={`${url}-${index}`} style={{ display: 'grid', gap: 6 }}>
                        <div style={{ height: 86, borderRadius: 12, overflow: 'hidden', background: 'var(--admin-surface-soft)' }}>
                          <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <button className="btn danger" type="button" onClick={() => removeExistingImage(url)}>
                          Remove
                        </button>
                      </div>
                    ))}
                    {form.imageUploads.map((upload, index) => (
                      <div key={`${upload.fileName}-${index}`} style={{ display: 'grid', gap: 6 }}>
                        <div style={{ height: 86, borderRadius: 12, overflow: 'hidden', background: 'var(--admin-surface-soft)' }}>
                          <img src={upload.previewUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <button className="btn danger" type="button" onClick={() => removeUploadedImage(index)}>
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>
                    The first saved image is used as the product cover.
                  </div>
                </div>
              ) : null}
              <div className="span-2 muted" style={{ fontSize: 12 }}>
                JPG, PNG and WebP images up to 5 MB each are supported.
              </div>
              {imageError ? (
                <div className="span-2 danger-text" style={{ fontSize: 12 }}>
                  {imageError}
                </div>
              ) : null}
              <div className="span-2 toolbar" style={{ justifyContent: 'flex-end' }}>
                <button className="btn primary" type="submit">
                  Save Product
                </button>
              </div>
              <div className="span-2 muted" style={{ fontSize: 12 }}>
                Note: Profit is calculated using (price - cost) for delivered/received orders.
              </div>
            </form>
          ) : (
            <div className="muted" style={{ fontSize: 13, lineHeight: 1.5 }}>
              Click <b>Add Product</b> or <b>Edit</b> to manage items.
            </div>
          )}
        </div>
      </div>

          {selected ? (
            <div className="card content-card admin-detail-card">
              <div className="admin-panel-head">
                <div>
                  <div className="admin-panel-title">Item details</div>
                  <div className="admin-panel-subtitle">Preview the selected product as customers see it.</div>
                </div>
                <button className="btn" type="button" onClick={() => setSelected(null)}>
                  Close
                </button>
              </div>
              <div className="detail-grid">
                <div className="detail-hero">
                  <div className="detail-image">
                    {selected.imageUrl ? <img src={selected.imageUrl} alt={selected.name} /> : null}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 4 }}>{selected.name}</div>
                    <div className="muted" style={{ marginBottom: 8 }}>
                      {selected.sku ? `SKU: ${selected.sku}` : 'SKU not set'}{selected.category ? ` · ${selected.category}` : ''}{selected.subcategory ? ` · ${selected.subcategory}` : ''}
                    </div>
                    {selected.subtitle ? <div className="muted" style={{ marginBottom: 4 }}>{selected.subtitle}</div> : null}
                    {selected.collection ? <div className="muted" style={{ marginBottom: 8 }}>{selected.collection}</div> : null}
                    {selected.badge ? (
                      <div className="badge" style={{ marginBottom: 8, background: selected.badgeColor || 'var(--color-primary)', color: 'var(--color-on-primary)' }}>
                        {selected.badge}
                      </div>
                    ) : null}
                    {selected.seasonalBatch ? (
                      <div className="badge" style={{ marginBottom: 8, background: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-container)' }}>
                        {selected.seasonalBadgeText || 'Seasonal'}{selected.seasonalEndsOn ? ` · off ${selected.seasonalEndsOn}` : ''}
                      </div>
                    ) : null}
                    {selected.originalPrice ? (
                      <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>
                        Compare at {formatMoneyLKR(selected.originalPrice)}
                      </div>
                    ) : null}
                    <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>
                      {selected.rating ? `Rating ${selected.rating}/5` : 'No rating set'} · {selected.reviewsCount || 0} reviews · {selected.currency}
                      {selected.isActive ? ' · Active' : ' · Inactive'}
                    </div>
                    <div style={{ fontWeight: 850, fontSize: 16 }}>
                      {formatMoneyLKR(selected.price)} <span className="muted" style={{ fontWeight: 600 }}>· stock {selected.stock}</span>
                    </div>
                  </div>
                </div>

                {selected.description ? (
                  <div>
                    <div className="field-label" style={{ marginBottom: 6 }}>Description</div>
                    <div style={{ lineHeight: 1.65 }}>{selected.description}</div>
                  </div>
                ) : null}

                {selected.details?.length ? (
                  <div>
                    <div className="field-label" style={{ marginBottom: 6 }}>Details</div>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {selected.details.map((d) => (
                        <li key={d} style={{ marginBottom: 5 }}>{d}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="toolbar" style={{ flexWrap: 'wrap', gap: 8 }}>
                  {selected.sizes?.length ? (
                    <div className="size-chip-list">
                      {selected.sizes.map((size) => (
                        <span key={size} className="size-chip">{size}</span>
                      ))}
                    </div>
                  ) : (
                    <div className="muted" style={{ fontSize: 12 }}>No sizes configured</div>
                  )}
                  {selected.colors?.length ? (
                    <div className="muted" style={{ fontSize: 12 }}>Colors: {selected.colors.map((c) => c.name).join(', ')}</div>
                  ) : null}
                </div>

                {selected.images?.length ? (
                  <div>
                    <div className="field-label" style={{ marginBottom: 8 }}>Images</div>
                    <div className="detail-gallery">
                      {selected.images.slice(0, 8).map((url) => (
                        <div key={url} className="detail-gallery-item">
                          <img src={url} alt="" />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
    </div>
    </div>
  );
}