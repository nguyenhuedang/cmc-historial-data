import moment =  require('moment');
import fetch from 'node-fetch';

const getData = (data: string, date: string) => {
  const dateString = moment(date).format('MMM DD, YYYY');
  const start = data.indexOf(dateString);
  if (start === -1) { throw new Error('Could not find the date'); }

  const end = data
    .slice(start, data.length)
    .indexOf('</tr>');
  if (end === -1) { throw new Error('Could not find the date'); }
  return (data.slice(start, start + end));
};


const getHistorical = async (slug: string, date: string) => {
  const start = moment(date).format('YYYYMMDD');
  const url = `https://coinmarketcap.com/currencies/${slug}/historical-data/?start=${start}&end=${start}`;
  const response = await fetch(url);
  const data = await response.text();
  const dateData = getData(data, date);
  const priceData = dateData
    .split(/<td .*?>(.*?)<\/td>/)
    .filter(item => item.indexOf('\n') === -1)
    .map(item => item.replace(/,/g, ''))
    .map(Number);
  const [ open, high, low, close, volume, cap ] = priceData;
  return { open, high, low, close, volume, cap };
};

export default { getHistorical };
