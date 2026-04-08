const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 静态文件服务（前端构建文件）
app.use(express.static(path.join(__dirname, '../dist')));

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
    summary: "柏拉图是苏格拉底的学生，创立了理念论，建立了西方第一个高等学府"学院"。"
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
  res.json(philosophersData);
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
  
  // TODO: 集成 AI SDK
  res.json({
    answer: {
      core: "这是一个示例回答",
      content: `您问的是：${question}`
    },
    sessionId,
    timestamp: new Date().toISOString()
  });
});

// 前端路由兜底
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
