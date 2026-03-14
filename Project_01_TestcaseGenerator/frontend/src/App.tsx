import { useState } from 'react';
import SettingsView from './views/SettingsView';
import GeneratorView from './views/GeneratorView';

function App() {
  const [activeTab, setActiveTab] = useState<'generator' | 'settings'>('generator');

  return (
    <div className="h-screen w-screen bg-black text-white flex flex-col font-sans overflow-hidden">
      {/* Top Navbar */}
      <nav className="h-14 border-b border-neutral-800 bg-neutral-900 flex items-center px-6 justify-between flex-shrink-0 z-20 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            TC
          </div>
          <span className="font-semibold text-lg tracking-tight">TestGen AI</span>
        </div>
        <div className="flex gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
          <button 
            onClick={() => setActiveTab('generator')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'generator' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'}`}
          >
            Generator
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'settings' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'}`}
          >
            Settings
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden">
        {activeTab === 'generator' ? <GeneratorView /> : <SettingsView />}
      </main>
    </div>
  );
}

export default App;
