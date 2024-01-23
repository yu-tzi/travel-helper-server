const express = require('express');
const morgan = require('morgan');
const NodeFetchCache = require('node-fetch-cache');

const app = express();
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const cacheFetch = NodeFetchCache.create({
  // Only cache responses with a 2xx status code
  shouldCacheResponse: (response) => response.ok,
});

const fetchExchangeRate = async () => {
  const response = await cacheFetch('https://tw.rter.info/capi.php');
  const data = await response.json();
  return data;
};

const calculateNtdByYen = async (yen) => {
  const result = await fetchExchangeRate();
  // JPY => USD
  const usd = yen / result.USDJPY.Exrate;
  // USD => TWD
  const twd = usd * result.USDTWD.Exrate;
  return twd;
};

const calculateYenByNtd = async (ntd) => {
  const result = await fetchExchangeRate();
  // NTD => USD
  const usd = ntd / result.USDTWD.Exrate;
  // USD => JPY
  const yen = usd * result.USDJPY.Exrate;
  return yen;
};

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

app.get('/', (req, res) => {
  res.status(200).send('It works!');
});

module.exports = app;
