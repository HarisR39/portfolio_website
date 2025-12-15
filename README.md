# Portfolio Website

A modern portfolio website built with React (frontend) and Python Flask (backend).

## Features

- 🎨 Beautiful, modern UI with gradient backgrounds
- 📱 Fully responsive design
- 🚀 Fast and lightweight
- 🔗 Dynamic content from backend API
- ✨ Smooth animations and transitions

## Project Structure

```
portfolio_website/
├── backend/
│   ├── app.py              # Flask backend server
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Main React component
│   │   ├── App.css         # Styles
│   │   └── main.jsx        # React entry point
│   └── package.json        # Node dependencies
└── README.md
```

## Setup Instructions

### Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
```

3. Activate the virtual environment:
   - On Windows:
   ```bash
   venv\Scripts\activate
   ```
   - On macOS/Linux:
   ```bash
   source venv/bin/activate
   ```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Run the Flask server:
```bash
python app.py
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or another port if 5173 is busy)

## Customization

### Update Portfolio Data

Edit `backend/app.py` to customize your portfolio information:
- Name, title, and about section
- Contact information (email, GitHub, LinkedIn)
- Projects list
- Skills

### Styling

Modify `frontend/src/App.css` to change colors, fonts, and layout.

## Development

- Backend API endpoint: `http://localhost:5000/api/portfolio`
- Frontend development server: `http://localhost:5173`

## Production Build

To create a production build of the frontend:

```bash
cd frontend
npm run build
```

The built files will be in the `frontend/dist` directory.

## License

MIT
