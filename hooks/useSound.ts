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

      // 尝试加载音效文件
      const soundFile = new Audio("/sounds/slash.mp3");
      soundFile.volume = 0.6;
      soundFile.preload = "auto";
      soundFile.oncanplaythrough = () => {
        audioCache.current.set("slash", soundFile);
        soundFile.currentTime = 0;
        soundFile.play().catch(() => {
          // 如果播放失败，静默处理
        });
      };
      soundFile.onerror = () => {
        // 文件不存在，静默处理
      };
      soundFile.load();
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
          // 如果播放失败，使用生成的音效
          generateSliceSound();
        });
        return;
      }

      // 尝试加载音效文件（支持多个可能的文件名）
      const possibleFiles = [
        "/sounds/slice.mp3",
        "/sounds/504610__neospica__knife-slice.mp3",
      ];

      let loaded = false;
      for (const filePath of possibleFiles) {
        const soundFile = new Audio(filePath);
        soundFile.volume = 0.7;
        soundFile.preload = "auto";
        soundFile.oncanplaythrough = () => {
          if (!loaded) {
            loaded = true;
            audioCache.current.set("slice", soundFile);
            soundFile.currentTime = 0;
            soundFile.play().catch(() => {
              generateSliceSound();
            });
          }
        };
        soundFile.onerror = () => {
          // 继续尝试下一个文件
        };
        soundFile.load();
      }

      // 如果所有文件都加载失败，延迟后使用生成的音效
      setTimeout(() => {
        if (!audioCache.current.get("slice")) {
          generateSliceSound();
        }
      }, 100);
    } catch (error) {
      // 如果出错，使用生成的音效
      generateSliceSound();
    }
  }, []);

  // 生成切碎音效（使用Web Audio API生成）
  const generateSliceSound = useCallback(() => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      // 创建或获取AudioContext
      let audioContext = (window as any).__audioContext;
      if (!audioContext || audioContext.state === 'closed') {
        audioContext = new AudioContextClass();
        (window as any).__audioContext = audioContext;
      }

      // 如果AudioContext被暂停，尝试恢复
      if (audioContext.state === 'suspended') {
        audioContext.resume().catch(() => {});
      }
      
      const now = audioContext.currentTime;
      
      // 创建多个短促的音效，模拟切碎声
      for (let i = 0; i < 3; i++) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        const startTime = now + i * 0.05;
        const frequency = 400 + Math.random() * 200;
        
        oscillator.frequency.setValueAtTime(frequency, startTime);
        oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.5, startTime + 0.05);
        
        gainNode.gain.setValueAtTime(0.2, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.05);

        oscillator.type = "square";
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.05);
      }
    } catch (error) {
      console.debug("Slice sound generation failed:", error);
    }
  }, []);

  return {
    playSound,
    playSlashSound,
    playSliceSound,
  };
}

