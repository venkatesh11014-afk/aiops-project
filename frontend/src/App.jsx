import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import LogExplorer from "./pages/LogExplorer";
import Anomalies from "./pages/Anomalies";
import Servers from "./pages/Servers";
import Copilot from "./pages/Copilot";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import Grainient from "./components/backgrounds/Grainient";
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
    <>
      {/* Grainient background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        <Grainient
    color1="#000000"
    color2="#0b1be1"
    color3="#000000"
    timeSpeed={0.2}
    colorBalance={0.03}
    warpStrength={0}
    warpFrequency={5.6}
    warpSpeed={0.6}
    warpAmplitude={14}
    blendAngle={130}
    blendSoftness={0}
    rotationAmount={870}
    noiseScale={2}
    grainAmount={0}
    grainScale={0.2}
    grainAnimated={false}
    contrast={1.05}
    gamma={1}
    saturation={1}
    centerX={0}
    centerY={0}
    zoom={0.9}
  />
</div>

Collapse Snippet


      {/* Scan line */}
      <div
        className="scan-line-overlay"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* Application */}
      <div
        className="app-shell"
        style={{
          position: "relative",
          zIndex: 2,

          display: "flex",
          height: "100vh",

          color: "#e2e8f0",
          fontFamily: "'Inter', system-ui, sans-serif",

          overflow: "hidden",
        }}
      >
        <Sidebar page={page} setPage={setPage} />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <TopBar page={page} />

          <main
            className="app-main"
            style={{
              flex: 1,
              overflow: "auto",
              padding: "24px",
            }}
          >
            {pages[page]}
          </main>
        </div>
      </div>
    </>
  );
}