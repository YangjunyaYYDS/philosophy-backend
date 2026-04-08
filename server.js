const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 智谱 AI API 配置
const ZHIPU_API_KEY = process.env.ZHIPU_API_KEY || 'fbffecaa4c474c09a3f1780dfd1d6c1d.DgXWqsznxVD041Ap';
const ZHIPU_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

// 中间件
app.use(cors());
app.use(express.json());

// 静态文件服务（前端构建文件）
app.use(express.static(path.join(__dirname, 'dist')));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 哲学家数据（内嵌示例数据，避免文件路径问题）
const philosophersData = [
  {
    id: "socrates",
    name: "苏格拉底",
    nameEn: "Socrates",
    era: "古希腊",
    years: "470-399 BC",
    birthYear: -470,
    deathYear: -399,
    school: "古希腊哲学",
    summary: "苏格拉底是古希腊哲学的奠基人之一，以其问答法（苏格拉底方法）闻名。",
    thoughtSummary: "苏格拉底强调'认识你自己'，通过诘问法（苏格拉底方法）引导人们发现真理。他认为美德即知识，无知是罪恶的根源。",
    keyConcepts: [
      { term: "苏格拉底方法", definition: "通过连续提问引导对方发现真理的辩证方法" },
      { term: "认识你自己", definition: "刻在德尔斐神庙的箴言，苏格拉底哲学的核心" },
      { term: "美德即知识", definition: "没有人故意为恶，恶行源于无知" }
    ],
    influenced: ["plato"],
    influencedBy: []
  },
  {
    id: "plato",
    name: "柏拉图",
    nameEn: "Plato",
    era: "古希腊",
    years: "428-348 BC",
    birthYear: -428,
    deathYear: -348,
    school: "理念论",
    summary: "柏拉图是苏格拉底的学生，创立了理念论，建立了西方第一个高等学府'学院'。",
    thoughtSummary: "柏拉图创立了理念论，认为现实世界是理念世界的影子。他在《理想国》中探讨了正义、国家和灵魂的本质。",
    keyConcepts: [
      { term: "理念论", definition: "现实世界是永恒理念世界的摹本" },
      { term: "洞穴寓言", definition: "比喻人类从无知到认识真理的过程" },
      { term: "灵魂三分", definition: "理性、激情、欲望三部分构成灵魂" }
    ],
    influenced: ["aristotle"],
    influencedBy: ["socrates"]
  },
  {
    id: "aristotle",
    name: "亚里士多德",
    nameEn: "Aristotle",
    era: "古希腊",
    years: "384-322 BC",
    birthYear: -384,
    deathYear: -322,
    school: "逍遥学派",
    summary: "亚里士多德是柏拉图的学生，百科全书式的学者，逻辑学、物理学、伦理学等领域的奠基人。",
    thoughtSummary: "亚里士多德是百科全书式的学者，创立了逻辑学，提出了'中庸之道'的伦理观。他强调经验观察和分类研究。",
    keyConcepts: [
      { term: "中庸之道", definition: "美德在于两个极端之间的平衡" },
      { term: "四因说", definition: "质料因、形式因、动力因、目的因解释事物存在" },
      { term: "实体", definition: "独立存在的个别事物是首要实体" }
    ],
    influenced: [],
    influencedBy: ["plato"]
  },
  {
    id: "confucius",
    name: "孔子",
    nameEn: "Confucius",
    era: "中国",
    years: "551-479 BC",
    birthYear: -551,
    deathYear: -479,
    school: "儒家",
    summary: "孔子是中国古代思想家、教育家，儒家学派创始人，其思想对中国文化影响深远。",
    thoughtSummary: "孔子创立儒家学说，核心思想是'仁'和'礼'。他强调个人修养、家庭伦理和社会秩序，主张'为政以德'。",
    keyConcepts: [
      { term: "仁", definition: "爱人，儒家最高的道德准则" },
      { term: "礼", definition: "规范行为的礼仪制度" },
      { term: "中庸", definition: "不偏不倚，恰到好处的处世态度" }
    ],
    influenced: ["mencius"],
    influencedBy: []
  },
  {
    id: "laozi",
    name: "老子",
    nameEn: "Laozi",
    era: "中国",
    years: "约6世纪 BC",
    birthYear: -600,
    deathYear: -500,
    school: "道家",
    summary: "老子是道家学派创始人，《道德经》作者，主张无为而治、道法自然。",
    thoughtSummary: "老子是道家创始人，主张'道法自然'、'无为而治'。他认为宇宙的本源是'道'，人应顺应自然而非强求。",
    keyConcepts: [
      { term: "道", definition: "宇宙万物的本源和规律" },
      { term: "无为", definition: "顺应自然，不强求妄为" },
      { term: "反者道之动", definition: "事物发展到极端会向相反方向转化" }
    ],
    influenced: ["zhuangzi"],
    influencedBy: []
  },
  {
    id: "mencius",
    name: "孟子",
    nameEn: "Mencius",
    era: "中国",
    years: "372-289 BC",
    birthYear: -372,
    deathYear: -289,
    school: "儒家",
    summary: "孟子是战国时期儒家代表人物，被尊为'亚圣'，主张性善论和仁政。",
    thoughtSummary: "孟子继承并发展了孔子思想，提出'性善论'，主张'仁政'和'民贵君轻'。他强调道德修养和义利之辨。",
    keyConcepts: [
      { term: "性善论", definition: "人性本善，有四端：恻隐、羞恶、辞让、是非" },
      { term: "仁政", definition: "以仁爱之心治理国家" },
      { term: "养气", definition: "培养浩然之气，达到道德境界" }
    ],
    influenced: [],
    influencedBy: ["confucius"]
  },
  {
    id: "zhuangzi",
    name: "庄子",
    nameEn: "Zhuangzi",
    era: "中国",
    years: "369-286 BC",
    birthYear: -369,
    deathYear: -286,
    school: "道家",
    summary: "庄子是战国时期道家代表人物，与老子并称'老庄'，主张逍遥无为。",
    thoughtSummary: "庄子继承老子思想，主张逍遥自在、齐物我。他用寓言故事阐述哲学，强调精神自由和超越世俗。",
    keyConcepts: [
      { term: "逍遥游", definition: "超越世俗束缚，达到精神自由" },
      { term: "齐物", definition: "万物齐一，消除是非对立" },
      { term: "坐忘", definition: "忘却形体和知识，与道合一" }
    ],
    influenced: [],
    influencedBy: ["laozi"]
  },
  {
    id: "descartes",
    name: "笛卡尔",
    nameEn: "Descartes",
    era: "近代",
    years: "1596-1650",
    birthYear: 1596,
    deathYear: 1650,
    school: "理性主义",
    summary: "笛卡尔是近代哲学之父，提出'我思故我在'，奠定了近代认识论基础。",
    thoughtSummary: "笛卡尔是近代哲学之父，提出'我思故我在'，确立了理性主义认识论。他用怀疑方法寻求确定的知识基础。",
    keyConcepts: [
      { term: "我思故我在", definition: "思维是证明自我存在的最确定基础" },
      { term: "方法论怀疑", definition: "系统怀疑一切，寻找不可怀疑的基础" },
      { term: "心物二元", definition: "心灵和物质是两种独立实体" }
    ],
    influenced: ["spinoza", "leibniz"],
    influencedBy: []
  },
  {
    id: "kant",
    name: "康德",
    nameEn: "Kant",
    era: "近代",
    years: "1724-1804",
    birthYear: 1724,
    deathYear: 1804,
    school: "德国古典哲学",
    summary: "康德是德国古典哲学创始人，提出'批判哲学'，调和理性主义与经验主义。",
    thoughtSummary: "康德提出'批判哲学'，调和理性主义与经验主义。他认为知识源于先天范畴与后天经验的结合，强调道德自律。",
    keyConcepts: [
      { term: "先天综合判断", definition: "既具有普遍性又扩展知识的判断" },
      { term: "绝对命令", definition: "道德法则：只按你能同时愿意它成为普遍法则的准则行动" },
      { term: "物自体", definition: "超越人类认识能力的存在本身" }
    ],
    influenced: ["hegel", "schopenhauer"],
    influencedBy: ["descartes", "hume"]
  },
  {
    id: "hegel",
    name: "黑格尔",
    nameEn: "Hegel",
    era: "近代",
    years: "1770-1831",
    birthYear: 1770,
    deathYear: 1831,
    school: "德国观念论",
    summary: "黑格尔是德国观念论集大成者，创立辩证法，提出'绝对精神'概念。",
    thoughtSummary: "黑格尔创立辩证法，提出'绝对精神'概念。他认为历史是精神自我实现的过程，正题-反题-合题是发展的规律。",
    keyConcepts: [
      { term: "辩证法", definition: "正题-反题-合题的发展规律" },
      { term: "绝对精神", definition: "宇宙万物的终极实在和自我意识" },
      { term: "主奴辩证法", definition: "自我意识通过承认斗争而发展" }
    ],
    influenced: ["marx", "kierkegaard"],
    influencedBy: ["kant"]
  },
  {
    id: "marx",
    name: "马克思",
    nameEn: "Marx",
    era: "近代",
    years: "1818-1883",
    birthYear: 1818,
    deathYear: 1883,
    school: "马克思主义",
    summary: "马克思是哲学家、经济学家，创立历史唯物主义和马克思主义。",
    thoughtSummary: "马克思创立历史唯物主义，强调经济基础决定上层建筑。他批判资本主义，提出共产主义理想，关注人的异化问题。",
    keyConcepts: [
      { term: "历史唯物主义", definition: "物质生产方式决定社会发展" },
      { term: "异化", definition: "人在资本主义制度下失去对劳动和产品的控制" },
      { term: "阶级斗争", definition: "历史发展的动力是阶级之间的矛盾" }
    ],
    influenced: [],
    influencedBy: ["hegel", "feuerbach"]
  },
  {
    id: "nietzsche",
    name: "尼采",
    nameEn: "Nietzsche",
    era: "近代",
    years: "1844-1900",
    birthYear: 1844,
    deathYear: 1900,
    school: "存在主义先驱",
    summary: "尼采是德国哲学家，批判传统道德，提出'超人'和'权力意志'概念。",
    thoughtSummary: "尼采批判传统道德和基督教，提出'上帝已死'。他主张权力意志，倡导创造新价值，追求生命的自我超越。",
    keyConcepts: [
      { term: "权力意志", definition: "生命的本质是追求力量的增长" },
      { term: "超人", definition: "超越现有人类，创造新价值的人" },
      { term: "永恒轮回", definition: "假设生命无限重复，你还愿意这样活吗" }
    ],
    influenced: ["freud", "sartre", "deleuze"],
    influencedBy: ["schopenhauer"]
  }
];

