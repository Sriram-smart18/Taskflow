import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, CheckSquare, Users, Settings, LogOut } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);

  const isAdmin = user?.role?.toLowerCase() === 'admin';

  const links = isAdmin 
    ? [
        { name: 'Dashboard', to: '/', icon: <LayoutDashboard size={18} strokeWidth={2.5} /> },
        { name: 'Projects', to: '/projects', icon: <FolderKanban size={18} strokeWidth={2.5} /> },
        { name: 'Tasks', to: '/tasks', icon: <CheckSquare size={18} strokeWidth={2.5} /> },
        { name: 'Team', to: '/team', icon: <Users size={18} strokeWidth={2.5} /> },
      ]
    : [
        { name: 'My Dashboard', to: '/', icon: <LayoutDashboard size={18} strokeWidth={2.5} /> },
        { name: 'My Tasks', to: '/tasks', icon: <CheckSquare size={18} strokeWidth={2.5} /> },
        { name: 'My Projects', to: '/projects', icon: <FolderKanban size={18} strokeWidth={2.5} /> },
      ];

  return (
    <div className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col justify-between h-screen p-4 flex-shrink-0 z-20">
      <div>
        <div className="flex items-center gap-3 px-3 mb-10 mt-2">
          <div className="bg-gradient-to-tr from-accent to-accentHover p-1.5 rounded-lg shadow-glow">
            <CheckSquare className="text-white" size={20} strokeWidth={3} />
          </div>
          <h1 className="text-lg font-bold text-white tracking-tight">TaskFlow</h1>
        </div>

        <nav className="flex flex-col gap-1.5">
          <div className="px-3 mb-2 text-xs font-semibold tracking-wider text-zinc-400 uppercase">Menu</div>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-400'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`
              }
            >
              {link.icon}
              {link.name}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex flex-col gap-1.5">
        <button className="flex items-center gap-3 px-3 py-2 rounded-md text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all text-sm font-medium w-full text-left">
          <Settings size={18} strokeWidth={2.5} />
          Settings
        </button>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-all text-sm font-medium w-full text-left"
        >
          <LogOut size={18} strokeWidth={2.5} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
