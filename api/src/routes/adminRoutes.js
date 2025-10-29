import { Router } from 'express';
import db from '../db.js';
import { hashPassword } from '../auth.js';
import { requireAuth, requireAdmin } from '../middleware/requireAuth.js';

const router = Router();
router.use(requireAuth, requireAdmin);

/** POST /api/admin/users  (criar usuário) */
router.post('/users', async (req, res) => {
  const { email, provisionalPassword, role = 'user' } = req.body || {};
  if (!email || !provisionalPassword) return res.status(400).json({ error: 'Dados obrigatórios' });
  if (!['user'].includes(role)) return res.status(400).json({ error: 'Role inválida' });

  try {
    const hash = await hashPassword(provisionalPassword);
    db.prepare(`
      INSERT INTO users (email, role, password_hash, is_first_login, active, created_at)
      VALUES (?, ?, ?, 1, 1, datetime('now'))
    `).run(email, role, hash);
    res.json({ ok: true });
  } catch (e) {
    if (String(e).includes('UNIQUE')) return res.status(409).json({ error: 'E-mail já cadastrado' });
    res.status(500).json({ error: 'Falha ao criar usuário' });
  }
});

export default router;