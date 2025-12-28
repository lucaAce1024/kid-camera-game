"use client";

import { motion } from "framer-motion";

interface GameHomeProps {
  onStartGame: (gameType: string) => void;
}

const games = [
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

      <div className="flex justify-center">
        {games.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.2, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full max-w-md"
          >
            <button
              onClick={() => onStartGame(game.id)}
              className={`w-full h-80 rounded-2xl bg-gradient-to-br ${game.color} p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 flex flex-col items-center justify-center text-white`}
            >
              <div className="text-8xl mb-6">{game.emoji}</div>
              <h2 className="text-4xl font-bold mb-4">{game.name}</h2>
              <p className="text-lg opacity-90">{game.description}</p>
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

