import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const MainLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-white selection:bg-indigo-500/30 selection:text-white font-sans">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/5 via-bg to-bg pointer-events-none -z-10"></div>
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 animate-fade-in scroll-smooth">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
