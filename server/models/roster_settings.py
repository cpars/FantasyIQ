# server/models/roster_settings.py

from db import db

class RosterSetting(db.Model):
    __tablename__ = 'team_roster_settings'

    id = db.Column(db.Integer, primary_key=True)
    team_id = db.Column(db.Integer, db.ForeignKey('teams.id'), nullable=False)
    position = db.Column(db.String(10), nullable=False)
    limit = db.Column(db.Integer, nullable=False)

    # ✅ Match back_populates
    team = db.relationship('Team', back_populates='roster_settings')
