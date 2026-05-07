import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircle2, Clock, AlertCircle, ListTodo, FolderKanban } from 'lucide-react';

const SkeletonCard = () => (
  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex items-center gap-4 animate-pulse">
    <div className="w-14 h-14 bg-border rounded-xl"></div>
    <div className="space-y-2 flex-1">
      <div className="h-4 bg-border rounded w-1/2"></div>
      <div className="h-6 bg-border rounded w-1/4"></div>
    </div>
  </div>
);

const StatCard = ({ title, value, icon: Icon, color }) => {
  const colorMap = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex items-center gap-4 card-hover relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-transparent group-hover:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className={`p-3.5 rounded-xl border ${colorMap[color]} shadow-sm transition-transform group-hover:scale-110`}>
        <Icon size={22} strokeWidth={2.5} />
      </div>
      <div className="z-10">
        <p className="text-[13px] text-zinc-400 font-medium uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-bold text-white mt-1 tracking-tight">{value}</p>
      </div>
    </div>
  );
};

const MemberDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data);
        setError(null);
      } catch (err) {
        console.error('Dashboard Error:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-zinc-800 rounded-md animate-pulse mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center h-64 bg-zinc-900 border border-zinc-800 rounded-2xl">
        <div className="flex flex-col items-center gap-3 text-red-400">
          <AlertCircle size={32} />
          <p className="font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) return <div className="text-zinc-400 flex items-center justify-center h-64">No stats available.</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white tracking-tight">My Productivity</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Assigned Tasks" value={stats.totalTasks} icon={ListTodo} color="blue" />
        <StatCard title="Completed" value={stats.completedTasks} icon={CheckCircle2} color="emerald" />
        <StatCard title="In Progress" value={stats.pendingTasks} icon={Clock} color="amber" />
        <StatCard title="My Projects" value={stats.totalProjects || 0} icon={FolderKanban} color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-7 shadow-sm flex flex-col">
          <h2 className="text-base font-semibold text-white mb-6 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            Upcoming Deadlines
          </h2>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2">
             <div className="h-full flex flex-col items-center justify-center text-zinc-400 bg-zinc-950/50 rounded-xl border border-dashed border-zinc-800 p-8">
               <Clock size={32} className="mb-3 opacity-20" />
               <p className="text-sm font-medium">No upcoming deadlines.</p>
               <p className="text-xs mt-1">You're all caught up!</p>
             </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-7 shadow-sm flex flex-col">
          <h2 className="text-base font-semibold text-white mb-6 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
            My Activity
          </h2>
          <div className="space-y-6 flex-1 overflow-y-auto pr-2">
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex gap-4 group">
                  <div className="w-9 h-9 rounded-full bg-border flex items-center justify-center flex-shrink-0 text-xs font-bold text-white group-hover:bg-indigo-500 transition-colors">
                    {activity.user.name.charAt(0)}
                  </div>
                  <div className="flex-1 border-b border-zinc-800/50 pb-4 group-last:border-0">
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      <span className="font-semibold text-white">{activity.user.name}</span> {activity.message}
                    </p>
                    <p className="text-[11px] font-medium text-zinc-400/60 mt-1.5 uppercase tracking-wider">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-400">
                <Clock size={32} className="mb-3 opacity-20" />
                <p className="text-sm">No recent activity.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
