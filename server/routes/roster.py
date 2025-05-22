from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.team import Team
from models.player import Player
from models.team_player import TeamPlayer
from models.roster_settings import RosterSetting
from db import db
from sqlalchemy import func

roster_bp = Blueprint('roster_bp', __name__)

@roster_bp.route("/api/teams/<int:team_id>/roster-status", methods=["GET"])
@jwt_required()
def get_roster_status(team_id):
    user_id = get_jwt_identity()
    team = Team.query.filter_by(id=team_id, user_id=user_id).first()
    if not team:
        return jsonify({"error": "Team not found or unauthorized"}), 404

    result = []
    for setting in team.roster_settings:
        used = sum(
            1
            for tp in team.players
            if tp.player.position == setting.position or (
                setting.position == "FLEX" and tp.player.position in ["RB", "WR", "TE"]
            )
        )
        result.append({
            "position": setting.position,
            "limit": setting.limit,
            "used": used
        })

    return jsonify(result), 200
