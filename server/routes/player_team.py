from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import db
from models.team import Team
from models.player import Player
from models.team_player import TeamPlayer
from models.roster_settings import RosterSettings
from sqlalchemy import func

player_team_bp = Blueprint('player_team_bp', __name__)

# Add a player to a team
@player_team_bp.route('/api/teams/<int:team_id>/players', methods=['POST'])
@jwt_required()
def add_player_to_team(team_id):
    user_id = get_jwt_identity()
    team = Team.query.filter_by(id=team_id, user_id=user_id).first()
    if not team:
        return jsonify({"error": "Team not found or unauthorized"}), 404

    data = request.get_json()
    player_id = data.get("player_id")
    if not player_id:
        return jsonify({"error": "Player ID is required"}), 400

    if any(tp.player_id == player_id for tp in team.players):
        return jsonify({"error": "Player already on team"}), 400

    player = Player.query.get(player_id)
    if not player:
        return jsonify({"error": "Player not found"}), 404

    # Roster logic
    eligible_flex_positions = ["RB", "WR", "TE"]
    player_pos = player.position

    # Count players already on the team by position
    position_count = (
        db.session.query(func.count(TeamPlayer.id))
        .join(Player)
        .filter(TeamPlayer.team_id == team.id, Player.position == player_pos)
        .scalar()
    )

    # Get core position limit
    pos_setting = RosterSettings.query.filter_by(team_id=team.id, position=player_pos).first()
    pos_max = pos_setting.max_count if pos_setting else 0

    # Get FLEX info
    flex_setting = RosterSettings.query.filter_by(team_id=team.id, position="FLEX").first()
    flex_max = flex_setting.max_count if flex_setting else 0

    eligible_players = (
        db.session.query(Player.position)
        .join(TeamPlayer)
        .filter(TeamPlayer.team_id == team.id, Player.position.in_(eligible_flex_positions))
        .all()
    )

    flex_used = 0
    counts = {"RB": 0, "WR": 0, "TE": 0}
    for (pos,) in eligible_players:
        counts[pos] += 1

    for pos in eligible_flex_positions:
        setting = RosterSettings.query.filter_by(team_id=team.id, position=pos).first()
        max_pos = setting.max_count if setting else 0
        if counts[pos] > max_pos:
            flex_used += counts[pos] - max_pos

    if position_count < pos_max:
        pass  # valid
    elif player_pos in eligible_flex_positions and flex_used < flex_max:
        pass  # use FLEX slot
    else:
        return jsonify({"error": f"No available roster spot for {player_pos}"}), 400

    new_tp = TeamPlayer(team_id=team_id, player_id=player_id)
    db.session.add(new_tp)
    db.session.commit()

    return jsonify({
        "message": "Player added successfully",
        "player": {
            "id": player.id,
            "name": player.name,
            "position": player.position,
            "team_name": player.team_name
        }
    }), 201

# Add test-player data
@player_team_bp.route('/api/test-add-player', methods=['POST'])
def test_add_player():
    from models.player import Player

    data = request.get_json()

    new_player = Player(
        name=data.get("name", "Test Player"),
        position=data.get("position", "QB"),
        team_name=data.get("team_name", "Test Team")
    )

    db.session.add(new_player)
    db.session.commit()

    return jsonify({
        "message": "Test player added",
        "player_id": new_player.id
    }), 201

# Remove a player from a team
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

# Get all players on a team
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
