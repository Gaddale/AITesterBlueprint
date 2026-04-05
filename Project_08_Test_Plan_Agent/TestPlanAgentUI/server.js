import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

// ALM API Proxy
app.post('/api/alm', async (req, res) => {
  try {
    const { source, ticket_id, endpoint, token, username } = req.body;
    
    // Example for Jira
    if (source === 'jira') {
      const auth = Buffer.from(`${username}:${token}`).toString('base64');
      const response = await axios.get(`${endpoint}/rest/api/3/issue/${ticket_id}`, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json'
        }
      });
      return res.json({ success: true, data: response.data });
    }
    
    // Can extend to ADO, X-Ray
    return res.status(400).json({ success: false, error: 'Unsupported ALM Source' });
  } catch (error) {
    console.error('ALM API Error:', error.response?.data || error.message);
    const apiErrMsg = error.response?.data?.errorMessages?.[0] || error.response?.data?.error || error.message;
    res.status(500).json({ success: false, error: 'Failed to fetch ALM data', details: apiErrMsg });
  }
});

// LLM Generation Proxy
app.post('/api/llm', async (req, res) => {
  try {
    const { provider, endpoint, model, apiKey, system_prompt, user_prompt } = req.body;

    if (provider === 'ollama') {
      const response = await axios.post(endpoint, {
        model: model,
        prompt: `${system_prompt}\n\n${user_prompt}`,
        stream: false
      });
      return res.json({ success: true, text: response.data.response });
    }
    else if (provider === 'groq') {
       const response = await axios.post(endpoint, {
        model,
        messages: [
          { role: 'system', content: system_prompt },
          { role: 'user', content: user_prompt }
        ]
       }, {
         headers: {
           'Authorization': `Bearer ${apiKey}`,
           'Content-Type': 'application/json'
         }
       });
       return res.json({ success: true, text: response.data.choices[0].message.content });
    }

    res.status(400).json({ success: false, error: 'Unsupported LLM Provider' });

  } catch (error) {
    console.error('LLM API Error:', error.response?.data || error.message);
    const apiErrMsg = error.response?.data?.error?.message || error.response?.data?.error || error.message;
    res.status(500).json({ success: false, error: 'Generation Failed', details: apiErrMsg });
  }
});

app.listen(PORT, () => {
  console.log(`B.L.A.S.T Proxy server running on port ${PORT}`);
});
