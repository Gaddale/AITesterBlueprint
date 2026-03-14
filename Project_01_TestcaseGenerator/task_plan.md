# Task Plan

## Phases & Goals

### Phase 1: Discovery & Initialization
- [x] Create `task_plan.md`, `findings.md`, `progress.md`, `context.md`
- [x] Ask discovery questions regarding the project.
- [ ] Approve Blueprint.

### Phase 2: Project Scaffolding
- [ ] Initialize Node.js backend with TypeScript (`backend/`).
- [ ] Initialize React frontend application (`frontend/`).
- [ ] Setup concurrent execution for development.

### Phase 3: Backend Development
- [ ] Implement Settings API (Save/Load settings).
- [ ] Implement LLM Integration Service (Ollama, OpenAI, Groq, etc.).
- [ ] Implement Test Case Generation API (Jira format templates).
- [ ] Implement test-connection endpoint.

### Phase 4: Frontend Development
- [ ] Implement Layout (Sidebar + Main Content).
- [ ] Implement Settings UI & Connection Test logic.
- [ ] Implement Generator UI (Chat input, Markdown display).
- [ ] Integrate Frontend API calls.

### Phase 5: Verification
- [ ] Verify Jira formatting and test case quality.
- [ ] Verify UI flows and responsiveness.

---

## Blueprint

**Overview**: A React and Node.js (TypeScript) web application that generates functional and non-functional test cases from Jira requirements. Supports Ollama, LM Studio, Groq, OpenAI, Claude, and Gemini.

1. **Frontend**: Vite React App + TailwindCSS.
   - Distinct views for Test Generator and Settings Manager.
   - History sidebar for tracking generation history.
2. **Backend**: Express + Node.js.
   - Adapters for various LLM APIs.
   - Persistence for API configurations and history.
3. **Output format**: Focused strictly on Jira-compatible representation.
