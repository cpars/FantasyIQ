import { useParams } from "react-router-dom";

export default function TeamDetail() {
  const { id } = useParams();

  return (
    <div style={{ padding: "2rem", color: "white" }}>
      <h2>Team ID: {id}</h2>
      <p>Player list will go here...</p>
    </div>
  );
}
