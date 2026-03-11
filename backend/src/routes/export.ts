import { Router } from 'express';
import PDFDocument from 'pdfkit';
import Expense from '../models/Expense.js';
import { authRequired } from '../middleware/auth.js';
import { assertTeamMember } from '../utils/teamAccess.js';

const router = Router();
router.use(authRequired);

router.get('/csv', async (req, res) => {
  const { team } = req.query;
  if (!team || typeof team !== 'string') return res.status(400).json({ error: 'team query required' });
  const access = await assertTeamMember(team, req.userId);
  if ('error' in access) return res.status(access.status).json({ error: access.error });

  const expenses = await Expense.find({ team }).populate('user', 'name email').sort({ date: -1 });
  const header = 'Date,Category,Amount,Description,User\n';
  const rows = expenses
    .map((e) => {
      const date = new Date(e.date).toISOString().slice(0, 10);
      const desc = `"${(e.description || '').replace(/"/g, '""')}"`;
      const user = e.user as { name?: string };
      return `${date},${e.category},${e.amount},${desc},${user?.name || ''}`;
    })
    .join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=expenses.csv');
  res.send(header + rows);
});

router.get('/pdf', async (req, res) => {
  const { team } = req.query;
  if (!team || typeof team !== 'string') return res.status(400).json({ error: 'team query required' });
  const access = await assertTeamMember(team, req.userId);
  if ('error' in access) return res.status(access.status).json({ error: access.error });

  const expenses = await Expense.find({ team }).populate('user', 'name email').sort({ date: -1 });
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=expenses.pdf');

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);
  doc.fontSize(20).text('PennyTrack Expense Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Total: $${total.toFixed(2)}`);
  doc.moveDown();
  expenses.forEach((e) => {
    doc.text(
      `${new Date(e.date).toLocaleDateString()} | ${e.category} | $${e.amount.toFixed(2)} | ${e.description || '-'}`
    );
  });
  doc.end();
});

export default router;
