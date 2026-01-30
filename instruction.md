# Event Manager — How to Run

This app has a **Python (Flask) backend** and a **TypeScript (React) frontend**. The backend uses **SQLite** for storage. Follow these steps to run everything locally.

---

## Prerequisites

- **Python 3.9+** (for the backend)
- **Node.js 18+** and **npm** (for the frontend)

---

## Step 1: Backend (Python + Flask + SQLite)

1. Open a terminal and go to the project root:
   ```bash
   cd /path/to/event_python
   ```

2. Create and activate a virtual environment (recommended):
   ```bash
   python3 -m venv venv
   source venv/bin/activate   # On Windows: venv\Scripts\activate
   ```

3. Go into the backend folder and install dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. Start the Flask server:
   ```bash
   python app.py
   ```
   The API will run at **http://localhost:8853**.  
   The first run creates the SQLite database file `events.db` in the `backend` folder.

5. Leave this terminal running. Use a **second terminal** for the frontend.

---

## Step 2: Frontend (React + TypeScript + Vite)

1. Open a **new** terminal and go to the project root:
   ```bash
   cd /path/to/event_python
   ```

2. Go into the frontend folder and install dependencies:
   ```bash
   cd frontend
   npm install
   ```

3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
   The app will be at **http://localhost:5173**.  
   Vite is configured to proxy `/api` requests to the backend at `http://localhost:8853`, so the frontend talks to the backend without CORS issues.

---

## Step 3: Use the App

1. In your browser, open **http://localhost:5173**.
2. You should see the Event Manager home page with **All Events** and **New Event** in the header.
3. Create events, assign users (loaded from JSONPlaceholder), edit and remove events as described in `functionality.md`.

---

## Optional: Database Location

- By default the SQLite database is created at `backend/events.db`.
- To use a different path, set the environment variable before starting the backend:
  ```bash
  export EVENT_DB_PATH=/path/to/your/events.db
  python app.py
  ```

---

## Optional: Production Build (Frontend)

To build the frontend for production:

```bash
cd frontend
npm run build
```

Output will be in `frontend/dist`. Serve that folder with any static file server; ensure `/api` is proxied to your Flask backend (e.g. at port 8853).

---

## Summary

| Step | Command | Where |
|------|--------|--------|
| 1 | `python3 -m venv venv` then `source venv/bin/activate` | project root |
| 2 | `cd backend && pip install -r requirements.txt && python app.py` | backend |
| 3 | `cd frontend && npm install && npm run dev` | frontend (new terminal) |
| 4 | Open **http://localhost:5173** in the browser | — |

Backend: **http://localhost:8853**  
Frontend: **http://localhost:5173**  
Database: **SQLite** at `backend/events.db` (default).
