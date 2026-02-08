import 'dotenv/config';
import { PageType, WorkspaceRole } from '@prisma/client';
import prisma from '../lib/prisma';

async function main() {
  console.log('Seeding database...');

  // 1. Create Dev User
  console.log('Creating dev user...');
  const devUser = await prisma.user.upsert({
    where: { id: 'dev-user-id' },
    update: {},
    create: {
      id: 'dev-user-id',
      email: 'dev@edutex.local',
      name: 'Dev User',
    },
  });
  console.log(`Dev user created: ${devUser.email}`);

  // 2. Create Demo Workspace
  console.log('Creating demo workspace...');
  const workspace = await prisma.workspace.upsert({
    where: { id: 'demo-workspace-id' },
    update: {},
    create: {
      id: 'demo-workspace-id',
      name: 'Demo Workspace',
      description: 'A demo workspace for development and testing',
    },
  });
  console.log(`Workspace created: ${workspace.name}`);

  // 3. Add Dev User as ADMINISTRATOR (owner) of workspace
  console.log('Adding dev user to workspace...');
  await prisma.workspaceMember.upsert({
    where: {
      workspaceId_userId: {
        workspaceId: workspace.id,
        userId: devUser.id,
      },
    },
    update: { role: WorkspaceRole.ADMINISTRATOR },
    create: {
      workspaceId: workspace.id,
      userId: devUser.id,
      role: WorkspaceRole.ADMINISTRATOR,
    },
  });
  console.log('Dev user added as ADMINISTRATOR');

  // 4. Create Course
  console.log('Creating demo course...');
  const course = await prisma.course.upsert({
    where: { id: 'demo-course-id' },
    update: {},
    create: {
      id: 'demo-course-id',
      name: 'Sales Onboarding Program',
      description: 'A comprehensive onboarding program for new sales representatives',
      status: 'IN_PROGRESS',
      workspaceId: workspace.id,
      clientName: 'Acme Corp',
      courseType: 'onboarding',
      phase: 'design',
      priority: 'high',
    },
  });
  console.log(`Course created: ${course.name}`);

  // 5. Create Pages for each course tab type
  // Note: Using available PageType enum values
  // QUIZ_BUILDER, JOB_AIDS, EVALUATION_PLAN don't exist in schema
  // Using closest alternatives: ASSESSMENT_PLAN, CUSTOM, CURRICULUM_MAP
  console.log('Creating pages...');
  const pageTypes: { type: PageType; title: string }[] = [
    { type: PageType.NEEDS_ANALYSIS, title: 'Needs Analysis' },
    { type: PageType.TASK_ANALYSIS, title: 'Task Analysis' },
    { type: PageType.STORYBOARD, title: 'Storyboard' },
    { type: PageType.ASSESSMENT_PLAN, title: 'Quiz Builder' },
    { type: PageType.CUSTOM, title: 'Job Aids' },
    { type: PageType.CURRICULUM_MAP, title: 'Evaluation Plan' },
  ];

  for (let i = 0; i < pageTypes.length; i++) {
    const { type, title } = pageTypes[i];
    const pageId = `demo-page-${type.toLowerCase()}`;

    await prisma.page.upsert({
      where: { id: pageId },
      update: {},
      create: {
        id: pageId,
        title,
        type,
        courseId: course.id,
        createdById: devUser.id,
        order: i,
      },
    });
    console.log(`  Created page: ${title} (${type})`);
  }

  // 6. Seed ActivityPattern data
  console.log('Seeding ActivityPattern data...');
  const patterns = [
    {
      name: 'Worked example plus guided practice',
      description: 'A learning activity pattern that presents a solved example followed by guided practice exercises. Learners first observe a complete solution, then attempt similar problems with scaffolding and feedback.',
      bestForBloomLevels: 'REMEMBER,UNDERSTAND,APPLY',
      references: 'Sweller, J., & Cooper, G. A. (1985). The use of worked examples as a substitute for problem solving in learning algebra. Cognition and Instruction, 2(1), 59-89.',
      typicalDurationMinutes: 30,
    },
    {
      name: 'Scenario based branching',
      description: 'An interactive learning pattern where learners make decisions in realistic scenarios, with the narrative branching based on their choices. Each branch provides feedback and consequences, allowing exploration of different outcomes.',
      bestForBloomLevels: 'APPLY,ANALYZE,EVALUATE',
      references: 'Clark, R. C., & Mayer, R. E. (2016). E-learning and the science of instruction: Proven guidelines for consumers and designers of multimedia learning. John Wiley & Sons.',
      typicalDurationMinutes: 45,
    },
    {
      name: 'Retrieval quiz with feedback',
      description: 'A pattern focused on active recall through quiz questions with immediate feedback. Learners retrieve information from memory, then receive corrective or confirmatory feedback to strengthen learning.',
      bestForBloomLevels: 'REMEMBER,UNDERSTAND',
      references: 'Roediger, H. L., & Karpicke, J. D. (2006). Test-enhanced learning: Taking memory tests improves long-term retention. Psychological Science, 17(3), 249-255.',
      typicalDurationMinutes: 15,
    },
    {
      name: 'Spaced reflection prompt',
      description: 'A pattern that prompts learners to reflect on their learning at spaced intervals. Reflection questions encourage metacognition, connection-making, and consolidation of learning over time.',
      bestForBloomLevels: 'UNDERSTAND,ANALYZE,EVALUATE',
      references: 'Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. Psychological Bulletin, 132(3), 354-380.',
      typicalDurationMinutes: 10,
    },
  ];

  for (const pattern of patterns) {
    const existing = await prisma.activityPattern.findFirst({
      where: { name: pattern.name },
    });

    if (existing) {
      console.log(`  Pattern "${pattern.name}" already exists, skipping...`);
    } else {
      const created = await prisma.activityPattern.create({
        data: pattern,
      });
      console.log(`  Created pattern: ${created.name}`);
    }
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
