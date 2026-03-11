import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import teamRoutes from './routes/teams.js';
import expenseRoutes from './routes/expenses.js';
import budgetRoutes from './routes/budgets.js';
import exportRoutes from './routes/export.js';
import dashboardRoutes from './routes/dashboard.js';

const app = express();
const PORT = process.env.PORT || 6023;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pennytrack';

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5023' }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'PennyTrack' }));
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/dashboard', dashboardRoutes);

async function start() {
  await mongoose.connect(MONGODB_URI);
  console.log('[MongoDB] Connected');
  app.listen(PORT, () => console.log(`PennyTrack API on http://localhost:${PORT}`));
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
