import { Router } from 'express';
import Budget from '../models/Budget.js';
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

  const budgets = await Budget.find({ team });
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const expenses = await Expense.aggregate([
    { $match: { team: access.team._id, date: { $gte: startOfMonth } } },
    { $group: { _id: '$category', spent: { $sum: '$amount' } } },
  ]);
  const spentMap = Object.fromEntries(expenses.map((e) => [e._id, e.spent]));

  res.json(
    budgets.map((b) => ({
      ...b.toObject(),
      spent: spentMap[b.category] || 0,
      remaining: b.limit - (spentMap[b.category] || 0),
    }))
  );
});

router.post('/', async (req, res) => {
  const { team, category, limit, period } = req.body;
  const access = await assertTeamMember(team, req.userId);
  if ('error' in access) return res.status(access.status).json({ error: access.error });
  if (access.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  if (!category || limit == null) {
    return res.status(400).json({ error: 'category and limit required' });
  }
  const budget = await Budget.create({ team, category, limit: Number(limit), period });
  res.status(201).json(budget);
});

router.put('/:id', async (req, res) => {
  const budget = await Budget.findById(req.params.id);
  if (!budget) return res.status(404).json({ error: 'Budget not found' });
  const access = await assertTeamMember(budget.team, req.userId);
  if ('error' in access) return res.status(access.status).json({ error: access.error });
  if (access.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  const { category, limit, period } = req.body;
  if (category) budget.category = category;
  if (limit != null) budget.limit = Number(limit);
  if (period) budget.period = period;
  await budget.save();
  res.json(budget);
});

router.delete('/:id', async (req, res) => {
  const budget = await Budget.findById(req.params.id);
  if (!budget) return res.status(404).json({ error: 'Budget not found' });
  const access = await assertTeamMember(budget.team, req.userId);
  if ('error' in access) return res.status(access.status).json({ error: access.error });
  if (access.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  await budget.deleteOne();
  res.json({ ok: true });
});

export default router;
