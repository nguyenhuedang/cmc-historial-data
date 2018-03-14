const fetch = require('node-fetch');
const restify = require('restify');
let allCoins = null;

const getData = ({ data, date }) => {
  const start = data.indexOf(date);
  if (start === -1) { throw new Error('Could not find the date'); }

  const end = data
    .slice(start, data.length)
    .indexOf('</tr>');
  if (end === -1) { throw new Error('Could not find the date'); }
  return (data.slice(start, start + end));
};

const getAllCoin = async () => {
  const url = 'https://api.coinmarketcap.com/v1/ticker/?limit=10000';
  const response = await fetch(url);
  return await response.json();
}

const request = async ({ symbol, date }) => {
  if (!allCoins) { allCoins = await getAllCoin(); }
  const target = allCoins.find(
    coin => coin.symbol.toLowerCase() === symbol.toLowerCase()
  );
  if (!target) { throw new Error('Symbol not found'); }
  console.log(target);
  const { id } = target;

  const url = `https://coinmarketcap.com/currencies/${id}/historical-data/?start=20130428&end=20180314`;
  const response = await fetch(url);
  const data = await response.text();
  const dateData = getData({ data, date });

  const priceData = dateData
    .split(/<td .*?>(.*?)<\/td>/)
    .filter(item => item.indexOf('\n') === -1)
    .map(item => item.replace(/,/g, ''))
    .map(Number);
  const [ open, high, low, close, volume, cap ] = priceData;
  return { open, high, low, close, volume, cap };
};

// request({ name: 'qash', date: 'Mar 13, 2018' }).then(console.log);

const cache = {};

async function respond(req, res, next) {
  const { symbol, date } = req.params;
  if (!cache[symbol + date]) {
    try {
      cache[symbol + date] = await request({ symbol, date });
    } catch (err) {
      return next(err);
    }
  }
  res.send(cache[symbol + date]);
  next();
}

const server = restify.createServer();
server.get('/:symbol/:date', respond);
server.head('/:symbol/:date', respond);

const port = process.env.PORT || 8080;
server.listen(port, function() {
  console.log('%s listening at %s', server.name, server.url);
});
