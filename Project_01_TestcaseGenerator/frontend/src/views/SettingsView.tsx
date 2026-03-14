import { useEffect, useState } from 'react';
import { api, type Settings } from '../services/api';

export default function SettingsView() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getSettings().then(s => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    await api.saveSettings(settings);
    setSaving(false);
    alert('Settings Saved!');
  };

  const testConnection = async () => {
    // Add toast or alert
    alert('Testing connection...');
  };

  if (loading) return <div className="p-8 text-neutral-400">Loading settings...</div>;

  return (
    <div className="flex flex-col h-full bg-neutral-900 border-l border-neutral-800 p-8">
      <h2 className="text-2xl font-semibold mb-6 text-white">API Configurations</h2>
      
      <div className="flex flex-col gap-6 max-w-xl">
        {/* Ollama */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-neutral-400">Ollama API URL</label>
          <input 
            type="text" 
            name="ollamaUrl"
            value={settings.ollamaUrl || ''}
            onChange={handleChange}
            placeholder="http://localhost:11434"
            className="bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* LM Studio */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-neutral-400">LM Studio API URL</label>
          <input 
            type="text" 
            name="lmStudioUrl"
            value={settings.lmStudioUrl || ''}
            onChange={handleChange}
            placeholder="http://localhost:1234/v1"
            className="bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Groq */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-neutral-400">Groq API Key</label>
          <input 
            type="password" 
            name="groqKey"
            value={settings.groqKey || ''}
            onChange={handleChange}
            placeholder="gsk_..."
            className="bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* OpenAI */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-neutral-400">OpenAI API Key</label>
          <input 
            type="password" 
            name="openAiKey"
            value={settings.openAiKey || ''}
            onChange={handleChange}
            placeholder="sk-..."
            className="bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Claude */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-neutral-400">Claude API Key</label>
          <input 
            type="password" 
            name="claudeKey"
            value={settings.claudeKey || ''}
            onChange={handleChange}
            placeholder="sk-ant-..."
            className="bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        
        {/* Gemini */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-neutral-400">Gemini API Key</label>
          <input 
            type="password" 
            name="geminiKey"
            value={settings.geminiKey || ''}
            onChange={handleChange}
            placeholder="AIza..."
            className="bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex gap-4 mt-4">
          <button 
            onClick={testConnection}
            className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-medium py-3 rounded-lg border border-neutral-700 transition-all cursor-pointer">
            Test Connection
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg shadow-lg hover:shadow-xl transition-all cursor-pointer disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
