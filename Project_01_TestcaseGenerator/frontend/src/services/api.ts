const API_URL = 'http://localhost:3001/api';

export interface Settings {
  ollamaUrl?: string;
  groqKey?: string;
  openAiKey?: string;
  claudeKey?: string;
  geminiKey?: string;
  lmStudioUrl?: string;
}

export const api = {
  getSettings: async (): Promise<Settings> => {
    try {
      const res = await fetch(`${API_URL}/settings`);
      return await res.json();
    } catch (e) {
      console.error(e);
      return {};
    }
  },
  saveSettings: async (settings: Settings): Promise<void> => {
    try {
      await fetch(`${API_URL}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
    } catch (e) {
      console.error(e);
    }
  },
  testConnection: async (): Promise<boolean> => {
    // To be implemented in backend, mocking for now.
    return true; 
  },
  generateTestCases: async (provider: string, requirement: string, history: {prompt: string, testCases: string}[] = []): Promise<string> => {
    try {
      const res = await fetch(`${API_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, requirement, history })
      });
      if (!res.ok) {
        throw new Error('Failed to generate.');
      }
      const data = await res.json();
      return data.testCases;
    } catch (e) {
      console.error(e);
      return 'Error generating test cases. Check console for details or verify your API settings.';
    }
  }
};
