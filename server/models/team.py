# server/models/team.py

from db import db

class Team(db.Model):
    __tablename__ = 'teams'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    roster_settings = db.relationship(
        'RosterSetting',
        back_populates='team',
        cascade="all, delete-orphan"
    )

    players = db.relationship('TeamPlayer', backref='team', lazy=True)

    def __repr__(self):
        return f"<Team {self.name}>"

