// src/pages/TeamDetail.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface Player {
  id: number;
  name: string;
  position: string;
  team_name: string;
}

export default function TeamDetail() {
  const { id } = useParams(); // team ID from URL
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem("token");

  // Fetch current players on the team
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetch(`http://localhost:5000/api/teams/${id}/players`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch players");
        return res.json();
      })
      .then((data) => {
        setPlayers(data);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, navigate, token]);

  // Fetch all available players (NFL player pool)
  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:5000/api/players", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch available players");
        return res.json();
      })
      .then((data) => setAvailablePlayers(data))
      .catch((err) => console.error("Error fetching available players:", err));
  }, [token]);

  function handleAddPlayer() {
    if (!selectedPlayerId || !token) return;

    fetch(`http://localhost:5000/api/teams/${id}/players`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ player_id: selectedPlayerId }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to add player");
        return res.json();
      })
      .then((data) => {
        setPlayers((prev) => [...prev, data.player]);
        setSelectedPlayerId(null);
      })
      .catch((err) => {
        console.error("Error adding player:", err);
      });
  }

  if (loading) return <p style={{ color: "white" }}>Loading players...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <div style={{ padding: "2rem", color: "white" }}>
      <h1>Players on Team #{id}</h1>

      {players.length === 0 ? (
        <p>No players on this team yet.</p>
      ) : (
        <ul>
          {players.map((player) => (
            <li key={player.id}>
              <strong>{player.name}</strong> — {player.position} (
              {player.team_name})
            </li>
          ))}
        </ul>
      )}

      <hr style={{ margin: "2rem 0" }} />

      <h2>Add a Player</h2>

      <select
        value={selectedPlayerId ?? ""}
        onChange={(e) => setSelectedPlayerId(Number(e.target.value))}
        style={{ padding: "0.5rem", marginRight: "0.5rem" }}
      >
        <option value="">Select a player</option>
        {availablePlayers.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} — {p.position} ({p.team_name})
          </option>
        ))}
      </select>

      <button
        onClick={handleAddPlayer}
        disabled={!selectedPlayerId}
        style={{ padding: "0.5rem 1rem" }}
      >
        Add Player
      </button>

      <div style={{ marginTop: "2rem" }}>
        <button onClick={() => navigate(-1)}>← Back to Dashboard</button>
      </div>
    </div>
  );
}
