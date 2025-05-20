# backend/routes/player.py

from flask import Blueprint, jsonify, request
from models.player import Player

player_bp = Blueprint('player_bp', __name__)

@player_bp.route('/api/players', methods=['GET'])
def get_all_players():
    position = request.args.get('position')
    team_name = request.args.get('team_name')

    # Start with all players
    query = Player.query

    # Apply filters if provided
    if position:
        query = query.filter_by(position=position)

    if team_name:
        query = query.filter_by(team_name=team_name)

    players = query.all()

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
