// utils/productsDb.js - Product Catalog & Inventory Store
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'products.json');

// Keep a complete storefront catalog available when the local data file is new.
const DEFAULT_PRODUCTS = require('./productsCatalog.json');

function readProducts() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      writeProducts(DEFAULT_PRODUCTS);
      return DEFAULT_PRODUCTS;
    }
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    if (err.code === 'ENOENT') {
      writeProducts(DEFAULT_PRODUCTS);
      return DEFAULT_PRODUCTS;
    }
    console.error('Error reading products:', err);
    return DEFAULT_PRODUCTS;
  }
}

function writeProducts(products) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(products, null, 2));
}

function findProductById(id) {
  const products = readProducts();
  return products.find((p) => String(p.id) === String(id));
}

function addProduct(product) {
  const products = readProducts();
  products.unshift(product);
  writeProducts(products);
  return product;
}

function updateProduct(id, updates) {
  const products = readProducts();
  const index = products.findIndex((p) => String(p.id) === String(id));
  if (index === -1) return null;

  products[index] = {
    ...products[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  writeProducts(products);
  return products[index];
}

function deleteProduct(id) {
  const products = readProducts();
  const index = products.findIndex((p) => String(p.id) === String(id));
  if (index === -1) return false;
  products.splice(index, 1);
  writeProducts(products);
  return true;
}

/**
 * Atomic stock check and deduction for an order's items
 * Throws error if any item is out of stock or insufficient
 */
function verifyAndDeductStock(items) {
  const products = readProducts();
  const deductedProducts = JSON.parse(JSON.stringify(products));

  const quantities = new Map();
  for (const item of items) {
    const id = String(item?.id || '');
    const quantity = Number(item?.quantity);
    if (!id || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      const error = new Error('Each cart item must have a valid product and quantity (1–99).');
      error.statusCode = 400;
      throw error;
    }
    quantities.set(id, (quantities.get(id) || 0) + quantity);
  }
  const canonicalItems = [];
  for (const [id, requestedQty] of quantities) {
    const product = deductedProducts.find((p) => String(p.id) === id && p.isActive !== false);
    if (!product) {
      const error = new Error('A product in your cart is no longer available. Please refresh your cart.');
      error.statusCode = 400;
      throw error;
    }
    const availableStock = Number(product.stock || 0);

    if (availableStock < requestedQty) {
      const error = new Error(
        `Item "${product.name}" is out of stock! Requested: ${requestedQty}, Available: ${availableStock}.`
      );
      error.statusCode = 400;
      throw error;
    }

    product.stock = availableStock - requestedQty;
    canonicalItems.push({ id: product.id, name: product.name, price: Number(product.price), quantity: requestedQty });
  }

  writeProducts(deductedProducts);
  return canonicalItems;
}

/**
 * Restores inventory if an order is cancelled
 */
function restoreStock(items) {
  const products = readProducts();
  for (const item of items) {
    const product = products.find(
      (p) => String(p.id) === String(item.id) || p.name.toLowerCase() === (item.name || '').toLowerCase()
    );
    if (product) {
      product.stock = (Number(product.stock) || 0) + Number(item.quantity || 1);
    }
  }
  writeProducts(products);
}

module.exports = {
  readProducts,
  writeProducts,
  findProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  verifyAndDeductStock,
  restoreStock
};
