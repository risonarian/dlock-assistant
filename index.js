const express = require("express");
const line = require("@line/bot-sdk");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// LINE設定
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};
const client = new line.Client(config);

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

        // ★ ユーザーIDをログ出力
        console.log("ユーザーID:", event.source.userId);

        // ★ 定型返信（GPTなしで確実動作）
        const replyText = `【テスト返信】ツンデレメイドだ☆りすよ！“${userMessage}”って何よっ…でも、返してあげるっ！`;

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
  res.send("だ☆りす（テスト版）、Renderで起動中よっ！");
});

// サーバー起動
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
