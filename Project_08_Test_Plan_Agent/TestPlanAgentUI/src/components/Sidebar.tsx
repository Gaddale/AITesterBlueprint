import { Target, Home, BookOpen, Settings as SettingsIcon, ChevronUp, Moon, Sun } from 'lucide-react';

export function Sidebar({ currentTab, setCurrentTab, isDarkMode, toggleTheme }: any) {
  return (
    <aside className="sidebar" style={{ backgroundColor: '#1e293b', color: '#f8fafc', width: '280px', display: 'flex', flexDirection: 'column', padding: 0, borderRight: 'none' }}>
      <div className="sidebar-header" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ background: '#3b82f6', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
           TB
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#fff', fontWeight: 700 }}>TestingBuddy AI</h2>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Testing Platform</span>
        </div>
      </div>
      
      <nav className="sidebar-nav" style={{ padding: '1rem', flex: 1, overflowY:'auto' }}>
        <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>Main</div>
        
        <button 
          className="nav-item"
          onClick={() => setCurrentTab('dashboard')}
          style={{
             display: 'flex', alignItems: 'center', gap: '12px', padding: '0.75rem 1rem', width: '100%',
             borderRadius: '8px', cursor: 'pointer', border: 'none',
             background: currentTab === 'dashboard' ? '#3b82f6' : 'transparent',
             color: currentTab === 'dashboard' ? '#fff' : '#cbd5e1',
             fontWeight: 600, fontSize: '1rem', marginBottom: '1.5rem', textAlign: 'left'
          }}
        >
          <Home size={20} /> Dashboard
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>
            <div style={{display:'flex', alignItems:'center', gap:'8px'}}><Target size={14} color="#ef4444"/> PLANNING & STRATEGY</div>
            <ChevronUp size={16} />
        </div>
        <button 
          className="nav-item"
          onClick={() => setCurrentTab('test_planner')}
          style={{
             display: 'flex', alignItems: 'center', gap: '12px', padding: '0.75rem 1rem', width: '100%',
             borderRadius: '8px', cursor: 'pointer', border: 'none',
             background: currentTab === 'test_planner' ? '#334155' : 'transparent',
             color: currentTab === 'test_planner' ? '#fff' : '#cbd5e1',
             fontWeight: 600, fontSize: '0.9rem', textAlign: 'left'
          }}
        >
          <Target size={18} color="#ef4444" /> Intelligent Test Planning Agent
        </button>
      </nav>

      <div className="sidebar-footer" style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
           <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>Nagaraja Rao</span>
           <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>n.gaddale@gmail.com</span>
        </div>
        {/* Invisible hotkey to toggle mode for the dev */}
        <div onClick={toggleTheme} style={{cursor: 'pointer', opacity: 0.1}}>°</div>
      </div>
    </aside>
  );
}
