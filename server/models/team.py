# server/models/team.py

from db import db

class Team(db.Model):
    __tablename__ = 'teams'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)

    # Foreign key to the user who owns this team
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # One team can have many players (through TeamPlayer)
    players = db.relationship('TeamPlayer', backref='team', lazy=True)

    # One team can have many roster settings
    # (e.g., max players per position)
    roster_settings = db.relationship('RosterSettings', back_populates='team', cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Team {self.name}>"
