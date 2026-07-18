const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// Get All Suppliers
router.get('/', async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM suppliers ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Get Supplier with Purchase History
router.get('/:id', async (req, res, next) => {
  try {
    const supplierResult = await query(
      'SELECT * FROM suppliers WHERE id = $1',
      [req.params.id]
    );

    if (supplierResult.rows.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    const purchaseResult = await query(
      'SELECT * FROM purchases WHERE supplier_id = $1 ORDER BY invoice_date DESC LIMIT 10',
      [req.params.id]
    );

    res.json({
      supplier: supplierResult.rows[0],
      purchases: purchaseResult.rows
    });
  } catch (err) {
    next(err);
  }
});

// Create Supplier
router.post('/', async (req, res, next) => {
  try {
    const { name, mobile, email, address, gst_number } = req.body;

    const result = await query(
      `INSERT INTO suppliers (name, mobile, email, address, gst_number, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [name, mobile, email, address, gst_number]
    );

    res.status(201).json({ message: 'Supplier created', supplier: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
