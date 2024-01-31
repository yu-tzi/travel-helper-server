const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const tourRouter = require('./routes/toursRoute');
const {
  calculateNtdByYen,
  calculateYenByNtd,
} = require('./utils/exchangeDollars');

const app = express();
app.use(express.json());

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

app.get('/', (req, res) => {
  res.status(200).send('It works!');
});

app.use('/api/v1/tours', tourRouter);

module.exports = app;
