const line = require('@line/bot-sdk');
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

const truncateToOneDecimalPlace = (num) => {
  return Math.floor(num * 10) / 10;
};

exports.config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new line.messagingApi.MessagingApiClient(config);

exports.handleWebhookEvent = async (event) => {
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
    if (currency === '日幣') {
      const ntd = await calculateNtdByYen(amount);
      return client.replyMessage({
        replyToken: event.replyToken,
        messages: [
          {
            type: 'text',
            text: `${currency} ${amount} 約等於 ${returnCurrency} ${truncateToOneDecimalPlace(ntd)}`,
          },
        ],
      });
    } else if (currency === '台幣') {
      const yen = await calculateYenByNtd(amount);
      return client.replyMessage({
        replyToken: event.replyToken,
        messages: [
          {
            type: 'text',
            text: `${currency} ${amount} 約等於 ${returnCurrency} ${truncateToOneDecimalPlace(yen)}`,
          },
        ],
      });
    }
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
