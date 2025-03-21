import "./App.css";
import { useEffect, useRef, useState } from "react";
import { Game } from "./three/Game";

export const App = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const startGame = () => {
    if (!containerRef.current || game) return;
    const gameInstance = new Game(containerRef.current);
    setGame(gameInstance);
  };

  useEffect(() => {
    if (!game) return;
    let timeout: number | null = null;
    game.loader.events.on("progress", ({ loaded, total }) => {
      setProgress(Math.round((loaded / total) * 100));
    });
    game.loader.events.on("load", () => {
      timeout = setTimeout(() => {
        setLoaded(true);
      }, 500);
    });
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [game]);

  return (
    <div className="App">
      <div className="game" ref={containerRef} />
      <div className={`start-screen ${game && loaded ? "hidden" : ""}`}>
        <h1 className="title">Minecraftless</h1>
        <button className="play-button" onClick={startGame}>
          Play
        </button>
        <div className={`loading-bar ${!game ? "hidden" : ""}`}>
          <div
            className="loading-bar-fill"
            style={{ transform: `translateX(-${100 - progress}%)` }}
          />
        </div>
      </div>
    </div>
  );
};
