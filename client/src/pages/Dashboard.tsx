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
  const [newTeamName, setNewTeamName] = useState("");

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

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!newTeamName.trim()) return;

          fetch("http://localhost:5000/api/teams", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ name: newTeamName }),
          })
            .then((res) => {
              if (!res.ok) throw new Error("Team creation failed");
              return res.json();
            })
            .then((data) => {
              setTeams((prev) => [...prev, data.team]);
              setNewTeamName("");
            })
            .catch((err) => alert(err.message));
        }}
        style={{ marginBottom: "1rem" }}
      >
        <input
          type="text"
          placeholder="New Team Name"
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
          style={{
            padding: "0.5rem",
            borderRadius: "0.5rem",
            border: "none",
            marginRight: "0.5rem",
          }}
        />
        <button type="submit">Create Team</button>
      </form>

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
