# backend/app.py

from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os

# Load .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Allow cross-origin requests (frontend and backend may run on different ports)
CORS(app)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the database
db = SQLAlchemy(app)

# Simple route to test the server
@app.route('/')
def index():
    return {"message": "FantasyIQ server is running!"}

# Run the app
if __name__ == '__main__':
    app.run(debug=True)
