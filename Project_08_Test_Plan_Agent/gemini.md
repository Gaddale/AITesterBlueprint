# Project Constitution (gemini.md)

## 1. Data Schemas

### Input Payload (ALM Target Data)
```json
{
  "source": "jira", // or ado, xray
  "ticket_id": "PROJ-123",
  "additional_context": "Any specific instructions or user descriptions.",
  "alm_connection": {
    "endpoint": "https://company.atlassian.net",
    "token": "<apiKey or token>",
    "username": "user@example.com"
  }
}
```

### Integration Metadata (LLM Connection)
```json
{
  "llm_provider": "ollama", // ollama, groq
  "endpoint": "http://localhost:11434/api/generate",
  "model": "llama3",
  "api_key": "<apiKey if groq/openai else null>"
}
```

### Output Payload (Generated Test Plan)
```json
{
  "status": "success",
  "ticket_id": "PROJ-123",
  "test_plan_markdown": "# QA Test Plan: ...\n\n## 1. Test Plan Overview...",
  "generated_at": "ISO-8601 Timestamp"
}
```

## 2. Behavioral Rules
- Connections to ALMs and LLMs are strictly defined on-the-fly and need to provide a UI mechanism to "Test Connection".
- System should primarily generate a Test Plan based on the `QA_Test_Plan.md` template structure.
- The UI MUST be built with React.

## 3. Architectural Invariants
- **Layer 1 (Architecture):** All procedures documented in `architecture/` before code (e.g., `alm_fetch_sop.md`, `llm_generate_sop.md`).
- **Layer 2 (Navigation):** The React frontend handles user-input logic and relays it to deterministic backend or client-side fetches.
- **Layer 3 (Tools):** We must write clean integrations (like `tools/fetch_jira.js` or Python equivalents depending on the stack). Since the UI is React, we'll implement integrations via a local node backend or directly in browser (if CORS allows, or via a simple proxy).
