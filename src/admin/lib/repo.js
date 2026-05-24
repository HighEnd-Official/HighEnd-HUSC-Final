import { readJson, uid, writeJson } from './storage';

export function getProducts() {
  return readJson('products', []);
}

export function saveProducts(products) {
  writeJson('products', products);
}

export function upsertProduct(product) {
  const products = getProducts();
  const idx = products.findIndex((p) => p.id === product.id);
  if (idx >= 0) {
    products[idx] = product;
  } else {
    products.unshift({ ...product, id: product.id || uid('prod') });
  }
  saveProducts(products);
  return products;
}

export function deleteProduct(productId) {
  const products = getProducts().filter((p) => p.id !== productId);
  saveProducts(products);
  return products;
}

export function getOrders() {
  return readJson('orders', []);
}

export function saveOrders(orders) {
  writeJson('orders', orders);
}

export function updateOrderStatus(orderId, status) {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx >= 0) {
    orders[idx] = { ...orders[idx], status };
  }
  saveOrders(orders);
  return orders;
}

export function getExpenses() {
  return readJson('expenses', []);
}

export function saveExpenses(expenses) {
  writeJson('expenses', expenses);
}

export function addExpense(expense) {
  const expenses = getExpenses();
  expenses.unshift({ ...expense, id: uid('exp') });
  saveExpenses(expenses);
  return expenses;
}

