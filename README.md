# 🎮 Super Mario Party - Camera Interactive Game

一个基于Web摄像头的互动游戏，灵感来自超级马里奥派对。使用MediaPipe进行姿态检测，通过身体动作控制游戏角色。

## 🚀 功能特性

- **摄像头姿态检测**：使用MediaPipe Pose实时检测身体姿态
- **多种小游戏**：
  - 🦘 **Jump Challenge**：通过跳跃动作控制角色跳跃
  - 👋 **Wave Race**：挥手控制角色移动，收集目标
  - ⚖️ **Balance Board**：通过身体倾斜保持平衡
  - 🍎 **Fruit Ninja**：快速挥手切水果，获得高分和连击
- **现代化UI**：流畅动画、渐变背景、响应式设计
- **实时反馈**：摄像头画面实时显示姿态检测结果

## 🛠️ 技术栈

- **Next.js 14** - React框架
- **TypeScript** - 类型安全
- **MediaPipe Pose** - 姿态检测
- **Framer Motion** - 动画效果
- **Tailwind CSS** - 样式框架

## 📦 安装

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 🎯 使用说明

1. **允许摄像头权限**：首次访问时，浏览器会请求摄像头权限，请点击"允许"
2. **选择游戏**：在主页选择想要游玩的小游戏
3. **开始游戏**：
   - **Jump Challenge**：站在摄像头前，向上跳跃即可让角色跳跃
   - **Wave Race**：举起双手，通过左右移动控制角色收集目标
   - **Balance Board**：通过身体左右倾斜保持平衡，坚持60秒
   - **Fruit Ninja**：快速挥动手臂切水果，连续切中可获得连击加分，60秒内尽可能获得高分

## 📝 开发进度

### ✅ 已完成
- [x] 项目初始化和基础配置
- [x] Next.js + TypeScript 项目结构
- [x] MediaPipe姿态检测集成
- [x] 摄像头访问和视频流处理
- [x] 游戏主界面和导航
- [x] Jump Challenge 游戏实现
- [x] Wave Race 游戏实现
- [x] Balance Board 游戏实现
- [x] Fruit Ninja 切水果游戏实现
- [x] 基础UI和动画效果

### 🔄 进行中
- [ ] 游戏音效和背景音乐
- [ ] 分数排行榜
- [ ] 游戏难度调整

### 📋 待实现
- [ ] 多人模式支持
- [ ] 游戏教程和引导
- [ ] 国际化支持（next-intl）
- [ ] 移动端优化
- [ ] 性能优化和错误处理

## 🐛 已知问题

- MediaPipe模型首次加载可能需要一些时间
- 姿态检测在光线较暗的环境下可能不够准确
- 需要HTTPS环境或localhost才能访问摄像头（浏览器安全限制）

## 📄 许可证

MIT License

