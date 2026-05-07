const prisma = require('../prisma');

const getProjects = async (req, res, next) => {
  try {
    const isAdmin = req.user.role && req.user.role.toLowerCase() === 'admin';
    const whereClause = isAdmin ? {} : {
      OR: [
        { createdBy: req.user.id },
        { members: { some: { userId: req.user.id } } }
      ]
    };

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        creator: { select: { name: true, email: true } },
        members: { include: { user: { select: { name: true, email: true } } } },
        _count: { select: { tasks: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(projects);
  } catch (error) {
    next(error);
  }
};

const createProject = async (req, res, next) => {
  try {
    const { title, description, deadline } = req.body;
    
    if (!title) {
      res.status(400);
      throw new Error('Title is required');
    }

    const project = await prisma.project.create({
      data: {
        title,
        description,
        deadline: deadline ? new Date(deadline) : null,
        createdBy: req.user.id,
        members: {
          create: { userId: req.user.id }
        }
      }
    });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

const getProjectById = async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        tasks: {
          include: { assignee: { select: { name: true } } }
        },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
      }
    });

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }
    
    res.json(project);
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const { title, description, status, deadline } = req.body;
    
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        status,
        deadline: deadline ? new Date(deadline) : undefined,
      }
    });

    res.json(project);
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    await prisma.project.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Project removed' });
  } catch (error) {
    next(error);
  }
};

const addMember = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    
    const member = await prisma.projectMember.create({
      data: {
        projectId: req.params.id,
        userId: user.id
      }
    });
    res.json(member);
  } catch (error) {
    next(error);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    
    await prisma.projectMember.delete({
      where: {
        projectId_userId: { projectId: id, userId }
      }
    });
    res.json({ message: 'Member removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember
};
