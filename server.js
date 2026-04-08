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

// API 路由
app.get('/api/philosophers', (req, res) => {
  const philosophers = require('../philosophy-data/philosophers.json');
  res.json(philosophers);
});

app.get('/api/philosophers/:id', (req, res) => {
  const philosophers = require('../philosophy-data/philosophers.json');
  const philosopher = philosophers.find(p => p.id === req.params.id);
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
