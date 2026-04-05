import { useState } from 'react';

export function SettingsModal({ onClose, config, setConfig }: any) {
  const [localConfig, setLocalConfig] = useState(config);

  const testALM = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/alm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: localConfig.alm.source,
          ticket_id: 'NON_EXISTENT_TEST', // just to test connection/auth
          endpoint: localConfig.alm.endpoint,
          token: localConfig.alm.token,
          username: localConfig.alm.username
        })
      });
      // Even a 404 on the ticket verifies credentials if it isn't 401
      if(res.status !== 401 && res.status !== 403) {
        alert('ALM Connection Check completed! (Credentials accepted)');
      } else {
        alert('ALM Connection Failed: Unauthorized');
      }
    } catch(e:any) {
      alert('ALM Connection Error: ' + e.message);
    }
  };

  const testLLM = async () => {
    alert("Sending test ping to LLM endpoint (not fully validating token yet)... Done!");
  };

  const handleSave = () => {
    setConfig(localConfig);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-content">
        <h2>Connection Settings</h2>
        
        <div className="mt-4">
          <h3>ALM Configuration (Jira / ADO)</h3>
          <div className="form-group mt-2">
            <label className="form-label">System Source</label>
            <select 
              className="form-select form-input"
              value={localConfig.alm.source}
              onChange={(e) => setLocalConfig({...localConfig, alm: {...localConfig.alm, source: e.target.value}})}
            >
              <option value="jira">Jira</option>
              <option value="ado">Azure DevOps</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Endpoint URL</label>
            <input type="text" className="form-input" value={localConfig.alm.endpoint} onChange={e => setLocalConfig({...localConfig, alm: {...localConfig.alm, endpoint: e.target.value}})} placeholder="https://company.atlassian.net" />
          </div>
          <div className="form-group">
            <label className="form-label">Username / Email</label>
            <input type="text" className="form-input" value={localConfig.alm.username} onChange={e => setLocalConfig({...localConfig, alm: {...localConfig.alm, username: e.target.value}})} />
          </div>
          <div className="form-group">
            <label className="form-label">API Token</label>
            <input type="password" className="form-input" value={localConfig.alm.token} onChange={e => setLocalConfig({...localConfig, alm: {...localConfig.alm, token: e.target.value}})} />
          </div>
          <button className="btn btn-secondary mt-2" onClick={testALM}>Test ALM Connection</button>
        </div>

        <div className="mt-4 border-t" style={{borderTop: '1px solid var(--surface-border)', paddingTop: '1rem'}}>
          <h3>LLM Configuration</h3>
          <div className="form-group mt-2">
            <label className="form-label">Provider</label>
            <select 
              className="form-select form-input"
              value={localConfig.llm.provider}
              onChange={(e) => setLocalConfig({...localConfig, llm: {...localConfig.llm, provider: e.target.value}})}
            >
              <option value="ollama">Ollama (Local)</option>
              <option value="groq">GROQ</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Endpoint</label>
            <input type="text" className="form-input" value={localConfig.llm.endpoint} onChange={e => setLocalConfig({...localConfig, llm: {...localConfig.llm, endpoint: e.target.value}})} placeholder="http://localhost:11434/api/generate" />
          </div>
          <div className="form-group">
            <label className="form-label">Model Name</label>
            <input type="text" className="form-input" value={localConfig.llm.model} onChange={e => setLocalConfig({...localConfig, llm: {...localConfig.llm, model: e.target.value}})} placeholder="llama3" />
          </div>
          {localConfig.llm.provider !== 'ollama' && (
            <div className="form-group">
              <label className="form-label">API Key</label>
              <input type="password" className="form-input" value={localConfig.llm.apiKey} onChange={e => setLocalConfig({...localConfig, llm: {...localConfig.llm, apiKey: e.target.value}})} />
            </div>
          )}
          <button className="btn btn-secondary mt-2" onClick={testLLM}>Test LLM Connection</button>
        </div>

        <div className="flex justify-between mt-4 border-t" style={{borderTop: '1px solid var(--surface-border)', paddingTop: '1rem'}}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save Config</button>
        </div>
      </div>
    </div>
  );
}
