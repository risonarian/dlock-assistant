const express = require('express');
const line = require('@line/bot-sdk');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

// LINE Bot設定（環境変数から取得）
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};

const client = new line.Client(config);

// OpenAI APIキー
const openaiApiKey = process.env.OPENAI_API_KEY;

// ミドルウェア（LINE認証用）
app.use(express.json());
app.use(line.middleware(config));

// Webhookエンドポイント
app.post('/webhook', async (req, res) => {
  const events = req.body.events;

  if (!events || events.length === 0) {
    return res.status(200).send("No events");
  }

  try {
    await Promise.all(events.map(handleEvent));
    res.status(200).send("OK");
  } catch (err) {
    console.error("エラー:", err);
    res.status(500).end();
  }
});

// イベント処理関数
async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return null;
  }

  const userMessage = event.message.text;

  const systemPrompt = {
    role: "system",
    content: "あなたはツンデレな女の子のように振る舞うAIアシスタント『だ☆りす』です。"
  };

  const userPrompt = {
    role: "user",
    content: userMessage
  };

  const apiResponse = await axios.post("https://api.openai.com/v1/chat/completions", {
    model: "gpt-3.5-turbo",
    messages: [systemPrompt, userPrompt],
    temperature: 0.9
  }, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${openaiApiKey}`
    }
  });

  const replyText = apiResponse.data.choices[0].message.content.trim();

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: replyText
  });
}

// サーバー起動
app.listen(port, () => {
  console.log(`だ☆りすサーバー起動中！http://localhost:${port}`);
});
