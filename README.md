# Job Application Tracker 

**Link** https://vbockaj.github.io/job-tracker/

A simple web app for tracking job applications - company, role, status, and next steps.

## Features

- Sign up / log in (with password hashing)
- Add, edit, and delete applications
- Table view and Kanban view
- Search and filter by status
- Reminders for upcoming or overdue next steps
- CSV export
- Dark mode

## Tech stack and why

- **React** for the frontend - easy to build the form, table, and Kanban views as reusable pieces.
- **Node.js + Express** for the backend - simple to set up, same language as the frontend.
- **SQLite** for the database - no separate setup needed, good for a small project.
- **JWT + bcrypt** for login - keeps users signed in and passwords stored safely.

## How to run

**Backend**
```bash
cd server
npm install
node index.js
```
Runs on `http://localhost:3001`.

**Frontend** (in a new terminal)
```bash
cd client
npm install
npm run dev
```
Runs on `http://localhost:5173`.

Then open `http://localhost:5173` in your browser.
