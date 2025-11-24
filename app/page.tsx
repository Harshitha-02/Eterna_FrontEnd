"use client";
import React, { useState, useEffect, useReducer, useContext, useMemo, useCallback, useRef } from 'react';
import { 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity, 
  Flame, 
  Rocket, 
  Filter, 
  MoreHorizontal, 
  X,
  ChevronDown,
  Clock,
  Zap,
  CheckCircle2
} from 'lucide-react';

/**
 * ARCHITECTURE NOTES:
 * 1. ATOMIC DESIGN: Components split into Atoms (Badge, Avatar), Molecules (TokenRow), Organisms (TokenColumn).
 * 2. PERFORMANCE: React.memo used on TokenCard to prevent re-renders of unrelated items during high-freq price updates.
 * 3. STATE: 'StoreContext' acts as the Redux store.
 * 4. MOCK ENGINE: Simulates WebSocket connections and market movements.
 */

// --- TYPES & INTERFACES (Simulated via JSDoc for JS) ---
// type TokenStatus = 'new' | 'stretch' | 'migrated';

// --- UTILS ---
const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 4 }).format(val);
const formatCompact = (val) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(val);
const cn = (...classes) => classes.filter(Boolean).join(' ');

// --- MOCK DATA GENERATOR ---
const generateToken = (id, status) => {
  // Determine progress based on status to simulate bonding curve
  let progress = 0;
  if (status === 'new') progress = Math.floor(Math.random() * 80); // 0-79%
  if (status === 'stretch') progress = 80 + Math.floor(Math.random() * 19); // 80-99%
  if (status === 'migrated') progress = 100;

  return {
    id,
    symbol: Array(4).fill(0).map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join(''),
    name: `Project ${id.slice(0, 4).toUpperCase()}`,
    price: Math.random() * 0.05,
    change24h: (Math.random() * 40) - 20, // -20% to +20%
    volume: Math.floor(Math.random() * 1000000),
    mcap: Math.floor(Math.random() * 5000000),
    status, // 'new', 'stretch', 'migrated'
    progress, // Bonding curve progress
    liquidity: Math.floor(Math.random() * 200000),
    created: Date.now() - Math.floor(Math.random() * 10000000),
    txCount: Math.floor(Math.random() * 5000),
    holders: Math.floor(Math.random() * 1000),
  };
};

// --- STATE MANAGEMENT (REDUX-LIKE PATTERN) ---
const initialState = {
  tokens: {
    new: [],
    stretch: [],
    migrated: []
  },
  selectedToken: null,
  sortKey: 'created', // 'created', 'change24h', 'volume'
  filter: '',
  isLoading: true,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'INIT_DATA':
      return { ...state, tokens: action.payload, isLoading: false };
    case 'UPDATE_PRICE': {
      // Complex immutable update optimization
      const { id, newPrice, category } = action.payload;
      const list = state.tokens[category];
      const index = list.findIndex(t => t.id === id);
      if (index === -1) return state;
      
      const newTokens = [...list];
      newTokens[index] = { ...newTokens[index], price: newPrice, prevPrice: list[index].price };
      
      return {
        ...state,
        tokens: { ...state.tokens, [category]: newTokens }
      };
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

const StoreContext = React.createContext();

// --- ATOMS ---

const Badge = ({ children, variant = 'neutral', className }) => {
  const styles = {
    neutral: 'bg-zinc-800 text-zinc-400 border-zinc-700',
    success: 'bg-green-950/30 text-green-400 border-green-900/50',
    danger: 'bg-red-950/30 text-red-400 border-red-900/50',
    accent: 'bg-blue-950/30 text-blue-400 border-blue-900/50',
    warning: 'bg-orange-950/30 text-orange-400 border-orange-900/50',
  };
  return (
    <span className={cn("px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider border rounded", styles[variant], className)}>
      {children}
    </span>
  );
};

const Skeleton = ({ className }) => (
  <div className={cn("animate-pulse bg-zinc-800/50 rounded", className)} />
);

// --- MOLECULES ---

// Accessible Tooltip Implementation
const Tooltip = ({ trigger, content }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative group" onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
      {trigger}
      {visible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 rounded whitespace-nowrap z-50 shadow-xl">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-700" />
        </div>
      )}
    </div>
  );
};