// API 路由
app.get('/api/philosophers', (req, res) => {
  res.json({
    philosophers: philosophersData,
    total: philosophersData.length
  });
});

app.get('/api/philosophers/:id', (req, res) => {
  const philosopher = philosophersData.find(p => p.id === req.params.id);
  if (philosopher) {
    res.json(philosopher);
  } else {
    res.status(404).json({ error: 'Philosopher not found' });
  }
});

// 概念搜索接口
app.get('/api/concepts/search', (req, res) => {
  const q = req.query.q?.toLowerCase().trim() || '';
  if (!q) {
    return res.json({ results: [] });
  }

  const results = [];
  philosophersData.forEach(p => {
    if (p.keyConcepts) {
      p.keyConcepts.forEach(c => {
        if (c.term?.toLowerCase().includes(q) || c.definition?.toLowerCase().includes(q)) {
          results.push({
            philosopherId: p.id,
            philosopher: p.name,
            concept: c.term,
            definition: c.definition,
            explanation: p.thoughtSummary?.substring(0, 100) + '...'
          });
        }
      });
    }
  });

  res.json({ results: results.slice(0, 10) });
});

// AI 问答接口
app.post('/api/ask', async (req, res) => {
  const { question, sessionId, depth = 'standard' } = req.body;
  
  if (!question) {
    return res.status(400).json({ error: '问题不能为空' });
  }

  try {
    // 构建系统提示词
    const systemPrompt = `你是一位专业的哲学导师，擅长用清晰、深入的方式回答哲学问题。

回答结构要求：
1. 核心观点：用一句话概括回答的核心
2. 详细解释：展开说明，引用相关哲学家或哲学流派
3. 思考延伸：提出值得进一步思考的问题

回答风格：
- 既要有学术深度，又要通俗易懂
- 适当引用经典哲学著作或名言
- 鼓励批判性思考，不给出绝对答案`;

    // 调用智谱 AI API
    const response = await fetch(ZHIPU_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ZHIPU_API_KEY}`
      },
      body: JSON.stringify({
        model: 'glm-4-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('智谱 AI API 错误:', errorData);
      return res.status(500).json({ 
        error: 'AI 服务暂时不可用',
        details: errorData.error?.message || 'Unknown error'
      });
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || '抱歉，我无法回答这个问题。';

    // 返回前端期望的格式
    res.json({
      answer: aiResponse,
      source: 'ai',
      sessionId: sessionId || Date.now().toString(),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI 问答错误:', error);
    res.status(500).json({ 
      error: '服务器内部错误',
      message: error.message
    });
  }
});

// 前端路由兜底
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
