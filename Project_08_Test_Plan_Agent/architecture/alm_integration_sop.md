# ALM Integration SOP

**Goal:** Fetch issue data (User Stories, Bugs) securely from an ALM tool (Jira, ADO).

**Inputs:**
1. `connection_details`: ALM API URL, Username/Email, API Token.
2. `ticket_id`: Target ticket number (e.g. `PROJ-123`).

**Logic:**
1. The React app collects the credentials via the UI.
2. The user clicks "Test Connection" to invoke `/rest/api/3/myself` (Jira) or equivalent ADO auth verification endpoint.
3. Upon validation, the ticket data is fetched from `/rest/api/3/issue/{issueIdOrKey}`.
4. The backend proxy handles this to prevent CORS blocks. If we are pure frontend, we rely on the target ALM allowing CORS (unlikely for Jira, unless configured). We will build a lightweight Node.js Express proxy in `server.js` or `tools/`.

**Edge Cases:**
- Connection unauthorized: Show clear error that token is invalid.
- CORS error: Proxy must be utilized.
- Ticket Not Found: Return 404 cleanly and alert user in UI.
