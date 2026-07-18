const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// Create Bill
router.post('/create', async (req, res, next) => {
  try {
    const { customer_id, items, discount, payment_method, notes } = req.body;

    const billResult = await query(
      `INSERT INTO bills (customer_id, total_amount, discount, payment_method, notes, bill_date, status)
       VALUES ($1, $2, $3, $4, $5, NOW(), 'completed')
       RETURNING *`,
      [customer_id || null, 0, discount || 0, payment_method, notes || '']
    );

    const bill = billResult.rows[0];
    let totalAmount = 0;

    for (const item of items) {
      const { product_id, quantity, unit_price } = item;
      const itemTotal = quantity * unit_price;
      totalAmount += itemTotal;

      await query(
        `INSERT INTO bill_items (bill_id, product_id, quantity, unit_price, total_amount)
         VALUES ($1, $2, $3, $4, $5)`,
        [bill.id, product_id, quantity, unit_price, itemTotal]
      );

      await query(
        'UPDATE products SET current_stock = current_stock - $1 WHERE id = $2',
        [quantity, product_id]
      );
    }

    await query(
      'UPDATE bills SET total_amount = $1 WHERE id = $2',
      [totalAmount - (discount || 0), bill.id]
    );

    res.status(201).json({ message: 'Bill created successfully', bill_id: bill.id });
  } catch (err) {
    next(err);
  }
});

// Get Bill
router.get('/:id', async (req, res, next) => {
  try {
    const billResult = await query('SELECT * FROM bills WHERE id = $1', [req.params.id]);
    if (billResult.rows.length === 0) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    const itemsResult = await query(
      'SELECT * FROM bill_items WHERE bill_id = $1',
      [req.params.id]
    );

    res.json({ bill: billResult.rows[0], items: itemsResult.rows });
  } catch (err) {
    next(err);
  }
});

// Hold Bill
router.post('/hold/:id', async (req, res, next) => {
  try {
    await query('UPDATE bills SET status = $1 WHERE id = $2', ['hold', req.params.id]);
    res.json({ message: 'Bill held successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
