import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Plus, FolderKanban, Calendar, Users, MoreVertical, LayoutGrid } from 'lucide-react';

const Projects = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '', deadline: '' });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', newProject);
      toast.success('Project created successfully');
      setShowModal(false);
      setNewProject({ title: '', description: '', deadline: '' });
      fetchProjects();
    } catch (err) {
      toast.error('Failed to create project');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between mb-8">
          <div className="h-8 w-32 bg-border rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-border rounded-lg animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 h-48 animate-pulse">
              <div className="h-10 w-10 bg-border rounded-lg mb-4"></div>
              <div className="h-5 bg-border rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-border rounded w-full mb-2"></div>
              <div className="h-4 bg-border rounded w-5/6"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white tracking-tight">Projects</h1>
        {isAdmin && (
          <button 
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            <Plus size={18} />
            New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="border border-dashed border-zinc-800 rounded-2xl h-64 flex flex-col items-center justify-center text-zinc-400 bg-zinc-900/30">
          <LayoutGrid size={32} className="mb-4 opacity-40" />
          <h3 className="text-lg font-medium text-white mb-1">No projects yet</h3>
          <p className="text-sm">Create a project to start organizing tasks.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div 
              key={project.id} 
              onClick={() => navigate(`/projects/${project.id}`)}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 card-hover group relative overflow-hidden flex flex-col justify-between h-[220px] cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              
              <div>
                <div className="flex items-start justify-between mb-5">
                  <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 group-hover:scale-110 transition-transform">
                    <FolderKanban size={20} strokeWidth={2.5} />
                  </div>
                  <button className="text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical size={18} />
                  </button>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 tracking-tight group-hover:text-indigo-400 transition-colors">{project.title}</h3>
                <p className="text-[13px] text-zinc-400 line-clamp-2 leading-relaxed">
                  {project.description || 'No description provided.'}
                </p>
              </div>
              
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-zinc-800/50">
                <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 bg-zinc-950 px-2 py-1 rounded-md border border-zinc-800">
                  <Calendar size={12} />
                  {project.deadline ? new Date(project.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No date'}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                  <Users size={14} className="text-zinc-400/70" />
                  {project.members?.length || 0}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md p-6 shadow-glow animate-slide-up">
            <h2 className="text-xl font-bold text-white mb-6 tracking-tight">Create Project</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Title</label>
                <input
                  type="text"
                  value={newProject.title}
                  onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                  className="input-field"
                  placeholder="E.g. Web App Redesign"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  className="input-field min-h-[80px]"
                  placeholder="What is this project about?"
                ></textarea>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Deadline</label>
                <input
                  type="date"
                  value={newProject.deadline}
                  onChange={(e) => setNewProject({...newProject, deadline: e.target.value})}
                  className="input-field"
                />
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
