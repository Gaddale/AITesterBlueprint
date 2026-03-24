# Local-First Job Tracker

A sleek, local-first React single-page application for tracking your job applications. All data is securely stored on your own device using IndexedDB, guaranteeing total privacy with no backend or API required.

## Features

- **Kanban Board:** Drag and drop job applications between 6 phases (Wishlist, Applied, Follow-up, Interview, Offer, Rejected).
- **100% Local Data:** Powered by `idb` for resilient and fast local storage.
- **Privacy Native:** No sign-up, no server, all data lives in your browser.
- **Import / Export:** Download a `.json` backup of your data or restore from a backup file anytime.
- **Beautiful UI:** Styled with Tailwind CSS v4, supporting dynamic Light & Dark modes.

## Quick Start (How to Run Locally)

Follow these steps to get the application up and running on your local machine:

1. **Navigate to the project directory** (if you aren't already there):
   ```bash
   cd Project_07_Job_tracker_application
   ```

2. **Install dependencies:**
   Make sure you have [Node.js](https://nodejs.org/) installed, then run:
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev -- --port 5173
   ```

4. **Open the Application in your browser:**
   Click the link below to access the tracker!
   **👉 [http://localhost:5173/](http://localhost:5173/)**

## Tech Stack
- **UI Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4
- **Drag & Drop:** `@dnd-kit/core` & `@dnd-kit/sortable`
- **Local Database:** `idb` (IndexedDB Wrapper)
- **Forms:** `react-hook-form`
- **Icons:** `lucide-react`
