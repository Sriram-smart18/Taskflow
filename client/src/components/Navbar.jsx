import { Bell, Search } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user } = useContext(AuthContext);

  return (
    <header className="h-16 glass-panel border-b border-zinc-800 flex items-center justify-between px-8 sticky top-0 z-10 w-full">
      <div className="flex items-center bg-zinc-950 rounded-md px-3 py-1.5 w-72 border border-zinc-800 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-accent/50 transition-all shadow-sm">
        <Search size={16} className="text-zinc-400 mr-2" />
        <input 
          type="text" 
          placeholder="Search..." 
          className="bg-transparent border-none outline-none text-sm w-full text-white placeholder:text-zinc-400/70"
        />
        <div className="hidden sm:flex items-center justify-center border border-zinc-800 rounded px-1.5 py-0.5 ml-2 text-[10px] text-zinc-400 font-medium bg-zinc-900">
          ⌘K
        </div>
      </div>

      <div className="flex items-center gap-5">
        <button className="text-zinc-400 hover:text-white transition-colors relative">
          <Bell size={18} strokeWidth={2.5} />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-bg"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-5 border-l border-zinc-800">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-medium text-white leading-tight">{user?.name}</span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border mt-0.5 ${user?.role?.toLowerCase() === 'admin' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
              {user?.role}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent to-accentHover flex items-center justify-center text-white text-xs font-bold shadow-glow cursor-pointer hover:scale-105 transition-transform">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
