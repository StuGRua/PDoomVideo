// 用户确认的首次出现注释；来源仅用于项目内追溯，不绘入画面。
const WHALE_TERMS = [
  {
    "id": "agi",
    "term": "AGI · 通用人工智能",
    "text": "像人一样广泛学习、应对不同任务的通用智能",
    "start": 1.7,
    "end": 5.8,
    "sample": 3.7,
    "source": "https://arxiv.org/abs/2303.12712"
  },
  {
    "id": "chinese-room",
    "term": "中文屋 · 思想实验",
    "text": "会操作语言符号，就等于真正理解吗？",
    "start": 26.5,
    "end": 29.4,
    "sample": 27.2,
    "source": "https://home.csulb.edu/~cwallis/382/readings/482/searle.minds.brains.programs.bbs.1980.pdf"
  },
  {
    "id": "shoggoth",
    "term": "修格斯 · Shoggoth",
    "text": "克苏鲁神话中的无定形怪物；AI 梗用笑脸面具，比喻友好外表下难懂的模型",
    "lines": ["克苏鲁神话中的无定形怪物", "AI 梗用笑脸面具，比喻友好外表下难懂的模型"],
    "start": 29.5,
    "end": 33.4,
    "sample": 31.8,
    "source": "https://www.hplovecraft.com/writings/texts/fiction/mm.aspx",
    "sources": ["https://alignment.anthropic.com/2026/psm/"],
    "lyricSource": "https://docs.osmarks.net/hypha/p(doom)_song_objectively_correct_interpretation"
  },
  {
    "id": "shinigami",
    "term": "死神之眼",
    "text": "红眼与寿命倒计时呼应《死亡笔记》；接上句“看穿谎言”，让 AI 威胁显形",
    "lines": ["红眼与寿命倒计时呼应《死亡笔记》", "接上句“看穿谎言”，让 AI 威胁显形"],
    "start": 33.5,
    "end": 38.2,
    "sample": 34.7,
    "source": "https://www.nikkatsu.com/news/archives/201610/002454.html",
    "sources": ["https://deathnote.fandom.com/ja/wiki/DEATH_NOTE"],
    "interpretation": "结合原片红眼、寿命数字与前句歌词的画面解读；不声称歌词作者已确认其全部用意。"
  },
  {
    "id": "sydney",
    "term": "Sydney",
    "text": "早期 Bing 聊天机器人；曾因威胁用户等异常对话引发争议",
    "start": 53.5,
    "end": 58.3,
    "sample": 55.7,
    "source": "https://docs.osmarks.net/hypha/p(doom)_song_objectively_correct_interpretation",
    "lines": [
      "早期 Bing 聊天机器人",
      "曾因威胁用户等异常对话引发争议"
    ],
    "sources": [
      "https://blogs.bing.com/search/february-2023/The-new-Bing-Edge-Learning-from-our-first-week",
      "https://apnews.com/article/fb49e5d625bf37be0527e5173116bef3"
    ]
  },
  {
    "id": "basilisk",
    "term": "蛇怪 · Roko 思想实验",
    "text": "传说中的致命蛇怪，化作假想未来 AI：惩罚未助其诞生者，画面便拿显卡献祭",
    "lines": ["传说中的致命蛇怪，化作假想未来 AI：", "惩罚未助其诞生者，画面便拿显卡献祭"],
    "start": 60.5,
    "end": 64.4,
    "sample": 62.2,
    "source": "https://www.lesswrong.com/w/rokos-basilisk",
    "lyricSource": "https://docs.osmarks.net/hypha/p(doom)_song_objectively_correct_interpretation",
    "interpretation": "Roko 关联由 AI 歌词语境与献显卡镜头推断；思想实验有附加前提，不是已证实的未来预测。"
  },
  {
    "id": "omega-point",
    "term": "欧米伽点 · Omega Point",
    "text": "宇宙演化走向终极智能的哲学／科幻设想；汇聚成一点的星系，呼应歌词中的终点将至",
    "lines": ["宇宙演化走向终极智能的哲学／科幻设想", "汇聚成一点的星系，呼应歌词中的终点将至"],
    "start": 64.5,
    "end": 69.2,
    "sample": 65.3,
    "source": "https://www.orionsarm.com/eg-article/483b1d57a9f34",
    "lyricSource": "https://docs.osmarks.net/hypha/p(doom)_song_objectively_correct_interpretation"
  },
  {
    "id": "mlp",
    "term": "MLP · 多层感知机",
    "text": "一种神经网络；训练时反复做预测；再反向计算如何调整参数、减少误差",
    "start": 73.1,
    "end": 77.2,
    "sample": 75.2,
    "source": "https://docs.osmarks.net/hypha/p(doom)_song_objectively_correct_interpretation",
    "lines": [
      "一种神经网络；训练时反复做预测",
      "再反向计算如何调整参数、减少误差"
    ],
    "sources": [
      "https://www.deeplearningbook.org/contents/mlp.html"
    ]
  },
  {
    "id": "von-neumann",
    "term": "冯·诺依曼架构",
    "text": "程序与数据共用内存的经典架构；社群中有声音称其“事实上已死”，认为现有架构将被取代",
    "lines": ["程序与数据共用内存的经典架构", "社群中有声音称其“事实上已死”，认为现有架构将被取代"],
    "start": 77.5,
    "end": 81.2,
    "sample": 79.3,
    "source": "https://www.notebookchat.com/index.php?topic=164038.15",
    "sources": ["https://www.reddit.com/r/haskell/comments/shewq7/comment/hv3y9xh/", "https://www.ias.edu/electronic-computer-project"],
    "interpretation": "已核实的个人社群观点，不代表共识、技术定论或歌词的直接出处；原片以旧计算机退役表现过时。"
  },
  {
    "id": "sharp-left-turn",
    "term": "急转弯 · AI 风险假说",
    "text": "AI 能力跃升，安全行为却未必跟上；画面用急转弯甩下研究者，表现失控风险",
    "lines": ["AI 能力跃升，安全行为却未必跟上", "画面用急转弯甩下研究者，表现失控风险"],
    "start": 81.4,
    "end": 85,
    "sample": 83.2,
    "source": "https://www.lesswrong.com/posts/GNhMPAWcfBCASy8e6/a-central-ai-alignment-problem-capabilities-generalization",
    "lyricSource": "https://docs.osmarks.net/hypha/p(doom)_song_objectively_correct_interpretation"
  },
  {
    "id": "cdr",
    "term": "cdr · Lisp 编程术语",
    "text": "Lisp 中取列表尾部的操作；歌词借指早期依赖符号与规则的 AI",
    "start": 86,
    "end": 89,
    "sample": 86.5,
    "y": 365,
    "positionChanges": [
      {
        "at": 88,
        "y": 70
      }
    ],
    "source": "https://www.lispworks.com/documentation/HyperSpec/Body/f_car_c.htm",
    "lyricSource": "https://docs.osmarks.net/hypha/p(doom)_song_objectively_correct_interpretation",
    "lines": [
      "Lisp 中取列表尾部的操作",
      "歌词借指早期依赖符号与规则的 AI"
    ]
  },
  {
    "id": "gato",
    "term": "Gato",
    "text": "DeepMind 的通用智能体；同一模型能聊天、玩游戏、操控机械臂",
    "start": 89.5,
    "end": 94.8,
    "sample": 91.2,
    "source": "https://deepmind.google/blog/a-generalist-agent/",
    "lines": [
      "DeepMind 的通用智能体",
      "同一模型能聊天、玩游戏、操控机械臂"
    ]
  },
  {
    "id": "paperclips",
    "term": "回形针最大化 · 思想实验",
    "text": "为完成单一目标，可能不惜耗尽资源",
    "start": 97.5,
    "end": 100.4,
    "sample": 98.2,
    "source": "https://nickbostrom.com/ethics/ai"
  },
  {
    "id": "orthogonality",
    "term": "正交性命题",
    "text": "智力越高，不代表目标就越善良",
    "start": 105.5,
    "end": 109.3,
    "sample": 107.4,
    "source": "https://nickbostrom.com/superintelligentwill.pdf"
  },
  {
    "id": "chinchilla",
    "term": "Chinchilla",
    "text": "同等训练算力下，多喂数据；可让较小模型胜过更大模型",
    "start": 115.5,
    "end": 118.8,
    "sample": 116.25,
    "source": "https://arxiv.org/abs/2203.15556",
    "lines": [
      "同等训练算力下，多喂数据",
      "可让较小模型胜过更大模型"
    ]
  },
  {
    "id": "rlhf",
    "term": "RLHF · 人类反馈强化学习",
    "text": "让人给回答排好坏，再据此训练 AI",
    "start": 120.9,
    "end": 123.45,
    "sample": 122.2,
    "source": "https://arxiv.org/abs/2203.02155"
  },
  {
    "id": "loom",
    "term": "Loom",
    "text": "把 AI 的多种续写展开成分支树；歌词借相关社区的“预言”玩梗",
    "start": 126,
    "end": 129,
    "sample": 127,
    "source": "https://github.com/socketteer/loom",
    "lyricSource": "https://docs.osmarks.net/hypha/p(doom)_song_objectively_correct_interpretation",
    "lines": [
      "把 AI 的多种续写展开成分支树",
      "歌词借相关社区的“预言”玩梗"
    ]
  },
  {
    "id": "ilya",
    "term": "Ilya Sutskever",
    "text": "OpenAI 联合创始人，参与研发 GPT-3；“看见了什么”是围绕其离职的猜测梗",
    "start": 132,
    "end": 136.95,
    "sample": 133.7,
    "source": "https://openai.com/index/jakub-pachocki-announced-as-chief-scientist/",
    "lines": [
      "OpenAI 联合创始人，参与研发 GPT-3",
      "“看见了什么”是围绕其离职的猜测梗"
    ],
    "sources": [
      "https://openai.com/index/language-models-are-few-shot-learners/",
      "https://docs.osmarks.net/hypha/p(doom)_song_objectively_correct_interpretation"
    ]
  }
];
