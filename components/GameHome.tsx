"use client";

import { motion } from "framer-motion";

interface GameHomeProps {
  onStartGame: (gameType: string) => void;
}

const games = [
  {
    id: "jump",
    name: "Jump Challenge",
    description: "Jump up to make Mario jump!",
    emoji: "🦘",
    color: "from-red-500 to-pink-500",
  },
  {
    id: "wave",
    name: "Wave Race",
    description: "Wave your hands to control the character!",
    emoji: "👋",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "balance",
    name: "Balance Board",
    description: "Lean left and right to balance!",
    emoji: "⚖️",
    color: "from-yellow-500 to-orange-500",
  },
  {
    id: "fruit",
    name: "Fruit Ninja",
    description: "Slice fruits with your hands!",
    emoji: "🍎",
    color: "from-green-500 to-emerald-500",
  },
];

export default function GameHome({ onStartGame }: GameHomeProps) {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 drop-shadow-2xl">
          🎮 Super Mario Party
        </h1>
        <p className="text-2xl md:text-3xl text-white/90 font-semibold">
          Camera Interactive Game
        </p>
        <p className="text-lg md:text-xl text-white/80 mt-4">
          Use your camera to play fun mini-games!
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {games.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.2, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <button
              onClick={() => onStartGame(game.id)}
              className={`w-full h-64 rounded-2xl bg-gradient-to-br ${game.color} p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 flex flex-col items-center justify-center text-white`}
            >
              <div className="text-6xl mb-4">{game.emoji}</div>
              <h2 className="text-2xl font-bold mb-2">{game.name}</h2>
              <p className="text-sm opacity-90">{game.description}</p>
            </button>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-12 text-center text-white/80 text-sm"
      >
        <p>🎥 Please allow camera access when prompted</p>
      </motion.div>
    </div>
  );
}

