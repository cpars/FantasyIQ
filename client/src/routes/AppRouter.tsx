import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
// import Dashboard from "../pages/Dashboard";
// import Players from "../pages/Players";
// import TeamDetail from "../pages/TeamDetail";
// import Admin from "../pages/Admin";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<Dashboard />} /> */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* <Route path="/players" element={<Players />} />
        <Route path="/teams/:id" element={<TeamDetail />} />
        <Route path="/admin" element={<Admin />} /> */}
      </Routes>
    </BrowserRouter>
  );
}
