const express = require("express");
const line = require("@line/bot-sdk");
const axios = require("axios");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};
const client = new line.Client(config);

// LINE用ミドルウェア
app.use(line.middleware(config));
app.use(express.json());

// 通常Webhook処理（変えない）
app.post("/webhook", async (req, res) => {
  const events = req.body.events;
  if (!events || events.length === 0) return res.status(200).send("No events");

  try {
    await Promise.all(
      events.map(async (event) => {
        if (event.type !== "message" || event.message.type !== "text") return;

        const userMessage = event.message.text;
        console.log("ユーザーID:", event.source.userId);

        const replyText = `【テスト返信】ツンデレメイドだ☆りすよ！“${userMessage}”なんて、バカじゃないの…でも返してあげるっ！`;

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

// ★ 追加：テスト通知用エンドポイント（ここで通知！）
app.get("/notify-test", async (req, res) => {
  try {
    await axios.post("https://api.line.me/v2/bot/message/push", {
      to: process.env.LINE_USER_ID,
      messages: [
        {
          type: "text",
          text: "【テスト通知】おはようございますっ！今日もちゃんと見てるからねっ、ご主人様っ！",
        },
      ],
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CHANNEL_ACCESS_TOKEN}`,
      },
    });

    console.log("通知成功！");
    res.send("LINE通知、送ったわよっ！");
  } catch (err) {
    console.error("通知失敗:", err.response?.data || err.message);
    res.status(500).send("通知失敗！");
  }
});

// 動作確認用
app.get("/", (req, res) => {
  res.send("だ☆りす（通知対応版）起動中っ！");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
