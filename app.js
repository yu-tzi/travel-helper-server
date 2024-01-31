const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const middleware = require('@line/bot-sdk').middleware;
const line = require('@line/bot-sdk');
const tourRouter = require('./routes/toursRoute');
const {
  calculateNtdByYen,
  calculateYenByNtd,
} = require('./utils/exchangeDollars');

const app = express();

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

app.use('/webhook', middleware(config));
// Do not use another body-parser before the webhook middleware()
app.use(bodyParser.json());

app.post('/webhook', (req, res) => {
  Promise.all(req.body.events.map(handleEvent)).then((result) =>
    res.json(result),
  );
});

const client = new line.messagingApi.MessagingApiClient(config);

const handleEvent = async (event) => {
  if (
    event.type !== 'message' ||
    event.message.type !== 'text' ||
    !event.replyToken
  ) {
    return Promise.resolve(null);
  }
  if (
    event.message.text.includes('日幣') ||
    event.message.text.includes('台幣')
  ) {
    const regex = /\d+/;
    const match = event.message.text.match(regex);
    const amount = parseInt(match[0], 10);
    const currency = event.message.text.includes('日幣') ? '日幣' : '台幣';
    const returnCurrency = event.message.text.includes('日幣')
      ? '台幣'
      : '日幣';
    let returnAmount = 0;
    if (currency === '日幣') {
      const ntd = await calculateNtdByYen(amount);
      returnAmount = ntd;
    } else if (currency === '台幣') {
      const yen = await calculateYenByNtd(amount);
      returnAmount = yen;
    }
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [
        {
          type: 'text',
          text: `${currency} ${amount} 等於 ${returnCurrency} ${returnAmount}`,
        },
      ],
    });
  }
  return client.replyMessage({
    replyToken: event.replyToken,
    messages: [
      {
        type: 'text',
        text: '如果要查詢匯率，請輸入「日幣」或「台幣」以及金額，例如：「日幣1000」',
      },
    ],
  });
};

/*
app.use(
  '/api/v1/tours',
  cors({
    origin: process.env.CLIENT_URL,
  }),
);
app.options(
  '/api/v1/tours',
  cors({
    origin: process.env.CLIENT_URL,
  }),
);
*/

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.get('/', (req, res) => {
  res.status(200).send('It works!');
});

app.use('/api/v1/tours', tourRouter);

module.exports = app;
