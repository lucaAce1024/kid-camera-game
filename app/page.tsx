"use client";

import { useEffect, useState } from "react";
import GameHome from "@/components/GameHome";
import CameraGame from "@/components/CameraGame";

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  return (
    <main className="game-container bg-gradient-to-br from-mario-red via-mario-blue to-mario-yellow min-h-screen">
      {!gameStarted ? (
        <GameHome
          onStartGame={(gameType) => {
            setSelectedGame(gameType);
            setGameStarted(true);
          }}
        />
      ) : (
        <CameraGame
          gameType={selectedGame || "jump"}
          onBack={() => {
            setGameStarted(false);
            setSelectedGame(null);
          }}
        />
      )}
    </main>
  );
}

