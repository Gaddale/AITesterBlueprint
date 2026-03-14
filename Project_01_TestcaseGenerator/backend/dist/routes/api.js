"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const llm_1 = require("../services/llm");
const router = (0, express_1.Router)();
const SETTINGS_PATH = path_1.default.join(__dirname, '../../data/settings.json');
router.get('/settings', (req, res) => {
    try {
        if (fs_1.default.existsSync(SETTINGS_PATH)) {
            const data = fs_1.default.readFileSync(SETTINGS_PATH, 'utf-8');
            res.json(JSON.parse(data));
        }
        else {
            res.json({});
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to read settings.' });
    }
});
router.post('/settings', (req, res) => {
    try {
        const newSettings = req.body;
        fs_1.default.writeFileSync(SETTINGS_PATH, JSON.stringify(newSettings, null, 2));
        res.json({ message: 'Settings saved successfully' });
    }
    catch (error) {
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
        const testCases = await (0, llm_1.generateTestCases)(provider, requirement, history);
        res.json({ testCases });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Error generating test cases.' });
    }
});
exports.default = router;
