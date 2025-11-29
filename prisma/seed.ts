import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding ActivityPattern data...');

  // Seed ActivityPattern data
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
      console.log(`Pattern "${pattern.name}" already exists, skipping...`);
    } else {
      const created = await prisma.activityPattern.create({
        data: pattern,
      });
      console.log(`Created pattern: ${created.name}`);
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

