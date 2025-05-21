# backend/routes/player.py

from flask import Blueprint, jsonify, request
from models.player import Player
from db import db  # in case you need it for anything else

player_bp = Blueprint('player_bp', __name__)

@player_bp.route('/api/players', methods=['GET'])
def get_all_players():
    position = request.args.get('position')
    team_name = request.args.get('team_name')

    # Fantasy-relevant positions
    valid_positions = ["QB", "RB", "WR", "TE", "K", "DEF"]

    # Start with only valid fantasy positions
    query = Player.query.filter(Player.position.in_(valid_positions))

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
