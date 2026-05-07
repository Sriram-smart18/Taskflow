import { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { UserPlus, UserX, Mail, Building2, Users } from 'lucide-react';

const Team = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emailToAdd, setEmailToAdd] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
      if (res.data.length > 0 && !selectedProject) {
        setSelectedProject(res.data[0]);
      } else if (selectedProject) {
        const updated = res.data.find(p => p.id === selectedProject.id);
        setSelectedProject(updated || res.data[0]);
      }
    } catch (err) {
      toast.error('Failed to fetch team data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;
    try {
      await api.post(`/projects/${selectedProject.id}/members`, { email: emailToAdd });
      toast.success('Member added successfully');
      setEmailToAdd('');
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await api.delete(`/projects/${selectedProject.id}/members/${userId}`);
      toast.success('Member removed');
      fetchProjects();
    } catch (err) {
      toast.error('Failed to remove member');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-border rounded animate-pulse mb-6"></div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl h-full animate-pulse p-4">
            <div className="h-6 w-1/2 bg-border rounded mb-6"></div>
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-12 w-full bg-border rounded-lg"></div>)}
            </div>
          </div>
          <div className="lg:col-span-3 bg-zinc-900 border border-zinc-800 rounded-xl h-full animate-pulse p-6">
            <div className="flex justify-between mb-8">
              <div className="space-y-2">
                <div className="h-8 w-48 bg-border rounded"></div>
                <div className="h-4 w-32 bg-border rounded"></div>
              </div>
              <div className="h-10 w-64 bg-border rounded"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {[1,2,3,4].map(i => <div key={i} className="h-20 w-full bg-border rounded-xl"></div>)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white tracking-tight">Team Management</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
        
        {/* Projects List sidebar */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col shadow-sm">
          <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Building2 size={16} className="text-indigo-400" />
              Select Project
            </h2>
          </div>
          <div className="overflow-y-auto flex-1 p-2 custom-scrollbar">
            {projects.length === 0 ? (
              <p className="text-zinc-400 text-sm p-4 text-center border border-dashed border-zinc-800 m-2 rounded-lg">No projects found.</p>
            ) : (
              projects.map(project => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className={`w-full text-left px-4 py-3 rounded-lg mb-1.5 transition-all text-sm font-medium flex items-center justify-between group ${selectedProject?.id === project.id ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white border border-transparent'}`}
                >
                  <span className="truncate pr-2">{project.title}</span>
                  <div className={`w-1.5 h-1.5 rounded-full ${selectedProject?.id === project.id ? 'bg-indigo-500' : 'bg-transparent group-hover:bg-border transition-colors'}`}></div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Team Members List */}
        <div className="lg:col-span-3 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col shadow-sm">
          <div className="p-6 border-b border-zinc-800 bg-zinc-900/30">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">{selectedProject?.title || 'No Project Selected'}</h2>
                <p className="text-zinc-400 text-sm mt-1">Manage members and roles for this project.</p>
              </div>
              
              {selectedProject && (
                <form onSubmit={handleAddMember} className="flex gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" size={16} />
                    <input
                      type="email"
                      value={emailToAdd}
                      onChange={(e) => setEmailToAdd(e.target.value)}
                      placeholder="Invite via email..."
                      className="input-field pl-10 h-10"
                      required
                    />
                  </div>
                  <button type="submit" className="btn-primary h-10 whitespace-nowrap">
                    <UserPlus size={16} />
                    Invite
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="p-6 flex-1 overflow-y-auto custom-scrollbar bg-zinc-950/30">
            {selectedProject ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Creator always listed first */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between hover:border-zinc-800/80 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent to-accentHover flex items-center justify-center text-white font-bold shadow-glow">
                      {selectedProject.creator.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-white font-medium tracking-tight text-sm">{selectedProject.creator.name}</h3>
                      <p className="text-xs text-zinc-400 mt-0.5">{selectedProject.creator.email}</p>
                    </div>
                  </div>
                  <span className="bg-indigo-500/10 text-indigo-400 text-[10px] uppercase tracking-wider px-2 py-1 rounded border border-indigo-500/20 font-bold">
                    Creator
                  </span>
                </div>

                {/* Project Members */}
                {selectedProject.members.filter(m => m.user.email !== selectedProject.creator.email).map((member) => (
                  <div key={member.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between group hover:border-zinc-800/80 hover:bg-zinc-800 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-border flex items-center justify-center text-white font-bold shadow-sm">
                        {member.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-white font-medium tracking-tight text-sm">{member.user.name}</h3>
                        <p className="text-xs text-zinc-400 mt-0.5">{member.user.email}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRemoveMember(member.user.id)}
                      className="text-zinc-400 hover:text-red-400 hover:bg-red-400/10 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all border border-transparent hover:border-red-400/20"
                      title="Remove Member"
                    >
                      <UserX size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-400">
                <div className="p-4 bg-zinc-900 rounded-full mb-4 shadow-sm border border-zinc-800">
                  <Users size={32} className="text-zinc-400/50" />
                </div>
                <p className="font-medium text-white mb-1">No Team Selected</p>
                <p className="text-sm">Select a project to view and manage its members.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Team;
