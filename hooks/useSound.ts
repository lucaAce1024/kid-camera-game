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

  // 生成挥刀音效（使用Web Audio API生成）
  const playSlashSound = useCallback(() => {
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
      const duration = 0.08; // 更短的持续时间

      // 创建主音调 - 使用更柔和的sine波
      const oscillator1 = audioContext.createOscillator();
      const gainNode1 = audioContext.createGain();
      
      oscillator1.connect(gainNode1);
      gainNode1.connect(audioContext.destination);
      
      // 使用更柔和的频率范围
      oscillator1.frequency.setValueAtTime(600, now);
      oscillator1.frequency.exponentialRampToValueAtTime(300, now + duration);
      
      gainNode1.gain.setValueAtTime(0.15, now);
      gainNode1.gain.exponentialRampToValueAtTime(0.01, now + duration);
      
      oscillator1.type = "sine"; // 使用sine波，更柔和
      oscillator1.start(now);
      oscillator1.stop(now + duration);

      // 添加一个高频谐波，增加清脆感
      const oscillator2 = audioContext.createOscillator();
      const gainNode2 = audioContext.createGain();
      
      oscillator2.connect(gainNode2);
      gainNode2.connect(audioContext.destination);
      
      oscillator2.frequency.setValueAtTime(1200, now);
      oscillator2.frequency.exponentialRampToValueAtTime(400, now + duration * 0.6);
      
      gainNode2.gain.setValueAtTime(0.08, now);
      gainNode2.gain.exponentialRampToValueAtTime(0.01, now + duration * 0.6);
      
      oscillator2.type = "sine";
      oscillator2.start(now);
      oscillator2.stop(now + duration * 0.6);
    } catch (error) {
      console.debug("Slash sound generation failed:", error);
    }
  }, []);

  // 生成切碎音效（使用Web Audio API生成）
  const playSliceSound = useCallback(() => {
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

