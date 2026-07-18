const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const result = await query(
      'SELECT * FROM users WHERE username = $1 AND is_active = true',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      await query(
        'INSERT INTO login_history (user_id, status, ip_address) VALUES ($1, $2, $3)',
        [user.id, 'failed', req.ip]
      );
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await query(
      'INSERT INTO login_history (user_id, status, ip_address) VALUES ($1, $2, $3)',
      [user.id, 'success', req.ip]
    );

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Change Password
router.post('/change-password', async (req, res, next) => {
  try {
    const { user_id, old_password, new_password } = req.body;

    const result = await query('SELECT * FROM users WHERE id = $1', [user_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(old_password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Old password incorrect' });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, user_id]);

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
