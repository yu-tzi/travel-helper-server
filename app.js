const express = require('express');
const morgan = require('morgan');
const {
  calculateNtdByYen,
  calculateYenByNtd,
} = require('./utils/exchangeDollars');

const app = express();
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

////// start - 串接 line message api 之後改成從 line SDK 輸出結果 //////
const getNtdByYen = async (req, res) => {
  const { yen } = req.body;
  try {
    const ntd = await calculateNtdByYen(yen);
    res.status(200).json({
      result: ntd,
    });
  } catch (e) {
    res.status(404).json({
      result: 'error',
    });
  }
};

const getYenByNtd = async (req, res) => {
  const { ntd } = req.body;
  try {
    const yen = await calculateYenByNtd(ntd);
    res.status(200).json({
      result: yen,
    });
  } catch (e) {
    res.status(404).json({
      result: 'error',
    });
  }
};

app.route('/api/v1/ntd').get(getNtdByYen);
app.route('/api/v1/yen').get(getYenByNtd);
////// end - 串接 line message api 之後改成從 line SDK 輸出結果 //////

app.get('/', (req, res) => {
  res.status(200).send('It works!');
});

module.exports = app;
