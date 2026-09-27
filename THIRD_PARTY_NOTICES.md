# 第三方来源与修改说明

## 原版动画、歌曲与歌词

基于 [JohnHeibel/PDoomVideo](https://github.com/JohnHeibel/PDoomVideo) 提交 `fa546a38092e75f2b079e6a86d6abc54dd525d17`。原版由 Claude Opus 5.5 生成、JohnHeibel 发布，保留其历史、场景、分镜说明与原版入口。其 package.json 标注 ISC，审计版本无单独许可文件；本版不虚构上游版权头。

改动包括角色与动作、中英词段高亮、中文画面和片尾、18 项典故卡片、并发导出及严格校验、独立封面工具。维护者负责创作取舍与审阅，AI 实施署名为“鲸鱼娘改编与中文本地化：GPT6Astra”；不表示原作者或 DeepSeek 的官方合作与背书。

音乐 `assets/pdoom.mp3` 沿用上游原文件；上游引用 [YouTube 来源](https://www.youtube.com/watch?v=uEB5E67vcPA)。歌词及背景参考 [Osmarks 的 Udio 记录和释义](https://docs.osmarks.net/hypha/p(doom)_song_objectively_correct_interpretation)。中文歌词由英文翻译并对齐词段。尚未核实音乐与歌词的独立再分发许可，不声明为 ISC。原版灵感：[X 帖子](https://x.com/slimer48484/status/2097752569212756134)。

## 鲸鱼娘 / 大肥鱼形象

正式形象主要参考 [1190fasheqi/dafeiyu-pet](https://github.com/1190fasheqi/dafeiyu-pet/tree/5b0e01856116bd2bae82df1f43c32faa5f056196) 的三视图。其 [MIT 许可](https://github.com/1190fasheqi/dafeiyu-pet/blob/5b0e01856116bd2bae82df1f43c32faa5f056196/LICENSE) 随附于 `LICENSES/dafeiyu-pet-MIT.txt`。本版未复制桌宠程序；使用参考图生成改编形象，再反绘为 SVG/PNG 图层，补充闭眼、嘴形、持杯、跑步、乐器姿态。原三视图、失败试稿及中间截图不在本公开版本中。

早期风格研究还参考 [Neko3000/deepseek-whalechan](https://github.com/Neko3000/deepseek-whalechan/tree/4f59071b75429076c39b37504948efc304f08150)，早期方案未成为正式角色素材。

社区角色署名线索来自 [Small-tailqwq 的第三方 NOTICE](https://github.com/Small-tailqwq/dsh-deep-whale/blob/825d02b0e569c370ae15ceed12d9393559b3e4f4/maid-atelier/NOTICE)：

- **上善**：[Pixiv](https://www.pixiv.net/users/62155430)，该说明列为鲸鱼娘初始作者。
- **ZipZipPipe**：[Pixiv](https://www.pixiv.net/users/18604994)，该说明列为加入 DeepSeek 元素的女仆鲸鱼娘二次设计者。
- **Small-tailqwq**：上述 NOTICE 所描述皮肤的进一步改编者与署名资料来源；本版未直接使用其皮肤素材。

该 NOTICE 对其皮肤声明 CC BY-NC-SA 4.0，不能单独证明所有相关项目的素材均有完整授权。本版保留上述来源，角色改编贡献按同一许可提供，并说明核验限制；桌宠的 MIT 声明不能自动消除上游角色设计的潜在限制。

## 字体与依赖

站酷快乐体 ZCOOL KuaiLe 未修改，版权及许可证保存在 [OFL 文件](assets/fonts/ZCOOLKuaiLe-OFL.txt)，来源及哈希见 [字体说明](assets/fonts/README.md)。英文 Permanent Marker、Shantell Sans 通过 Google Fonts 加载，未打包入库。

npm 依赖按锁文件安装，未发布 node_modules；各包的版权与许可随其 npm 包分发，使用和再分发仍需遵守各自条款。

| 直接依赖 | 锁定版本 | 包声明的许可 |
| --- | --- | --- |
| p5 | 2.3.3 | LGPL-2.1 |
| p5.brush | 2.2.3 | MIT |
| Playwright | 1.62.1 | Apache-2.0 |
| puppeteer-core | 25.11.0 | Apache-2.0 |
| sharp | 0.35.4 | Apache-2.0 |

本表不替代传递依赖和原生库各自的许可；完整包版本与来源由 package-lock.json 固定。本版未改动这些依赖的代码。
