const NodeFetchCache = require('node-fetch-cache');

const cacheFetch = NodeFetchCache.create({
  // Only cache responses with a 2xx status code
  shouldCacheResponse: (response) => response.ok,
});

const fetchExchangeRate = async () => {
  const response = await cacheFetch('https://tw.rter.info/capi.php');
  const data = await response.json();
  return data;
};

exports.calculateNtdByYen = async (yen) => {
  const result = await fetchExchangeRate();
  // JPY => USD
  const usd = yen / result.USDJPY.Exrate;
  // USD => TWD
  const twd = usd * result.USDTWD.Exrate;
  return twd;
};

exports.calculateYenByNtd = async (ntd) => {
  const result = await fetchExchangeRate();
  // NTD => USD
  const usd = ntd / result.USDTWD.Exrate;
  // USD => JPY
  const yen = usd * result.USDJPY.Exrate;
  return yen;
};
