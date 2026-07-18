const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// Create Purchase Invoice
router.post('/create', async (req, res, next) => {
  try {
    const { supplier_id, items, total_amount, invoice_number, invoice_date } = req.body;

    const result = await query(
      `INSERT INTO purchases (supplier_id, invoice_number, invoice_date, total_amount, status, created_at)
       VALUES ($1, $2, $3, $4, 'completed', NOW())
       RETURNING *`,
      [supplier_id, invoice_number, invoice_date, total_amount]
    );

    const purchase = result.rows[0];

    for (const item of items) {
      const { product_id, quantity, unit_price } = item;

      await query(
        `INSERT INTO purchase_items (purchase_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [purchase.id, product_id, quantity, unit_price]
      );

      await query(
        'UPDATE products SET current_stock = current_stock + $1 WHERE id = $2',
        [quantity, product_id]
      );
    }

    res.status(201).json({ message: 'Purchase created successfully', purchase_id: purchase.id });
  } catch (err) {
    next(err);
  }
});

// Get Purchase
router.get('/:id', async (req, res, next) => {
  try {
    const purchaseResult = await query('SELECT * FROM purchases WHERE id = $1', [req.params.id]);
    if (purchaseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Purchase not found' });
    }

    const itemsResult = await query(
      'SELECT * FROM purchase_items WHERE purchase_id = $1',
      [req.params.id]
    );

    res.json({ purchase: purchaseResult.rows[0], items: itemsResult.rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
