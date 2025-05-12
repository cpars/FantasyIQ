# backend/routes/team.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import db
from models.team import Team

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
def get_teams():
    user_id = get_jwt_identity()
    teams = Team.query.filter_by(user_id=user_id).all()

    team_list = [{"id": team.id, "name": team.name} for team in teams]

    return jsonify(team_list), 200
