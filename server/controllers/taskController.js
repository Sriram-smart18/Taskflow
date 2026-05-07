const prisma = require('../prisma');

const getTasks = async (req, res, next) => {
  try {
    const { projectId } = req.query;
    const isAdmin = req.user.role && req.user.role.toLowerCase() === 'admin';
    
    const filter = {};
    if (projectId) filter.projectId = projectId;

    if (!isAdmin) {
      // Member can only see tasks assigned to them OR tasks in projects they are a member of
      // The user requested: "view assigned tasks". So we filter heavily.
      filter.assignedTo = req.user.id;
    }
    
    const tasks = await prisma.task.findMany({
      where: filter,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        project: { select: { title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo, projectId } = req.body;
    
    if (!title || !projectId) {
      res.status(400);
      throw new Error('Title and projectId are required');
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'Todo',
        priority: priority || 'Medium',
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedTo,
        projectId,
        createdBy: req.user.id
      }
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo } = req.body;
    const isAdmin = req.user.role && req.user.role.toLowerCase() === 'admin';

    const existingTask = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!existingTask) {
      res.status(404);
      throw new Error('Task not found');
    }

    if (!isAdmin) {
      if (existingTask.assignedTo !== req.user.id) {
        res.status(403);
        throw new Error('Not authorized to edit this task');
      }
      
      // Members can only update status
      const updatedTask = await prisma.task.update({
        where: { id: req.params.id },
        data: { status }
      });
      return res.json(updatedTask);
    }
    
    // Admins can update everything
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        assignedTo
      }
    });

    res.json(task);
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    await prisma.task.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Task removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
