"use client";

import { useRef, useCallback } from "react";

/**
 * 音效管理Hook
 * 支持播放音效，如果音效文件不存在则静默失败
 */
export function useSound() {
  const audioCache = useRef<Map<string, HTMLAudioElement>>(new Map());

  const playSound = useCallback((soundName: string, volume: number = 0.5) => {
    try {
      // 检查缓存
      let audio = audioCache.current.get(soundName);
      
      if (!audio) {
        // 创建新的Audio对象
        audio = new Audio(`/sounds/${soundName}.mp3`);
        audio.volume = volume;
        audio.preload = "auto";
        audioCache.current.set(soundName, audio);
      }

      // 重置播放位置并播放
      audio.currentTime = 0;
      audio.volume = volume;
      
      // 播放音效（如果失败则静默处理）
      audio.play().catch((error) => {
        // 静默处理错误（可能是文件不存在或用户未交互）
        console.debug(`Sound ${soundName} play failed:`, error);
      });
    } catch (error) {
      // 静默处理错误
      console.debug(`Sound ${soundName} error:`, error);
    }
  }, []);

  // 生成挥刀音效（"咻"的声音）
  // 只使用真实音效文件，如果不存在则静默
  const playSlashSound = useCallback(() => {
    try {
      // 首先尝试使用真实音效文件（如果存在）
      const audio = audioCache.current.get("slash");
      if (audio) {
        audio.currentTime = 0;
        audio.volume = 0.6;
        audio.play().catch(() => {
          // 如果播放失败，静默处理
        });
        return;
      }

      // 尝试加载音效文件（挥刀音效）
      const possibleSlashFiles = [
        "/sounds/504610__neospica__knife-slice.mp3",
      ];

      let slashLoaded = false;
      for (const filePath of possibleSlashFiles) {
        const soundFile = new Audio(filePath);
        soundFile.volume = 0.6;
        soundFile.preload = "auto";
        soundFile.oncanplaythrough = () => {
          if (!slashLoaded) {
            slashLoaded = true;
            audioCache.current.set("slash", soundFile);
            soundFile.currentTime = 0;
            soundFile.play().catch(() => {
              // 如果播放失败，静默处理
            });
          }
        };
        soundFile.onerror = () => {
          // 继续尝试下一个文件
        };
        soundFile.load();
      }
    } catch (error) {
      // 如果出错，静默处理
    }
  }, []);

  // 生成切碎音效
  // 优先使用真实音效文件，如果不存在则使用Web Audio API生成
  const playSliceSound = useCallback(() => {
    try {
      // 首先尝试使用真实音效文件（如果存在）
      const audio = audioCache.current.get("slice");
      if (audio) {
        audio.currentTime = 0;
        audio.volume = 0.7;
        audio.play().catch(() => {
          // 如果播放失败，静默处理
        });
        return;
      }

      // 尝试加载音效文件（切碎音效）
      const possibleSliceFiles = [
        "/sounds/478145__aris621__nasty-knife-stab-2.wav",
        "/sounds/slice.wav",
        "/sounds/slice.mp3",
      ];

      let sliceLoaded = false;
      for (const filePath of possibleSliceFiles) {
        const soundFile = new Audio(filePath);
        soundFile.volume = 0.7;
        soundFile.preload = "auto";
        soundFile.oncanplaythrough = () => {
          if (!sliceLoaded) {
            sliceLoaded = true;
            audioCache.current.set("slice", soundFile);
            soundFile.currentTime = 0;
            soundFile.play().catch(() => {
              // 如果播放失败，静默处理
            });
          }
        };
        soundFile.onerror = () => {
          // 继续尝试下一个文件
        };
        soundFile.load();
      }
    } catch (error) {
      // 如果出错，静默处理
    }
  }, []);

  return {
    playSound,
    playSlashSound,
    playSliceSound,
  };
}

