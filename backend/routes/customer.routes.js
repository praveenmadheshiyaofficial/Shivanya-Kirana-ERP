const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// Get All Customers
router.get('/', async (req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM customers ORDER BY name ASC'
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Search Customer by Name or Mobile
router.get('/search/:searchQuery', async (req, res, next) => {
  try {
    const searchQuery = req.params.searchQuery;
    const result = await query(
      'SELECT * FROM customers WHERE name ILIKE $1 OR mobile LIKE $2',
      [`%${searchQuery}%`, `%${searchQuery}%`]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Get Customer Details with Purchase History
router.get('/:id', async (req, res, next) => {
  try {
    const customerResult = await query(
      'SELECT * FROM customers WHERE id = $1',
      [req.params.id]
    );

    if (customerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const historyResult = await query(
      'SELECT * FROM bills WHERE customer_id = $1 ORDER BY bill_date DESC LIMIT 10',
      [req.params.id]
    );

    res.json({
      customer: customerResult.rows[0],
      purchase_history: historyResult.rows
    });
  } catch (err) {
    next(err);
  }
});

// Create Customer
router.post('/', async (req, res, next) => {
  try {
    const { name, mobile, address, email } = req.body;

    const result = await query(
      `INSERT INTO customers (name, mobile, address, email, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [name, mobile, address, email]
    );

    res.status(201).json({ message: 'Customer created', customer: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
