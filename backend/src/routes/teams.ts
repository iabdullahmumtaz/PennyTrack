import { Router } from 'express';
import Team from '../models/Team.js';
import User from '../models/User.js';
import { authRequired } from '../middleware/auth.js';
import { getUserTeams } from '../utils/teamAccess.js';
import { errorMessage } from '../utils/errors.js';

const router = Router();
router.use(authRequired);

router.get('/', async (req, res) => {
  try {
    res.json(await getUserTeams(req.userId!));
  } catch (err) {
    res.status(500).json({ error: errorMessage(err) });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Team name required' });

    const team = await Team.create({
      name: name.trim(),
      owner: req.userId,
      members: [],
    });

    const populated = await Team.findById(team._id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    if (!populated) return res.status(500).json({ error: 'Failed to load team' });
    res.status(201).json({ ...populated.toObject(), role: 'admin' });
  } catch (err) {
    res.status(500).json({ error: errorMessage(err) });
  }
});

router.post('/:id/members', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    if (team.getMemberRole(req.userId!) !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { email, role = 'member' } = req.body;
    if (!email) return res.status(400).json({ error: 'email required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (team.getMemberRole(user._id)) {
      return res.status(409).json({ error: 'User already in team' });
    }

    team.members.push({ user: user._id, role: role === 'admin' ? 'admin' : 'member' });
    await team.save();

    const updated = await Team.findById(team._id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    if (!updated) return res.status(500).json({ error: 'Failed to load team' });
    res.json({ ...updated.toObject(), role: updated.getMemberRole(req.userId!) });
  } catch (err) {
    res.status(500).json({ error: errorMessage(err) });
  }
});

export default router;
