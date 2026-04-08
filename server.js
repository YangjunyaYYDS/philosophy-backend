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

// 加载哲学家数据
const fs = require('fs');
let philosophersData = [];

try {
  const dataPath = path.join(__dirname, '..', 'philosophy-data', 'philosophers-data-full.json');
  const rawData = fs.readFileSync(dataPath, 'utf8');
  const parsed = JSON.parse(rawData);
  philosophersData = parsed.philosophers || [];
  console.log(`成功加载 ${philosophersData.length} 位哲学家数据`);
} catch (error) {
  console.error('加载哲学家数据失败:', error.message);
  console.log('使用备用数据...');
  // 备用：加载失败时使用最少数据
  philosophersData = [];
}

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
