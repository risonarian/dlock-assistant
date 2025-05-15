const express = require("express");
const line = require("@line/bot-sdk");
const { OpenAI } = require("openai");

const app = express();
const port = process.env.PORT || 3000;

// LINE設定
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};
const client = new line.Client(config);

// OpenAI GPT-4o設定
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// LINE認証ミドルウェア
app.use(line.middleware(config));
app.use(express.json());

// Webhookエンドポイント
app.post("/webhook", async (req, res) => {
  const events = req.body.events;
  if (!events || events.length === 0) return res.status(200).send("No events");

  try {
    await Promise.all(
      events.map(async (event) => {
        if (event.type !== "message" || event.message.type !== "text") return;

        const userMessage = event.message.text;

        // GPT-4oとの会話生成
        const gptResponse = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content:
                "あなたはツンデレなメイドの『だ☆りす』です。ユーザーの発言にはツンツンしながらも、最後にちょっとだけデレてください。",
            },
            {
              role: "user",
              content: userMessage,
            },
          ],
        });

        const replyText = gptResponse.choices[0].message.content;

        await client.replyMessage(event.replyToken, {
          type: "text",
          text: replyText,
        });
      })
    );

    res.status(200).send("OK");
  } catch (err) {
    console.error("Webhookエラー:", err);
    res.status(500).end();
  }
});

// 動作確認用ルート
app.get("/", (req, res) => {
  res.send("D☆Lock Assistantは起動してるわよっ…べ、別にあなたのためじゃないけど！");
});

// サーバー起動
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
