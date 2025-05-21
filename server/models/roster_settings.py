from db import db

class RosterSettings(db.Model):
    __tablename__ = 'roster_settings'

    id = db.Column(db.Integer, primary_key=True)
    team_id = db.Column(db.Integer, db.ForeignKey('teams.id'), nullable=False)
    position = db.Column(db.String, nullable=False)
    max_count = db.Column(db.Integer, nullable=False)

    team = db.relationship("Team", back_populates="roster_settings")
