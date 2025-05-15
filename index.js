const express = require('express');
const line = require('@line/bot-sdk');
const app = express();
const port = process.env.PORT || 3000;

// LINE Bot設定（環境変数から取得）
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const client = new line.Client(config);

// LINEの署名検証ミドルウェア（これが先！）
app.post('/webhook', line.middleware(config), (req, res) => {
  const events = req.body.events;

  if (!events || events.length === 0) {
    return res.status(200).send("No events");
  }

  // イベント処理
  Promise.all(events.map(async (event) => {
    console.log("受信イベント:", event);

    if (event.type === 'message' && event.message.type === 'text') {
      const replyText = `だ☆りすだよっ！「${event.message.text}」って送ってきたのね…ふんっ、べ、別にうれしくなんてないけど！`;
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: replyText
      });
    }

    return Promise.resolve(null);
  }))
    .then(() => res.status(200).send("OK"))
    .catch(err => {
      console.error("処理エラー:", err);
      res.status(500).end();
    });
});

// 静的ファイル（オプション）
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
