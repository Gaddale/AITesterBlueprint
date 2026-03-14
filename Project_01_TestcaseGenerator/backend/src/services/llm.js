"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOllama = generateOllama;
exports.generateGroq = generateGroq;
exports.generateOpenAI = generateOpenAI;
exports.generateLMStudio = generateLMStudio;
exports.generateTestCases = generateTestCases;
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const SETTINGS_PATH = path_1.default.join(__dirname, '../../data/settings.json');
function getSettings() {
    if (fs_1.default.existsSync(SETTINGS_PATH)) {
        return JSON.parse(fs_1.default.readFileSync(SETTINGS_PATH, 'utf-8'));
    }
    return {};
}
const SYSTEM_PROMPT = `
You are an expert QA Engineer. 
The user will provide a software requirement (Jira story, feature description, etc.).
Your job is to generate comprehensive Functional and Non-Functional test cases based on the requirement.
You MUST output the test cases in a strict Markdown format compatible with Jira description fields.

Format Requirements:
1. Provide a brief Summary.
2. Provide a list of Functional Test Cases (Table format if possible, containing Test ID, Title, Steps, Expected Result).
3. Provide a list of Non-Functional Test Cases.
4. Output NOTHING ELSE but the markdown. Do not wrap it in a markdown block, just return the raw markdown text.
`;
async function generateOllama(prompt) {
    const settings = getSettings();
    const url = settings.ollamaUrl || 'http://localhost:11434';
    const response = await axios_1.default.post(`${url}/api/generate`, {
        model: 'llama3', // Adjust default model if needed
        system: SYSTEM_PROMPT,
        prompt: prompt,
        stream: false,
    });
    return response.data.response;
}
async function generateGroq(prompt) {
    const settings = getSettings();
    const apiKey = settings.groqKey;
    if (!apiKey)
        throw new Error('Groq API Key not configured');
    const response = await axios_1.default.post('https://api.groq.com/openai/v1/chat/completions', {
        model: 'llama3-70b-8192',
        messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: prompt }
        ]
    }, {
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
    });
    return response.data.choices[0].message.content;
}
async function generateOpenAI(prompt) {
    const settings = getSettings();
    const apiKey = settings.openAiKey;
    if (!apiKey)
        throw new Error('OpenAI API Key not configured');
    const response = await axios_1.default.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4o',
        messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: prompt }
        ]
    }, {
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
    });
    return response.data.choices[0].message.content;
}
async function generateLMStudio(prompt) {
    const settings = getSettings();
    const url = settings.lmStudioUrl || 'http://localhost:1234/v1';
    const response = await axios_1.default.post(`${url}/chat/completions`, {
        model: 'local-model',
        messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: prompt }
        ]
    });
    return response.data.choices[0].message.content;
}
// TODO: Implement Claude and Gemini as stretch goals
async function generateTestCases(provider, prompt) {
    switch (provider.toLowerCase()) {
        case 'ollama':
            return generateOllama(prompt);
        case 'groq':
            return generateGroq(prompt);
        case 'openai':
            return generateOpenAI(prompt);
        case 'lmstudio':
            return generateLMStudio(prompt);
        default:
            throw new Error(`Provider ${provider} not supported yet.`);
    }
}
//# sourceMappingURL=llm.js.map