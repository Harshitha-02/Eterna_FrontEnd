// utils/mockData.ts
import { TokenType } from './store';

export const generateToken = (id: string, status: TokenType['status']): TokenType => {
  let progress = 0;
  if (status === 'new') progress = Math.floor(Math.random() * 80);
  if (status === 'stretch') progress = 80 + Math.floor(Math.random() * 19);
  if (status === 'migrated') progress = 100;

  return {
    id,
    symbol: Array.from({ length: 4 }).map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join(''),
    name: `Project ${id.slice(0, 4).toUpperCase()}`,
    price: Math.random() * 0.05,
    change24h: (Math.random() * 40) - 20,
    volume: Math.floor(Math.random() * 1_000_000),
    mcap: Math.floor(Math.random() * 5_000_000),
    status,
    progress,
    liquidity: Math.floor(Math.random() * 200_000),
    created: Date.now() - Math.floor(Math.random() * 10_000_000),
    txCount: Math.floor(Math.random() * 5_000),
    holders: Math.floor(Math.random() * 1_000),
  };
};
