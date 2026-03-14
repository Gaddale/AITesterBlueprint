import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { generateTestCases } from '../services/llm';

const router = Router();
const SETTINGS_PATH = path.join(__dirname, '../../data/settings.json');

router.get('/settings', (req, res) => {
  try {
    if (fs.existsSync(SETTINGS_PATH)) {
      const data = fs.readFileSync(SETTINGS_PATH, 'utf-8');
      res.json(JSON.parse(data));
    } else {
      res.json({});
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to read settings.' });
  }
});

router.post('/settings', (req, res) => {
  try {
    const newSettings = req.body;
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(newSettings, null, 2));
    res.json({ message: 'Settings saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save settings.' });
  }
});

router.post('/generate', async (req, res) => {
  try {
    const { provider, requirement, history } = req.body;
    if (!provider || !requirement) {
      res.status(400).json({ error: 'Missing provider or requirement' });
      return;
    }
    const testCases = await generateTestCases(provider, requirement, history);
    res.json({ testCases });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error generating test cases.' });
  }
});

export default router;
