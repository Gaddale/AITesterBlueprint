# TestingBuddy AI - Intelligent Test Planning Agent

## Overview
The Intelligent Test Planning Agent is a modern, responsive web application framework designed to bridge User Stories directly into automated AI Test Plans. It operates as the flagship "Planning & Strategy" module within the overarching **TestingBuddy AI Platform**.

By connecting external Application Lifecycle Management (ALM) systems like Atlassian Jira to Large Language Models (LLMs) like Groq or Ollama, the agent can actively digest live product requirements and intelligently draft robust, enterprise-grade test plans.

## 🏗️ Architecture Design
The architecture is split into a robust, two-tier proxy-client system designed specifically to circumvent Browser Security (CORS) exceptions and secure API keys:

1. **Vite + React.js Frontend (`App.tsx` & `TestPlannerWizard.tsx`)**
   - Handles the state persistence (`localStorage` syncing) of API connections across browser reloads.
   - Manages the clean multi-modal routing environment and the native Dark-Slate Jira Preview UI.
2. **Express.js Node Proxy (`server.js`)**
   - Intelligently acts as a secure middleman. 
   - All REST Calls to Jira (which strictly block frontend browser requests via CORS) are wrapped through this `/api/alm` NodeJS backend.
   - Traps deep errors (like Atlassian `401 Unauthorized` or `Browse Project` permission failures) and sanitizes them into readable JSON for the Frontend.

## 🚀 How to Run the Environment
1. **Navigate to the Client Directory:**
   ```bash
   cd /Users/nagaraj/Documents/workspace/AITesterBlueprint/Project_08_Test_Plan_Agent/TestPlanAgentUI
   ```
2. **Install necessary node package modules:**
   ```bash
   npm install
   ```
3. **Boot the concurrent stack:**
   This project uses the `concurrently` package to boot both the Node Proxy server (port 3001) and Vite React Application (port 5174) simultaneously. 
   ```bash
   npm run start:all
   ```
4. **Access the application:**
   Open your browser and navigate to `http://localhost:5174`

---

## 📘 Step-By-Step User Guide

### 1. Connection Requirements (Step 1)
To begin securely fetching data and running Generations, the system requires verified credentials:
* **Jira Configuration:** You must provide your Jira Cloud **Base URL**, the **User Email** mapped to your Atlassian account, and an **API Token**. 
* **LLM Provider:** Select either `GROQ (Remote)` and provide your Groq API Key for lightning-fast internet-based inferences... OR select `Ollama (Local)` to route generations directly to your machine's hardware with zero configuration required.
* *Note: Hitting "Test Connection" performs a dummy ping via the server proxy to ensure the credentials align before you start.*

### 2. Fetching the Requirements (Step 2)
* Input your specific **Jira Ticket ID** (e.g. `VWO-5`). 
* _Auto-parsing Feature:_ If you copy-paste the entire Jira URL into the Ticket ID box, the UI will automatically distill and slice the URL to extract just the exact Ticket ID.
* Hit **Fetch Preview** to immediately command Jira to return the Ticket Title and Description rendered straight into the live-feed JSON preview card.

### 3. Review & Generation (Steps 3 & 4)
* You may inject custom QA constraints or directives in the Additional Context text area.
* Hit **Generate Intelligence Plan**. The proxy secures your prompt sequence and the fetched Jira data, transferring it to the LLM. 
* Once generation completes, you can review the Markdown output. You can use the **Copy Markdown** button to migrate it to Notion/Confluence, or map it directly out to an isolated, stylistically-clean PDF file using the integrated **Export PDF** button.
