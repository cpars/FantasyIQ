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

    # Create a count dictionary: position -> list of matching players
    player_counts = {
        "QB": [],
        "RB": [],
        "WR": [],
        "TE": [],
        "K": [],
        "DEF": [],
    }

    for tp in team.players:
        pos = tp.player.position
        if pos in player_counts:
            player_counts[pos].append(tp.player)

    # Build usage map excluding FLEX at first
    usage = {}
    for setting in team.roster_settings:
        if setting.position == "FLEX":
            continue
        usage[setting.position] = {
            "limit": setting.limit,
            "used": len(player_counts.get(setting.position, [])),
        }

    # Count FLEX-eligible players *after* RB/WR/TE slots are filled
    flex_eligible = []
    for pos in ["RB", "WR", "TE"]:
        excess = len(player_counts.get(pos, [])) - usage.get(pos, {}).get("limit", 0)
        if excess > 0:
            flex_eligible.extend(player_counts[pos][-excess:])  # only the extra ones

    # Add FLEX usage
    flex_setting = next(
        (s for s in team.roster_settings if s.position == "FLEX"), None
    )
    if flex_setting:
        usage["FLEX"] = {
            "limit": flex_setting.limit,
            "used": min(len(flex_eligible), flex_setting.limit),
        }

    # Format output
    result = [
        {"position": pos, "used": data["used"], "limit": data["limit"]}
        for pos, data in usage.items()
    ]

    return jsonify(result), 200
