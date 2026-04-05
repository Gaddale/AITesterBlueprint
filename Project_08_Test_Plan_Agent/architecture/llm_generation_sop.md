# LLM Generation SOP

**Goal:** Generate a Test Plan based on ALM data and the target Template context.

**Inputs:**
1. `llm_config`: Provider (Ollama, Groq), Base URL, API Key, Model.
2. `context_payload`: The fetched Jira Ticket details + user's "additional context".
3. `template_markdown`: The reference `QA_Test_Plan.md`.

**Logic:**
1. React frontend compiles a system prompt encompassing the task ("You are a QA Engineer... generate a test plan...").
2. The extracted Jira details and additional manual contexts are mapped to the Prompt's "Story context".
3. The app invokes the POST request to the LLM. 
   - For Ollama: `http://localhost:11434/api/generate`
   - For Groq: `https://api.groq.com/openai/v1/chat/completions`

**Edge Cases:**
- Ollama is not running: Network error caught and prompts user to start it locally.
- Large context limits: Warn user if Jira output is too large.
