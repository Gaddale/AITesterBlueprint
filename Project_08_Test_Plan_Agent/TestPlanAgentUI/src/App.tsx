import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TestPlannerWizard } from './components/TestPlannerWizard';
import { Menu, Bot, Sparkles, Flame } from 'lucide-react';
import './index.css';

function TestingBuddyDashboard() {
  return (
     <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', background: '#fff' }}>
        <div style={{ 
           background: 'linear-gradient(90deg, #3b82f6 0%, #ec4899 100%)', 
           padding: '1.5rem 2rem', 
           display: 'flex', justifyContent: 'space-between', alignItems: 'center',
           color: 'white'
        }}>
           <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>TestingBuddy AI</h1>
              <p style={{ margin: 0, fontSize: '1rem', opacity: 0.9 }}>Your Expert QA Testing Assistant</p>
           </div>
           <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <Flame size={16} /> 0 day streak
              </div>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
                 0 total days
              </div>
           </div>
        </div>

        <div className="animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem' }}>
           <div style={{ background: '#eff6ff', width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
               <Bot size={50} color="#3b82f6" />
           </div>
           
           <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              TestingBuddy AI <Sparkles size={32} color="#3b82f6" />
           </h2>
           <h3 style={{ fontSize: '1.25rem', color: '#64748b', fontWeight: 500, marginBottom: '1.5rem' }}>Your Expert QA Testing Assistant</h3>
           <p style={{ color: '#64748b', textAlign: 'center', maxWidth: '600px', lineHeight: 1.6, marginBottom: '2.5rem' }}>
              I'm here to help you with test automation, best practices, debugging, and everything QA-related. Choose an agent from the left to get started!
           </p>
        </div>
     </div>
  );
}

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('testPlannerConfig');
    if (saved) return JSON.parse(saved);
    return {
      alm: {
        source: 'jira',
        endpoint: '',
        token: '',
        username: ''
      },
      llm: {
        provider: 'ollama',
        endpoint: 'http://localhost:11434/api/generate',
        model: 'llama3',
        apiKey: ''
      }
    };
  });

  useEffect(() => {
    localStorage.setItem('testPlannerConfig', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className="app-container">
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        isDarkMode={isDarkMode}
        toggleTheme={() => setIsDarkMode(!isDarkMode)}
      />

      <main className="main-content" style={{ padding: currentTab === 'dashboard' ? '0' : undefined }}>
        {currentTab !== 'dashboard' && (
           <header className="topbar">
              <Menu size={20} style={{color: 'var(--text-muted)', cursor: 'pointer'}} />
           </header>
        )}

        {currentTab === 'dashboard' && <TestingBuddyDashboard />}
        {currentTab === 'test_planner' && <TestPlannerWizard config={config} setConfig={setConfig} />}
      </main>
    </div>
  );
}
