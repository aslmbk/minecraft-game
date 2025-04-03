import "./App.css";
import { useEffect, useRef, useState } from "react";
import { Game } from "./three/Game";

const blocks = [
  {
    id: 0,
    texture: "/textures/pickaxe.png",
    keyCode: "Digit0",
    hint: "0",
  },
  {
    id: 1,
    texture: "/textures/grass.png",
    keyCode: "Digit1",
    hint: "1",
  },
  {
    id: 2,
    texture: "/textures/dirt.png",
    keyCode: "Digit2",
    hint: "2",
  },
  {
    id: 3,
    texture: "/textures/stone.png",
    keyCode: "Digit3",
    hint: "3",
  },
  {
    id: 4,
    texture: "/textures/coal_ore.png",
    keyCode: "Digit4",
    hint: "4",
  },
  {
    id: 5,
    texture: "/textures/iron_ore.png",
    keyCode: "Digit5",
    hint: "5",
  },
  {
    id: 6,
    texture: "/textures/leaves.png",
    keyCode: "Digit6",
    hint: "6",
  },
  {
    id: 7,
    texture: "/textures/tree_side.png",
    keyCode: "Digit7",
    hint: "7",
  },
  {
    id: 8,
    texture: "/textures/sand.png",
    keyCode: "Digit8",
    hint: "8",
  },
  {
    id: 9,
    texture: "/textures/snow.png",
    keyCode: "Digit9",
    hint: "9",
  },
];

export const App = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [activeBlock, setActiveBlock] = useState(0);

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
    game.inputs.events.on("keydown", ({ event }) => {
      const block = blocks.find((block) => block.keyCode === event.code);
      if (block) {
        setActiveBlock(block.id);
      }
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
      <div className="toolbar" style={{ zIndex: 500 }}>
        <div className="toolbar-items">
          {blocks.map((block) => (
            <div
              key={block.id}
              className={`toolbar-item ${
                activeBlock === block.id ? "active" : ""
              }`}
            >
              <div className="block-texture">
                <img src={block.texture} alt={block.hint} />
              </div>
              <div className="digit-hint">{block.hint}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
