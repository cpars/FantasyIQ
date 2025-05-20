# backend/routes/sportsdata.py

import os
import requests
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from db import db
from models.player import Player

sportsdata_bp = Blueprint('sportsdata_bp', __name__)

@sportsdata_bp.route('/api/import-nfl-players', methods=['POST'])
@jwt_required()
def import_nfl_players():
    api_key = os.getenv("SPORTSDATA_API_KEY")
    headers = {"Ocp-Apim-Subscription-Key": api_key}

    url = "https://api.sportsdata.io/v3/nfl/scores/json/Players"

    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        return jsonify({
            "error": "Failed to fetch data",
            "status_code": response.status_code,
            "details": response.text
        }), 500

    players_data = response.json()
    added_count = 0

    for player in players_data:
        if not player.get("PlayerID") or not player.get("Name"):
            continue

        # Avoid duplicates by PlayerID
        if Player.query.get(player["PlayerID"]):
            continue

        new_player = Player(
            id=player["PlayerID"],
            name=player["Name"],
            position=player.get("Position", ""),
            team_name=player.get("Team", "")
        )

        db.session.add(new_player)
        added_count += 1

    db.session.commit()

    return jsonify({
        "message": f"{added_count} NFL players imported successfully"
    }), 201
