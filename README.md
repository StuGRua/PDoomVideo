# 大肥鱼单曲 · AI末日概率上升中↑

基于 [JohnHeibel/PDoomVideo](https://github.com/JohnHeibel/PDoomVideo) 的鲸鱼娘音乐动画改编。保留原曲、九章分镜、节奏和笔触风格，完善角色动作、中文观看体验及本地渲染。

## 本版改进与贡献

- **鲸鱼娘改编**：参考社区大肥鱼形象，生成参考图后反绘、分层并接入原片；适配坐姿、跑步、演奏、持物、多人同帧与表情，修复闭眼眼圈残边。
- **46 句中英双语字幕**：中文在上、英文在下，两种语言均按词段高亮；中文采用站酷快乐体。
- **画面与片尾本地化**：为标题、可容纳中文的 P(DOOM) 仪表、FOOM 和片尾补充中文，保留原英文。
- **18 项典故注释**：AGI、中文屋、修格斯、死神之眼、Sydney、蛇怪、欧米伽点、MLP、冯诺依曼架构、急剧左转、cdr、Gato、回形针最大化、正交性命题、Chinchilla、RLHF、Loom、Ilya；随首次出现展示，出处见 [src/whale-terms.js](src/whale-terms.js)。
- **渲染优化**：Vulkan、多浏览器并发、内容指纹缓存、严格解码检查及验证后发布。开发机曾完成 1920×1080 / 24 fps / 3759 帧空缓存导出约 5 分 46 秒；这是单机实测，不是跨设备保证。Vulkan 与 Direct3D 11 个别背景有轻微色差。
- **三种原画封面**：16:9、4:3、9:16，调用原片场景函数，独立工具与输出目录，不参与正片缓存指纹。

维护者负责创作方向、形象和文案取舍及验收；**鲸鱼娘改编与中文本地化：GPT6Astra**。原版动画由 JohnHeibel 发布、Claude Opus 5.5 生成。本版贡献不包含原曲、原始分镜或上游角色设计的原创权利。

## 安装与导出

需要 Node.js 22+、Google Chrome（或 Playwright Chromium）、PATH 中的 FFmpeg 和 ffprobe。

```bash
npm ci
# 没有本机 Chrome 时安装浏览器
npx playwright install chromium
npm run render
# 空缓存重渲
npm run render -- --fresh
# Windows Direct3D 11 回退
npm run render -- --angle=d3d11 --workers=3
# 无典故卡片的双语版
npm run render:plain
# 英文字幕
npm run render:plain -- --lang=en
# 只绘指定时间范围，不编码完整视频
npm run render -- --range=103:104
```

默认 Vulkan、6 个工作浏览器；可用 `--workers=1` 降低内存占用。成片和检查报告在 `out/video/`，帧缓存在 `out/whale-final/`。需可工作的 GPU 后端，实际验证环境是 Windows + Chrome，其他平台未验证。英文手绘字体首次加载需要访问 Google Fonts。

可用环境变量 `CHROME_PATH`、`FFMPEG_PATH`、`FFPROBE_PATH` 配置工具位置；Chrome 也可传 `--chrome=/path/to/chrome`。默认查找常见 Chrome 安装位置，再回退 Playwright Chromium；编码器默认从 PATH 查找。

`studio-whale-annotated.html` 是带注释预览入口，`studio-whale.html` 是无注释双语入口。手动打开本地 HTML 时，浏览器的文件访问权限可能与工具启动的 Chrome 不同。

## 封面：可选的独立流程

```bash
npm run covers
```

输出 `out/covers/cover-16x9.{png,jpg}`（1920×1080）、`cover-4x3.{png,jpg}`（1600×1200）、`cover-9x16.{png,jpg}`（1080×1920）。选取 103.5 秒的点燃导火索镜头：横版保留原构图，另两版重排原场景元素。

临时 HTML 和画布改写只发生在 `out/whale-cover-formats/`，工具检查正片源文件哈希未改变。正片导出不会运行封面命令，也不会读取封面产物。

## 验证与目录

```bash
npm test
npm run test:localization
npm run test:annotations
npm run test:character
npm run benchmark
```

`npm test` 检查语法、本地引用、正式素材和封面隔离；其余检查需要浏览器/GPU，覆盖字幕布局、注释边界、乱序绘帧、多人隔离、跑步接地。

| 路径 | 用途 |
| --- | --- |
| `src/ch/`、`src/core.js` 等 | 原版九章场景、绘制与时间轴 |
| `src/whale-*.js` | 改编角色、双语、本地化与注释 |
| `assets/whale/` | 正式 PNG 图层及对应 SVG |
| `assets/fonts/` | 中文字体及 OFL 许可 |
| `render_whale.cjs` | 正片导出与校验 |
| `tools/covers/` | 可选封面工具 |
| `out/` | 本地缓存与产物，不进入版本库 |
| `studio.html`、`render.mjs` | 保留的上游原版入口 |

公开贡献提交不包含聊天标识、本机用户名或个人路径、历史样片、审阅截图和临时诊断报告。上游历史与署名保留，本版使用公开 noreply 提交身份。生成报告可能包含运行机器路径，因此均保留在忽略的 `out/` 中。

## 来源与许可

**代码许可不能覆盖音乐、歌词、字体和角色图像**。范围、来源、改动说明与授权链核验限制见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) 和 [LICENSE.md](LICENSE.md)。整部成片不能因此视为无条件商用的 ISC 作品。

- 原版：[JohnHeibel/PDoomVideo](https://github.com/JohnHeibel/PDoomVideo)，[原视频](https://youtu.be/8j-hR4fJywU)。两版原动画由 Claude Opus 5.5 生成，首版在 `legacy/`；保留 [ANIMATION_GUIDE.md](ANIMATION_GUIDE.md) 和 [STORYBOARD.md](STORYBOARD.md)。
- 原版灵感：[slimer48484 的帖子](https://x.com/slimer48484/status/2097752569212756134)。
- 歌曲：[上游引用的 YouTube 来源](https://www.youtube.com/watch?v=uEB5E67vcPA)；歌词、Udio 生成记录与释义：[Osmarks](https://docs.osmarks.net/hypha/p(doom)_song_objectively_correct_interpretation)。
- 主要形象参考：[1190fasheqi/dafeiyu-pet](https://github.com/1190fasheqi/dafeiyu-pet)，社区角色署名链见许可说明。
- 上游作者的通用动画项目：[ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase)。
