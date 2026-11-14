// Product catalog and stock. DATABASE_URL enables PostgreSQL; otherwise use local JSON.
const fs = require('fs');
const path = require('path');
const { isPostgresEnabled, listRecords, mutateRecords } = require('./pgStore');

const DB_PATH = path.join(__dirname, '..', 'data', 'products.json');
const DEFAULT_PRODUCTS = require('./productsCatalog.json');

function readLocalProducts() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      writeLocalProducts(DEFAULT_PRODUCTS);
      return DEFAULT_PRODUCTS;
    }
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8') || '[]');
  } catch (error) {
    if (error.code === 'ENOENT') {
      writeLocalProducts(DEFAULT_PRODUCTS);
      return DEFAULT_PRODUCTS;
    }
    console.error('Error reading products:', error);
    return DEFAULT_PRODUCTS;
  }
}

function writeLocalProducts(products) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(products, null, 2));
}

async function readProducts() {
  return isPostgresEnabled() ? listRecords('products') : readLocalProducts();
}

async function writeProducts(products) {
  if (isPostgresEnabled()) return mutateRecords('products', (records) => records.splice(0, records.length, ...products));
  writeLocalProducts(products);
}

async function findProductById(id) {
  const products = await readProducts();
  return products.find((product) => String(product.id) === String(id)) || null;
}

async function addProduct(product) {
  if (isPostgresEnabled()) return mutateRecords('products', (products) => { products.unshift(product); return product; });
  const products = readLocalProducts();
  products.unshift(product);
  writeLocalProducts(products);
  return product;
}

async function updateProduct(id, updates) {
  const update = (products) => {
    const index = products.findIndex((product) => String(product.id) === String(id));
    if (index === -1) return null;
    products[index] = { ...products[index], ...updates, updatedAt: new Date().toISOString() };
    return products[index];
  };
  if (isPostgresEnabled()) return mutateRecords('products', update);
  const products = readLocalProducts();
  const result = update(products);
  if (result) writeLocalProducts(products);
  return result;
}

async function deleteProduct(id) {
  const remove = (products) => {
    const index = products.findIndex((product) => String(product.id) === String(id));
    if (index === -1) return false;
    products.splice(index, 1);
    return true;
  };
  if (isPostgresEnabled()) return mutateRecords('products', remove);
  const products = readLocalProducts();
  const result = remove(products);
  if (result) writeLocalProducts(products);
  return result;
}

function validateAndDeduct(products, items) {
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
    const product = products.find((item) => String(item.id) === id && item.isActive !== false);
    if (!product) {
      const error = new Error('A product in your cart is no longer available. Please refresh your cart.');
      error.statusCode = 400;
      throw error;
    }
    const availableStock = Number(product.stock || 0);
    if (availableStock < requestedQty) {
      const error = new Error(`Item "${product.name}" is out of stock! Requested: ${requestedQty}, Available: ${availableStock}.`);
      error.statusCode = 400;
      throw error;
    }
    product.stock = availableStock - requestedQty;
    canonicalItems.push({ id: product.id, name: product.name, price: Number(product.price), quantity: requestedQty });
  }
  return canonicalItems;
}

async function verifyAndDeductStock(items) {
  if (isPostgresEnabled()) return mutateRecords('products', (products) => validateAndDeduct(products, items));
  const products = readLocalProducts();
  const canonicalItems = validateAndDeduct(products, items);
  writeLocalProducts(products);
  return canonicalItems;
}

async function restoreStock(items) {
  const restore = (products) => {
    for (const item of items) {
      const product = products.find((candidate) =>
        String(candidate.id) === String(item.id) || candidate.name.toLowerCase() === (item.name || '').toLowerCase()
      );
      if (product) product.stock = (Number(product.stock) || 0) + Number(item.quantity || 1);
    }
  };
  if (isPostgresEnabled()) return mutateRecords('products', restore);
  const products = readLocalProducts();
  restore(products);
  writeLocalProducts(products);
}

module.exports = {
  DEFAULT_PRODUCTS,
  readProducts,
  writeProducts,
  findProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  verifyAndDeductStock,
  restoreStock
};
