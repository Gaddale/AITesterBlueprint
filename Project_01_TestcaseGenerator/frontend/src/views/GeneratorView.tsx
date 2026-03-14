import { useState, useEffect } from 'react';
import { api } from '../services/api';
import ReactMarkdown from 'react-markdown';

interface HistoryItem {
  id: string;
  prompt: string;
  testCases: string;
}

export default function GeneratorView() {
  const [requirement, setRequirement] = useState('');
  
  // Load history from localStorage or default to empty
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('testGenHistoryV2');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('testGenHistoryV2', JSON.stringify(history));
  }, [history]);

  const [testCases, setTestCases] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('Ollama');

  const handleGenerate = async () => {
    if (!requirement.trim()) return;
    
    const submittedPrompt = requirement;
    setRequirement(''); // Clear input immediately
    setGenerating(true);
    setTestCases(null);

    const result = await api.generateTestCases(selectedProvider, submittedPrompt, history);

    const newHistoryItem: HistoryItem = {
      id: Date.now().toString(),
      prompt: submittedPrompt,
      testCases: result
    };
    
    setTestCases(result);
    setHistory([newHistoryItem, ...history]);
    setGenerating(false);
  };

  return (
    <div className="flex h-full w-full bg-neutral-900 overflow-hidden">
      {/* Sidebar History */}
      <div className="w-64 border-r border-neutral-800 flex flex-col hidden md:flex">
        <div className="p-4 border-b border-neutral-800">
          <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">History</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {history.map((item) => (
            <div 
              key={item.id} 
              onClick={() => {
                setRequirement(item.prompt);
                setTestCases(item.testCases);
              }}
              className="p-3 bg-neutral-800 rounded-lg text-sm text-neutral-300 hover:bg-neutral-700 cursor-pointer transition-colors truncate"
              title={item.prompt}
            >
              {item.prompt.substring(0, 25)}...
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative h-full">
        {/* Header Options */}
        <div className="absolute top-0 w-full p-4 flex justify-end z-10 bg-gradient-to-b from-neutral-900 to-transparent">
          <select 
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="bg-neutral-800 border border-neutral-700 text-sm text-white rounded-lg px-3 py-2 outline-none focus:border-blue-500 transition-colors"
          >
            <option value="Ollama">Ollama</option>
            <option value="Groq">Groq</option>
            <option value="OpenAI">OpenAI</option>
            <option value="Claude">Claude</option>
            <option value="Gemini">Gemini</option>
            <option value="LMStudio">LM Studio</option>
          </select>
        </div>

        {/* Display Area */}
        <div className="flex-1 overflow-y-auto p-8 pt-20 custom-scrollbar">
          {!testCases && !generating ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto">
              <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">AI Test Case Generator</h2>
              <p className="text-neutral-400">Provide Jira requirements below to automatically generate functional and non-functional tests.</p>
            </div>
          ) : (
             <div className="max-w-4xl mx-auto w-full min-w-0">
               {generating ? (
                 <div className="flex items-center gap-3 text-blue-400">
                    <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    Generating Test Cases with {selectedProvider}...
                 </div>
               ) : (
                <div className="bg-neutral-800 border border-neutral-700 p-8 rounded-xl text-neutral-200 shadow-xl prose prose-invert max-w-none overflow-x-auto break-words">
                  <ReactMarkdown>{testCases}</ReactMarkdown>
                </div>
               )}
             </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-neutral-900 border-t border-neutral-800">
          <div className="max-w-4xl mx-auto flex gap-4">
            <textarea 
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
              placeholder="Ask here is here TC for Requirement..."
              className="flex-1 bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none h-14 min-h-[56px] custom-scrollbar focus:ring-4 focus:ring-blue-500/10 placeholder-neutral-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
            />
            <button 
              onClick={handleGenerate}
              disabled={generating || !requirement.trim()}
              className="px-6 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:shadow-blue-500/20 flex items-center justify-center min-w-[120px]"
            >
              Generate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
