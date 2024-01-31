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

function handleEvent(event) {
  if (
    event.type !== 'message' ||
    event.message.type !== 'text' ||
    !event.replyToken
  ) {
    return Promise.resolve(null);
  }
  return client.replyMessage({
    replyToken: event.replyToken,
    messages: [
      {
        type: 'text',
        text: event.message.text,
      },
    ],
  });
}

////// start - 串接 line message api 之後改成從 line SDK 輸出結果 //////
const getNtdByYen = async (req, res) => {
  const { yen } = req.body;
  const ntd = await calculateNtdByYen(yen);
  res.status(200).json({
    result: ntd,
  });
};

const getYenByNtd = async (req, res) => {
  const { ntd } = req.body;
  const yen = await calculateYenByNtd(ntd);
  res.status(200).json({
    result: yen,
  });
};

app.route('/api/v1/ntd').get(getNtdByYen);
app.route('/api/v1/yen').get(getYenByNtd);
////// end - 串接 line message api 之後改成從 line SDK 輸出結果 //////

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
