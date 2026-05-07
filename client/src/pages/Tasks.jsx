import { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { toast } from 'react-hot-toast';
import { Plus, GripVertical, Calendar, Inbox } from 'lucide-react';

const COLUMNS = {
  Todo: { name: 'Todo', items: [] },
  'In Progress': { name: 'In Progress', items: [] },
  Done: { name: 'Done', items: [] }
};

const Tasks = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const [columns, setColumns] = useState(COLUMNS);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'Medium', projectId: '', dueDate: '' });

  useEffect(() => {
    fetchTasksAndProjects();
  }, []);

  const fetchTasksAndProjects = async () => {
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/projects')
      ]);
      
      setProjects(projectsRes.data);
      
      const newColumns = {
        Todo: { name: 'Todo', items: [] },
        'In Progress': { name: 'In Progress', items: [] },
        Done: { name: 'Done', items: [] }
      };
      
      tasksRes.data.forEach(task => {
        if (newColumns[task.status]) {
          newColumns[task.status].items.push(task);
        } else {
          newColumns['Todo'].items.push(task);
        }
      });
      
      setColumns(newColumns);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result, columns, setColumns) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      
      const [removed] = sourceItems.splice(source.index, 1);
      
      // Verification logic: ensure user is authorized to edit
      if (!isAdmin && removed.assignedTo?.id !== user.id && removed.assignedTo !== user.id) {
        toast.error('You are not authorized to edit this task.');
        return;
      }

      removed.status = destination.droppableId;
      destItems.splice(destination.index, 0, removed);
      
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          items: sourceItems
        },
        [destination.droppableId]: {
          ...destColumn,
          items: destItems
        }
      });

      try {
        await api.put(`/tasks/${removed.id}`, { status: destination.droppableId });
      } catch (err) {
        toast.error('Failed to update task status');
        fetchTasksAndProjects(); 
      }
    } else {
      const column = columns[source.droppableId];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...column,
          items: copiedItems
        }
      });
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', newTask);
      toast.success('Task created successfully');
      setShowModal(false);
      setNewTask({ title: '', description: '', priority: 'Medium', projectId: '', dueDate: '' });
      fetchTasksAndProjects();
    } catch (err) {
      toast.error('Failed to create task');
    }
  };

  if (loading) {
    return (
      <div className="flex gap-6 pb-4 overflow-hidden h-full">
        {[1, 2, 3].map((i) => (
          <div key={i} className="min-w-[320px] w-[320px] bg-zinc-950 border border-zinc-800 rounded-xl h-[80vh] flex flex-col p-4 animate-pulse">
            <div className="h-6 w-32 bg-border rounded mb-4"></div>
            <div className="space-y-3">
              <div className="h-28 bg-zinc-900 rounded-lg border border-zinc-800"></div>
              <div className="h-28 bg-zinc-900 rounded-lg border border-zinc-800"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-400 bg-red-400/10 border border-red-400/20';
      case 'Medium': return 'text-amber-400 bg-amber-400/10 border border-amber-400/20';
      case 'Low': return 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20';
      default: return 'text-zinc-400 bg-border';
    }
  };

  const getPriorityDot = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-400';
      case 'Medium': return 'bg-amber-400';
      case 'Low': return 'bg-emerald-400';
      default: return 'bg-textMuted';
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Board</h1>
          <p className="text-sm text-zinc-400 mt-1">Drag and drop tasks to change their status.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            <Plus size={18} />
            New Issue
          </button>
        )}
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
        <DragDropContext onDragEnd={result => onDragEnd(result, columns, setColumns)}>
          {Object.entries(columns).map(([columnId, column]) => {
            return (
              <div key={columnId} className="flex flex-col min-w-[320px] w-[320px]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-white flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${columnId === 'Done' ? 'bg-indigo-500' : columnId === 'Todo' ? 'bg-border' : 'bg-amber-500'}`}></div>
                    {column.name}
                    <span className="text-zinc-400 font-normal ml-1">({column.items.length})</span>
                  </h2>
                  <button className="text-zinc-400 hover:text-white transition-colors"><Plus size={16}/></button>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                  <Droppable droppableId={columnId} key={columnId}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`min-h-[200px] h-full rounded-xl transition-all duration-300 ${snapshot.isDraggingOver ? 'bg-zinc-900/30 ring-1 ring-border border-dashed' : 'bg-transparent'}`}
                      >
                        {column.items.length === 0 && !snapshot.isDraggingOver && (
                          <div className="border border-dashed border-zinc-800 rounded-xl h-24 flex flex-col items-center justify-center text-zinc-400">
                            <Inbox size={18} className="mb-2 opacity-50" />
                            <span className="text-xs font-medium tracking-wide">No issues</span>
                          </div>
                        )}
                        
                        {column.items.map((item, index) => {
                          return (
                            <Draggable key={item.id} draggableId={item.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`p-4 mb-3 rounded-xl bg-zinc-900 border border-zinc-800 ${snapshot.isDragging ? 'shadow-glow border-indigo-500/50 scale-[1.02] z-50' : 'hover:border-zinc-800/80 hover:bg-zinc-800'} transition-all duration-200 group relative`}
                                  style={{ ...provided.draggableProps.style }}
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-start gap-2 w-full">
                                      <GripVertical size={16} className="text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab absolute left-2 top-4" />
                                      <h3 className="font-medium text-white text-sm leading-snug pl-4">{item.title}</h3>
                                    </div>
                                  </div>
                                  
                                  {item.project && (
                                    <p className="text-xs text-zinc-400 pl-4 mb-4 truncate flex items-center gap-1.5 font-medium">
                                      <span className="w-1.5 h-1.5 rounded-full bg-border"></span>
                                      {item.project.title}
                                    </p>
                                  )}

                                  <div className="flex items-center justify-between mt-2 pl-4">
                                    <div className="flex items-center gap-2">
                                      <div className={`flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-md ${getPriorityStyle(item.priority)}`}>
                                        <div className={`w-1 h-1 rounded-full ${getPriorityDot(item.priority)}`}></div>
                                        {item.priority}
                                      </div>
                                      {item.dueDate && (
                                        <div className="flex items-center gap-1 text-[10px] font-semibold text-zinc-400 bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded-md">
                                          <Calendar size={10} />
                                          {new Date(item.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </div>
                                      )}
                                    </div>
                                    {item.assignee && (
                                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-accent to-accentHover flex items-center justify-center text-[10px] text-white font-bold shadow-sm" title={item.assignee.name}>
                                        {item.assignee.name.charAt(0).toUpperCase()}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>
            );
          })}
        </DragDropContext>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md p-6 shadow-glow animate-slide-up">
            <h2 className="text-xl font-bold text-white mb-6 tracking-tight">Create Issue</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Project</label>
                <select
                  value={newTask.projectId}
                  onChange={(e) => setNewTask({...newTask, projectId: e.target.value})}
                  className="input-field"
                  required
                >
                  <option value="">Select a project</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Task Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="input-field"
                  placeholder="E.g. Update pricing page"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className="input-field min-h-[80px]"
                  placeholder="Add more details..."
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    className="input-field"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    className="input-field"
                  />
                </div>
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
                  Create Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
