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

  function handleDelete(teamId: number) {
    fetch(`http://localhost:5000/api/teams/${teamId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        console.log("Delete status:", res.status);
        if (!res.ok) throw new Error("Delete failed");
        setTeams((prev) => prev.filter((team) => team.id !== teamId));
      })
      .catch((err) => alert(err.message));
  }

  const [showConfirm, setShowConfirm] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);

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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1rem",
          }}
        >
          {teams.map((team) => (
            <div
              key={team.id}
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                padding: "1.5rem",
                borderRadius: "1rem",
                boxShadow: "0 0 15px rgba(0,0,0,0.3)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <h3 style={{ marginBottom: "0.5rem", color: "#fff" }}>
                {team.name}
              </h3>

              <button
                onClick={() => navigate(`/teams/${team.id}`)}
                style={{
                  padding: "0.5rem",
                  borderRadius: "0.5rem",
                  border: "none",
                  background: "linear-gradient(to right, #36d1dc, #5b86e5)",
                  color: "white",
                  fontWeight: "bold",
                  cursor: "pointer",
                  marginTop: "1rem",
                }}
              >
                View Players
              </button>
              <button
                onClick={() => {
                  setTeamToDelete(team);
                  setShowConfirm(true);
                }}
                style={{
                  flex: 1,
                  padding: "0.5rem",
                  borderRadius: "0.5rem",
                  border: "none",
                  background: "linear-gradient(to right, #ff416c, #ff4b2b)",
                  color: "white",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
      {showConfirm && teamToDelete && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#1e1e1e",
              padding: "2rem",
              borderRadius: "1rem",
              width: "90%",
              maxWidth: "400px",
              color: "white",
              textAlign: "center",
              boxShadow: "0 0 25px rgba(0,0,0,0.4)",
            }}
          >
            <h2>Delete Team</h2>
            <p>
              Are you sure you want to delete{" "}
              <strong>{teamToDelete.name}</strong>?
            </p>

            <div
              style={{
                marginTop: "1.5rem",
                display: "flex",
                gap: "1rem",
                justifyContent: "center",
              }}
            >
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "0.5rem",
                  border: "none",
                  background: "gray",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDelete(teamToDelete.id);
                  setShowConfirm(false);
                  setTeamToDelete(null);
                }}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "0.5rem",
                  border: "none",
                  background: "linear-gradient(to right, #ff416c, #ff4b2b)",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
