"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePoseDetection } from "@/hooks/usePoseDetection";
import JumpGame from "@/games/JumpGame";
import WaveGame from "@/games/WaveGame";
import BalanceGame from "@/games/BalanceGame";
import FruitNinjaGame from "@/games/FruitNinjaGame";

interface CameraGameProps {
  gameType: string;
  onBack: () => void;
}

export default function CameraGame({ gameType, onBack }: CameraGameProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { pose, isDetecting, startDetection, stopDetection } =
    usePoseDetection();

  // 初始化摄像头
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: 640,
            height: 480,
            facingMode: "user",
          },
        });

        if (videoRef.current && canvasRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            // 设置canvas尺寸与video匹配
            if (canvasRef.current && videoRef.current) {
              canvasRef.current.width = videoRef.current.videoWidth;
              canvasRef.current.height = videoRef.current.videoHeight;
            }
            setIsCameraReady(true);
            // 再次检查确保不为null
            if (videoRef.current && canvasRef.current) {
              startDetection(videoRef.current, canvasRef.current);
            }
          };
        }
      } catch (err) {
        setError("无法访问摄像头。请检查权限设置。");
        console.error("Camera access error:", err);
      }
    };

    initCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
      stopDetection();
    };
  }, [startDetection, stopDetection]);

  const renderGame = () => {
    switch (gameType) {
      case "jump":
        return <JumpGame pose={pose} isDetecting={isDetecting} />;
      case "wave":
        return <WaveGame pose={pose} isDetecting={isDetecting} />;
      case "balance":
        return <BalanceGame pose={pose} isDetecting={isDetecting} />;
      case "fruit":
        return <FruitNinjaGame pose={pose} isDetecting={isDetecting} />;
      default:
        return <div>Unknown game type</div>;
    }
  };

  return (
    <div className="w-full h-screen flex flex-col relative">
      {/* 返回按钮 - 固定在左上角 */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={onBack}
        className="absolute top-4 left-4 z-50 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-lg text-white font-semibold hover:bg-white/30 transition-all shadow-lg"
      >
        ← Back to Menu
      </motion.button>

      {error ? (
        <div className="flex items-center justify-center h-full text-white text-xl">
          {error}
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4">
          {/* 摄像头画面 - 占据20%空间，保持比例 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-[20vw] lg:w-[20%] mx-auto lg:mx-0 flex-shrink-0"
          >
            <div className="relative w-full rounded-lg overflow-hidden shadow-2xl border-4 border-white" style={{ aspectRatio: '4/3' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain camera-video"
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                style={{ width: "100%", height: "100%" }}
              />
              {!isCameraReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-xl">
                  Loading camera...
                </div>
              )}
            </div>
            <div className="mt-2 text-center text-white/80 text-sm">
              {isDetecting ? (
                <span className="text-green-400">✓ Pose detected</span>
              ) : (
                <span className="text-yellow-400">⏳ Detecting pose...</span>
              )}
            </div>
          </motion.div>

          {/* 游戏区域 - 占据80%空间 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-1 flex items-center justify-center min-w-0 overflow-hidden"
          >
            <div className="w-full h-full flex items-center justify-center">
              {renderGame()}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

