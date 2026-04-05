import { useState } from 'react';

export function TestPlanGenerator({ config }: any) {
  const [ticketId, setTicketId] = useState('');
  const [context, setContext] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generatePlan = async () => {
    if (!ticketId) {
       setError("Jira/ADO Ticket ID is required");
       return;
    }
    if (!config.alm.token) {
       setError("ALM connection not configured. Please open settings.");
       return;
    }
    
    setLoading(true);
    setError('');
    setOutput('Fetching ALM details...\n');

    try {
      // 1. Fetch ALM Data
      const almRes = await fetch('http://localhost:3001/api/alm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: config.alm.source,
          ticket_id: ticketId,
          endpoint: config.alm.endpoint,
          token: config.alm.token,
          username: config.alm.username
        })
      });

      const almData = await almRes.json();
      
      let storyContext = "";
      if (almData.success) {
         storyContext = JSON.stringify(almData.data); // in real life, parse out description and summary
         setOutput(prev => prev + `Successfully fetched ${ticketId}.\nInvoking LLM for Test Plan creation...\n`);
      } else {
         setOutput(prev => prev + `Failed to fetch ALM. Generating blindly with manual context...\n`);
         storyContext = "ALM FETCH FAILED. RELY ON MANUAL CONTEXT.";
      }

      // 2. Generate via LLM
      const systemPrompt = `You are an expert QA Engineer. Generate a comprehensive Test Plan based strictly on the provided Context and Ticket information. Format your output strictly in Markdown. Follow the QA_Test_Plan.md structure.`;
      
      const userPrompt = `Ticket: ${ticketId}\nStory Context: ${storyContext}\nAdditional Requirements: ${context}\nPlease provide the markdown test plan.`;

      const llmRes = await fetch('http://localhost:3001/api/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           provider: config.llm.provider,
           endpoint: config.llm.endpoint,
           model: config.llm.model,
           apiKey: config.llm.apiKey,
           system_prompt: systemPrompt,
           user_prompt: userPrompt
        })
      });

      const llmData = await llmRes.json();
      
      if (llmData.success) {
         setOutput(llmData.text);
      } else {
         setError('LLM Generation Failed: ' + llmData.error);
         setOutput(prev => prev + '\nError in LLM Generation.');
      }
      
    } catch(err:any) {
       setError(err.message);
    } finally {
       setLoading(false);
    }
  };

  return (
    <div className="grid-cols-2 animate-fade-in">
      <div className="glass-panel">
        <h2>Input Requirements</h2>
        <div className="form-group mt-4">
          <label className="form-label">Ticket ID (Jira / ADO)</label>
          <input 
            type="text" 
            className="form-input" 
            placeholder="e.g. PROJ-123" 
            value={ticketId} 
            onChange={e => setTicketId(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Additional Context (Optional)</label>
          <textarea 
            className="form-input" 
            placeholder="List any extra requirements, screenshots text, or edge cases to consider..."
            value={context}
            onChange={e => setContext(e.target.value)}
          ></textarea>
        </div>
        
        {error && <div className="badge badge-error mb-4">{error}</div>}
        
        <button className="btn btn-primary mt-4" onClick={generatePlan} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Test Plan'}
        </button>
      </div>

      <div className="glass-panel" style={{minHeight: '400px'}}>
        <h2>Generated Test Plan</h2>
        <div className="mt-4">
           {output ? (
             <pre className="form-input" style={{height: '300px', overflowY: 'auto', whiteSpace: 'pre-wrap', fontFamily: 'monospace'}}>
               {output}
             </pre>
           ) : (
             <div className="text-muted" style={{display: 'flex', alignItems:'center', justifyContent: 'center', height: '100%', fontStyle: 'italic', opacity: 0.5}}>
               Your generated test plan will appear here...
             </div>
           )}
        </div>
        {output && !loading && (
          <button className="btn btn-success mt-4" onClick={() => navigator.clipboard.writeText(output)}>
            Copy Markdown
          </button>
        )}
      </div>
    </div>
  );
}
