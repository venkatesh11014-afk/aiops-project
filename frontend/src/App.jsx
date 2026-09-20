import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import LogExplorer from "./pages/LogExplorer";
import Anomalies from "./pages/Anomalies";
import Servers from "./pages/Servers";
import Copilot from "./pages/Copilot";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";

export default function App() {
  const [page, setPage] = useState("dashboard");

  const pages = {
    dashboard: <Dashboard />,
    logs: <LogExplorer />,
    anomalies: <Anomalies />,
    servers: <Servers />,
    copilot: <Copilot />,
  };

  return (
    <div className="app-shell" style={{ display: "flex", height: "100vh", background: "#080d1a", color: "#e2e8f0", fontFamily: "'Inter', system-ui, sans-serif", overflow: "hidden" }}>
      <Sidebar page={page} setPage={setPage} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopBar page={page} />
        <main className="app-main" style={{ flex: 1, overflow: "auto", padding: "24px" }}>
          {pages[page]}
        </main>
      </div>
    </div>
  );
}
