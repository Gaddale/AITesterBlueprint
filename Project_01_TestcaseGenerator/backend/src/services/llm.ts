import axios from 'axios';
import fs from 'fs';
import path from 'path';

const SETTINGS_PATH = path.join(__dirname, '../../data/settings.json');

function getSettings() {
  if (fs.existsSync(SETTINGS_PATH)) {
    return JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8'));
  }
  return {};
}

const SYSTEM_PROMPT = `
You are an expert strict QA Engineer. 
The user will provide a software requirement (Jira story, feature description, etc.).
Your job is to generate comprehensive Functional and Non-Functional test cases based on the requirement.
You MUST output the test cases in a strict Markdown format compatible with Jira description fields.
Never include introductory conversational text.

Format Requirements:
1. Provide a brief Markdown Summary section.
2. Provide a list of Functional Test Cases. **YOU MUST USE A STRICT MARKDOWN TABLE** for this section. The table must have exactly these columns: | Test ID | Title | Steps | Expected Result |
3. Provide a list of Non-Functional Test Cases. **YOU MUST USE A STRICT MARKDOWN TABLE** for this section as well.
4. Output NOTHING ELSE but the markdown. Do not enclose the output in triple backticks or markdown code blocks, just return the raw text.
`;
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface HistoryItem {
  prompt: string;
  testCases: string;
}

function buildMessages(prompt: string, history: HistoryItem[]): ChatMessage[] {
  const messages: ChatMessage[] = [{ role: 'system', content: SYSTEM_PROMPT }];
  
  // Inject history limited to last 5 turns to prevent token overflow
  const recentHistory = history.slice(0, 5).reverse();
  for (const item of recentHistory) {
    messages.push({ role: 'user', content: item.prompt });
    messages.push({ role: 'assistant', content: item.testCases });
  }
  
  messages.push({ role: 'user', content: prompt });
  return messages;
}
export async function generateOllama(prompt: string, history: HistoryItem[] = []): Promise<string> {
  const settings = getSettings();
  const url = settings.ollamaUrl || 'http://localhost:11434';
  
  const messages = buildMessages(prompt, history);

  const response = await axios.post(`${url}/api/chat`, {
    model: 'gemma3:4b', // Updated to match the user's local Ollama environment
    messages: messages,
    stream: false,
  });
  return response.data.message.content;
}

export async function generateGroq(prompt: string, history: HistoryItem[] = []): Promise<string> {
  const settings = getSettings();
  const apiKey = settings.groqKey;
  if (!apiKey) throw new Error('Groq API Key not configured');

  const messages = buildMessages(prompt, history);

  const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
    model: 'llama3-70b-8192',
    messages: messages
  }, {
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
  });
  
  return response.data.choices[0].message.content;
}

export async function generateOpenAI(prompt: string, history: HistoryItem[] = []): Promise<string> {
  const settings = getSettings();
  const apiKey = settings.openAiKey;
  if (!apiKey) throw new Error('OpenAI API Key not configured');

  const messages = buildMessages(prompt, history);

  const response = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: 'gpt-4o',
    messages: messages
  }, {
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
  });
  
  return response.data.choices[0].message.content;
}

export async function generateLMStudio(prompt: string, history: HistoryItem[] = []): Promise<string> {
  const settings = getSettings();
  const url = settings.lmStudioUrl || 'http://localhost:1234/v1';

  const messages = buildMessages(prompt, history);

  const response = await axios.post(`${url}/chat/completions`, {
    model: 'local-model',
    messages: messages
  });
  
  return response.data.choices[0].message.content;
}

// TODO: Implement Claude and Gemini as stretch goals
export async function generateTestCases(provider: string, prompt: string, history: HistoryItem[] = []): Promise<string> {
  switch (provider.toLowerCase()) {
    case 'ollama':
      return generateOllama(prompt, history);
    case 'groq':
      return generateGroq(prompt, history);
    case 'openai':
      return generateOpenAI(prompt, history);
    case 'lmstudio':
      return generateLMStudio(prompt, history);
    default:
      throw new Error(`Provider ${provider} not supported yet.`);
  }
}
