# backend/routes/player.py

from flask import Blueprint, jsonify
from models.player import Player

player_bp = Blueprint('player_bp', __name__)

#Get all players in the database
@player_bp.route('/api/players', methods=['GET'])
def get_all_players():
    players = Player.query.all()

    result = [
        {
            "id": player.id,
            "name": player.name,
            "position": player.position,
            "team_name": player.team_name
        }
        for player in players
    ]

    return jsonify(result), 200
