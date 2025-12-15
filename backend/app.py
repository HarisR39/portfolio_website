from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Sample portfolio data
portfolio_data = {
    "name": "Your Name",
    "title": "Full Stack Developer",
    "about": "I'm a passionate developer who loves creating beautiful and functional web applications.",
    "email": "your.email@example.com",
    "github": "https://github.com/yourusername",
    "linkedin": "https://linkedin.com/in/yourusername",
    "projects": [
        {
            "id": 1,
            "title": "Project One",
            "description": "A description of your first project. Showcase your skills and technologies used.",
            "technologies": ["React", "Python", "Flask"],
            "github": "https://github.com/yourusername/project1",
            "demo": "https://project1-demo.com"
        },
        {
            "id": 2,
            "title": "Project Two",
            "description": "Another amazing project that demonstrates your capabilities.",
            "technologies": ["React", "Node.js"],
            "github": "https://github.com/yourusername/project2",
            "demo": "https://project2-demo.com"
        },
        {
            "id": 3,
            "title": "Project Three",
            "description": "A third project to showcase your diverse skill set.",
            "technologies": ["Python", "Django"],
            "github": "https://github.com/yourusername/project3",
            "demo": "https://project3-demo.com"
        }
    ],
    "skills": [
        "React",
        "Python",
        "JavaScript",
        "Flask",
        "HTML/CSS",
        "Git"
    ]
}

@app.route('/api/portfolio', methods=['GET'])
def get_portfolio():
    """Get portfolio data"""
    return jsonify(portfolio_data)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)

