const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// Get Dashboard Stats
router.get('/stats', async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const salesResult = await query(
      'SELECT COALESCE(SUM(total_amount), 0) as total_sale FROM bills WHERE DATE(bill_date) = $1',
      [today]
    );

    const profitResult = await query(
      `SELECT COALESCE(SUM(
        (b.total_amount - (bi.quantity * p.purchase_price))
      ), 0) as total_profit
      FROM bills b
      JOIN bill_items bi ON b.id = bi.bill_id
      JOIN products p ON bi.product_id = p.id
      WHERE DATE(b.bill_date) = $1`,
      [today]
    );

    const productsResult = await query('SELECT COUNT(*) as count FROM products');
    const customersResult = await query('SELECT COUNT(*) as count FROM customers');
    
    const lowStockResult = await query(
      'SELECT COUNT(*) as count FROM products WHERE current_stock <= minimum_stock'
    );

    const outOfStockResult = await query(
      'SELECT COUNT(*) as count FROM products WHERE current_stock = 0'
    );

    const topProductsResult = await query(
      `SELECT p.id, p.name, SUM(bi.quantity) as total_quantity
       FROM bill_items bi
       JOIN products p ON bi.product_id = p.id
       WHERE DATE(bi.created_at) = $1
       GROUP BY p.id, p.name
       ORDER BY total_quantity DESC
       LIMIT 10`,
      [today]
    );

    res.json({
      today_sale: parseFloat(salesResult.rows[0].total_sale),
      today_profit: parseFloat(profitResult.rows[0].total_profit),
      total_products: parseInt(productsResult.rows[0].count),
      total_customers: parseInt(customersResult.rows[0].count),
      low_stock_count: parseInt(lowStockResult.rows[0].count),
      out_of_stock_count: parseInt(outOfStockResult.rows[0].count),
      top_selling_products: topProductsResult.rows,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
