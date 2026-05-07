import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, Calendar, Users, ListTodo, CheckCircle2, 
  Clock, AlertCircle, MessageSquare, Activity, ShieldCheck, 
  MoreVertical, FileText, Plus
} from 'lucide-react';

// Fallback Generators
const generateDemoTasks = (projectTitle) => {
  const isDesign = projectTitle.toLowerCase().includes('design') || projectTitle.toLowerCase().includes('ui');
  const isBackend = projectTitle.toLowerCase().includes('api') || projectTitle.toLowerCase().includes('backend');
  
  if (isDesign) return [
    { id: '1', title: 'Create wireframes for dashboard', status: 'Done', priority: 'High', assignee: { name: 'Alice Freeman' }, dueDate: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: '2', title: 'Define color palette and typography', status: 'In Progress', priority: 'Medium', assignee: { name: 'Bob Chen' }, dueDate: new Date(Date.now() + 86400000 * 3).toISOString() },
    { id: '3', title: 'Design mobile responsive layouts', status: 'Todo', priority: 'High', assignee: { name: 'Charlie Davis' }, dueDate: new Date(Date.now() + 86400000 * 7).toISOString() },
  ];
  
  if (isBackend) return [
    { id: '1', title: 'Setup database schema', status: 'Done', priority: 'High', assignee: { name: 'Bob Chen' }, dueDate: new Date(Date.now() - 86400000 * 5).toISOString() },
    { id: '2', title: 'Implement JWT authentication', status: 'Done', priority: 'High', assignee: { name: 'Alice Freeman' }, dueDate: new Date(Date.now() - 86400000 * 1).toISOString() },
    { id: '3', title: 'Create REST endpoints for users', status: 'In Progress', priority: 'Medium', assignee: { name: 'Charlie Davis' }, dueDate: new Date(Date.now() + 86400000 * 2).toISOString() },
    { id: '4', title: 'Write unit tests for services', status: 'Todo', priority: 'Low', assignee: null, dueDate: new Date(Date.now() + 86400000 * 10).toISOString() },
  ];

  return [
    { id: '1', title: `Initial planning for ${projectTitle}`, status: 'Done', priority: 'High', assignee: { name: 'Alice Freeman' }, dueDate: new Date(Date.now() - 86400000 * 4).toISOString() },
    { id: '2', title: 'Draft project specifications', status: 'In Progress', priority: 'Medium', assignee: { name: 'Bob Chen' }, dueDate: new Date(Date.now() + 86400000 * 1).toISOString() },
    { id: '3', title: 'Kickoff meeting with stakeholders', status: 'Todo', priority: 'Low', assignee: { name: 'Charlie Davis' }, dueDate: new Date(Date.now() + 86400000 * 5).toISOString() },
  ];
};

const generateDemoActivities = (projectTitle, members) => {
  const getMember = (index) => members[index % members.length]?.user?.name || 'System';
  
  return [
    { id: 'a1', message: 'created the project', user: { name: getMember(0) }, createdAt: new Date(Date.now() - 86400000 * 10).toISOString() },
    { id: 'a2', message: 'updated project description', user: { name: getMember(1) }, createdAt: new Date(Date.now() - 86400000 * 9).toISOString() },
    { id: 'a3', message: 'moved task "Initial planning" to Done', user: { name: getMember(2) }, createdAt: new Date(Date.now() - 86400000 * 4).toISOString() },
    { id: 'a4', message: 'assigned a task to ' + getMember(1), user: { name: getMember(0) }, createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: 'a5', message: 'commented: "Looks great so far!"', user: { name: getMember(1) }, createdAt: new Date(Date.now() - 86400000 * 1).toISOString() },
  ];
};

