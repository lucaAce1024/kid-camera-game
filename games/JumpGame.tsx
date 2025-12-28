"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

interface JumpGameProps {
  pose: any;
  isDetecting: boolean;
}

export default function JumpGame({ pose, isDetecting }: JumpGameProps) {
  const [marioY, setMarioY] = useState(0);
  const [score, setScore] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const groundY = 200; // 地面Y坐标
  const jumpHeight = 150;
  const lastAnkleYRef = useRef<number | null>(null);

  useEffect(() => {
    if (!pose || !isDetecting) return;

    const leftAnkle = pose.leftAnkle;
    const rightAnkle = pose.rightAnkle;

    if (leftAnkle && rightAnkle) {
      const avgAnkleY = (leftAnkle.y + rightAnkle.y) / 2;
      const noseY = pose.nose?.y || 0;

      // 检测跳跃：脚踝Y值突然增大（向上移动）且鼻子Y值减小
      if (lastAnkleYRef.current !== null) {
        const ankleDelta = lastAnkleYRef.current - avgAnkleY; // 正值表示向上移动
        const noseDelta = noseY - (pose.nose?.y || 0);

        // 跳跃检测：脚踝向上移动且鼻子也向上移动
        if (ankleDelta > 0.02 && noseY < 0.4 && !isJumping) {
          handleJump();
        }
      }

      lastAnkleYRef.current = avgAnkleY;

      // 根据脚踝位置更新Mario位置（简单的跟随效果）
      const normalizedY = (avgAnkleY - 0.5) * 100;
      setMarioY(Math.max(0, Math.min(jumpHeight, normalizedY)));
    }
  }, [pose, isDetecting, isJumping]);

  const handleJump = () => {
    setIsJumping(true);
    setMarioY(jumpHeight);
    setScore((prev) => prev + 10);

    setTimeout(() => {
      setIsJumping(false);
      setMarioY(0);
    }, 500);
  };

  return (
    <div className="w-full h-full min-h-[500px] bg-gradient-to-b from-blue-400 to-green-400 rounded-2xl p-8 relative overflow-hidden shadow-2xl">
      {/* 游戏标题 */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <h2 className="text-3xl font-bold text-white drop-shadow-lg">
          Jump Challenge
        </h2>
        <div className="text-2xl font-bold text-white drop-shadow-lg">
          Score: {score}
        </div>
      </div>

      {/* 地面 */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-green-600 to-green-500 flex items-center justify-center">
        <div className="text-white/80 text-sm">Jump up to make Mario jump!</div>
      </div>

      {/* Mario角色 */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
        <motion.div
          animate={{
            y: -marioY,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="text-6xl"
        >
          {isJumping ? "🦘" : "👨"}
        </motion.div>
      </div>

      {/* 云朵装饰 */}
      <div className="absolute top-20 left-10 text-4xl opacity-50">☁️</div>
      <div className="absolute top-32 right-20 text-3xl opacity-50">☁️</div>

      {/* 提示信息 */}
      {!isDetecting && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl">
          <div className="text-white text-xl font-semibold">
            Please stand in front of the camera
          </div>
        </div>
      )}
    </div>
  );
}

