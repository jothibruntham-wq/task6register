import { useState, useEffect, useCallback, Suspense, useRef } from "react";
import "../assets/style/style.css";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, useAnimations, useProgress } from "@react-three/drei";

// Robust model URL that works both in development (/) and production (/register/)
const MODEL_URL = `${(import.meta.env.BASE_URL || "/").replace(/\/$/, "")}/models/robot.glb`;

/* =========================
   ROBOT MODEL
========================= */
function Robot({ onLoaded }) {
  const group = useRef();
  const { scene, animations } = useGLTF(MODEL_URL);
  const { actions, names } = useAnimations(animations, group);

  useEffect(() => {
    // Play the first available animation (e.g. "Brooklyn Uprock")
    if (names && names.length > 0) {
      const firstAction = actions[names[0]];
      if (firstAction) {
        firstAction.reset().fadeIn(0.3).play();
      }
    }

    if (onLoaded) {
      onLoaded();
    }
  }, [actions, names, onLoaded]);

  return (
    <group ref={group}>
      <primitive
        object={scene}
        scale={2.2}
        position={[0, -1.8, 0]}
      />
    </group>
  );
}

useGLTF.preload(MODEL_URL);

/* =========================
   HOME COMPONENT
========================= */
function Home() {
  // 'robot' -> 'exiting' -> 'card'
  const [screenPhase, setScreenPhase] = useState("robot");
  const [robotReady, setRobotReady] = useState(false);
  const { progress } = useProgress();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRobotReady = useCallback(() => {
    setRobotReady(true);
  }, []);

  const handleTransitionToCard = useCallback(() => {
    setScreenPhase("exiting");
    setTimeout(() => {
      setScreenPhase("card");
    }, 500);
  }, []);

  const handleBackToRobot = useCallback(() => {
    setScreenPhase("robot");
  }, []);

  // When robot is loaded and active, animate for 5 seconds then transition to register card
  useEffect(() => {
    if (!robotReady || screenPhase !== "robot") return;

    const timer = setTimeout(() => {
      handleTransitionToCard();
    }, 5000);

    return () => clearTimeout(timer);
  }, [robotReady, screenPhase, handleTransitionToCard]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    alert(`Registration successful!\nEmail: ${email}`);
  };

  const progressPercent = Math.min(100, Math.round(progress));

  return (
    <div className="register-page">
      {/* =========================
          ROBOT SCREEN (Shows & animates in 3D)
      ========================= */}
      {screenPhase !== "card" && (
        <div className={`robot-screen ${screenPhase === "exiting" ? "exiting" : ""}`}>
          <div className="robot-title">
            <h1>WELCOME</h1>
            <p>
              {robotReady
                ? "Robot Active & Dancing! 🕺"
                : `Loading Robot... ${progressPercent}%`}
            </p>
          </div>

          <Canvas
            camera={{
              position: [0, 1, 6],
              fov: 45,
            }}
          >
            <ambientLight intensity={2.2} />
            <directionalLight position={[5, 5, 5]} intensity={3} />
            <pointLight position={[-5, 2, 3]} intensity={2} />

            <Suspense fallback={null}>
              <Robot onLoaded={handleRobotReady} />
            </Suspense>

            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate
              autoRotateSpeed={2}
            />
          </Canvas>

          {/* Action buttons and progress bar on robot screen */}
          <div className="robot-controls-container">
            <button
              type="button"
              className="continue-btn"
              onClick={handleTransitionToCard}
            >
              {robotReady ? "Continue to Register →" : "Skip to Register →"}
            </button>

            <div className="loading-bar">
              <div
                className={`loading-progress ${robotReady ? "active" : ""}`}
                style={{
                  width: robotReady ? "100%" : `${Math.max(10, progressPercent)}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          REGISTER CARD
      ========================= */}
      {screenPhase !== "robot" && (
        <div className="register-card">
          <h1>Create Account</h1>
          <p>Register to continue</p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit">Register</button>

            <button
              type="button"
              className="view-robot-btn"
              onClick={handleBackToRobot}
            >
              🤖 View Robot Animation
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Home;
