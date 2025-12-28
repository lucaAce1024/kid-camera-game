"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface WaveGameProps {
  pose: any;
  isDetecting: boolean;
}

export default function WaveGame({ pose, isDetecting }: WaveGameProps) {
  const [characterX, setCharacterX] = useState(0);
  const [score, setScore] = useState(0);
  const [targets, setTargets] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    if (!pose || !isDetecting) return;

    const leftWrist = pose.leftWrist;
    const rightWrist = pose.rightWrist;
    const leftShoulder = pose.leftShoulder;
    const rightShoulder = pose.rightShoulder;

    if (leftWrist && rightWrist && leftShoulder && rightShoulder) {
      // 计算手腕相对于肩膀的位置
      const leftHandRaised = leftWrist.y < leftShoulder.y;
      const rightHandRaised = rightWrist.y < rightShoulder.y;

      // 检测挥手动作：手腕在肩膀上方
      if (leftHandRaised || rightHandRaised) {
        // 根据手腕X位置控制角色移动
        const avgWristX = (leftWrist.x + rightWrist.x) / 2;
        const normalizedX = (avgWristX - 0.5) * 400; // 转换为屏幕坐标
        setCharacterX(normalizedX);
      }
    }
  }, [pose, isDetecting]);

  // 生成目标
  useEffect(() => {
    const interval = setInterval(() => {
      setTargets((prev) => [
        ...prev,
        {
          id: Date.now(),
          x: Math.random() * 300 - 150,
          y: -50,
        },
      ]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // 更新目标位置并检测碰撞
  useEffect(() => {
    const interval = setInterval(() => {
      setTargets((prev) => {
        return prev
          .map((target) => ({
            ...target,
            y: target.y + 2,
          }))
          .filter((target) => {
            // 检测碰撞
            const distance = Math.abs(target.x - characterX);
            if (distance < 30 && target.y > 150 && target.y < 200) {
              setScore((s) => s + 1);
              return false; // 移除目标
            }
            return target.y < 300; // 移除超出屏幕的目标
          });
      });
    }, 16);

    return () => clearInterval(interval);
  }, [characterX]);

  return (
    <div className="w-full h-full min-h-[500px] bg-gradient-to-b from-purple-400 to-pink-400 rounded-2xl p-8 relative overflow-hidden shadow-2xl">
      {/* 游戏标题 */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <h2 className="text-3xl font-bold text-white drop-shadow-lg">
          Wave Race
        </h2>
        <div className="text-2xl font-bold text-white drop-shadow-lg">
          Score: {score}
        </div>
      </div>

      {/* 目标 */}
      {targets.map((target) => (
        <motion.div
          key={target.id}
          initial={{ y: target.y }}
          animate={{ y: target.y }}
          className="absolute text-4xl"
          style={{ left: `calc(50% + ${target.x}px)` }}
        >
          🎯
        </motion.div>
      ))}

      {/* 角色 */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
        <motion.div
          animate={{
            x: characterX,
          }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="text-6xl"
        >
          🏃
        </motion.div>
      </div>

      {/* 提示信息 */}
      {!isDetecting && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl">
          <div className="text-white text-xl font-semibold">
            Wave your hands to move!
          </div>
        </div>
      )}
    </div>
  );
}

