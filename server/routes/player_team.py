# backend/routes/player_team.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import db
from models.team import Team
from models.player import Player
from models.team_player import TeamPlayer

player_team_bp = Blueprint('player_team_bp', __name__)

#Add a player to a team
@player_team_bp.route('/api/teams/<int:team_id>/players', methods=['POST'])
@jwt_required()
def add_player_to_team(team_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    player_id = data.get('player_id')

    # Check if team belongs to user
    team = Team.query.filter_by(id=team_id, user_id=user_id).first()
    if not team:
        return jsonify({"error": "Team not found or unauthorized"}), 404

    # Check if player exists
    player = Player.query.get(player_id)
    if not player:
        return jsonify({"error": "Player not found"}), 404

    # Prevent duplicates
    existing = TeamPlayer.query.filter_by(team_id=team_id, player_id=player_id).first()
    if existing:
        return jsonify({"error": "Player already on team"}), 409

    # Add player to team
    team_player = TeamPlayer(team_id=team_id, player_id=player_id)
    db.session.add(team_player)
    db.session.commit()

    return jsonify({"message": "Player added to team!"}), 201

#Add test-player data
@player_team_bp.route('/api/test-add-player', methods=['POST'])
@jwt_required()
def test_add_player():
    from models.player import Player

    new_player = Player(
        name="Test Player",
        position="QB",
        team_name="Test Team"
    )

    db.session.add(new_player)
    db.session.commit()

    return jsonify({
        "message": "Test player added",
        "player_id": new_player.id
    }), 201


#Remove a player from a team
@player_team_bp.route('/api/teams/<int:team_id>/players/<int:player_id>', methods=['DELETE'])
@jwt_required()
def remove_player_from_team(team_id, player_id):
    user_id = get_jwt_identity()

    team = Team.query.filter_by(id=team_id, user_id=user_id).first()
    if not team:
        return jsonify({"error": "Team not found or unauthorized"}), 404

    team_player = TeamPlayer.query.filter_by(team_id=team_id, player_id=player_id).first()
    if not team_player:
        return jsonify({"error": "Player not on team"}), 404

    db.session.delete(team_player)
    db.session.commit()

    return jsonify({"message": "Player removed from team"}), 200

#Get all players on a team
@player_team_bp.route('/api/teams/<int:team_id>/players', methods=['GET'])
@jwt_required()
def get_team_players(team_id):
    user_id = get_jwt_identity()

    team = Team.query.filter_by(id=team_id, user_id=user_id).first()
    if not team:
        return jsonify({"error": "Team not found or unauthorized"}), 404

    players = [
        {
            "id": tp.player.id,
            "name": tp.player.name,
            "position": tp.player.position,
            "team_name": tp.player.team_name
        }
        for tp in team.players
    ]

    return jsonify(players), 200
