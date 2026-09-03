// utils/productsDb.js - Product Catalog & Inventory Store
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'products.json');

// Default initial catalog if products.json doesn't exist
const DEFAULT_PRODUCTS = [
  {
    id: 'prod_1',
    name: 'Hydrocolloid Cute Heart & Star Pimple Patches',
    price: 350,
    category: 'Skincare',
    description: 'Ultra-cute tea tree & salicylic acid infused hydrocolloid patches for glowing skin.',
    stock: 25,
    imageUrl: '/images/patch.jpeg',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_2',
    name: 'Sparkle Quilted Baddie Shoulder Bag',
    price: 1800,
    category: 'Bags',
    description: 'Chic, premium finish handbag to elevate every outfit with major baddie energy.',
    stock: 8,
    imageUrl: '/images/bag.jpeg',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_3',
    name: 'Gold Dipped Dainty Butterfly Earrings',
    price: 450,
    category: 'Jewelry',
    description: 'Hypoallergenic lightweight gold aesthetic earrings that never tarnish.',
    stock: 15,
    imageUrl: '/images/earrings.jpeg',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_4',
    name: '3D Faux Mink Wispy Cluster Lashes',
    price: 600,
    category: 'Lashes',
    description: 'Fluffy salon-quality DIY lash clusters with invisible lightweight band.',
    stock: 12,
    imageUrl: '/images/clusters.jpeg',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_5',
    name: 'Silky Velvet Oversized Hair Scrunchie',
    price: 250,
    category: 'Hair Accessories',
    description: 'Super soft anti-breakage hair scrunchie in gorgeous pastel pink tones.',
    stock: 20,
    imageUrl: '/images/scrunchie.jpeg',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_6',
    name: 'Layered Dainty Crystal Anklet',
    price: 400,
    category: 'Jewelry',
    description: 'Shimmering anklet that sparkles in natural sunlight, adjustable fit.',
    stock: 10,
    imageUrl: '/images/anklet.jpeg',
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

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

  for (const item of items) {
    const product = deductedProducts.find(
      (p) => String(p.id) === String(item.id) || p.name.toLowerCase() === (item.name || '').toLowerCase()
    );

    if (!product) {
      // If product id isn't in DB, allow if generic or throw
      continue;
    }

    const requestedQty = Number(item.quantity || 1);
    const availableStock = Number(product.stock || 0);

    if (availableStock < requestedQty) {
      const error = new Error(
        `Item "${product.name}" is out of stock! Requested: ${requestedQty}, Available: ${availableStock}.`
      );
      error.statusCode = 400;
      throw error;
    }

    product.stock = availableStock - requestedQty;
  }

  writeProducts(deductedProducts);
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
