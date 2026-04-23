const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { getPrisma } = require('../utils/prisma');

const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}

async function register(req, res) {
  const data = registerSchema.parse(req.body);
  const prisma = getPrisma();

  const exists = await prisma.user.findUnique({ where: { email: data.email } });
  if (exists) return res.status(409).json({ error: 'Email already registered.' });

  const hashed = await bcrypt.hash(data.password, 12);
  const user = await prisma.user.create({
    data: { ...data, password: hashed },
    select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true },
  });

  const token = signToken(user.id);
  res.status(201).json({ message: 'Account created!', token, user });
}

async function login(req, res) {
  const data = loginSchema.parse(req.body);
  const prisma = getPrisma();

  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials.' });

  const valid = await bcrypt.compare(data.password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials.' });

  const token = signToken(user.id);
  const { password, ...safeUser } = user;
  res.json({ message: 'Login successful!', token, user: safeUser });
}

async function getMe(req, res) {
  const { password, ...safeUser } = req.user;
  res.json({ user: safeUser });
}

async function updateProfile(req, res) {
  const prisma = getPrisma();
  const { name, phone } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { name, phone },
    select: { id: true, email: true, name: true, phone: true, role: true },
  });
  res.json({ user });
}

module.exports = { register, login, getMe, updateProfile };
