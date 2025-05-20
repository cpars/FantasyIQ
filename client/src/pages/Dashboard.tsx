// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Team {
  id: number;
  name: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    fetch("http://localhost:5000/api/me", { headers })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch /api/me");
        return res.json();
      })
      .then(setUser)
      .catch((err) => console.error("Error fetching user info:", err));

    fetch("http://localhost:5000/api/teams", { headers })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch /api/teams");
        return res.json();
      })
      .then(setTeams)
      .catch((err) => console.error("Error fetching teams:", err));
  }, [navigate, token]);

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <div style={{ padding: "2rem", color: "white" }}>
      <h1>Welcome, {user?.username}</h1>
      <p>Email: {user?.email}</p>

      <button onClick={handleLogout} style={{ marginTop: "1rem" }}>
        Logout
      </button>

      <hr style={{ margin: "2rem 0" }} />

      <h2>Your Teams</h2>
      {teams.length === 0 ? (
        <p>You don’t have any teams yet.</p>
      ) : (
        <ul>
          {teams.map((team) => (
            <li key={team.id}>{team.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
