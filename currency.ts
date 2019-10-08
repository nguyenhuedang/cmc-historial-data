import api from './api';

interface Currency {
  id: number;
  name: string;
  symbol: string;
  slug: string;
}

const getCurrencyData = async (symbols: string[]) => {
  interface Response {
    data: Currency[];
  };
  const symbolList = symbols.map(symbol => symbol.toUpperCase()).join(',');
  const path = `/v1/cryptocurrency/map?symbol=${symbolList}`;
  return api.get<Response>(path);
}

export default { getCurrencyData };