// Components
const StatCard = ({ title, value, icon: Icon, color }) => {
  const colorMap = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between card-hover">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2.5 rounded-lg border ${colorMap[color]}`}>
          <Icon size={18} strokeWidth={2.5} />
        </div>
        <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">{title}</p>
      </div>
      <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
    </div>
  );
};

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      let projectData = res.data;
      
      // Inject demo fallback data if empty
      if (!projectData.tasks || projectData.tasks.length === 0) {
        projectData.tasks = generateDemoTasks(projectData.title);
      }
      if (!projectData.activities || projectData.activities.length === 0) {
        projectData.activities = generateDemoActivities(projectData.title, projectData.members || []);
      }
      
      setProject(projectData);
    } catch (err) {
      toast.error('Failed to load project details');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="h-8 w-24 bg-border rounded animate-pulse mb-6"></div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl h-48 animate-pulse p-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-zinc-900 border border-zinc-800 rounded-xl animate-pulse"></div>)}
        </div>
      </div>
    );
  }

  if (!project) return null;

  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter(t => t.status === 'Done').length;
  const inProgressTasks = project.tasks.filter(t => t.status === 'In Progress').length;
  const overdueTasks = project.tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done').length;
  const progressPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'Medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'Low': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      default: return 'text-zinc-400 bg-border border-border';
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Done': return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Done</span>;
      case 'In Progress': return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">In Progress</span>;
      default: return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300 border border-zinc-700">Todo</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10 animate-fade-in">
      <button 
        onClick={() => navigate('/projects')}
        className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Projects
      </button>

      {/* Header Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 lg:p-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 relative z-10">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {project.status}
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">{project.title}</h1>
            <p className="text-zinc-400 text-base leading-relaxed max-w-xl">
              {project.description || 'No detailed description provided for this project.'}
            </p>
            
            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Calendar size={16} className="text-zinc-500" />
                <span className="font-medium text-white">Due:</span> 
                {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Users size={16} className="text-zinc-500" />
                <span className="font-medium text-white">Team:</span> 
                {project.members?.length || 0} members
              </div>
            </div>
          </div>

          <div className="w-full lg:w-72 bg-zinc-950/50 rounded-2xl p-6 border border-zinc-800/80 backdrop-blur-sm">
            <div className="flex justify-between items-end mb-3">
              <span className="text-sm font-semibold text-zinc-400">Progress</span>
              <span className="text-2xl font-bold text-white">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2.5 mb-5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-indigo-400 h-2.5 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex -space-x-3">
                {project.members?.slice(0, 4).map((m, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-zinc-900 bg-gradient-to-tr from-zinc-700 to-zinc-600 flex items-center justify-center text-[10px] font-bold text-white shadow-sm z-10" style={{ zIndex: 10 - i }}>
                    {m.user?.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                ))}
                {project.members?.length > 4 && (
                  <div className="w-8 h-8 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400 shadow-sm z-0">
                    +{project.members.length - 4}
                  </div>
                )}
              </div>
              {isAdmin && (
                <button className="w-8 h-8 rounded-full border border-dashed border-zinc-600 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-400 transition-colors">
                  <Plus size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 overflow-x-auto custom-scrollbar">
        {['Overview', 'Tasks', 'Team', 'Activity'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3.5 text-sm font-medium tracking-wide whitespace-nowrap transition-all border-b-2 ${
              activeTab === tab 
                ? 'border-indigo-500 text-white' 
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {activeTab === 'Overview' && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard title="Total Tasks" value={totalTasks} icon={ListTodo} color="blue" />
              <StatCard title="Completed" value={completedTasks} icon={CheckCircle2} color="emerald" />
              <StatCard title="In Progress" value={inProgressTasks} icon={Clock} color="amber" />
              <StatCard title="Overdue" value={overdueTasks} icon={AlertCircle} color="red" />
            </div>
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <FileText size={18} className="text-indigo-400" />
                Recent Tasks
              </h3>
              <div className="space-y-3">
                {project.tasks.slice(0, 5).map(task => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-zinc-950/50 border border-zinc-800/80 rounded-xl hover:border-zinc-700 transition-colors group">
                    <div className="flex items-center gap-4">
                      {getStatusBadge(task.status)}
                      <p className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">{task.title}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className={`px-2 py-0.5 rounded border ${getPriorityStyle(task.priority)}`}>{task.priority}</span>
                      {task.dueDate && <span className="text-zinc-500 hidden sm:inline-block">{new Date(task.dueDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Tasks' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-400">
                <thead className="bg-zinc-950/50 text-xs uppercase text-zinc-500 font-semibold border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-4">Task Name</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Priority</th>
                    <th className="px-6 py-4">Assignee</th>
                    <th className="px-6 py-4 text-right">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {project.tasks.map(task => (
                    <tr key={task.id} className="hover:bg-zinc-800/30 transition-colors group cursor-pointer">
                      <td className="px-6 py-4 font-medium text-zinc-200 group-hover:text-white transition-colors">{task.title}</td>
                      <td className="px-6 py-4">{getStatusBadge(task.status)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${getPriorityStyle(task.priority)}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {task.assignee ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] text-white font-bold">
                              {task.assignee.name.charAt(0)}
                            </div>
                            <span className="text-zinc-300">{task.assignee.name}</span>
                          </div>
                        ) : (
                          <span className="text-zinc-500 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right text-zinc-500">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Team' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {project.members?.map(member => (
              <div key={member.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-start gap-4 card-hover relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-zinc-800 to-zinc-700 flex items-center justify-center text-lg text-white font-bold shadow-sm relative z-10 border border-zinc-600/50">
                  {member.user?.name?.charAt(0) || '?'}
                </div>
                <div className="relative z-10 flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-white text-base tracking-tight group-hover:text-indigo-400 transition-colors">{member.user?.name || 'Unknown User'}</h3>
                    <button className="text-zinc-500 hover:text-white"><MoreVertical size={16} /></button>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 mb-3">{member.user?.email || 'No email'}</p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">
                    <ShieldCheck size={12} />
                    {member.user?.id === project.createdBy ? 'Creator' : 'Member'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Activity' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-3xl animate-fade-in">
            <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
              <Activity size={18} className="text-emerald-400" />
              Project Timeline
            </h3>
            <div className="relative border-l border-zinc-800 ml-4 space-y-8">
              {project.activities.map((activity, index) => (
                <div key={activity.id} className="relative pl-8 group">
                  <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-zinc-700 ring-4 ring-zinc-900 group-hover:bg-indigo-400 transition-colors"></div>
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-1">
                    <span className="font-semibold text-zinc-200">{activity.user?.name}</span>
                    <span className="text-sm text-zinc-400">{activity.message}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    <Clock size={12} />
                    {new Date(activity.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;
