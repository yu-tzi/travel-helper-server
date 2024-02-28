const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const middleware = require('@line/bot-sdk').middleware;
const tourRouter = require('./routes/toursRoute');
const lineRouter = require('./routes/lineRoute');
const { config } = require('./models/lineModel');
const app = express();

//// 開發輔助工具
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//// 設定 cors 容許所有 domain 請求
app.use('/api/v1/tours', cors());
app.options('/api/v1/tours', cors());

//// 註冊 LINE webhook
app.use('/webhook', middleware(config));
// Do not use another body-parser before the webhook middleware()
app.use(bodyParser.json());

//// route
app.get('/', (req, res) => {
  res.status(200).send('It works!');
});
app.use('/api/v1/tours', tourRouter);
app.use('/webhook', lineRouter);

module.exports = app;
