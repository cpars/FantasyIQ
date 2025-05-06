# server/models/user.py

from db import db

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)  # Unique ID
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

    # One user can have many fantasy teams
    teams = db.relationship('Team', backref='owner', lazy=True)

    def __repr__(self):
        return f"<User {self.username}>"
