import { useEffect, useMemo, useState } from 'react';
import '../admin.css';
import { deleteProduct, getProducts, upsertProduct } from '../lib/apiRepo';
import { uid } from '../lib/storage';
import { formatMoneyLKR } from '../lib/format';

const emptyForm = () => ({
  id: '',
  name: '',
  sku: '',
  category: '',
  price: '',
  cost: '',
  stock: '',
  imageUrl: '',
});

export default function Products() {
  const [refresh, setRefresh] = useState(0);
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState(emptyForm());
  const [query, setQuery] = useState('');
  const [productsState, setProductsState] = useState([]);
  const [selected, setSelected] = useState(null);

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
    if (!q) return products;
    return products.filter((p) =>
      [p.name, p.sku, p.category].some((x) => String(x || '').toLowerCase().includes(q))
    );
  }, [products, query]);

  function startNew() {
    setEditingId('__new__');
    setForm({ ...emptyForm(), id: uid('prod') });
  }

  function startEdit(product) {
    setEditingId(product.id);
    setForm({
      id: product.id,
      name: product.name || '',
      sku: product.sku || '',
      category: product.category || '',
      price: String(product.price ?? ''),
      cost: String(product.cost ?? ''),
      stock: String(product.stock ?? ''),
      imageUrl: product.imageUrl || '',
    });
  }

  function cancel() {
    setEditingId('');
    setForm(emptyForm());
  }

  async function onSave(e) {
    e.preventDefault();
    const price = Number(form.price);
    const cost = Number(form.cost);
    const stock = Number(form.stock);
    if (!form.name.trim()) return;
    if (!Number.isFinite(price) || price < 0) return;
    if (!Number.isFinite(cost) || cost < 0) return;
    if (!Number.isFinite(stock) || stock < 0) return;

    await upsertProduct({
      id: form.id,
      name: form.name.trim(),
      sku: form.sku.trim(),
      category: form.category.trim(),
      price,
      cost,
      stock,
      imageUrl: form.imageUrl.trim(),
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
    <div className="grid" style={{ gap: 14 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <div className="page-subtitle">Add, update and manage your clothing products</div>
        </div>
        <div className="page-actions">
          <input
            className="input"
            style={{ width: 280 }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name / SKU / category"
          />
          <button className="btn primary" onClick={startNew} type="button">
            Add Product
          </button>
        </div>
      </div>

      <div className="split">
        <div className="card content-card">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 780 }}>{p.name}</td>
                  <td className="muted">{p.sku || '-'}</td>
                  <td>{p.category || '-'}</td>
                  <td style={{ fontWeight: 750 }}>{formatMoneyLKR(p.price)}</td>
                  <td>{p.stock}</td>
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
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="muted">
                    No products found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="card content-card">
          <div className="toolbar" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontWeight: 850 }}>
              {editingId ? (editingId === '__new__' ? 'Add Product' : 'Edit Product') : 'Select a product'}
            </div>
            {editingId ? (
              <button className="btn" type="button" onClick={cancel}>
                Cancel
              </button>
            ) : null}
          </div>

          {editingId ? (
            <form onSubmit={onSave} className="form-grid">
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
                <input
                  className="input"
                  value={form.category}
                  onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}
                  placeholder="T-Shirts / Jackets / Pants..."
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
                <div className="field-label">Image URL (optional)</div>
                <input
                  className="input"
                  value={form.imageUrl}
                  onChange={(e) => setForm((s) => ({ ...s, imageUrl: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
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
        <div className="card content-card">
          <div className="toolbar" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontWeight: 850 }}>Item Details</div>
            <button className="btn" type="button" onClick={() => setSelected(null)}>
              Close
            </button>
          </div>
          <div className="grid" style={{ gap: 10 }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ width: 120, height: 120, borderRadius: 14, overflow: 'hidden', background: 'rgba(255,255,255,0.04)', flexShrink: 0 }}>
                {selected.imageUrl ? (
                  <img src={selected.imageUrl} alt={selected.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : null}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 900, fontSize: 16 }}>{selected.name}</div>
                <div className="muted" style={{ marginTop: 4 }}>
                  {selected.sku ? `SKU: ${selected.sku}` : ''} {selected.category ? ` · ${selected.category}` : ''}
                </div>
                {selected.subtitle ? <div className="muted" style={{ marginTop: 6 }}>{selected.subtitle}</div> : null}
                {selected.collection ? <div className="muted" style={{ marginTop: 2 }}>{selected.collection}</div> : null}
                <div style={{ marginTop: 8, fontWeight: 800 }}>
                  {formatMoneyLKR(selected.price)} <span className="muted" style={{ fontWeight: 600 }}>· stock {selected.stock}</span>
                </div>
              </div>
            </div>

            {selected.description ? (
              <div>
                <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Description</div>
                <div style={{ lineHeight: 1.55 }}>{selected.description}</div>
              </div>
            ) : null}

            {selected.details?.length ? (
              <div>
                <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Details</div>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {selected.details.map((d) => (
                    <li key={d} style={{ marginBottom: 4 }}>{d}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="toolbar" style={{ flexWrap: 'wrap', gap: 10 }}>
              {selected.sizes?.length ? (
                <div className="muted" style={{ fontSize: 12 }}>Sizes: {selected.sizes.join(', ')}</div>
              ) : null}
              {selected.colors?.length ? (
                <div className="muted" style={{ fontSize: 12 }}>Colors: {selected.colors.map((c) => c.name).join(', ')}</div>
              ) : null}
            </div>

            {selected.images?.length ? (
              <div>
                <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Images</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {selected.images.slice(0, 8).map((url) => (
                    <div key={url} style={{ width: 86, height: 86, borderRadius: 12, overflow: 'hidden', background: 'rgba(255,255,255,0.04)' }}>
                      <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
