const fetch = require('node-fetch');
const restify = require('restify');

const getData = ({ data, date }) => {
  const start = data.indexOf(date);
  if (start === -1) { throw new Error('Could not find the date'); }

  const end = data
    .slice(start, data.length)
    .indexOf('</tr>');
  if (end === -1) { throw new Error('Could not find the date'); }
  return (data.slice(start, start + end));
};

const request = async ({ name, date }) => {
  const url = `https://coinmarketcap.com/currencies/${name}/historical-data/?start=20130428&end=20180314`;
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
  const { name, date } = req.params;
  if (!cache[name + date]) {
    try {
      cache[name + date] = await request({ name, date });
      res.send(cache[name + date]);
      next();
    } catch (err) {
      return next(err);
    }
  }
}

const server = restify.createServer();
server.get('/:name/:date', respond);
server.head('/:name/:date', respond);

const port = process.env.PORT || 8080;
server.listen(port, function() {
  console.log('%s listening at %s', server.name, server.url);
});
