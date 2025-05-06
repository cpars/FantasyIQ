# backend/app.py

from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os

from db import db  # importing db from db.py
from routes.auth import auth_bp, bcrypt

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure database
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize SQLAlchemy with the app
db.init_app(app)

# Initialize Bcrypt with the app
bcrypt.init_app(app)
app.register_blueprint(auth_bp)


# Import models after initializing db
from models import User, Team, Player, TeamPlayer

# Create tables
with app.app_context():
    db.create_all()

@app.route('/')
def home():
    return {"message": "Fantasy Sports Tracker backend is running!"}

if __name__ == '__main__':
    app.run(debug=True)
