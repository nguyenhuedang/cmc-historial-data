const fetch = require('node-fetch');
const restify = require('restify');

const getData = ({ data, date }) => {
  const start = data.indexOf(date);
  const end = (() => {
    let i = start + 1;
    while (true) {
      let check = data[i] + data[i + 1] + data[i + 2] + data[i + 3] + data[i + 4];
      if (check === '</tr>') { return i; }
      i++;
    }
  })();
  return (data.slice(start, end));
};

const request = async ({ name, date }) => {
  const url = `https://coinmarketcap.com/currencies/${name}/historical-data/`;
  const response = await fetch(url);
  const data = await response.text();
  const dateData = getData({ data, date });
  const priceData = dateData
    .split(/<td .*?>(.*?)<\/td>/)
    .filter(item => item.indexOf('\n') === -1)
    .map(item => item.replace(/,/g, ''))
    .map(Number)
  const [ open, high, low, close, volume, cap ] = priceData;
  return { open, high, low, close, volume, cap };
};

const cache = {};

async function respond(req, res, next) {
  const { name, date } = req.params;
  if (!cache[name + date]) {
    cache[name + date] = await request({ name, date });
  }
  res.send(cache[name + date]);
  next();
}

const server = restify.createServer();
server.get('/:name/:date', respond);
server.head('/:name/:date', respond);

const port = process.env.PORT || 8080;
server.listen(port, function() {
  console.log('%s listening at %s', server.name, server.url);
});
