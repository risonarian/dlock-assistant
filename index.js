const express = require('express');
const line = require('@line/bot-sdk');
const app = express();
const port = process.env.PORT || 3000;

// LINE Bot設定（環境変数から取得）
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};

const client = new line.Client(config);

// ミドルウェア（LINE認証用）
app.use(express.json());
app.use(line.middleware(config));

// Webhookエンドポイント
app.post('/webhook', (req, res) => {
  const events = req.body.events;

  if (!events || events.length === 0) {
    return res.status(200).send("No events");
  }

  // 各イベントに対して返信処理
  Promise.all(events.map(event => {
    console.log("受信したイベント:", event);

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
      console.error("Webhook処理中のエラー:", err);
      res.status(500).end();
    });
});

// Webページ表示（静的ファイル対応）
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// おすすめAPI（例：昼ごはん提案機能）
app.get('/api/suggest', (req, res) => {
  const genre = req.query.genre || 'omelet';
  const budget = parseInt(req.query.budget || '1000', 10);

  const suggestions = {
    omelet: [
      { name: "札幌オムライス本舗", price: 980, transport: "地下鉄", time: "12分" },
      { name: "カフェたまご屋", price: 850, transport: "バス", time: "18分" },
      { name: "とろとろオムレツ工房", price: 1100, transport: "徒歩", time: "25分" }
    ],
    ramen: [
      { name: "ラーメン炎神", price: 880, transport: "地下鉄", time: "10分" },
      { name: "味の時計台", price: 950, transport: "徒歩", time: "15分" },
      { name: "さっぽろ塩ラーメン堂", price: 790, transport: "バス", time: "20分" }
    ],
    curry: [
      { name: "スープカレーGARAKU", price: 1200, transport: "バス", time: "20分" },
      { name: "奥芝商店", price: 1000, transport: "地下鉄", time: "13分" },
      { name: "カリーライス本舗", price: 850, transport: "徒歩", time: "17分" }
    ]
  };

  const results = suggestions[genre] || [
    { name: "ジャンル未登録のお店", price: 999, transport: "不明", time: "？分" }
  ];

  results.forEach(shop => {
    shop.message = (shop.price > budget)
      ? "ちょっと予算オーバーかも…どうする？"
      : "予算内でおすすめだよ♪";
  });

  res.json({
    genre: genre,
    budget: budget,
    suggestions: results
  });
});

// サーバー起動
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
