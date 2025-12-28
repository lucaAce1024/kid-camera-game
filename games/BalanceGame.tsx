"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface BalanceGameProps {
  pose: any;
  isDetecting: boolean;
}

export default function BalanceGame({ pose, isDetecting }: BalanceGameProps) {
  const [balance, setBalance] = useState(0); // -1 to 1, 0 is center
  const [score, setScore] = useState(0);
  const [gameTime, setGameTime] = useState(60);

  useEffect(() => {
    if (!pose || !isDetecting) return;

    const leftShoulder = pose.leftShoulder;
    const rightShoulder = pose.rightShoulder;
    const nose = pose.nose;

    if (leftShoulder && rightShoulder && nose) {
      // 计算身体倾斜：比较左右肩膀的X位置
      const shoulderDiff = rightShoulder.x - leftShoulder.x;
      // 归一化到 -1 到 1
      const normalizedBalance = Math.max(-1, Math.min(1, (shoulderDiff - 0.1) * 5));
      setBalance(normalizedBalance);

      // 保持平衡得分（越接近0越好）
      const balanceScore = Math.max(0, 100 - Math.abs(normalizedBalance) * 100);
      if (balanceScore > 80) {
        setScore((prev) => prev + 0.1);
      }
    }
  }, [pose, isDetecting]);

  // 倒计时
  useEffect(() => {
    if (gameTime > 0) {
      const timer = setInterval(() => {
        setGameTime((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameTime]);

  const balanceAngle = balance * 15; // 最大倾斜15度

  return (
    <div className="w-full h-full min-h-[500px] bg-gradient-to-b from-yellow-400 to-orange-400 rounded-2xl p-8 relative overflow-hidden shadow-2xl">
      {/* 游戏标题 */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <h2 className="text-3xl font-bold text-white drop-shadow-lg">
          Balance Board
        </h2>
        <div className="flex gap-4">
          <div className="text-2xl font-bold text-white drop-shadow-lg">
            Score: {Math.floor(score)}
          </div>
          <div className="text-2xl font-bold text-white drop-shadow-lg">
            Time: {gameTime}s
          </div>
        </div>
      </div>

      {/* 平衡板 */}
      <div className="absolute bottom-40 left-1/2 transform -translate-x-1/2">
        <motion.div
          animate={{
            rotate: balanceAngle,
          }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="w-64 h-8 bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg shadow-xl border-4 border-gray-900"
        >
          {/* 角色 */}
          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
            <motion.div
              animate={{
                x: balance * 50,
              }}
              className="text-6xl"
            >
              🧍
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* 平衡指示器 */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-64">
        <div className="h-4 bg-white/30 rounded-full overflow-hidden">
          <motion.div
            animate={{
              width: `${(1 - Math.abs(balance)) * 100}%`,
              x: `${(balance * 50)}%`,
            }}
            className="h-full bg-green-500 rounded-full"
          />
        </div>
        <div className="text-center text-white/80 text-sm mt-2">
          {Math.abs(balance) < 0.2 ? "Perfect Balance! 🎯" : "Keep Balancing!"}
        </div>
      </div>

      {/* 提示信息 */}
      {!isDetecting && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl">
          <div className="text-white text-xl font-semibold">
            Lean left and right to balance!
          </div>
        </div>
      )}

      {/* 游戏结束 */}
      {gameTime === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
          <div className="text-center text-white">
            <div className="text-4xl font-bold mb-4">Game Over!</div>
            <div className="text-2xl">Final Score: {Math.floor(score)}</div>
          </div>
        </div>
      )}
    </div>
  );
}

