import { motion, useReducedMotion } from "framer-motion";
import MicroSlats from "../components/MicroSlats";
import "./Login.css";

const easeOut = [0.22, 1, 0.36, 1];

export default function Login({ onLogin }) {
  const reduceMotion = useReducedMotion();

  const enter = (delay = 0) => reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.55, delay, ease: easeOut },
      };

  return (
    <main className="login-page">
      <div className="login-background" aria-hidden="true">
        <MicroSlats
          color="#07b2f6"
          glintColor="#ffffff"
          backgroundColor="#000000"
          slatWidth={10}
          slatHeight={24}
          gap={3}
          roundness={1.5}
          speed={0.6}
          scale={1.5}
          direction={250}
          chop={1.05}
          stretch={0}
          glint={0.5}
          contrast={1.95}
          perspective={0.5}
          fog={0.55}
          interactive
          cursorStrength={1}
          cursorSize={50}
          swirl={0}
          trail={1.4}
          lean={0}
          intro
          introDuration={1.5}
          paused={false}
        />
      </div>
      <div className="login-backdrop-shade" aria-hidden="true" />

      <motion.section
        className="login-panel"
        initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, ease: easeOut }}
        aria-label="Sign in to AIOps"
      >
        <div className="login-intro">
          <motion.div className="login-brand" {...enter(0.1)}>
            <img src="/logo1.png" alt="AIOps" />
            <span>AIOPS <span className="login-brand-divider">/</span> CONTROL CENTER</span>
          </motion.div>

          <motion.div className="login-intro-copy" {...enter(0.2)}>
            <div className="login-eyebrow">
              <span className="login-eyebrow-dot" />
              INFRASTRUCTURE INTELLIGENCE
            </div>
            <h1>Clarity for your<br /><span>entire fleet.</span></h1>
            <p>
              Monitor health, investigate anomalies, and keep every service
              moving from one calm, focused workspace.
            </p>
          </motion.div>

          <motion.div className="login-trust" {...enter(0.32)}>
            <span className="login-trust-mark">✓</span>
            <span>Live visibility across your infrastructure</span>
          </motion.div>
        </div>

        <div className="login-form-side">
          <motion.div className="login-form-content" {...enter(0.24)}>
            <div className="login-mobile-brand">
              <img src="/logo.png" alt="" />
              <span>AIOps</span>
            </div>
            <div className="login-form-heading">
              <div className="login-form-kicker">WELCOME BACK</div>
              <h2>Sign in to your workspace</h2>
              <p>Enter your details to continue to the dashboard.</p>
            </div>

            <form className="login-form" onSubmit={event => {
              event.preventDefault();
              onLogin();
            }}>
              <label htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                name="email"
                type="email"
                placeholder="you@company.com"
                autoComplete="username"
                required
              />

              <div className="login-password-label">
                <label htmlFor="login-password">Password</label>
                <span>Demo access</span>
              </div>
              <input
                id="login-password"
                name="password"
                type="password"
                placeholder="Enter any password"
                autoComplete="current-password"
                required
              />

              <button className="login-submit" type="submit">
                <span>Continue to dashboard</span>
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M4 10h11M10 5l5 5-5 5" />
                </svg>
              </button>
            </form>

            <div className="login-demo-note">
              <span className="login-info-icon">i</span>
              <span>Demo sign-in only. Any valid email and password will work.</span>
            </div>
            <div className="login-support-note">
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M2 3.5h12v8H2z" />
                <path d="M5 14h6M8 11.5V14" />
              </svg>
              <span>Your infrastructure, at a glance</span>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <div className="login-footer">
        <span>© 2026 AIOps Control Center</span>
        <span>OBSERVE <i /> UNDERSTAND <i /> RESPOND</span>
      </div>
    </main>
  );
}
