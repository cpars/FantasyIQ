# server/models/player.py

from db import db

class Player(db.Model):
    __tablename__ = 'players'

    id = db.Column(db.Integer, primary_key=True)  # Can match API ID
    name = db.Column(db.String(100), nullable=False)
    position = db.Column(db.String(20))
    team_name = db.Column(db.String(50))

    # Player can appear on multiple teams (many-to-many)
    teams = db.relationship('TeamPlayer', backref='player', lazy=True)

    def __repr__(self):
        return f"<Player {self.name}>"
