# ShareBite — React Local Edition

A runnable front-end prototype of ShareBite with role-based experiences for Donors, Volunteers, Needy people, and Charities/NGOs.

## Requirements
- Node.js 18+ (Node 20+ recommended)
- npm

## Run locally
1. Extract this ZIP.
2. Open the extracted `ShareBite-React-Local` folder in VS Code.
3. Open a terminal in that folder and run:
   ```bash
   npm install
   npm run dev
   ```
4. Open the local URL Vite prints (usually `http://localhost:5173`).

## What's included
- Role selection / demo sign-in (no passwords, API keys, OAuth, or external services)
- Separate dashboards for Donor, Volunteer, Needy, and Charity
- Create and browse food donations
- Needy users can request/claim available donations
- Charity users can manage requests and view donation activity
- Volunteers can pick up available deliveries and update delivery status
- Track My Tree gamification / impact points
- Basic analytics and impact summary
- Search and status filters
- Seeded demo data plus reset-to-demo-data option
- Responsive layout

## Local data storage
This version uses the browser's `localStorage` as a tiny local database. Changes remain in the same browser on the same device after refresh, but they are not shared across devices or users and may be cleared if browser site data is deleted. For a real multi-user deployment, connect a backend and database later.

## Notes
- The authentication screen is a demo role selector, not production authentication.
- Donation trends and impact charts are illustrative summaries based on locally stored app data; no trained ML model is bundled in this front-end-only version.
- No API keys or `.env` file are needed.
