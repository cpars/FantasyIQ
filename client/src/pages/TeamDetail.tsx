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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetch(`http://localhost:5000/api/teams/${id}/players`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
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

      <button style={{ marginTop: "1rem" }} onClick={() => navigate(-1)}>
        ← Back to Dashboard
      </button>
    </div>
  );
}
