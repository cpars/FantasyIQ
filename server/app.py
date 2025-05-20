# backend/app.py

from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os

from db import db  # importing db from db.py
from routes.auth import auth_bp, bcrypt
from routes.team import team_bp
from routes.player import player_bp
from routes.player_team import player_team_bp
from routes.sportsdata import sportsdata_bp
from flask_jwt_extended import JWTManager
from datetime import timedelta

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure database
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Configure JWT
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
jwt = JWTManager(app)
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=1)  # Token expiration time

# Initialize SQLAlchemy with the app
db.init_app(app)

# Initialize Bcrypt with the app
bcrypt.init_app(app)

# Register blueprints
app.register_blueprint(sportsdata_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(team_bp)
app.register_blueprint(player_team_bp)
app.register_blueprint(player_bp)


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
