"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FruitNinjaGameProps {
  pose: any;
  isDetecting: boolean;
}

interface Fruit {
  id: number;
  x: number;
  y: number;
  type: string;
  emoji: string;
  speed: number;
  rotation: number;
  rotationSpeed: number;
}

interface SlashTrail {
  id: number;
  x: number;
  y: number;
  timestamp: number;
}

interface FruitFragment {
  id: number;
  x: number;
  y: number;
  emoji: string;
  vx: number; // 水平速度
  vy: number; // 垂直速度
  rotation: number;
  rotationSpeed: number;
}

const FRUITS = [
  { emoji: "🍎", type: "apple", points: 10 },
  { emoji: "🍌", type: "banana", points: 15 },
  { emoji: "🍊", type: "orange", points: 10 },
  { emoji: "🍇", type: "grape", points: 20 },
  { emoji: "🍓", type: "strawberry", points: 15 },
  { emoji: "🍑", type: "peach", points: 12 },
  { emoji: "🥝", type: "kiwi", points: 18 },
  { emoji: "🍉", type: "watermelon", points: 25 },
];

export default function FruitNinjaGame({
  pose,
  isDetecting,
}: FruitNinjaGameProps) {
  const [fruits, setFruits] = useState<Fruit[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [gameTime, setGameTime] = useState(60);
  const [isGameOver, setIsGameOver] = useState(false);
  const [slashTrails, setSlashTrails] = useState<SlashTrail[]>([]);
  const [fragments, setFragments] = useState<FruitFragment[]>([]);
  const lastWristPosRef = useRef<{ left: { x: number; y: number } | null; right: { x: number; y: number } | null }>({
    left: null,
    right: null,
  });
  const gameAreaRef = useRef<HTMLDivElement>(null);

  // 重置游戏
  const resetGame = () => {
    setFruits([]);
    setScore(0);
    setCombo(0);
    setGameTime(60);
    setIsGameOver(false);
    setSlashTrails([]);
    setFragments([]);
    lastWristPosRef.current = {
      left: null,
      right: null,
    };
  };

  // 游戏倒计时
  useEffect(() => {
    if (gameTime > 0 && !isGameOver) {
      const timer = setInterval(() => {
        setGameTime((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    } else if (gameTime === 0) {
      setIsGameOver(true);
    }
  }, [gameTime, isGameOver]);

  // 生成水果
  useEffect(() => {
    if (isGameOver) return;

    // 立即生成第一个水果
    const generateFruit = () => {
      const fruitType = FRUITS[Math.floor(Math.random() * FRUITS.length)];
      const newFruit: Fruit = {
        id: Date.now() + Math.random(),
        x: Math.random() * 80 + 10, // 10% 到 90% 的位置
        y: 100, // 从底部开始（100%）
        type: fruitType.type,
        emoji: fruitType.emoji,
        speed: 2 + Math.random() * 3, // 2-5 的速度（加快）
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 15,
      };
      setFruits((prev) => [...prev, newFruit]);
    };

    // 立即生成一个
    const timeout = setTimeout(() => {
      generateFruit();
    }, 500); // 延迟500ms生成第一个，确保游戏区域已渲染

    const interval = setInterval(() => {
      generateFruit();
    }, 1500 - Math.min(score / 50, 800)); // 随着分数增加，生成速度加快

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };

    return () => clearInterval(interval);
  }, [isGameOver, score]);

  // 更新水果位置
  useEffect(() => {
    if (isGameOver) return;

    const interval = setInterval(() => {
      setFruits((prev) =>
        prev
          .map((fruit) => ({
            ...fruit,
            y: fruit.y - fruit.speed * 0.5, // 向上移动（y值减小），每16ms移动，加快速度
            rotation: fruit.rotation + fruit.rotationSpeed * 0.2,
          }))
          .filter((fruit) => fruit.y > -15) // 移除超出屏幕顶部的水果
      );
    }, 16);

    return () => clearInterval(interval);
  }, [isGameOver]);

  // 检测手势切水果
  useEffect(() => {
    if (!pose || !isDetecting || isGameOver) return;

    const leftWrist = pose.leftWrist;
    const rightWrist = pose.rightWrist;

    if (leftWrist && rightWrist) {
      // 将姿态坐标转换为游戏区域坐标
      const gameArea = gameAreaRef.current;
      if (!gameArea) return;

      const gameWidth = gameArea.offsetWidth;
      const gameHeight = gameArea.offsetHeight;

      // 计算手腕在游戏区域中的位置（注意：pose坐标是0-1，需要转换为像素）
      const leftWristX = leftWrist.x * gameWidth;
      const leftWristY = leftWrist.y * gameHeight;
      const rightWristX = rightWrist.x * gameWidth;
      const rightWristY = rightWrist.y * gameHeight;

      // 检测快速移动（切的动作）
      const lastLeft = lastWristPosRef.current.left;
      const lastRight = lastWristPosRef.current.right;

      if (lastLeft && lastRight) {
        const leftSpeed = Math.sqrt(
          Math.pow(leftWristX - lastLeft.x, 2) +
            Math.pow(leftWristY - lastLeft.y, 2)
        );
        const rightSpeed = Math.sqrt(
          Math.pow(rightWristX - lastRight.x, 2) +
            Math.pow(rightWristY - lastRight.y, 2)
        );

        // 如果移动速度足够快，认为是切的动作
        const SLASH_THRESHOLD = 20; // 降低阈值，更容易触发
        if (leftSpeed > SLASH_THRESHOLD || rightSpeed > SLASH_THRESHOLD) {
          // 添加切痕轨迹
          const activeWrist = leftSpeed > rightSpeed ? leftWrist : rightWrist;
          const activeWristX = leftSpeed > rightSpeed ? leftWristX : rightWristX;
          const activeWristY = leftSpeed > rightSpeed ? leftWristY : rightWristY;

          setSlashTrails((prev) => [
            ...prev.slice(-10), // 只保留最近10个点
            {
              id: Date.now(),
              x: activeWristX,
              y: activeWristY,
              timestamp: Date.now(),
            },
          ]);

          // 检测是否切中水果
          checkFruitHit(activeWristX, activeWristY);
        } else {
          // 即使速度不够快，也检测是否在水果附近（更宽松的检测）
          checkFruitHit(leftWristX, leftWristY);
          checkFruitHit(rightWristX, rightWristY);
        }
      }

      lastWristPosRef.current = {
        left: { x: leftWristX, y: leftWristY },
        right: { x: rightWristX, y: rightWristY },
      };
    }
  }, [pose, isDetecting, isGameOver]);

  // 清理过期的切痕
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setSlashTrails((prev) =>
        prev.filter((trail) => now - trail.timestamp < 200)
      );
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // 更新碎片位置和清理过期碎片
  useEffect(() => {
    if (fragments.length === 0) return;

    const interval = setInterval(() => {
      setFragments((prev) =>
        prev
          .map((fragment) => ({
            ...fragment,
            x: fragment.x + fragment.vx * 0.8, // 添加阻力
            y: fragment.y + fragment.vy * 0.8,
            rotation: fragment.rotation + fragment.rotationSpeed,
            vy: fragment.vy + 0.8, // 重力效果
            vx: fragment.vx * 0.98, // 水平阻力
          }))
          .filter((fragment) => {
            // 移除超出屏幕的碎片
            if (!gameAreaRef.current) return false;
            const gameWidth = gameAreaRef.current.offsetWidth;
            const gameHeight = gameAreaRef.current.offsetHeight;
            return (
              fragment.x > -100 &&
              fragment.x < gameWidth + 100 &&
              fragment.y > -100 &&
              fragment.y < gameHeight + 100
            );
          })
      );
    }, 16);

    return () => clearInterval(interval);
  }, [fragments.length]);

  const checkFruitHit = (x: number, y: number) => {
    const HIT_RADIUS = 150; // 切中半径（水果放大5倍，切中半径也相应增大）

    setFruits((prev) => {
      const hitFruits: Fruit[] = [];
      const remainingFruits: Fruit[] = [];

      prev.forEach((fruit) => {
        if (!gameAreaRef.current) {
          remainingFruits.push(fruit);
          return;
        }
        const gameWidth = gameAreaRef.current.offsetWidth;
        const gameHeight = gameAreaRef.current.offsetHeight;
        const fruitX = (fruit.x / 100) * gameWidth;
        const fruitY = (fruit.y / 100) * gameHeight;

        const distance = Math.sqrt(
          Math.pow(x - fruitX, 2) + Math.pow(y - fruitY, 2)
        );

        if (distance < HIT_RADIUS) {
          hitFruits.push(fruit);
        } else {
          remainingFruits.push(fruit);
        }
      });

      if (hitFruits.length > 0) {
        // 创建切碎动画效果
        hitFruits.forEach((fruit) => {
          if (!gameAreaRef.current) return;
          const gameWidth = gameAreaRef.current.offsetWidth;
          const gameHeight = gameAreaRef.current.offsetHeight;
          const fruitX = (fruit.x / 100) * gameWidth;
          const fruitY = (fruit.y / 100) * gameHeight;

          // 创建4-6个碎片，向不同方向飞溅
          const fragmentCount = 5 + Math.floor(Math.random() * 2); // 5-6个碎片
          const newFragments: FruitFragment[] = [];

          for (let i = 0; i < fragmentCount; i++) {
            const angle = (Math.PI * 2 * i) / fragmentCount + (Math.random() - 0.5) * 0.8;
            const speed = 4 + Math.random() * 6; // 4-10的速度
            newFragments.push({
              id: Date.now() + Math.random() * 1000 + i,
              x: fruitX,
              y: fruitY,
              emoji: fruit.emoji,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed - 3, // 初始向上速度，更明显
              rotation: Math.random() * 360,
              rotationSpeed: (Math.random() - 0.5) * 25, // 更快的旋转
            });
          }

          setFragments((prev) => [...prev, ...newFragments]);
        });

        // 计算得分
        const points = hitFruits.reduce((sum, fruit) => {
          const fruitData = FRUITS.find((f) => f.type === fruit.type);
          return sum + (fruitData?.points || 10);
        }, 0);

        const comboMultiplier = 1 + combo * 0.1;
        const finalPoints = Math.floor(points * comboMultiplier);

        setScore((prev) => prev + finalPoints);
        setCombo((prev) => prev + 1);

        // 重置combo计时器
        setTimeout(() => {
          setCombo((prev) => Math.max(0, prev - 1));
        }, 2000);
      }

      return remainingFruits;
    });
  };

  return (
    <div
      ref={gameAreaRef}
      className="w-full h-full min-h-[500px] bg-gradient-to-b from-sky-300 via-blue-400 to-indigo-500 rounded-2xl p-4 md:p-8 relative overflow-visible shadow-2xl"
    >
      {/* 游戏标题和分数 */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <h2 className="text-3xl font-bold text-white drop-shadow-lg">
          🍎 Fruit Ninja
        </h2>
        <div className="flex gap-4 items-center">
          {combo > 1 && (
            <div className="text-xl font-bold text-yellow-300 drop-shadow-lg animate-pulse">
              COMBO x{combo}!
            </div>
          )}
          <div className="text-2xl font-bold text-white drop-shadow-lg">
            Score: {score}
          </div>
          <div className="text-2xl font-bold text-white drop-shadow-lg">
            Time: {gameTime}s
          </div>
        </div>
      </div>

      {/* 切痕轨迹 */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
        {slashTrails.map((trail, index) => {
          const nextTrail = slashTrails[index + 1];
          if (!nextTrail) return null;
          return (
            <line
              key={`${trail.id}-${index}`}
              x1={trail.x}
              y1={trail.y}
              x2={nextTrail.x}
              y2={nextTrail.y}
              stroke="#FFD700"
              strokeWidth="4"
              strokeLinecap="round"
              opacity={0.8}
            />
          );
        })}
      </svg>

      {/* 水果 */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-visible">
        {fruits.map((fruit) => (
          <div
            key={fruit.id}
            className="absolute text-6xl md:text-7xl pointer-events-none select-none"
            style={{
              left: `${fruit.x}%`,
              top: `${fruit.y}%`,
              transform: `translate(-50%, -50%) rotate(${fruit.rotation}deg) scale(5)`,
              willChange: "transform",
            }}
          >
            {fruit.emoji}
          </div>
        ))}
      </div>

      {/* 切碎的水果碎片 */}
      <div className="absolute inset-0 pointer-events-none z-15 overflow-visible">
        {fragments.map((fragment) => {
          // 计算碎片存在时间，用于淡出效果
          const gameHeight = gameAreaRef.current?.offsetHeight || 500;
          const opacity = Math.max(0, Math.min(1, 1 - Math.abs(fragment.y - gameHeight * 0.5) / (gameHeight * 0.6)));
          const baseScale = 0.7 + opacity * 0.3;
          
          return (
            <div
              key={fragment.id}
              className="absolute text-4xl md:text-5xl pointer-events-none select-none"
              style={{
                left: `${fragment.x}px`,
                top: `${fragment.y}px`,
                transform: `translate(-50%, -50%) rotate(${fragment.rotation}deg) scale(${baseScale * 5})`,
                opacity: opacity,
                filter: `brightness(${0.8 + opacity * 0.2})`,
                transition: "opacity 0.05s linear, transform 0.05s linear",
              }}
            >
              {fragment.emoji}
            </div>
          );
        })}
      </div>
      
      {/* 调试信息 - 开发时显示 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-20 left-4 text-white text-xs bg-black/50 p-2 rounded z-50">
          Fruits: {fruits.length} | Y: {fruits[0]?.y.toFixed(1) || 'N/A'}
        </div>
      )}

      {/* 地面提示 */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-green-600/80 to-transparent flex items-center justify-center">
        <div className="text-white/90 text-sm font-semibold">
          Wave your hands quickly to slice fruits! 🗡️
        </div>
      </div>

      {/* 提示信息 */}
      {!isDetecting && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl z-30">
          <div className="text-white text-xl font-semibold">
            Please stand in front of the camera
          </div>
        </div>
      )}

      {/* 游戏结束 */}
      {isGameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-2xl z-40">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center text-white"
          >
            <div className="text-5xl font-bold mb-4">Game Over! 🎉</div>
            <div className="text-3xl mb-2">Final Score: {score}</div>
            <div className="text-xl text-yellow-300 mb-6">
              {score > 500 ? "🌟 Amazing!" : score > 300 ? "Great Job!" : "Good Try!"}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetGame}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-2xl font-bold rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300"
            >
              🔄 Try Again
            </motion.button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

