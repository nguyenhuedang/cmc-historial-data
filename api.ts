import fetch from 'node-fetch';
import config from './config';

const base = 'https://pro-api.coinmarketcap.com';

const get = async function<T>(path: string): Promise<T> {
  const response = await fetch(base + path, {
    method: 'GET',
    headers: {
      'X-CMC_PRO_API_KEY': config.CMC_PRO_API_KEY,
    }
  });
  if (response.ok) return response.json();
  console.error(await response.text());
  throw Error(`Request to ${path} failed`);
}

 export default { get };
