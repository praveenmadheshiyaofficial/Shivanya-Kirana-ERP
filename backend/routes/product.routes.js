const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// Get All Products
router.get('/', async (req, res, next) => {
  try {
    const { search, category, brand, limit = 50, offset = 0 } = req.query;
    let queryStr = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (search) {
      queryStr += ` AND (name ILIKE $${params.length + 1} OR barcode = $${params.length + 2} OR sku = $${params.length + 3})`;
      params.push(`%${search}%`, search, search);
    }
    if (category) {
      queryStr += ` AND category_id = $${params.length + 1}`;
      params.push(category);
    }
    if (brand) {
      queryStr += ` AND brand_id = $${params.length + 1}`;
      params.push(brand);
    }

    queryStr += ` ORDER BY name ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await query(queryStr, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Get Single Product
router.get('/:id', async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Create Product
router.post('/', async (req, res, next) => {
  try {
    const {
      name, barcode, sku, category_id, brand_id, unit,
      purchase_price, selling_price, mrp, gst, minimum_stock, expiry_date
    } = req.body;

    const result = await query(
      `INSERT INTO products (name, barcode, sku, category_id, brand_id, unit, purchase_price, selling_price, mrp, gst, minimum_stock, expiry_date, current_stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 0)
       RETURNING *`,
      [name, barcode, sku, category_id, brand_id, unit, purchase_price, selling_price, mrp, gst, minimum_stock, expiry_date]
    );

    res.status(201).json({
      message: 'Product created successfully',
      product: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
});

// Update Product
router.put('/:id', async (req, res, next) => {
  try {
    const updates = req.body;
    const setClause = Object.keys(updates)
      .map((key, i) => `${key} = $${i + 1}`)
      .join(', ');
    const values = [...Object.values(updates), req.params.id];

    const result = await query(
      `UPDATE products SET ${setClause}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`,
      values
    );

    res.json({ message: 'Product updated successfully', product: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// Delete Product
router.delete('/:id', async (req, res, next) => {
  try {
    await query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
