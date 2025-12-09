require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { sequelize, User, Project, Task } = require('./database/setup');
const { requireAuth, requireManager, requireAdmin } = require('./middleware/auth');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

/* ===========================
   AUTH ROUTES
=========================== */

app.post('/api/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: role || 'employee'
  });

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  res.json({ token, user });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  res.json({ token, user });
});

app.post('/api/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

/* ===========================
   USER ROUTES (ADMIN)
=========================== */

app.get('/api/users', requireAuth, requireAdmin, async (req, res) => {
  const users = await User.findAll({ attributes: ['id', 'name', 'email', 'role'] });
  res.json(users);
});

/* ===========================
   PROJECT ROUTES
=========================== */

app.post('/api/projects', requireAuth, requireManager, async (req, res) => {
  const project = await Project.create(req.body);
  res.json(project);
});

app.put('/api/projects/:id', requireAuth, requireManager, async (req, res) => {
  await Project.update(req.body, { where: { id: req.params.id } });
  res.json({ message: 'Project updated' });
});

app.delete('/api/projects/:id', requireAuth, requireAdmin, async (req, res) => {
  await Project.destroy({ where: { id: req.params.id } });
  res.json({ message: 'Project deleted' });
});

/* ===========================
   TASK ROUTES
=========================== */

app.post('/api/projects/:id/tasks', requireAuth, requireManager, async (req, res) => {
  const task = await Task.create({
    ...req.body,
    projectId: req.params.id
  });
  res.json(task);
});

app.delete('/api/tasks/:id', requireAuth, requireManager, async (req, res) => {
  await Task.destroy({ where: { id: req.params.id } });
  res.json({ message: 'Task deleted' });
});

/* ===========================
   SERVER
=========================== */

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
});
