import { useState, useEffect, useCallback, Suspense } from "react";
import "../assets/style/style.css";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, useAnimations } from "@react-three/drei";

/* =========================
   ROBOT MODEL
========================= */

function Robot({ onLoaded }) {
  const { scene, animations } = useGLTF("/models/robot.glb");

  const { actions } = useAnimations(animations, scene);

  useEffect(() => {
    if (animations && animations.length > 0) {
      const firstAnimation = actions[animations[0].name];

      if (firstAnimation) {
        firstAnimation.reset();
        firstAnimation.fadeIn(0.2).play();
      }
    }

    if (onLoaded) {
      onLoaded();
    }
  }, [actions, animations, onLoaded]);

  return (
    <primitive
      object={scene}
      scale={2}
      position={[0, -1.5, 0]}
    />
  );
}

useGLTF.preload("/models/robot.glb");


/* =========================
   HOME
========================= */

function Home() {
  // 'robot' -> 'exiting' -> 'card'
  const [screenPhase, setScreenPhase] = useState("robot");
  const [robotReady, setRobotReady] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRobotReady = useCallback(() => {
    setRobotReady(true);
  }, []);

  // Fallback: If 3D model takes longer or in case of delay, ensure ready state activates
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      setRobotReady(true);
    }, 1500);

    return () => clearTimeout(fallbackTimer);
  }, []);

  // When robot is ready, animate for 2 seconds, then transition to register card
  useEffect(() => {
    if (!robotReady) return;

    // Robot animates for 2 seconds
    const timer = setTimeout(() => {
      setScreenPhase("exiting");

      // After exit transition completes (500ms), switch fully to register card
      const exitTimer = setTimeout(() => {
        setScreenPhase("card");
      }, 500);

      return () => clearTimeout(exitTimer);
    }, 2000);

    return () => clearTimeout(timer);
  }, [robotReady]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    alert(`Registration successful!\nEmail: ${email}`);
  };

  return (
    <div className="register-page">

      {/* =========================
          ROBOT SCREEN (Shows & animates for 2 seconds)
      ========================= */}

      {screenPhase !== "card" && (
        <div className={`robot-screen ${screenPhase === "exiting" ? "exiting" : ""}`}>

          <div className="robot-title">
            <h1>WELCOME</h1>
            <p>{robotReady ? "Robot Active" : "Initializing Robot..."}</p>
          </div>

          <Canvas
            camera={{
              position: [0, 1, 7],
              fov: 45
            }}
          >

            <ambientLight intensity={2} />

            <directionalLight
              position={[5, 5, 5]}
              intensity={3}
            />

            <pointLight
              position={[-5, 2, 3]}
              intensity={2}
            />

            <Suspense fallback={null}>
              <Robot onLoaded={handleRobotReady} />
            </Suspense>

            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate
              autoRotateSpeed={3}
            />

          </Canvas>

          <div className="loading-bar">
            <div className={`loading-progress ${robotReady ? "active" : ""}`}></div>
          </div>

        </div>
      )}


      {/* =========================
          REGISTER CARD (Comes out after 2 seconds)
      ========================= */}

      {screenPhase !== "robot" && (
        <div className="register-card">

          <h1>Create Account</h1>

          <p>Register to continue</p>

          <form onSubmit={handleSubmit}>

            <div className="input-group">

              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />

            </div>


            <div className="input-group">

              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />

            </div>


            <button type="submit">
              Register
            </button>

          </form>

        </div>
      )}

    </div>
  );
}

export default Home;
