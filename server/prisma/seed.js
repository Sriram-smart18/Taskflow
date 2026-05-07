const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean up existing data
  await prisma.activity.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.projectMember.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create Users
  const alice = await prisma.user.create({
    data: {
      name: 'Alice Freeman',
      email: 'alice@linear.demo',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const bob = await prisma.user.create({
    data: {
      name: 'Bob Chen',
      email: 'bob@linear.demo',
      password: hashedPassword,
      role: 'MEMBER',
    },
  });

  const charlie = await prisma.user.create({
    data: {
      name: 'Charlie Davis',
      email: 'charlie@linear.demo',
      password: hashedPassword,
      role: 'MEMBER',
    },
  });

  // 2. Create Projects & Add Members
  const p1 = await prisma.project.create({
    data: {
      title: 'Web App Redesign',
      description: 'Modernizing the legacy application with a sleek new glassmorphism interface and improved typography.',
      createdBy: alice.id,
      deadline: new Date(new Date().setDate(new Date().getDate() + 30)),
      members: {
        create: [
          { userId: alice.id },
          { userId: bob.id },
          { userId: charlie.id },
        ],
      },
    },
  });

  const p2 = await prisma.project.create({
    data: {
      title: 'API Gateway Integration',
      description: 'Implementing the new GraphQL gateway and migrating standard REST endpoints to improve query efficiency.',
      createdBy: bob.id,
      deadline: new Date(new Date().setDate(new Date().getDate() + 15)),
      members: {
        create: [
          { userId: bob.id },
          { userId: alice.id },
        ],
      },
    },
  });

  const p3 = await prisma.project.create({
    data: {
      title: 'Q3 Marketing Launch',
      description: 'Campaign assets, landing pages, and automated email sequences for the upcoming product launch.',
      createdBy: charlie.id,
      deadline: new Date(new Date().setDate(new Date().getDate() + 5)),
      members: {
        create: [
          { userId: charlie.id },
          { userId: bob.id },
        ],
      },
    },
  });

  // Helper dates
  const overdueDate = new Date(new Date().setDate(new Date().getDate() - 2));
  const upcomingDate = new Date(new Date().setDate(new Date().getDate() + 3));
  const farDate = new Date(new Date().setDate(new Date().getDate() + 14));

  // 3. Create Tasks
  const tasksData = [
    { title: 'Update global typography to Inter', desc: 'Replace standard fonts with Inter across all UI components to match Linear style.', status: 'Done', priority: 'Low', dueDate: overdueDate, projectId: p1.id, assignedTo: alice.id, createdBy: alice.id },
    { title: 'Implement Kanban drag-and-drop', desc: 'Use hello-pangea/dnd for fluid task boards and persistent state.', status: 'Done', priority: 'High', dueDate: new Date(), projectId: p1.id, assignedTo: bob.id, createdBy: alice.id },
    { title: 'Design system tokens', desc: 'Establish color variables, spacing scale, and border radius properties.', status: 'In Progress', priority: 'High', dueDate: upcomingDate, projectId: p1.id, assignedTo: alice.id, createdBy: alice.id },
    { title: 'Refactor Auth Context', desc: 'Fix potential memory leak in the JWT context provider during logout.', status: 'Todo', priority: 'Medium', dueDate: farDate, projectId: p1.id, assignedTo: charlie.id, createdBy: alice.id },
    
    { title: 'Setup Apollo Server', desc: 'Initialize the base GraphQL server setup with schema definitions.', status: 'Done', priority: 'Medium', dueDate: overdueDate, projectId: p2.id, assignedTo: bob.id, createdBy: bob.id },
    { title: 'Migrate User endpoints', desc: 'Port /api/users to GraphQL queries and resolvers.', status: 'In Progress', priority: 'High', dueDate: overdueDate, projectId: p2.id, assignedTo: bob.id, createdBy: bob.id },
    { title: 'Rate limiting middleware', desc: 'Implement redis-based rate limiting to protect auth endpoints.', status: 'Todo', priority: 'Low', dueDate: upcomingDate, projectId: p2.id, assignedTo: alice.id, createdBy: bob.id },
    { title: 'Write integration tests', desc: 'Achieve 80% coverage on new gateway endpoints using Jest.', status: 'Todo', priority: 'Medium', dueDate: farDate, projectId: p2.id, assignedTo: null, createdBy: bob.id },
    
    { title: 'Draft email sequence', desc: 'Write copy for the 3-part welcome series targeting new signups.', status: 'In Progress', priority: 'High', dueDate: upcomingDate, projectId: p3.id, assignedTo: charlie.id, createdBy: charlie.id },
    { title: 'Hero banner illustrations', desc: 'Create SVG graphics for the main landing page header.', status: 'Todo', priority: 'Medium', dueDate: overdueDate, projectId: p3.id, assignedTo: bob.id, createdBy: charlie.id },
    { title: 'Setup Google Analytics', desc: 'Add tracking scripts and configure conversion goals for signups.', status: 'Todo', priority: 'Low', dueDate: farDate, projectId: p3.id, assignedTo: null, createdBy: charlie.id },
    { title: 'Review pricing tiers', desc: 'Finalize the pricing matrix for Pro and Enterprise plans.', status: 'Done', priority: 'High', dueDate: new Date(), projectId: p3.id, assignedTo: charlie.id, createdBy: charlie.id },
  ];

  for (const t of tasksData) {
    const task = await prisma.task.create({
      data: {
        title: t.title,
        description: t.desc,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        projectId: t.projectId,
        assignedTo: t.assignedTo,
        createdBy: t.createdBy
      }
    });

    // 4. Create Activity
    await prisma.activity.create({
      data: {
        message: `created task "${t.title}"`,
        userId: t.assignedTo || alice.id,
        projectId: t.projectId
      }
    });

    if (t.status === 'Done') {
      await prisma.activity.create({
        data: {
          message: `marked task "${t.title}" as complete`,
          userId: t.assignedTo || alice.id,
          projectId: t.projectId
        }
      });
    } else if (t.status === 'In Progress') {
      await prisma.activity.create({
        data: {
          message: `moved task "${t.title}" to In Progress`,
          userId: t.assignedTo || alice.id,
          projectId: t.projectId
        }
      });
    }
  }

  // Some extra random activity
  await prisma.activity.create({
    data: {
      message: 'created project "Web App Redesign"',
      userId: alice.id,
      projectId: p1.id,
    }
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
