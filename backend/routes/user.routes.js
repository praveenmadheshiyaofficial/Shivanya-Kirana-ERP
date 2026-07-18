const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { query } = require('../config/database');

// Get All Users
router.get('/', async (req, res, next) => {
  try {
    const result = await query('SELECT id, username, full_name, email, role, is_active FROM users');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Create User
router.post('/', async (req, res, next) => {
  try {
    const { username, full_name, email, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO users (username, full_name, email, password, role, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id, username, full_name, email, role`,
      [username, full_name, email, hashedPassword, role]
    );

    res.status(201).json({ message: 'User created', user: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
