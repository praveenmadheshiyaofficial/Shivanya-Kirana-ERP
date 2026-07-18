const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// Daily Sales Report
router.get('/sales/daily', async (req, res, next) => {
  try {
    const { date } = req.query;
    const result = await query(
      `SELECT DATE(bill_date) as date, COUNT(*) as total_bills, SUM(total_amount) as total_sale
       FROM bills
       WHERE DATE(bill_date) = $1
       GROUP BY DATE(bill_date)`,
      [date]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Monthly Sales Report
router.get('/sales/monthly', async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const result = await query(
      `SELECT DATE(bill_date) as date, SUM(total_amount) as total_sale
       FROM bills
       WHERE EXTRACT(MONTH FROM bill_date) = $1 AND EXTRACT(YEAR FROM bill_date) = $2
       GROUP BY DATE(bill_date)
       ORDER BY date ASC`,
      [month, year]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Product Wise Sales
router.get('/sales/product-wise', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT p.id, p.name, SUM(bi.quantity) as total_quantity, SUM(bi.total_amount) as total_sale
       FROM bill_items bi
       JOIN products p ON bi.product_id = p.id
       GROUP BY p.id, p.name
       ORDER BY total_sale DESC`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Profit Report
router.get('/profit', async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    const result = await query(
      `SELECT
        SUM(b.total_amount) as total_revenue,
        SUM(bi.quantity * p.purchase_price) as total_cost,
        SUM(b.total_amount - (bi.quantity * p.purchase_price)) as total_profit
       FROM bills b
       JOIN bill_items bi ON b.id = bi.bill_id
       JOIN products p ON bi.product_id = p.id
       WHERE DATE(b.bill_date) BETWEEN $1 AND $2`,
      [start_date, end_date]
    );
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
