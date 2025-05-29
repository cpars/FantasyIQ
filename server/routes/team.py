from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import db
from models.team import Team
from models.roster_settings import RosterSetting

team_bp = Blueprint('team_bp', __name__)

# --------------------------
# CREATE TEAM
# --------------------------
@team_bp.route('/api/teams', methods=['POST'])
@jwt_required()
def create_team():
    user_id = get_jwt_identity()
    data = request.get_json()
    name = data.get('name')

    if not name:
        return jsonify({"error": "Team name is required"}), 400

    new_team = Team(name=name, user_id=user_id)
    db.session.add(new_team)
    db.session.commit() 

    
    default_settings = {
        "QB": 2,
        "RB": 2,
        "WR": 2,
        "TE": 1,
        "FLEX": 1,
        "K": 1,
        "DEF": 1
    }

    for position, count in default_settings.items():
        setting = RosterSetting(team_id=new_team.id, position=position, limit=count)
        db.session.add(setting)

    db.session.commit() 

    return jsonify({
        "message": "Team created successfully!",
        "team": {
            "id": new_team.id,
            "name": new_team.name
        }
    }), 201

# --------------------------
# GET USER'S TEAMS
# --------------------------
@team_bp.route('/api/teams', methods=['GET'])
@jwt_required()
def get_user_teams():
    user_id = get_jwt_identity()
    teams = Team.query.filter_by(user_id=user_id).all()

    return jsonify([
        {"id": team.id, "name": team.name}
        for team in teams
    ])


@team_bp.route('/api/teams/<int:team_id>', methods=['DELETE'])
@jwt_required()
def delete_team(team_id):
    user_id = get_jwt_identity()
    print("Authenticated user ID:", user_id)

    team = Team.query.get_or_404(team_id)
    print("Team owner ID:", team.user_id)

    if int(team.user_id) != int(user_id):
        print("MISMATCH - Unauthorized delete attempt")
        return jsonify({"error": "Unauthorized"}), 403

    db.session.delete(team)
    db.session.commit()

    print(f"Deleted team: {team.name} (ID: {team.id})")
    return jsonify({"message": "Team deleted"}), 200

