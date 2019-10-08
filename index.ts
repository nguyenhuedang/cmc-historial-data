import { writeFileSync } from 'fs';
import historical from './historical';
import currency from './currency';
import { Promise as Bluebird } from 'bluebird';

const main = async function () {
  const [, , currencyList, date] = process.argv;
  const symbols = currencyList.split(',');
  const currencies = await currency.getCurrencyData(symbols);
  const slugs = currencies.data.map(currency => currency.slug);
  const historicalDatas = await Bluebird.map(
    slugs,
    slug => historical.getHistorical(slug, date),
    { concurrency: 2 },
  );
  const output = `${date}.csv`;
  writeFileSync(
    output,
    'symbol,open,high,low,close,volume,market cap\n'+
    historicalDatas.map((data, index) =>
      `${symbols[index]},${data.open},${data.high},${data.low},${data.close},${data.volume},${data.cap}`
    ).join('\n')
  );
}

main().catch(console.error);
