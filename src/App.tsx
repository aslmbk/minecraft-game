import "./App.css";
import { useEffect, useRef } from "react";
import { Game } from "./three/Game";

export const App = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const game = new Game(containerRef.current);

    return () => {
      game.dispose();
    };
  }, []);

  return <div className="App" ref={containerRef} />;
};
