"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { POSE_CONNECTIONS } from "@mediapipe/pose";

interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

interface PoseResult {
  landmarks: PoseLandmark[];
  // 计算的关键点位置
  leftShoulder?: PoseLandmark;
  rightShoulder?: PoseLandmark;
  leftWrist?: PoseLandmark;
  rightWrist?: PoseLandmark;
  leftAnkle?: PoseLandmark;
  rightAnkle?: PoseLandmark;
  nose?: PoseLandmark;
}

export function usePoseDetection() {
  const [pose, setPose] = useState<PoseResult | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const poseRef = useRef<Pose | null>(null);
  const cameraRef = useRef<Camera | null>(null);

  const startDetection = useCallback(
    (video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
      if (poseRef.current) {
        return; // 已经初始化
      }

      const pose = new Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        },
      });

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      pose.onResults((results) => {
        if (results.poseLandmarks) {
          const landmarks = results.poseLandmarks;
          const poseData: PoseResult = {
            landmarks,
            leftShoulder: landmarks[11],
            rightShoulder: landmarks[12],
            leftWrist: landmarks[15],
            rightWrist: landmarks[16],
            leftAnkle: landmarks[27],
            rightAnkle: landmarks[28],
            nose: landmarks[0],
          };
          setPose(poseData);
          setIsDetecting(true);

          // 绘制姿态
          const ctx = canvas.getContext("2d");
          if (ctx && results.image) {
            ctx.save();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // 绘制视频帧
            ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

            // 绘制连接线和关键点
            drawConnectors(ctx, landmarks, POSE_CONNECTIONS, {
              color: "#00FF00",
              lineWidth: 2,
            });
            drawLandmarks(ctx, landmarks, {
              color: "#FF0000",
              lineWidth: 1,
              radius: 3,
            });
            ctx.restore();
          }
        } else {
          setIsDetecting(false);
        }
      });

      const camera = new Camera(video, {
        onFrame: async () => {
          await pose.send({ image: video });
        },
        width: 640,
        height: 480,
      });

      camera.start();
      poseRef.current = pose;
      cameraRef.current = camera;
    },
    []
  );

  const stopDetection = useCallback(() => {
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }
    if (poseRef.current) {
      poseRef.current.close();
      poseRef.current = null;
    }
    setPose(null);
    setIsDetecting(false);
  }, []);

  useEffect(() => {
    return () => {
      stopDetection();
    };
  }, [stopDetection]);

  return {
    pose,
    isDetecting,
    startDetection,
    stopDetection,
  };
}

