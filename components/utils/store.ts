// utils/store.ts
import React from 'react';

export type TokenStatus = 'new' | 'stretch' | 'migrated';

export type TokenType = {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume?: number;
  mcap: number;
  status: TokenStatus;
  progress: number;
  liquidity: number;
  created: number;
  txCount?: number;
  holders: number;
  image?: string | null; 
};

export type AppState = {
  tokens: { new: TokenType[]; stretch: TokenType[]; migrated: TokenType[] };
  selectedToken: TokenType | null;
  sortKey: 'created' | 'change24h' | 'volume';
  filter: string;
  isLoading: boolean;
};

export const initialState: AppState = {
  tokens: { new: [], stretch: [], migrated: [] },
  selectedToken: null,
  sortKey: 'created',
  filter: '',
  isLoading: true,
};

export type Action =
  | { type: 'INIT_DATA'; payload: AppState['tokens'] }
  | { type: 'UPDATE_PRICE'; payload: { id: string; newPrice: number; category: keyof AppState['tokens'] } }
  | { type: 'SELECT_TOKEN'; payload: TokenType | null }
  | { type: 'SET_SORT'; payload: AppState['sortKey'] }
  | { type: 'SET_FILTER'; payload: string };

export const reducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'INIT_DATA':
      return { ...state, tokens: action.payload, isLoading: false };
    case 'UPDATE_PRICE': {
      const { id, newPrice, category } = action.payload;
      const list = state.tokens[category];
      const index = list.findIndex((t) => t.id === id);
      if (index === -1) return state;
      const newList = [...list];
      newList[index] = { ...newList[index], price: newPrice };
      return { ...state, tokens: { ...state.tokens, [category]: newList } };
    }
    case 'SELECT_TOKEN':
      return { ...state, selectedToken: action.payload };
    case 'SET_SORT':
      return { ...state, sortKey: action.payload };
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
    default:
      return state;
  }
};

export const StoreContext = React.createContext<{ state: AppState; dispatch: React.Dispatch<Action> }>({
  state: initialState,
  dispatch: () => undefined,
});
