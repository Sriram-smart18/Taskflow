const prisma = require('../prisma');

const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role && req.user.role.toLowerCase() === 'admin';

    const whereClause = isAdmin ? {} : {
      OR: [
        { createdBy: userId },
        { members: { some: { userId } } }
      ]
    };

    const userProjects = await prisma.project.findMany({
      where: whereClause,
      select: { id: true }
    });
    
    const projectIds = userProjects.map(p => p.id);

    const tasks = await prisma.task.findMany({
      where: { projectId: { in: projectIds } }
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Done').length;
    const pendingTasks = tasks.filter(t => t.status !== 'Done').length;
    
    const now = new Date();
    const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'Done').length;

    const activities = await prisma.activity.findMany({
      where: { projectId: { in: projectIds } },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: { select: { name: true } },
        project: { select: { title: true } }
      }
    });

    res.json({
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      recentActivity: activities,
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };
