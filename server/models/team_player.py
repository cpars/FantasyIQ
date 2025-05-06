# server/models/team_player.py

from db import db

class TeamPlayer(db.Model):
    __tablename__ = 'team_players'

    id = db.Column(db.Integer, primary_key=True)
    team_id = db.Column(db.Integer, db.ForeignKey('teams.id'), nullable=False)
    player_id = db.Column(db.Integer, db.ForeignKey('players.id'), nullable=False)

    def __repr__(self):
        return f"<TeamPlayer Team {self.team_id} - Player {self.player_id}>"
