# 音效文件说明

## 如何添加真实音效

1. 将音效文件放在 `public/sounds/` 目录下
2. 文件名要求：
   - 挥刀音效：`slash.mp3` 或 `slash.wav`
   - 切碎音效：`slice.mp3` 或 `slice.wav`

## 推荐的免费音效资源网站

1. **Freesound.org** - https://freesound.org
   - 搜索关键词：whoosh, sword slash, air whoosh
   - 免费注册后可下载

2. **Pixabay** - https://pixabay.com/sound-effects/
   - 搜索关键词：whoosh, slash, swoosh
   - 完全免费，无需注册

3. **Zapsplat** - https://www.zapsplat.com
   - 搜索关键词：whoosh, sword, air movement
   - 免费注册后可下载

4. **Mixkit** - https://mixkit.co/free-sound-effects/
   - 完全免费，无需注册
   - 搜索关键词：whoosh, slash

## 音效要求

- **挥刀音效（slash.mp3）**：
  - 持续时间：0.1-0.3秒
  - 类型：快速移动的风声/"咻"声
  - 格式：MP3 或 WAV

- **切碎音效（slice.mp3）**：
  - 持续时间：0.1-0.2秒
  - 类型：短促的切碎/破裂声
  - 格式：MP3 或 WAV

## 注意事项

- 如果音效文件不存在，系统会自动使用Web Audio API生成音效
- 音效文件会自动缓存，提高性能
- 建议使用MP3格式，文件更小

