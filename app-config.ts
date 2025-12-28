/**
 * 应用配置文件
 * 定义游戏配置、语言支持等
 */

export const appConfig = {
  // 支持的语言列表
  locales: ["en", "zh"] as const,
  defaultLocale: "en" as const,
  
  // 游戏配置
  game: {
    // 摄像头配置
    camera: {
      width: 640,
      height: 480,
      facingMode: "user", // 前置摄像头
    },
    // MediaPipe配置
    poseDetection: {
      modelComplexity: 1, // 0-2, 越高越精确但越慢
      enableSegmentation: false,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    },
  },
};

export type Locale = (typeof appConfig.locales)[number];

