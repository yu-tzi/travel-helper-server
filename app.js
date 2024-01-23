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
  try {
    const response = await cacheFetch('https://tw.rter.info/capi.php');
    const data = await response.json();
    return data;
  } catch (err) {
    // TODO: handle error
    console.error(`💥 ERROR : ${err}`);
  }
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
  // TODO: add middleware to handle error
  const { yen } = req.body;
  const ntd = await calculateNtdByYen(yen);
  res.status(200).json({
    result: ntd,
  });
};

const getYenByNtd = async (req, res) => {
  // TODO: add middleware to handle error
  const { ntd } = req.body;
  const yen = await calculateYenByNtd(ntd);
  res.status(200).json({
    result: yen,
  });
};

app.route('/api/v1/ntd').get(getNtdByYen);
app.route('/api/v1/yen').get(getYenByNtd);

app.get('/', (req, res) => {
  res.status(200).send('It works!');
});

module.exports = app;
