"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSound } from "@/hooks/useSound";

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
  speed: number; // 水平速度
  vy: number; // 垂直速度（向上为正）
  maxY: number; // 最高点（百分比）
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
  // 平滑处理用的历史位置
  const smoothedPosRef = useRef<{ left: { x: number; y: number } | null; right: { x: number; y: number } | null }>({
    left: null,
    right: null,
  });
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const { playSlashSound, playSliceSound } = useSound();

  // 初始化音效系统（在用户首次交互时）
  useEffect(() => {
    const initAudio = () => {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass && !(window as any).__audioContext) {
          const audioContext = new AudioContextClass();
          (window as any).__audioContext = audioContext;
          // 尝试恢复（如果被暂停）
          if (audioContext.state === 'suspended') {
            audioContext.resume();
          }
        }
      } catch (error) {
        console.debug("Audio initialization failed:", error);
      }
    };

    // 在用户首次点击或触摸时初始化
    const handleUserInteraction = () => {
      initAudio();
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

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
    smoothedPosRef.current = {
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
      
      // 随机最高点（概率上大多数集中在屏幕中央附近）
      // 使用加权随机，使结果更集中在中央（50%附近）
      let maxY: number;
      const rand = Math.random();
      if (rand < 0.6) {
        // 60%的概率在屏幕中央附近（40%-60%）
        maxY = 40 + Math.random() * 20;
      } else if (rand < 0.85) {
        // 25%的概率在中央偏上（20%-40%）
        maxY = 20 + Math.random() * 20;
      } else if (rand < 0.95) {
        // 10%的概率在中央偏下（60%-80%）
        maxY = 60 + Math.random() * 20;
      } else {
        // 5%的概率可以到达屏幕顶端（0%-20%）或底部（80%-100%）
        maxY = Math.random() < 0.5 ? Math.random() * 20 : 80 + Math.random() * 20;
      }
      
      // 计算初始向上速度，使水果能到达最高点
      // 使用物理公式：v^2 = 2gh，其中h是高度差，g是重力加速度
      // 从底部(100%)到最高点(maxY%)的高度差
      const heightDiff = 100 - maxY;
      // 重力加速度（每帧）- 进一步减小重力使水果能抛得更高
      const gravity = 0.2;
      // 初始向上速度，需要足够大以到达最高点
      // 使用 v = sqrt(2 * g * h) 计算，并添加一些随机变化
      // 增加一个安全系数，确保能到达最高点
      const initialVy = Math.sqrt(2 * gravity * heightDiff) * (1.2 + Math.random() * 0.2);
      
      const newFruit: Fruit = {
        id: Date.now() + Math.random(),
        x: Math.random() * 80 + 10, // 10% 到 90% 的位置
        y: 100, // 从底部开始（100%）
        type: fruitType.type,
        emoji: fruitType.emoji,
        speed: (Math.random() - 0.5) * 0.5, // 水平速度，可以左右移动
        vy: initialVy, // 初始向上速度
        maxY: maxY, // 最高点
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

  // 更新水果位置（物理模拟）
  useEffect(() => {
    if (isGameOver) return;

    const interval = setInterval(() => {
      setFruits((prev) =>
        prev
          .map((fruit) => {
            // 重力加速度（每帧）- 进一步减小重力使水果能抛得更高
            const gravity = 0.2;
            const currentY = fruit.y;
            let newVy = fruit.vy;
            
            // 物理规律：重力始终向下，使速度减小（上升时）或增加（下落时）
            // vy > 0 表示向上，vy < 0 表示向下
            // 重力使向上速度减小，使向下速度增加（绝对值）
            
            if (newVy > 0) {
              // 正在上升：速度受重力影响逐渐减小
              newVy = newVy - gravity;
              // 如果速度变为负值，说明已经过最高点，开始下落
              if (newVy < 0) {
                newVy = 0; // 在最高点速度为零，下一帧开始下落
              }
            } else {
              // 正在下落或静止：速度受重力影响逐渐增加（向下，变为更负）
              newVy = newVy - gravity; // 减去重力使速度更负（向下更快）
            }
            
            // 更新位置
            // y值：0%是顶部，100%是底部
            // vy > 0 时，y减小（向上移动）
            // vy < 0 时，y增加（向下移动）
            const newY = currentY - newVy * 0.5;
            const newX = fruit.x + fruit.speed * 0.3; // 水平移动
            
            return {
              ...fruit,
              x: newX,
              y: newY,
              vy: newVy,
              rotation: fruit.rotation + fruit.rotationSpeed * 0.2,
            };
          })
          .filter((fruit) => {
            // 移除超出屏幕顶部或底部的水果
            return fruit.y > -15 && fruit.y < 110;
          })
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

      // 放大挥手动作，使轨迹能覆盖整个屏幕宽度
      // 使用放大系数，将手腕的移动范围放大到整个屏幕
      const scaleX = 2.5; // 水平方向放大2.5倍
      const scaleY = 1.2; // 垂直方向稍微放大
      
      // 计算手腕在游戏区域中的位置（注意：pose坐标是0-1）
      // 将手腕位置映射到更大的范围，使其能覆盖整个屏幕宽度
      // 使用手腕相对于中心点的偏移，然后放大
      const centerX = 0.5; // 摄像头中心
      const centerY = 0.5;
      
      // 镜像处理：摄像头画面是镜像的，需要翻转X坐标
      // 左手在摄像头中显示在右侧，但实际在左侧，所以需要翻转
      const mirroredLeftX = 1 - leftWrist.x; // 镜像翻转X坐标
      const mirroredRightX = 1 - rightWrist.x; // 镜像翻转X坐标
      
      // 计算相对于中心点的偏移（使用镜像后的坐标）
      const leftOffsetX = (mirroredLeftX - centerX) * scaleX;
      const leftOffsetY = (leftWrist.y - centerY) * scaleY;
      const rightOffsetX = (mirroredRightX - centerX) * scaleX;
      const rightOffsetY = (rightWrist.y - centerY) * scaleY;
      
      // 将偏移映射到游戏区域，确保覆盖整个屏幕宽度
      const leftWristX = (centerX + leftOffsetX) * gameWidth;
      const leftWristY = (centerY + leftOffsetY) * gameHeight;
      const rightWristX = (centerX + rightOffsetX) * gameWidth;
      const rightWristY = (centerY + rightOffsetY) * gameHeight;
      
      // 限制在屏幕范围内
      const clampedLeftX = Math.max(0, Math.min(gameWidth, leftWristX));
      const clampedLeftY = Math.max(0, Math.min(gameHeight, leftWristY));
      const clampedRightX = Math.max(0, Math.min(gameWidth, rightWristX));
      const clampedRightY = Math.max(0, Math.min(gameHeight, rightWristY));

      // 平滑处理：使用指数移动平均（EMA）减少跳动
      const smoothingFactor = 0.3; // 平滑系数，越小越平滑但延迟越大
      let smoothedLeftX = clampedLeftX;
      let smoothedLeftY = clampedLeftY;
      let smoothedRightX = clampedRightX;
      let smoothedRightY = clampedRightY;

      if (smoothedPosRef.current.left) {
        smoothedLeftX = smoothedPosRef.current.left.x * (1 - smoothingFactor) + clampedLeftX * smoothingFactor;
        smoothedLeftY = smoothedPosRef.current.left.y * (1 - smoothingFactor) + clampedLeftY * smoothingFactor;
      }
      if (smoothedPosRef.current.right) {
        smoothedRightX = smoothedPosRef.current.right.x * (1 - smoothingFactor) + clampedRightX * smoothingFactor;
        smoothedRightY = smoothedPosRef.current.right.y * (1 - smoothingFactor) + clampedRightY * smoothingFactor;
      }

      // 更新平滑后的位置
      smoothedPosRef.current = {
        left: { x: smoothedLeftX, y: smoothedLeftY },
        right: { x: smoothedRightX, y: smoothedRightY },
      };

      // 检测快速移动（切的动作）- 使用平滑后的位置计算速度
      const lastLeft = lastWristPosRef.current.left;
      const lastRight = lastWristPosRef.current.right;

      if (lastLeft && lastRight) {
        // 使用平滑后的位置计算速度
        const leftSpeed = Math.sqrt(
          Math.pow(smoothedLeftX - lastLeft.x, 2) +
            Math.pow(smoothedLeftY - lastLeft.y, 2)
        );
        const rightSpeed = Math.sqrt(
          Math.pow(smoothedRightX - lastRight.x, 2) +
            Math.pow(smoothedRightY - lastRight.y, 2)
        );

        // 如果移动速度足够快，认为是切的动作
        const SLASH_THRESHOLD = 20; // 降低阈值，更容易触发
        if (leftSpeed > SLASH_THRESHOLD || rightSpeed > SLASH_THRESHOLD) {
          // 播放挥刀音效
          playSlashSound();

          // 使用平滑后的位置添加切痕轨迹
          const activeWristX = leftSpeed > rightSpeed ? smoothedLeftX : smoothedRightX;
          const activeWristY = leftSpeed > rightSpeed ? smoothedLeftY : smoothedRightY;

          setSlashTrails((prev) => {
            const newTrail = {
              id: Date.now(),
              x: activeWristX,
              y: activeWristY,
              timestamp: Date.now(),
            };
            
            // 如果上一个点很近，跳过（减少冗余点）
            if (prev.length > 0) {
              const lastTrail = prev[prev.length - 1];
              const distance = Math.sqrt(
                Math.pow(activeWristX - lastTrail.x, 2) + 
                Math.pow(activeWristY - lastTrail.y, 2)
              );
              // 如果距离太近（小于5px），不添加新点
              if (distance < 5) {
                return prev;
              }
            }
            
            return [
              ...prev.slice(-15), // 保留最近15个点（增加以支持更长的轨迹）
              newTrail,
            ];
          });

          // 检测是否切中水果（使用平滑后的位置）
          checkFruitHit(activeWristX, activeWristY);
        } else {
          // 即使速度不够快，也检测是否在水果附近（使用平滑后的位置）
          checkFruitHit(smoothedLeftX, smoothedLeftY);
          checkFruitHit(smoothedRightX, smoothedRightY);
        }
      }

      // 更新原始位置（用于下次速度计算）
      lastWristPosRef.current = {
        left: { x: smoothedLeftX, y: smoothedLeftY },
        right: { x: smoothedRightX, y: smoothedRightY },
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
        // 播放切碎音效
        playSliceSound();

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

      {/* 切痕轨迹 - 使用平滑的曲线 */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
        {slashTrails.length > 1 && (
          <path
            d={slashTrails.reduce((path, trail, index) => {
              if (index === 0) {
                return `M ${trail.x} ${trail.y}`;
              } else {
                const prevTrail = slashTrails[index - 1];
                // 使用二次贝塞尔曲线使轨迹更平滑
                const cp1x = prevTrail.x + (trail.x - prevTrail.x) * 0.5;
                const cp1y = prevTrail.y;
                return `${path} Q ${cp1x} ${cp1y} ${trail.x} ${trail.y}`;
              }
            }, "")}
            fill="none"
            stroke="#FFD700"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.9}
          />
        )}
        {/* 也保留直线连接作为备用，但使用更细的线条 */}
        {slashTrails.map((trail, index) => {
          const nextTrail = slashTrails[index + 1];
          if (!nextTrail) return null;
          // 计算两点间距离，如果太远则跳过（避免跳跃）
          const distance = Math.sqrt(
            Math.pow(nextTrail.x - trail.x, 2) + 
            Math.pow(nextTrail.y - trail.y, 2)
          );
          if (distance > 100) return null; // 跳过距离过大的点
          
          return (
            <line
              key={`${trail.id}-${index}`}
              x1={trail.x}
              y1={trail.y}
              x2={nextTrail.x}
              y2={nextTrail.y}
              stroke="#FFD700"
              strokeWidth="3"
              strokeLinecap="round"
              opacity={0.6}
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

