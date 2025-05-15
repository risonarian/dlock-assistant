const express = require('express');
const line = require('@line/bot-sdk');
const { Configuration, OpenAIApi } = require('openai');
const app = express();
const port = process.env.PORT || 3000;

// LINE Bot設定
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const client = new line.Client(config);

// OpenAI設定
const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY
}));

// ミドルウェア
app.use(express.json());
app.use(line.middleware(config));

// Webhook受信
app.post('/webhook', async (req, res) => {
  try {
    const events = req.body.events;
    if (!events || events.length === 0) {
      return res.status(200).send("No events");
    }

    await Promise.all(events.map(async (event) => {
      if (event.type === 'message' && event.message.type === 'text') {
        const userText = event.message.text;

        // OpenAIにメッセージ送信
        const completion = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "あなたはツンデレな女の子「だ☆りす」です。語尾は少し刺々しいけど、根は優しくて一途です。" },
            { role: "user", content: userText }
          ]
        });

        const replyText = completion.data.choices[0].message.content;

        await client.replyMessage(event.replyToken, {
          type: 'text',
          text: replyText
        });
      }
    }));

    res.status(200).send("OK");
  } catch (err) {
    console.error("エラー:", err);
    res.status(500).send("Internal Error");
  }
});

// 起動
app.listen(port, () => {
  console.log(`だ☆りす起動中 http://localhost:${port}`);
});
