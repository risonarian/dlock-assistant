const axios = require('axios');
require('dotenv').config();

(async () => {
  try {
    await axios.post('https://api.line.me/v2/bot/message/push', {
      to: process.env.LINE_USER_ID,
      messages: [
        {
          type: 'text',
          text: '【テスト通知】おはようございますっ！今日もがんばりなさいよねっ、ご主人様っ！'
        }
      ]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CHANNEL_ACCESS_TOKEN}`
      }
    });
    console.log('LINE通知、成功したわよっ！！');
  } catch (err) {
    console.error('通知エラーよ…っ！', err.response?.data || err.message);
  }
})();
