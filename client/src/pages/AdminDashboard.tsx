// src/pages/AdminDashboard.tsx
import { useState } from "react";

export default function AdminDashboard() {
  const [selectedTab, setSelectedTab] = useState("users");

  return (
    <div style={{ padding: "2rem", color: "white" }}>
      <h1>Admin Dashboard</h1>

      {/* Navigation Tabs */}
      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={() => setSelectedTab("users")}
          style={{ marginRight: "1rem" }}
        >
          Users
        </button>
        <button
          onClick={() => setSelectedTab("teams")}
          style={{ marginRight: "1rem" }}
        >
          Teams
        </button>
        <button onClick={() => setSelectedTab("players")}>Players</button>
      </div>

      {/* Section Display */}
      <div style={{ border: "1px solid #ccc", padding: "1rem" }}>
        {selectedTab === "users" && <UsersSection />}
        {selectedTab === "teams" && <TeamsSection />}
        {selectedTab === "players" && <PlayersSection />}
      </div>
    </div>
  );
}

function UsersSection() {
  return (
    <div>
      <h2>Manage Users</h2>
      <p>List of users with promote/demote and delete options.</p>
    </div>
  );
}

function TeamsSection() {
  return (
    <div>
      <h2>Manage Teams</h2>
      <p>List of all teams. Admin can delete or view by user.</p>
    </div>
  );
}

function PlayersSection() {
  return (
    <div>
      <h2>Manage Players</h2>
      <p>Full player pool. Admin can add/edit/delete players.</p>
    </div>
  );
}
