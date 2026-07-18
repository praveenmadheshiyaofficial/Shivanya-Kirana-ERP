const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// Get Inventory
router.get('/', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, name, sku, barcode, category_id, current_stock, minimum_stock,
              purchase_price, selling_price, mrp
       FROM products
       ORDER BY name ASC`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Stock Adjustment
router.post('/adjust', async (req, res, next) => {
  try {
    const { product_id, adjustment_quantity, reason } = req.body;

    await query(
      `INSERT INTO stock_adjustments (product_id, adjustment_quantity, reason, adjusted_at)
       VALUES ($1, $2, $3, NOW())`,
      [product_id, adjustment_quantity, reason]
    );

    await query(
      'UPDATE products SET current_stock = current_stock + $1 WHERE id = $2',
      [adjustment_quantity, product_id]
    );

    res.json({ message: 'Stock adjusted successfully' });
  } catch (err) {
    next(err);
  }
});

// Get Low Stock Products
router.get('/low-stock', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, name, sku, barcode, current_stock, minimum_stock
       FROM products
       WHERE current_stock <= minimum_stock
       ORDER BY current_stock ASC`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