// The core row component - Memoized for performance
const TokenCard = React.memo(({ token, onClick }) => {
  // Flash effect logic
  const priceRef = useRef(token.price);
  const [flash, setFlash] = useState(null); // 'up' | 'down' | null

  useEffect(() => {
    if (token.price > priceRef.current) setFlash('up');
    else if (token.price < priceRef.current) setFlash('down');
    
    priceRef.current = token.price;
    const timer = setTimeout(() => setFlash(null), 800);
    return () => clearTimeout(timer);
  }, [token.price]);

  const isUp = token.change24h >= 0;
  const isMigrated = token.status === 'migrated';

  return (
    <div 
      onClick={() => onClick(token)}
      className={cn(
        "group relative p-3 bg-zinc-900/40 hover:bg-zinc-800/60 border-b border-zinc-800/50 last:border-0 cursor-pointer transition-colors duration-150",
        isMigrated && "bg-zinc-900/60 hover:bg-zinc-800/80"
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          {/* Avatar with Status Indicator Ring */}
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-xs font-bold text-white border border-zinc-700">
              {token.symbol.substring(0, 2)}
            </div>
            {isMigrated && (
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border border-zinc-900">
                <CheckCircle2 size={8} className="text-black" strokeWidth={3} />
              </div>
            )}
          </div>
          
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-zinc-200 text-sm tracking-tight">{token.symbol}</span>
              <span className="text-[10px] text-zinc-500 font-mono">/SOL</span>
            </div>
            <div className="text-[10px] text-zinc-500 truncate max-w-[80px]">{token.name}</div>
          </div>
        </div>
        
        {/* Price Block with Flash Animation */}
        <div className="text-right">
          <div className={cn(
            "text-sm font-mono font-medium transition-colors duration-300 tabular-nums",
            flash === 'up' ? "text-green-400" : flash === 'down' ? "text-red-400" : "text-zinc-200"
          )}>
            {formatCurrency(token.price)}
          </div>
          <div className={cn("text-[10px] font-mono flex items-center justify-end gap-0.5", isUp ? "text-green-500" : "text-red-500")}>
            {isUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
            {Math.abs(token.change24h).toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Migration / Bonding Curve Progress Bar */}
      {!isMigrated ? (
        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-2 mt-1">
          <div 
            className={cn(
              "h-full rounded-full transition-all duration-500",
              token.status === 'stretch' ? "bg-orange-500" : "bg-blue-500"
            )}
            style={{ width: `${token.progress}%` }}
          />
        </div>
      ) : (
         <div className="mb-2 mt-1 flex items-center gap-1">
            <div className="h-0.5 flex-1 bg-gradient-to-r from-green-500/50 to-transparent" />
            <span className="text-[9px] uppercase font-bold text-green-500 tracking-wider">Migrated</span>
         </div>
      )}

      <div className="flex items-center justify-between mt-1">
        <div className="flex gap-2">
           {!isMigrated && (
             <span className={cn(
               "text-[10px] font-medium",
               token.status === 'stretch' ? "text-orange-400" : "text-zinc-500"
             )}>
               {token.progress}% bonded
             </span>
           )}
           {isMigrated && <Badge variant="success" className="text-[9px] py-0">Raydium</Badge>}
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[10px] text-zinc-500 font-mono">MC: {formatCompact(token.mcap)}</span>
           <div className="text-[10px] text-zinc-600 flex items-center gap-1">
             <Clock size={10} />
             {Math.floor((Date.now() - token.created) / 60000)}m
           </div>
        </div>
      </div>

      {/* Hover Actions (Desktop) */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex gap-1 z-10">
        <Tooltip trigger={
            <button className="p-1.5 bg-zinc-950 border border-zinc-700 text-zinc-400 hover:text-white rounded hover:border-zinc-500 transition-colors">
                <Activity size={14} />
            </button>
        } content="Chart" />
        <Tooltip trigger={
             <button className="p-1.5 bg-zinc-950 border border-zinc-700 text-zinc-400 hover:text-white rounded hover:border-zinc-500 transition-colors">
                <Zap size={14} />
            </button>
        } content="Quick Buy" />
      </div>
    </div>
  );
});

// --- ORGANISMS ---

const TokenListColumn = ({ title, icon: Icon, category, colorClass }) => {
  const { state, dispatch } = useContext(StoreContext);
  
  // Memoized derived state for filtering and sorting
  const displayTokens = useMemo(() => {
    let list = state.tokens[category] || [];
    
    // Filter
    if (state.filter) {
      list = list.filter(t => t.symbol.toLowerCase().includes(state.filter.toLowerCase()) || t.name.toLowerCase().includes(state.filter.toLowerCase()));
    }

    // Sort
    return [...list].sort((a, b) => {
      if (state.sortKey === 'created') return b.created - a.created;
      if (state.sortKey === 'volume') return b.volume - a.volume;
      if (state.sortKey === 'change24h') return Math.abs(b.change24h) - Math.abs(a.change24h);
      return 0;
    });
  }, [state.tokens[category], state.filter, state.sortKey]);

  return (
    <div className="flex-1 min-w-[300px] h-full flex flex-col bg-[#09090b] border-r border-zinc-800 last:border-r-0">
      {/* Column Header */}
      <div className="sticky top-0 z-10 bg-[#09090b]/95 backdrop-blur-sm border-b border-zinc-800 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("p-1.5 rounded bg-opacity-10", colorClass)}>
            <Icon size={16} className={colorClass.replace('bg-', 'text-')} />
          </div>
          <h2 className="text-sm font-semibold text-zinc-200 tracking-wide">{title}</h2>
          <span className="px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-mono">
            {displayTokens.length}
          </span>
        </div>
        <button className="text-zinc-500 hover:text-zinc-300">
           <Filter size={14} />
        </button>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        {state.isLoading ? (
          <div className="p-3 space-y-3">
             {[1,2,3,4,5].map(i => (
                <div key={i} className="h-28 bg-zinc-900/30 rounded border border-zinc-800/50 flex flex-col p-3 gap-2">
                   <div className="flex gap-2 mb-2">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <div className="space-y-1">
                         <Skeleton className="w-12 h-3" />
                         <Skeleton className="w-20 h-2" />
                      </div>
                   </div>
                   <Skeleton className="w-full h-1.5 rounded-full" />
                   <div className="flex justify-between mt-1">
                      <Skeleton className="w-16 h-3" />
                      <Skeleton className="w-16 h-3" />
                   </div>
                </div>
             ))}
          </div>
        ) : (
          displayTokens.map(token => (
            <TokenCard 
              key={token.id} 
              token={token} 
              onClick={(t) => dispatch({ type: 'SELECT_TOKEN', payload: t })}
            />
          ))
        )}
        
        {!state.isLoading && displayTokens.length === 0 && (
           <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
              <Filter size={24} className="mb-2 opacity-20" />
              <p className="text-xs">No tokens found</p>
           </div>
        )}
      </div>
    </div>
  );
};

// --- MODAL / POPOVER ---
const TokenDetailModal = () => {
  const { state, dispatch } = useContext(StoreContext);
  const token = state.selectedToken;

  if (!token) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold border border-indigo-500/30">
                 {token.symbol[0]}
              </div>
              <div>
                 <h3 className="text-lg font-bold text-white">{token.name}</h3>
                 <p className="text-xs text-zinc-500 flex items-center gap-2">
                    {token.symbol} • <span className="text-zinc-400">{token.id.substring(0,8)}...</span>
                 </p>
              </div>
           </div>
           <button 
             onClick={() => dispatch({ type: 'SELECT_TOKEN', payload: null })}
             className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
           >
              <X size={20} />
           </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 grid grid-cols-2 gap-4">
           {/* Progress Bar in Modal */}
           <div className="col-span-2 mb-2">
              <div className="flex justify-between text-xs text-zinc-400 mb-1">
                 <span>Bonding Curve Progress</span>
                 <span className={token.status === 'migrated' ? "text-green-400" : "text-zinc-200"}>{token.progress}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                 <div 
                   className={cn("h-full transition-all", token.status === 'migrated' ? "bg-green-500" : "bg-indigo-500")} 
                   style={{ width: `${token.progress}%` }}
                 />
              </div>
           </div>

           <div className="p-4 bg-zinc-950/50 rounded-lg border border-zinc-800">
              <p className="text-xs text-zinc-500 uppercase mb-1">Price</p>
              <p className="text-xl font-mono text-zinc-200">{formatCurrency(token.price)}</p>
           </div>
           <div className="p-4 bg-zinc-950/50 rounded-lg border border-zinc-800">
              <p className="text-xs text-zinc-500 uppercase mb-1">24h Change</p>
              <p className={cn("text-xl font-mono", token.change24h >= 0 ? "text-green-400" : "text-red-400")}>
                 {token.change24h.toFixed(2)}%
              </p>
           </div>
           
           <div className="col-span-2 space-y-3 mt-2">
              <div className="flex justify-between text-sm py-2 border-b border-zinc-800/50">
                 <span className="text-zinc-500">Liquidity</span>
                 <span className="text-zinc-300 font-mono">{formatCurrency(token.liquidity)}</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-zinc-800/50">
                 <span className="text-zinc-500">Market Cap</span>
                 <span className="text-zinc-300 font-mono">{formatCurrency(token.mcap)}</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-zinc-800/50">
                 <span className="text-zinc-500">Holders</span>
                 <span className="text-zinc-300 font-mono">{token.holders}</span>
              </div>
           </div>
           
           <button className="col-span-2 mt-4 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
              <Zap size={18} />
              Quick Buy
           </button>
        </div>
      </div>
    </div>
  );
};

// --- APP SHELL & LOGIC ---

export default function AxiomReplica() {
  const [state, dispatch] = useReducer(reducer, initialState);

  // 1. Initial Data Load Simulation
  useEffect(() => {
    const loadData = async () => {
      // Simulate network delay
      await new Promise(r => setTimeout(r, 1200));
      
      const newTokens = Array(15).fill(0).map((_, i) => generateToken(`new-${i}`, 'new'));
      const stretchTokens = Array(15).fill(0).map((_, i) => generateToken(`str-${i}`, 'stretch'));
      const migratedTokens = Array(15).fill(0).map((_, i) => generateToken(`mig-${i}`, 'migrated'));
      
      dispatch({
        type: 'INIT_DATA',
        payload: {
          new: newTokens,
          stretch: stretchTokens,
          migrated: migratedTokens
        }
      });
    };
    loadData();
  }, []);

  // 2. Real-time Price Update Simulation (WebSocket Mock)
  useEffect(() => {
    if (state.isLoading) return;

    const interval = setInterval(() => {
      // Pick a random category and random token to update
      const categories = ['new', 'stretch', 'migrated'];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const list = state.tokens[category];
      
      if (list.length > 0) {
        const token = list[Math.floor(Math.random() * list.length)];
        // Random price movement
        const movement = (Math.random() * 0.002) - 0.001;
        const newPrice = Math.max(0, token.price + movement);
        
        dispatch({
          type: 'UPDATE_PRICE',
          payload: { id: token.id, newPrice, category }
        });
      }
    }, 100); // Very fast updates to test performance

    return () => clearInterval(interval);
  }, [state.isLoading, state.tokens]);

  const setSort = (key) => dispatch({ type: 'SET_SORT', payload: key });

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      <div className="flex flex-col h-screen bg-[#050505] text-zinc-100 font-sans overflow-hidden selection:bg-indigo-500/30">
        
        {/* --- GLOBAL HEADER --- */}
        <header className="h-14 border-b border-zinc-800 flex items-center px-4 justify-between bg-[#09090b]">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-indigo-500">
                 <Activity className="animate-pulse" size={24} />
                 <span className="text-lg font-bold tracking-tight text-white">AXIOM<span className="text-indigo-500">.TRADE</span></span>
              </div>
              
              <nav className="hidden md:flex items-center gap-1">
                 {['Discover', 'Pulse', 'Portfolio'].map(item => (
                    <button key={item} className={cn("px-3 py-1.5 text-sm font-medium rounded-md transition-colors", item === 'Pulse' ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300")}>
                       {item}
                    </button>
                 ))}
              </nav>
           </div>

           <div className="flex items-center gap-3">
              <div className="relative hidden sm:block">
                 <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
                 <input 
                    type="text" 
                    placeholder="Search tokens..." 
                    className="h-9 w-64 bg-zinc-900 border border-zinc-800 rounded-md pl-9 pr-4 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder:text-zinc-700"
                    onChange={(e) => dispatch({ type: 'SET_FILTER', payload: e.target.value })}
                 />
              </div>
              
              {/* Sort Dropdown Simulator */}
              <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-md p-1">
                 <button onClick={() => setSort('created')} className={cn("p-1.5 rounded", state.sortKey === 'created' ? "bg-zinc-800 text-white" : "text-zinc-500")}>
                    <Clock size={14} />
                 </button>
                 <button onClick={() => setSort('change24h')} className={cn("p-1.5 rounded", state.sortKey === 'change24h' ? "bg-zinc-800 text-white" : "text-zinc-500")}>
                    <Activity size={14} />
                 </button>
                 <button onClick={() => setSort('volume')} className={cn("p-1.5 rounded", state.sortKey === 'volume' ? "bg-zinc-800 text-white" : "text-zinc-500")}>
                    <Flame size={14} />
                 </button>
              </div>
           </div>
        </header>

        {/* --- MAIN CONTENT (GRID LAYOUT) --- */}
        <main className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-800">
           <TokenListColumn 
              title="New Pairs" 
              category="new" 
              icon={Clock} 
              colorClass="bg-blue-500 text-blue-400" 
           />
           <TokenListColumn 
              title="Final Stretch" 
              category="stretch" 
              icon={Flame} 
              colorClass="bg-orange-500 text-orange-400" 
           />
           <TokenListColumn 
              title="Migrated" 
              category="migrated" 
              icon={Rocket} 
              colorClass="bg-green-500 text-green-400" 
           />
        </main>

        {/* --- FOOTER STATUS BAR --- */}
        <footer className="h-8 bg-[#050505] border-t border-zinc-800 flex items-center justify-between px-4 text-[10px] text-zinc-600 uppercase font-mono">
           <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-green-500">
                 <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                 </span>
                 Operational
              </span>
              <span>TPS: 4,291</span>
              <span>Gas: 0.0002 SOL</span>
           </div>
           <div>
              Wait time: &lt;100ms
           </div>
        </footer>

        {/* --- MODALS --- */}
        <TokenDetailModal />

      </div>
      
      {/* Global Styles for Scrollbar (Simulated) */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #09090b;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
      `}</style>
    </StoreContext.Provider>
  );
}