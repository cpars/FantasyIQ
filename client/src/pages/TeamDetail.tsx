import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";

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
  const { showToast } = useToast();
  const [filterPosition, setFilterPosition] = useState("");
  const [filterTeam, setFilterTeam] = useState("");
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
        if (!data.player) {
          console.warn("No player in response:", data);
          showToast("Unexpected response. Could not add player.", "error");
          return;
        }

        setPlayers((prev) => [...prev, data.player]);
        setSelectedPlayerId(null);
        showToast("Player added successfully!", "success");
      })

      .catch((err) => {
        console.error("Error adding player:", err);
        showToast("Failed to add player", "error");
      });
  }

  function handleRemovePlayer(playerId: number) {
    fetch(`http://localhost:5000/api/teams/${id}/players/${playerId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to remove player");
        setPlayers((prev) => prev.filter((p) => p.id !== playerId));
        showToast("Player removed", "success");
      })
      .catch((err) => {
        console.error("Error removing player:", err);
        showToast("Failed to remove player", "error");
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
            <li key={player.id} style={{ marginBottom: "0.5rem" }}>
              <strong>{player.name}</strong> — {player.position} (
              {player.team_name})
              <button
                onClick={() => handleRemovePlayer(player.id)}
                style={{
                  marginLeft: "1rem",
                  background: "red",
                  color: "white",
                  border: "none",
                  padding: "0.25rem 0.75rem",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <hr style={{ margin: "2rem 0" }} />

      <h2>Add a Player</h2>
      <div style={{ marginBottom: "1rem" }}>
        <label>Filter by Position: </label>
        <select
          value={filterPosition}
          onChange={(e) => setFilterPosition(e.target.value)}
        >
          <option value="">All</option>
          <option value="QB">QB</option>
          <option value="RB">RB</option>
          <option value="WR">WR</option>
          <option value="TE">TE</option>
          <option value="DEF">DEF</option>
          <option value="K">K</option>
        </select>

        <label style={{ marginLeft: "1rem" }}>Filter by Team: </label>
        <select
          value={filterTeam}
          onChange={(e) => setFilterTeam(e.target.value)}
        >
          <option value="">All</option>
          <option value="KC">KC</option>
          <option value="BUF">BUF</option>
          <option value="SF">SF</option>
          <option value="DAL">DAL</option>
          <option value="PHI">PHI</option>
          {/* add more teams or dynamically generate */}
        </select>
      </div>

      <select
        value={selectedPlayerId ?? ""}
        onChange={(e) => setSelectedPlayerId(Number(e.target.value))}
        style={{ padding: "0.5rem", marginRight: "0.5rem" }}
      >
        <option value="">Select a player</option>
        {availablePlayers
          .filter((p) => !players.some((tp) => tp.id === p.id))
          .filter((p) =>
            filterPosition ? p.position === filterPosition : true
          )
          .filter((p) => (filterTeam ? p.team_name === filterTeam : true))
          .map((p) => (
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
