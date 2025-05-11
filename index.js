const express = require('express');
const app = express();
const port = 3000;

// publicフォルダ内のファイルを静的に提供
app.use(express.static('public'));

// 明示的に `/` へアクセスした時の処理
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/webhook', express.json(), (req, res) => {
  const events = req.body.events;

  if (!events || events.length === 0) {
    return res.status(200).send("No events");
  }

  events.forEach(event => {
    console.log("受信したイベント:", event);
    // ここに応答処理を入れる予定よ！
  });

  res.status(200).send("OK");
});

// サーバーを起動するよ！
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

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

  // 予算を超えてたらメッセージを追加
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