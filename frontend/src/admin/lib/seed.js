import { readJson, todayISO, uid, writeJson } from './storage';

function daysAgoISO(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function ensureSeedData() {
  const existing = readJson('seeded', false);
  if (existing) return;

  const products = [
    {
      id: uid('prod'),
      name: 'Oversized T-Shirt (Black)',
      sku: 'TS-BLK-OS',
      category: 'T-Shirts',
      price: 3500,
      cost: 2100,
      stock: 24,
      imageUrl: '',
    },
    {
      id: uid('prod'),
      name: 'Denim Jacket (Blue)',
      sku: 'JK-DNM-BLU',
      category: 'Jackets',
      price: 12500,
      cost: 7800,
      stock: 8,
      imageUrl: '',
    },
    {
      id: uid('prod'),
      name: 'Cargo Pants (Olive)',
      sku: 'PT-CGO-OLV',
      category: 'Pants',
      price: 8900,
      cost: 5400,
      stock: 14,
      imageUrl: '',
    },
  ];

  const [p1, p2, p3] = products;
  const orders = [
    {
      id: uid('ord'),
      createdAt: daysAgoISO(0),
      customerName: 'Nimal Perera',
      customerPhone: '07x xxx xxxx',
      status: 'order pending',
      items: [
        { productId: p1.id, name: p1.name, qty: 2, price: p1.price, cost: p1.cost },
      ],
    },
    {
      id: uid('ord'),
      createdAt: daysAgoISO(1),
      customerName: 'Amaya Silva',
      customerPhone: '07x xxx xxxx',
      status: 'order delivered',
      items: [
        { productId: p2.id, name: p2.name, qty: 1, price: p2.price, cost: p2.cost },
        { productId: p1.id, name: p1.name, qty: 1, price: p1.price, cost: p1.cost },
      ],
    },
    {
      id: uid('ord'),
      createdAt: daysAgoISO(9),
      customerName: 'Kasun Jayasekara',
      customerPhone: '07x xxx xxxx',
      status: 'order received',
      items: [{ productId: p3.id, name: p3.name, qty: 1, price: p3.price, cost: p3.cost }],
    },
  ];

  const expenses = [
    { id: uid('exp'), date: todayISO(), category: 'Ads', note: 'Meta ads', amount: 2500 },
    { id: uid('exp'), date: daysAgoISO(2), category: 'Packaging', note: 'Bags + stickers', amount: 1800 },
    { id: uid('exp'), date: daysAgoISO(10), category: 'Delivery', note: 'Courier charges', amount: 3200 },
  ];

  writeJson('products', products);
  writeJson('orders', orders);
  writeJson('expenses', expenses);
  writeJson('seeded', true);
}

