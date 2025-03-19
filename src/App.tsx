import "./App.css";
import { useRef, useState } from "react";
import { Game } from "./three/Game";

export const App = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [game, setGame] = useState<Game | null>(null);

  const startGame = () => {
    if (!containerRef.current || game) return;
    const gameInstance = new Game(containerRef.current);
    setGame(gameInstance);
  };

  return (
    <div className="App">
      <div className="game" ref={containerRef} />
      <div className={`start-screen ${game ? "hidden" : ""}`}>
        <h1 className="title">Minecraft</h1>
        <button className="play-button" onClick={startGame}>
          Play
        </button>
      </div>
    </div>
  );
};
