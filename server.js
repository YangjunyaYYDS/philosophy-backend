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
    school: "古希腊哲学",
    summary: "苏格拉底是古希腊哲学的奠基人之一，以其问答法（苏格拉底方法）闻名。"
  },
  {
    id: "plato",
    name: "柏拉图",
    nameEn: "Plato",
    era: "古希腊",
    years: "428-348 BC",
    school: "理念论",
    summary: "柏拉图是苏格拉底的学生，创立了理念论，建立了西方第一个高等学府'学院'。"
  },
  {
    id: "aristotle",
    name: "亚里士多德",
    nameEn: "Aristotle",
    era: "古希腊",
    years: "384-322 BC",
    school: "逍遥学派",
    summary: "亚里士多德是柏拉图的学生，百科全书式的学者，逻辑学、物理学、伦理学等领域的奠基人。"
  },
  {
    id: "confucius",
    name: "孔子",
    nameEn: "Confucius",
    era: "春秋时期",
    years: "551-479 BC",
    school: "儒家",
    summary: "孔子是中国古代思想家、教育家，儒家学派创始人，其思想对中国文化影响深远。"
  },
  {
    id: "laozi",
    name: "老子",
    nameEn: "Laozi",
    era: "春秋时期",
    years: "约6世纪 BC",
    school: "道家",
    summary: "老子是道家学派创始人，《道德经》作者，主张无为而治、道法自然。"
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

    // 解析 AI 回答，提取核心观点和详细内容
    const lines = aiResponse.split('\n').filter(line => line.trim());
    let core = '';
    let content = aiResponse;

    // 尝试提取核心观点（通常在第一行或包含"核心"、"观点"的行）
    for (const line of lines) {
      if (line.includes('核心') || line.includes('观点') || line.length < 100) {
        core = line.replace(/^[\d\s\.、]+/, '').trim();
        break;
      }
    }
    
    // 如果没有找到核心观点，用第一行
    if (!core && lines.length > 0) {
      core = lines[0].substring(0, 50) + '...';
    }

    res.json({
      answer: {
        core: core || '哲学思考',
        content: content
      },
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
