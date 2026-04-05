import { useState } from 'react';
import { Target, Bug, BotMessageSquare, ArrowDownToLine, RefreshCw, FileText, Settings, Play, Search, Download } from 'lucide-react';

export function TestPlannerWizard({ config, setConfig }: any) {
  const [step, setStep] = useState(1);
  
  // Local Config for connection inputs
  const [localConfig, setLocalConfig] = useState(config);

  // Step 2 Form
  const [productName, setProductName] = useState('');
  const [projectKey, setProjectKey] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');

  // Execution State
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Connection Test States
  const [llmTestStatus, setLlmTestStatus] = useState<{type: 'success'|'error'|'loading'|null, msg: string}>({type: null, msg: ''});
  const [almTestStatus, setAlmTestStatus] = useState<{type: 'success'|'error'|'loading'|null, msg: string}>({type: null, msg: ''});
  
  // Storage for Preview
  const [jiraPreview, setJiraPreview] = useState<any>(null);

  const steps = [
    { num: 1, label: 'Setup' },
    { num: 2, label: 'Fetch Issues' },
    { num: 3, label: 'Review' },
    { num: 4, label: 'Test Plan' }
  ];

  const testALM = async () => {
    setAlmTestStatus({type: 'loading', msg: 'Verifying connection...'});
    try {
      const res = await fetch('http://localhost:3001/api/alm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: localConfig.alm.source,
          ticket_id: 'TEST_CONNECTION',
          endpoint: localConfig.alm.endpoint,
          token: localConfig.alm.token,
          username: localConfig.alm.username
        })
      });
      const data = await res.json();
      
      // Because we use 'TEST_CONNECTION' as a dummy ticket ID, 
      // Jira will return a 404/403 or specific string if auth actually succeeds but ticket is fake.
      // But if the proxy fails to reach Jira or auth outright fails, data.success is false!
      if(data.success || (data.details && data.details.includes('Issue does not exist'))) {
        setAlmTestStatus({type: 'success', msg: 'ALM Connection Verified & Successful!'});
      } else {
        setAlmTestStatus({type: 'error', msg: `ALM Connection Failed: ${data.details || 'Unauthorized'}`});
      }
    } catch(e:any) {
      setAlmTestStatus({type: 'error', msg: 'ALM Connection Error: ' + e.message});
    }
  };

  const testLLM = async () => {
    setLlmTestStatus({type: 'loading', msg: 'Pinging remote LLM provider...'});
    try {
      const llmRes = await fetch('http://localhost:3001/api/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           provider: localConfig.llm.provider,
           endpoint: localConfig.llm.endpoint,
           model: localConfig.llm.model,
           apiKey: localConfig.llm.apiKey,
           system_prompt: "Respond with the exact word: SUCCESS",
           user_prompt: "Test Connection Ping"
        })
      });
      const data = await llmRes.json();
      if(data.success) {
          setLlmTestStatus({type: 'success', msg: 'LLM Connection Verified & Successful!'});
      } else {
          setLlmTestStatus({type: 'error', msg: 'LLM Connection Failed: ' + (data.details || data.error)});
      }
    } catch (e:any) {
      setLlmTestStatus({type: 'error', msg: "Error trying to reach LLM Proxy: " + e.message});
    }
  };

  const handleSaveConnections = () => {
     // In real app, call proxy to test connections fully here.
       if (!localConfig.alm.token && localConfig.llm.provider !== 'ollama' && !localConfig.llm.apiKey) {
          alert("Please provide valid tokens/keys for your configuration to proceed.");
          return;
       }
       setConfig(localConfig);
       setStep(2);
    };

  // New logic for Fetch Preview
  const [isFetchingPreview, setIsFetchingPreview] = useState(false);

  const handleFetchPreview = async () => {
     if(!projectKey) {
       alert("Ticket ID is mandatory for preview");
       return;
     }

     setIsFetchingPreview(true);
     setJiraPreview(null);
     try {
       const res = await fetch('http://localhost:3001/api/alm', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           source: localConfig.alm.source,
           ticket_id: projectKey.split(',')[0].trim().split('/').pop(),
           endpoint: localConfig.alm.endpoint,
           token: localConfig.alm.token,
           username: localConfig.alm.username
         })
       });
       const data = await res.json();
       if (data.success) {
          setJiraPreview(data.data);
       } else {
          setJiraPreview({error: `Jira Request Failed: ${data.details || data.error}`});
       }
     } catch (e:any) {
       setJiraPreview({error: 'Server Proxy unavailable', message: e.message});
     }
     setIsFetchingPreview(false);
  };

  const generateTestPlan = async () => {
    setLoading(true);
    setStep(4);
    setOutput('Generating Test Plan via configuration...\n');
    
    try {
      const llmRes = await fetch('http://localhost:3001/api/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           provider: localConfig.llm.provider,
           endpoint: localConfig.llm.endpoint,
           model: localConfig.llm.model,
           apiKey: localConfig.llm.apiKey,
           system_prompt: "You are an expert QA Engineer. Generate a mock test plan based on "+projectKey,
           user_prompt: `App: ${productName}\nTickets: ${projectKey}\nContext: ${additionalContext}`
        })
      });
      const data = await llmRes.json();
      if(data.success) {
          setOutput(data.text);
          const history = JSON.parse(localStorage.getItem('testPlanHistory') || '[]');
          history.unshift({ date: new Date().toLocaleString(), ticket: projectKey || 'Unknown Ticket', content: data.text });
          localStorage.setItem('testPlanHistory', JSON.stringify(history.slice(0, 10)));
      } else {
          setOutput("LLM generation failed: " + data.error);
      }
    } catch (e:any) {
      setOutput("Error connecting to LLM/Proxy: " + e.message);
    }
    setLoading(false);
  };

  const handleViewHistory = () => {
    const history = JSON.parse(localStorage.getItem('testPlanHistory') || '[]');
    if(history.length === 0) {
      alert("No test plans generated yet. Complete a test plan generation first!");
    } else {
      const formatted = history.map((h:any, i:number) => `${i+1}. ${h.date} - ${h.ticket}`).join('\n');
      alert(`Test Plan History (Last 10):\n\n${formatted}\n\n(Feature: Full historical modal coming in a future update)`);
    }
  };

  const exportToPDF = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) {
       alert("Popup blocked! Please allow popups to export to PDF.");
       return;
    }
    const safeOutput = output.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    printWindow.document.write(`
      <html>
        <head>
          <title>Test Plan - ${projectKey.split(',')[0].trim().split('/').pop() || 'Generated'}</title>
          <style>
             body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; }
             pre { white-space: pre-wrap; font-family: inherit; font-size: 14px; line-height: 1.6; }
             h1 { border-bottom: 1px solid #cbd5e1; padding-bottom: 10px; margin-bottom: 20px; font-size: 24px; }
          </style>
        </head>
        <body>
          <h1>QA Test Plan: ${projectKey.split(',')[0].trim().split('/').pop() || 'Generated'}</h1>
          <pre>${safeOutput}</pre>
          <script>
            window.onload = () => { 
                setTimeout(() => {
                    window.print(); 
                    window.close();
                }, 250);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="content-wrapper">
      <div className="page-header">
        <div className="page-title-row">
          <div className="title-icon">
             <Target size={24} />
          </div>
          <div>
            <h1>Intelligent Test Planning Agent</h1>
            <p>Generate comprehensive test plans from Jira requirements using AI</p>
          </div>
        </div>
        <button className="btn btn-outline" style={{display:'flex', gap:'0.5rem', alignItems:'center'}} onClick={handleViewHistory}>
          <RefreshCw size={16} /> View History
        </button>
      </div>

      <div className="stepper">
        {steps.map(s => (
          <div 
            key={s.num} 
            className={`step ${step === s.num ? 'active' : step > s.num ? 'completed' : ''}`}
            onClick={() => setStep(s.num)}
            style={{cursor: 'pointer'}}
          >
             {s.num}. {s.label}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="animate-fade-in">
          <div className="card mb-6">
            <h2 className="mb-2 flex items-center gap-2"><Target size={20} /> AI Engine Configuration (LLM)</h2>
            <p className="mb-6">Connect to your preferred Local or Remote LLM provider</p>
            
            <div className="grid grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Provider *</label>
                  <select className="form-input" value={localConfig.llm.provider} onChange={e => {
                     const newProvider = e.target.value;
                     const newEndpoint = newProvider === 'groq' 
                         ? 'https://api.groq.com/openai/v1/chat/completions' 
                         : 'http://localhost:11434/api/generate';
                     const newModel = newProvider === 'groq' ? 'llama-3.1-8b-instant' : 'llama3';
                     setLocalConfig({...localConfig, llm: {...localConfig.llm, provider: newProvider, endpoint: newEndpoint, model: newModel}});
                  }}>
                     <option value="ollama">Ollama (Local)</option>
                     <option value="groq">GROQ (Remote)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Model Name *</label>
                  <input type="text" className="form-input" value={localConfig.llm.model} onChange={e => setLocalConfig({...localConfig, llm: {...localConfig.llm, model: e.target.value}})} />
                </div>
            </div>
            <div className="form-group">
                <label className="form-label">API Key *</label>
                <input type="password" className="form-input" value={localConfig.llm.apiKey} onChange={e => setLocalConfig({...localConfig, llm: {...localConfig.llm, apiKey: e.target.value}})} placeholder="Optional for some local providers" />
            </div>
            <div className="flex items-center gap-4 mt-4">
                <button className="btn btn-outline" onClick={testLLM}>{llmTestStatus.type === 'loading' ? 'Testing...' : 'Test LLM Connection'}</button>
                {llmTestStatus.msg && (
                    <span style={{color: llmTestStatus.type === 'success' ? '#10b981' : '#ef4444', fontSize: '0.875rem'}}>
                      {llmTestStatus.msg}
                    </span>
                )}
            </div>
          </div>

          <div className="card mb-6">
            <h2 className="mb-2 flex items-center gap-2"><Settings size={20} /> Jira / ALM Connection</h2>
            <p className="mb-6">Connect to your target Test Management repository to fetch requirements</p>
            
            <div className="grid grid-cols-2">
                <div className="form-group">
                  <label className="form-label">System Source *</label>
                  <select className="form-input" value={localConfig.alm.source} onChange={e => setLocalConfig({...localConfig, alm: {...localConfig.alm, source: e.target.value}})}>
                     <option value="jira">Jira Cloud</option>
                     <option value="ado">Azure DevOps</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Username *</label>
                  <input type="text" className="form-input" value={localConfig.alm.username} onChange={e => setLocalConfig({...localConfig, alm: {...localConfig.alm, username: e.target.value}})} placeholder="e.g. user@company.com" />
                </div>
            </div>
            <div className="form-group">
               <label className="form-label">Base URL *</label>
               <input type="text" className="form-input w-full" value={localConfig.alm.endpoint} onChange={e => setLocalConfig({...localConfig, alm: {...localConfig.alm, endpoint: e.target.value}})} placeholder="https://yourcompany.atlassian.net" />
            </div>
            <div className="form-group">
               <label className="form-label">API Token *</label>
               <input type="password" className="form-input w-full" value={localConfig.alm.token} onChange={e => setLocalConfig({...localConfig, alm: {...localConfig.alm, token: e.target.value}})} />
            </div>
            <div className="flex items-center gap-4 mt-4">
               <button className="btn btn-outline" onClick={testALM}>{almTestStatus.type === 'loading' ? 'Testing...' : 'Test Jira Connection'}</button>
               {almTestStatus.msg && (
                  <span style={{color: almTestStatus.type === 'success' ? '#10b981' : '#ef4444', fontSize: '0.875rem'}}>
                    {almTestStatus.msg}
                  </span>
               )}
            </div>
          </div>

          <button className="btn btn-primary" onClick={handleSaveConnections}>
            Save Connections & Continue <Play size={16} />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="card animate-fade-in">
          <h2 className="mb-2">Fetch Jira Requirements</h2>
          <p className="mb-6">Enter project details to fetch user stories and requirements</p>

          <div className="mb-6 form-input flex justify-between items-center" style={{background: 'var(--bg-color)', border: '1px solid var(--surface-border)'}}>
             <div>
               <div style={{fontSize: '0.875rem', color: 'var(--text-muted)'}}>Connected to:</div>
               <div style={{fontWeight: 500}}>{localConfig.alm.source === 'jira' ? 'Jira' : 'Azure DevOps'} ({localConfig.alm.endpoint || 'Not configured'})</div>
             </div>
             <button className="btn" style={{background: 'transparent', color: 'var(--text-main)', border: 'none', fontWeight: 500, cursor: 'pointer'}} onClick={() => setStep(1)}>Change</button>
          </div>

          <div className="form-group">
             <label className="form-label">Product Name & URL (Optional)</label>
             <input type="text" className="form-input w-full" placeholder="e.g., App.vwo.com" value={productName} onChange={e => setProductName(e.target.value)} />
          </div>
          
          <div className="form-group">
             <label className="form-label">Ticket ID(s) *</label>
             <input type="text" className="form-input w-full" placeholder="e.g., VWO-1234, KAN-1" value={projectKey} onChange={e => setProjectKey(e.target.value)} required />
             <div style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem'}}>Enter one or more Jira ticket IDs separated by commas.</div>
          </div>

          <div className="form-group mb-6 mt-4">
             <label className="form-label">Additional Context (Optional)</label>
             <textarea className="form-input w-full" style={{minHeight:'100px'}} placeholder="Any additional information about the product, testing goals, or constraints..." value={additionalContext} onChange={e => setAdditionalContext(e.target.value)} />
          </div>

          <div className="mb-6">
             <button className="btn btn-outline flex items-center justify-center gap-2" style={{width:'fit-content', padding:'0.5rem 1rem'}} onClick={handleFetchPreview} disabled={isFetchingPreview}>
                <Search size={16} /> {isFetchingPreview ? 'Fetching Preview...' : 'Fetch Preview'}
             </button>
          </div>

          {jiraPreview && (
             <div className="mb-6 form-input" style={{
                background: '#334155', /* Dark slate */
                borderLeft: '5px solid var(--primary-color)',
                color: '#f8fafc',
                padding: '1.25rem',
                maxHeight: '200px',
                overflowY: 'auto',
                border: 'none',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                wordBreak: 'break-word',
                marginTop: '-0.5rem'
             }}>
                {jiraPreview.error ? (
                   <p style={{color: '#fca5a5', fontWeight: 500}}>{jiraPreview.error}</p>
                ) : (
                   <div>
                     <strong style={{display:'block', marginBottom:'0.5rem', fontSize:'1rem'}}>
                       {projectKey.split(',')[0].trim().split('/').pop()}: {jiraPreview.fields?.summary || 'Issue Fetched Successfully (No Title)'}
                     </strong>
                     <p style={{fontSize: '0.875rem', opacity: 0.9, lineHeight: 1.5}}>
                       {JSON.stringify(jiraPreview.fields?.description || jiraPreview).substring(0, 400)}...
                     </p>
                   </div>
                )}
             </div>
          )}

          <div className="flex gap-4">
             <button className="btn btn-outline" onClick={() => setStep(1)}>Back</button>
             <button className="btn btn-primary w-full flex justify-center items-center gap-2" onClick={() => {
                if(!jiraPreview) handleFetchPreview();
                setStep(3);
             }}>
               <ArrowDownToLine size={20} /> Fetch Jira Requirements & Continue
             </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="animate-fade-in">
          <div className="flex justify-between items-center mb-4">
             <div className="badge" style={{background: 'var(--surface-color)', border:'1px solid var(--surface-border)'}}><Target size={12} style={{display:'inline', marginRight:'4px'}}/> Active Connection</div>
             <span className="flex items-center gap-2" style={{color: 'var(--primary-color)', fontSize:'0.875rem', cursor: 'pointer'}}><RefreshCw size={14}/> Refresh Issues</span>
          </div>

          <div className="card mb-6">
             <h2 className="mb-2">Additional Context & Notes</h2>
             <p className="mb-4">Add any additional context, special requirements, or constraints.</p>
             <textarea className="form-input w-full" style={{minHeight:'100px'}} placeholder="Add any additional context about the testing approach, special requirements, constraints, team structure, or specific areas of focus..." value={additionalContext} onChange={e => setAdditionalContext(e.target.value)} />
          </div>

          <div className="card mb-6">
             <h2 className="mb-2">Review Target Issues</h2>
             <p className="mb-4">Issues that will be used to generate the test plan.</p>
             <pre className="form-input" style={{background:'var(--bg-color)', padding:'1.5rem', textAlign:'left', color:'var(--text-muted)', overflowY:'auto', maxHeight:'300px', fontSize:'0.85rem', whiteSpace: 'pre-wrap'}}>
                {jiraPreview ? JSON.stringify(jiraPreview, null, 2) : 'No issues fetched.'}
             </pre>
          </div>

          <div className="flex gap-4">
             <button className="btn btn-outline" onClick={() => setStep(2)}>Back</button>
             <button className="btn btn-primary w-full" onClick={generateTestPlan}>
               <Target size={20} /> Generate Intelligence Plan
             </button>
          </div>
        </div>
      )}

      {step === 4 && (
         <div className="card animate-fade-in" style={{minHeight:'400px', display:'flex', flexDirection:'column', alignItems: output ? 'flex-start' : 'center', justifyContent: output ? 'flex-start' : 'center'}}>
           {!output ? (
              <div style={{textAlign:'center', color: 'var(--text-muted)'}}>
                 <FileText size={48} style={{margin:'0 auto 1rem', opacity: 0.2}} />
                 <h2 className="mb-2">No test plan generated yet</h2>
                 <p>Complete the previous steps to generate your test plan.</p>
              </div>
           ) : (
              <div style={{width:'100%'}}>
                 <div className="flex justify-between items-center mb-4">
                    <h2>Generated Test Plan Output</h2>
                    <div className="flex gap-2">
                       <button className="btn btn-outline flex items-center gap-2" onClick={exportToPDF}><Download size={16}/> Export PDF</button>
                       <button className="btn btn-outline" onClick={() => navigator.clipboard.writeText(output)}>Copy Markdown</button>
                    </div>
                 </div>
                 <pre className="form-input" style={{height:'350px', overflowY:'auto', background:'var(--bg-color)', whiteSpace:'pre-wrap', color: 'var(--text-main)'}}>
                    {output}
                 </pre>
                 {loading && <p className="mt-4" style={{color:'var(--primary-color)'}}>Generating content via proxy...</p>}
                 
                 <div className="mt-6 flex justify-between">
                    <button className="btn btn-outline" onClick={() => {setOutput(''); setStep(3);}}>Regenerate</button>
                    <button className="btn btn-primary">Publish to ALM</button>
                 </div>
              </div>
           )}
         </div>
      )}

    </div>
  );
}
