import express from 'express';
import {
  createBackup,
  verifyBackup,
  restoreBackup,
  listBackups,
  enforceRetention,
  getMetrics,
} from '../backup/manager.js';

const router = express.Router();

/**
 * @swagger
 * /api/backup:
 *   get:
 *     summary: List all backup files
 *     tags: [Backup]
 *     responses:
 *       200:
 *         description: List of backup metadata
 *       500:
 *         description: Server error
 */
router.get('/', async (_req, res) => {
  try {
    res.json(await listBackups());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/backup:
 *   post:
 *     summary: Trigger a manual backup
 *     tags: [Backup]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tag: { type: string, default: manual }
 *     responses:
 *       201:
 *         description: Backup created
 *       500:
 *         description: Server error
 */
router.post('/', async (req, res) => {
  try {
    const meta = await createBackup({ tag: req.body?.tag || 'manual' });
    res.status(201).json(meta);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/backup/verify:
 *   post:
 *     summary: Verify checksum of a backup file
 *     tags: [Backup]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file: { type: string }
 *     responses:
 *       200:
 *         description: Verification result
 *       400:
 *         description: file is required
 *       500:
 *         description: Server error
 */
router.post('/verify', async (req, res) => {
  const { file } = req.body;
  if (!file) return res.status(400).json({ error: 'file is required' });
  try {
    res.json(await verifyBackup(file));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/backup/restore:
 *   post:
 *     summary: Restore a backup (supports point-in-time recovery)
 *     tags: [Backup]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file: { type: string }
 *               targetTime: { type: string, format: date-time }
 *               targetDatabase: { type: string }
 *     responses:
 *       200:
 *         description: Restore result
 *       400:
 *         description: file is required
 *       500:
 *         description: Server error
 */
router.post('/restore', async (req, res) => {
  const { file, targetTime, targetDatabase } = req.body;
  if (!file) return res.status(400).json({ error: 'file is required' });
  try {
    res.json(await restoreBackup(file, { targetTime, targetDatabase }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/backup/retention:
 *   delete:
 *     summary: Enforce backup retention policy immediately
 *     tags: [Backup]
 *     responses:
 *       200:
 *         description: Retention enforced
 *       500:
 *         description: Server error
 */
router.delete('/retention', async (_req, res) => {
  try {
    res.json(await enforceRetention());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/backup/metrics:
 *   get:
 *     summary: Get backup health metrics and alerts
 *     tags: [Backup]
 *     responses:
 *       200:
 *         description: Backup metrics
 */
router.get('/metrics', (_req, res) => {
  res.json(getMetrics());
});

export default router;
