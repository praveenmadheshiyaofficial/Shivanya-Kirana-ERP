const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// Record Daily Expense
router.post('/expense', async (req, res, next) => {
  try {
    const { amount, category, description, date } = req.body;

    const result = await query(
      `INSERT INTO expenses (amount, category, description, expense_date)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [amount, category, description, date]
    );

    res.status(201).json({ message: 'Expense recorded', expense: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// Record Income
router.post('/income', async (req, res, next) => {
  try {
    const { amount, source, description, date } = req.body;

    const result = await query(
      `INSERT INTO income (amount, source, description, income_date)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [amount, source, description, date]
    );

    res.status(201).json({ message: 'Income recorded', income: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// Get P&L Statement
router.get('/statement', async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    const result = await query(
      `SELECT
        (SELECT COALESCE(SUM(total_amount), 0) FROM bills WHERE DATE(bill_date) BETWEEN $1 AND $2) as total_revenue,
        (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE DATE(expense_date) BETWEEN $1 AND $2) as total_expenses,
        (SELECT COALESCE(SUM(amount), 0) FROM income WHERE DATE(income_date) BETWEEN $1 AND $2) as other_income`,
      [start_date, end_date]
    );

    const data = result.rows[0];
    const profit = data.total_revenue - data.total_expenses + data.other_income;

    res.json({
      total_revenue: data.total_revenue,
      total_expenses: data.total_expenses,
      other_income: data.other_income,
      net_profit: profit
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
