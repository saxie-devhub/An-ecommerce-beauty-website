// routes/products.js - Product Management & Catalog API
const express = require('express');
const crypto = require('crypto');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const {
  readProducts,
  findProductById,
  addProduct,
  updateProduct,
  deleteProduct
} = require('../utils/productsDb');
const {
  sanitizeHtml,
  validatePositiveNumber,
  validateInteger
} = require('../middleware/security');

const router = express.Router();

/**
 * GET /api/products - Get all products (Public)
 */
router.get('/', async (req, res) => {
  try {
    const products = (await readProducts()).filter((product) => product.isActive !== false);
    const { category, in_stock } = req.query;

    let filtered = products;
    if (category && category !== 'all') {
      filtered = filtered.filter(
        (p) => (p.category || '').toLowerCase() === category.toLowerCase()
      );
    }
    if (in_stock === 'true') {
      filtered = filtered.filter((p) => Number(p.stock) > 0);
    }

    return res.status(200).json({
      success: true,
      count: filtered.length,
      products: filtered
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    return res.status(500).json({ error: 'Failed to retrieve products.' });
  }
});

/**
 * GET /api/products/:id - Get single product
 */
router.get('/:id', async (req, res) => {
  try {
    const product = await findProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    return res.status(200).json({ product });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve product.' });
  }
});

/**
 * POST /api/products - (Admin Only) Add a new product
 */
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, price, category, description, stock, imageUrl } = req.body || {};

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Product name must be at least 2 characters.' });
    }
    if (!validatePositiveNumber(price)) {
      return res.status(400).json({ error: 'Product price must be a valid positive number.' });
    }
    if (!validateInteger(stock, 0)) {
      return res.status(400).json({ error: 'Stock quantity must be a non-negative whole number.' });
    }

    const newProduct = {
      id: `prod_${crypto.randomUUID()}`,
      name: sanitizeHtml(name.trim()),
      price: Number(price),
      category: sanitizeHtml((category || 'Accessories').trim()),
      description: sanitizeHtml((description || '').trim()),
      stock: Number(stock),
      imageUrl: (imageUrl || '/images/patch.jpeg').trim(),
      isActive: true,
      createdAt: new Date().toISOString()
    };

    await addProduct(newProduct);

    return res.status(201).json({
      message: 'Product added successfully! ✨',
      product: newProduct
    });
  } catch (err) {
    console.error('Error adding product:', err);
    return res.status(500).json({ error: 'Failed to add product.' });
  }
});

/**
 * PUT /api/products/:id - (Admin Only) Edit an existing product
 */
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const productId = req.params.id;
    const existing = await findProductById(productId);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const { name, price, category, description, stock, imageUrl, isActive } = req.body || {};
    const updates = {};

    if (name) updates.name = sanitizeHtml(name.trim());
    if (price !== undefined) {
      if (!validatePositiveNumber(price)) {
        return res.status(400).json({ error: 'Price must be a positive number.' });
      }
      updates.price = Number(price);
    }
    if (category) updates.category = sanitizeHtml(category.trim());
    if (description !== undefined) updates.description = sanitizeHtml(description.trim());
    if (stock !== undefined) {
      if (!validateInteger(stock, 0)) {
        return res.status(400).json({ error: 'Stock must be a non-negative integer.' });
      }
      updates.stock = Number(stock);
    }
    if (imageUrl) updates.imageUrl = imageUrl.trim();
    if (isActive !== undefined) updates.isActive = Boolean(isActive);

    const updated = await updateProduct(productId, updates);

    return res.status(200).json({
      message: 'Product updated successfully!',
      product: updated
    });
  } catch (err) {
    console.error('Error updating product:', err);
    return res.status(500).json({ error: 'Failed to update product.' });
  }
});

/**
 * DELETE /api/products/:id - (Admin Only) Delete a product
 */
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const deleted = await deleteProduct(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    return res.status(200).json({ message: 'Product deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete product.' });
  }
});

module.exports = router;
