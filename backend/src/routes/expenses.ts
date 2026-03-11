import { Router } from 'express';
import Expense from '../models/Expense.js';
import { authRequired } from '../middleware/auth.js';
import { assertTeamMember } from '../utils/teamAccess.js';

const router = Router();
router.use(authRequired);

router.get('/', async (req, res) => {
  const { team } = req.query;
  if (!team || typeof team !== 'string') return res.status(400).json({ error: 'team query required' });
  const access = await assertTeamMember(team, req.userId);
  if ('error' in access) return res.status(access.status).json({ error: access.error });
  const expenses = await Expense.find({ team })
    .populate('user', 'name email')
    .sort({ date: -1 });
  res.json(expenses);
});

router.post('/', async (req, res) => {
  const { team, amount, category, description, date } = req.body;
  const access = await assertTeamMember(team, req.userId);
  if ('error' in access) return res.status(access.status).json({ error: access.error });
  if (amount == null || !category) {
    return res.status(400).json({ error: 'amount and category required' });
  }
  const expense = await Expense.create({
    team,
    user: req.userId,
    amount: Number(amount),
    category,
    description: description || '',
    date: date ? new Date(date) : new Date(),
  });
  await expense.populate('user', 'name email');
  res.status(201).json(expense);
});

router.get('/:id', async (req, res) => {
  const expense = await Expense.findById(req.params.id).populate('user', 'name email');
  if (!expense) return res.status(404).json({ error: 'Expense not found' });
  const access = await assertTeamMember(expense.team, req.userId);
  if ('error' in access) return res.status(access.status).json({ error: access.error });
  res.json(expense);
});

router.put('/:id', async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) return res.status(404).json({ error: 'Expense not found' });
  const access = await assertTeamMember(expense.team, req.userId);
  if ('error' in access) return res.status(access.status).json({ error: access.error });
  const { amount, category, description, date } = req.body;
  if (amount != null) expense.amount = Number(amount);
  if (category) expense.category = category;
  if (description != null) expense.description = description;
  if (date) expense.date = new Date(date);
  await expense.save();
  await expense.populate('user', 'name email');
  res.json(expense);
});

router.delete('/:id', async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) return res.status(404).json({ error: 'Expense not found' });
  const access = await assertTeamMember(expense.team, req.userId);
  if ('error' in access) return res.status(access.status).json({ error: access.error });
  if (access.role !== 'admin' && expense.user.toString() !== req.userId) {
    return res.status(403).json({ error: 'Only admin or expense owner can delete' });
  }
  await expense.deleteOne();
  res.json({ ok: true });
});

export default router;
