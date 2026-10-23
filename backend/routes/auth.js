const express = require('express');
const bcrypt = require('bcryptjs');
const { users } = require('../store');

const router = express.Router();

function sanitizeUser(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    role: user.role,
  };
}

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username/email and password are required.' });
  }

  const user = users.find(
    (entry) =>
      entry.username.toLowerCase() === String(username).trim().toLowerCase() ||
      entry.email.toLowerCase() === String(username).trim().toLowerCase()
  );

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const valid = bcrypt.compareSync(String(password), user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  req.session.user = sanitizeUser(user);
  return res.json({ user: req.session.user, message: 'Login successful.' });
});

router.post('/register', (req, res) => {
  const { fullName, username, email, password } = req.body;

  if (!fullName || !username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const exists = users.some(
    (user) =>
      user.username.toLowerCase() === String(username).trim().toLowerCase() ||
      user.email.toLowerCase() === String(email).trim().toLowerCase()
  );

  if (exists) {
    return res.status(409).json({ message: 'User already exists.' });
  }

  const nextId = users.length ? Math.max(...users.map((user) => user.id)) + 1 : 1;
  const user = {
    id: nextId,
    fullName: String(fullName).trim(),
    username: String(username).trim(),
    email: String(email).trim(),
    passwordHash: bcrypt.hashSync(String(password), 10),
    role: 'staff',
  };

  users.push(user);
  req.session.user = sanitizeUser(user);
  return res.status(201).json({ user: req.session.user, message: 'Registration successful.' });
});

router.get('/me', (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  return res.json({ user: req.session.user });
});

router.post('/logout', (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({ message: 'Could not logout.' });
    }

    return res.json({ ok: true });
  });
});

module.exports = router;
