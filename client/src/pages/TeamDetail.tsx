import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";

interface Player {
  id: number;
  name: string;
  position: string;
  team_name: string;
}

interface RosterStatus {
  position: string;
  used: number;
  limit: number;
}

export default function TeamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { showToast } = useToast();

  const [players, setPlayers] = useState<Player[]>([]);
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterPosition, setFilterPosition] = useState("");
  const [filterTeam, setFilterTeam] = useState("");
  const [rosterStatus, setRosterStatus] = useState<RosterStatus[]>([]);

  const draftablePositions = ["QB", "RB", "WR", "TE", "K", "DEF"];

  const uniquePositions = useMemo(
    () => Array.from(new Set(availablePlayers.map((p) => p.position))).sort(),
    [availablePlayers]
  );
  const uniqueTeams = useMemo(
    () => Array.from(new Set(availablePlayers.map((p) => p.team_name))).sort(),
    [availablePlayers]
  );

  const fetchPlayers = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/teams/${id}/players`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch players");
      const data = await res.json();
      setPlayers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailablePlayers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/players", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch available players");
      const data = await res.json();
      setAvailablePlayers(data);
    } catch (err) {
      console.error("Error fetching available players:", err);
    }
  };

  const fetchRosterStatus = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/teams/${id}/roster-status`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch roster status");
      const data = await res.json();
      console.log("Roster status fetched:", data);
      setRosterStatus(data);
    } catch (err) {
      console.error("Error fetching roster status:", err);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchPlayers();
    fetchAvailablePlayers();
    fetchRosterStatus();
  }, [id, token, navigate]);

  const handleAddPlayer = () => {
    if (!selectedPlayerId || !token) return;

    fetch(`http://localhost:5000/api/teams/${id}/players`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ player_id: selectedPlayerId }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          const message =
            errorData?.error || errorData?.message || "Failed to add player";
          throw new Error(message);
        }
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
        fetchRosterStatus();
      })
      .catch((err) => {
        console.error("Error adding player:", err);
        showToast(err.message || "Failed to add player", "error");
      });
  };

  const handleRemovePlayer = (playerId: number) => {
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
        fetchRosterStatus();
      })
      .catch((err) => {
        console.error("Error removing player:", err);
        showToast("Failed to remove player", "error");
      });
  };

  if (loading) return <p style={{ color: "white" }}>Loading players...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <div style={{ padding: "2rem", color: "white" }}>
      <h1>Players on Team #{id}</h1>

      <div style={{ margin: "1rem 0" }}>
        <h3>Roster Status</h3>
        {rosterStatus.length === 0 ? (
          <p style={{ fontStyle: "italic" }}>No roster settings found.</p>
        ) : (
          <ul style={{ listStyle: "none", paddingLeft: 0 }}>
            {rosterStatus.map((item) => (
              <li key={item.position}>
                {item.position}:{" "}
                <span
                  style={{
                    color:
                      item.used >= item.limit
                        ? "red"
                        : item.used >= item.limit - 1
                        ? "orange"
                        : "lightgreen",
                    fontWeight: "bold",
                  }}
                >
                  {item.used} / {item.limit}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

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
          {uniquePositions.map((pos) => (
            <option key={pos} value={pos}>
              {pos}
            </option>
          ))}
        </select>

        <label style={{ marginLeft: "1rem" }}>Filter by Team: </label>
        <select
          value={filterTeam}
          onChange={(e) => setFilterTeam(e.target.value)}
        >
          <option value="">All</option>
          {uniqueTeams.map((team) => (
            <option key={team} value={team}>
              {team}
            </option>
          ))}
        </select>
      </div>

      {!filterPosition && !filterTeam && (
        <p
          style={{
            color: "lightgray",
            fontStyle: "italic",
            marginTop: "0.5rem",
          }}
        >
          Select a position or team to view available players.
        </p>
      )}

      <select
        value={selectedPlayerId ?? ""}
        onChange={(e) => setSelectedPlayerId(Number(e.target.value))}
        disabled={!filterPosition && !filterTeam}
        style={{
          width: "35ch",
          padding: "0.5rem",
          marginRight: "0.5rem",
          backgroundColor: !filterPosition && !filterTeam ? "#ccc" : "white",
          color: !filterPosition && !filterTeam ? "#666" : "black",
        }}
      >
        <option value="">Select a player</option>
        {availablePlayers
          .filter((p) => draftablePositions.includes(p.position))
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
