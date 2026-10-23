import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import "./index.css";
import "./minimalist-white.css";
import "./platinum-dark.css";
import Login from "./pages/Login";
import MicroSlats from "./components/MicroSlats";
import Sidebar  from "./components/Sidebar";
import TopBar   from "./components/TopBar";
import Dashboard   from "./pages/Dashboard";
import Anomalies   from "./pages/Anomalies";
import LogExplorer from "./pages/LogExplorer";
import Servers     from "./pages/Servers";
import Copilot     from "./pages/Copilot";

const PAGES = {
  dashboard: <Dashboard />,
  anomalies: <Anomalies />,
  logs:      <LogExplorer />,
  servers:   <Servers />,
  copilot:   <Copilot />,
};

export default function App() {
  const reduceMotion = useReducedMotion();
  const [page, setPage] = useState("dashboard");
  const [authenticated, setAuthenticated] = useState(false);
  const [theme, setTheme] = useState(() => {
    try {
      return window.localStorage.getItem("aiops-theme") === "light" ? "light" : "dark";
    } catch (error) {
      console.warn("Unable to read the saved theme preference.", error);
      return "dark";
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      window.localStorage.setItem("aiops-theme", theme);
    } catch (error) {
      console.warn("Unable to save the theme preference.", error);
    }
  }, [theme]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      {!authenticated ? (
        <motion.div
          key="login"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: reduceMotion ? 0 : 0.2 } }}
        >
          <Login onLogin={() => setAuthenticated(true)} />
        </motion.div>
      ) : (
        <motion.div
          key="dashboard"
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="scan-overlay" />
          <div className="app-frame">
            <MicroSlats
              className="app-microslats-background"
              color={theme === "light" ? "#252a31" : "#c7cbd1"}
              glintColor={theme === "light" ? "#656c75" : "#ffffff"}
              backgroundColor="rgba(0, 0, 0, 0)"
              slatWidth={10}
              slatHeight={24}
              gap={4}
              speed={0.25}
              glint={0.12}
              contrast={0.8}
              fog={0.8}
              interactive={false}
              intro={false}
            />
            <Sidebar page={page} setPage={setPage} />
            <div className="app-workspace">
              <TopBar page={page} theme={theme} onThemeToggle={() => setTheme(current => current === "dark" ? "light" : "dark")} />
              <main className="app-content">
                {PAGES[page]}
              </main>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
