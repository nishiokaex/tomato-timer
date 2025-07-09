const { getDefaultConfig } = require('expo/metro-config');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// デフォルトのMetro設定を取得
const config = getDefaultConfig(__dirname);

// ログサーバーを作成
const createLogServer = () => {
  const app = express();
  
  // 起動時刻を記録
  const startTime = new Date();
  const logFileName = startTime.toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '') + '.md';
  const logsDir = path.join(__dirname, 'logs');
  const logFilePath = path.join(logsDir, logFileName);
  
  // logsディレクトリが存在しない場合は作成
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  // ログファイルの初期化
  fs.writeFileSync(logFilePath, `# Error Log - ${startTime.toISOString()}\n\n`);
  
  // CORS設定
  app.use(cors({
    origin: true,
    credentials: true
  }));
  
  // JSON形式のリクエストボディを解析
  app.use(express.json());
  
  // ログエンドポイント
  app.post('/api/log', (req, res) => {
    const { exception, message } = req.body;
    
    // タイムスタンプを含むMarkdown形式でログ出力
    const logTime = new Date().toISOString();
    
    let logContent = `## ${logTime}\n`;
    logContent += `**Message:** ${message}\n`;
    
    // 例外オブジェクトがある場合はMarkdown形式で出力
    if (exception) {
      logContent += `**Exception:**\n`;
      logContent += '```json\n';
      logContent += JSON.stringify(exception, null, 2) + '\n';
      logContent += '```\n\n';
    }
    
    // ファイルに追記
    fs.appendFileSync(logFilePath, logContent);
    
    res.json({ success: true, message: 'Log received' });
  });
  
  return app;
};

// カスタムサーバーをMetroに統合
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware, server) => {
    const logApp = createLogServer();
    
    // ログサーバーのミドルウェアを追加
    return (req, res, next) => {
      if (req.url.startsWith('/api/')) {
        return logApp(req, res, next);
      }
      return middleware(req, res, next);
    };
  }
};

module.exports = config;