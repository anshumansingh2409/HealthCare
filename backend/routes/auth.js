import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Register Route
router.post('/register', async (req, res) => {
  const { name, emailOrPhone, password, confirm_password } = req.body;

  if (!name || !emailOrPhone || !password || !confirm_password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (password !== confirm_password) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  try {
    const existingUser = await User.findOne({ emailOrPhone });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email/phone' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({ name, emailOrPhone, passwordHash });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { emailOrPhone, password } = req.body;

  if (!emailOrPhone || !password) {
    return res.status(400).json({ error: 'Email/Phone and password are required' });
  }

  try {
    const user = await User.findOne({ emailOrPhone });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user._id,
        name: user.name,
        emailOrPhone: user.emailOrPhone,
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'supersecretkey', {
      expiresIn: '2h',
    });

    res.json({
      message: 'Login successful',
      token,
      user: payload.user,
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

export default router;
