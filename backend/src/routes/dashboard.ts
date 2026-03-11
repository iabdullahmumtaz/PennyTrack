import { Router } from 'express';
import Expense from '../models/Expense.js';
import { authRequired } from '../middleware/auth.js';
import { assertTeamMember } from '../utils/teamAccess.js';

const router = Router();
router.use(authRequired);

router.get('/stats', async (req, res) => {
  const { team } = req.query;
  if (!team || typeof team !== 'string') return res.status(400).json({ error: 'team query required' });
  const access = await assertTeamMember(team, req.userId);
  if ('error' in access) return res.status(access.status).json({ error: access.error });

  const teamId = access.team._id;
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [byCategory, byMonth, recent] = await Promise.all([
    Expense.aggregate([
      { $match: { team: teamId } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),
    Expense.aggregate([
      { $match: { team: teamId, date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { y: { $year: '$date' }, m: { $month: '$date' } },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.y': 1, '_id.m': 1 } },
    ]),
    Expense.find({ team: teamId }).sort({ date: -1 }).limit(8).populate('user', 'name'),
  ]);

  const monthly = byMonth.map((r) => ({
    label: `${r._id.y}-${String(r._id.m).padStart(2, '0')}`,
    total: r.total,
  }));

  const totalSpent = byCategory.reduce((s, c) => s + c.total, 0);

  res.json({
    totalSpent,
    byCategory: byCategory.map((c) => ({ category: c._id, total: c.total, count: c.count })),
    monthly,
    recent,
  });
});

export default router;
