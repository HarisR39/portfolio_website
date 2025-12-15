# Quick Start Guide

## Running the Portfolio Website

You need **TWO terminal windows** - one for the backend and one for the frontend.

---

## Terminal 1: Backend (Python/Flask)

1. **Navigate to backend folder:**
   ```powershell
   cd backend
   ```

2. **Install Python dependencies (first time only):**
   ```powershell
   pip install -r requirements.txt
   ```

3. **Start the Flask server:**
   ```powershell
   python app.py
   ```

   You should see: `Running on http://127.0.0.1:5000`

   **Keep this terminal open!**

---

## Terminal 2: Frontend (React)

1. **Open a NEW terminal window** and navigate to frontend folder:
   ```powershell
   cd frontend
   ```

2. **Install Node dependencies (first time only):**
   ```powershell
   npm install
   ```

3. **Start the React development server:**
   ```powershell
   npm run dev
   ```

   You should see something like: `Local: http://localhost:5173/`

---

## Access Your Portfolio

Open your browser and go to: **http://localhost:5173**

The frontend will automatically connect to the backend API at `http://localhost:5000`

---

## Troubleshooting

- **Backend not starting?** Make sure port 5000 is not in use
- **Frontend can't connect?** Make sure the backend is running first
- **Dependencies error?** Run `pip install -r requirements.txt` (backend) or `npm install` (frontend) again

