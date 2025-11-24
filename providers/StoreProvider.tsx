// providers/StoreProvider.tsx
'use client';
import React, { useReducer, useEffect, ReactNode } from 'react';
import { generateToken } from '../components/utils/mockData';
import { StoreContext, initialState, reducer } from '../components/utils/store';

type Props = { children: ReactNode };

export default function StoreProvider({ children }: Props) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // initial load
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      await new Promise((r) => setTimeout(r, 900));
      if (!mounted) return;
      const newTokens = Array.from({ length: 15 }).map((_, i) => generateToken(`new-${i}`, 'new'));
      const stretchTokens = Array.from({ length: 15 }).map((_, i) => generateToken(`str-${i}`, 'stretch'));
      const migratedTokens = Array.from({ length: 15 }).map((_, i) => generateToken(`mig-${i}`, 'migrated'));

      dispatch({
        type: 'INIT_DATA',
        payload: { new: newTokens, stretch: stretchTokens, migrated: migratedTokens },
      });
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // price update mock (simulates websocket)
  useEffect(() => {
    if (state.isLoading) return;
    const interval = setInterval(() => {
      const categories: Array<keyof typeof state.tokens> = ['new', 'stretch', 'migrated'];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const list = state.tokens[category];
      if (!list || list.length === 0) return;
      const token = list[Math.floor(Math.random() * list.length)];
      const movement = (Math.random() * 0.002) - 0.001;
      const newPrice = Math.max(0, token.price + movement);
      dispatch({ type: 'UPDATE_PRICE', payload: { id: token.id, newPrice, category } });
    }, 100);
    return () => clearInterval(interval);
  }, [state.isLoading, state.tokens]);

  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>;
}
